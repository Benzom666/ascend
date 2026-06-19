const { createLogger } = require("../../lib/logger");
const logger = createLogger("files");

/* eslint-disable no-console */
/* eslint-disable consistent-return */
const axios = require("axios");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const helper = require("../../helpers/helper");

const maxCount = 4;
const maxFileSize = 5 * 1024 * 1024; // 5MB per file
const filetypes = /jpeg|jpg|png|webp/;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: maxFileSize,
        files: maxCount,
    },
    fileFilter: (req, file, cb) => {
        if (!file) {
            return cb(new Error("Files required."));
        }

        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(new Error("Allow images only of extensions jpeg|jpg|png|webp !"));
    },
}).array("files", maxCount);

let cachedBuckets = null;
let cachedBucketFetchedAt = 0;

const getSupabaseConfig = () => {
    const supabaseUrl =
        process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.supabase_url ||
        process.env.supabaseUrl ||
        process.env.SUPABSE_URL ||
        process.env.supabse_url ||
        "";
    const supabaseServiceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        process.env.SUPABASE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.supabase_service_role_key ||
        process.env.supabase_service_key ||
        process.env.supabase_key ||
        process.env.supabase_anon_key ||
        process.env.supabse_service_key ||
        "";
    const storageBucket =
        process.env.SUPABASE_STORAGE_BUCKET ||
        process.env.SUPABASE_BUCKET ||
        process.env.supabase_storage_bucket ||
        process.env.supabase_bucket ||
        process.env.SUPABSE_STORAGE_BUCKET ||
        process.env.supabse_storage_bucket ||
        "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error(
            "Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY)."
        );
    }

    return { supabaseUrl, supabaseServiceRoleKey, storageBucket };
};

const fetchSupabaseBuckets = async (supabaseUrl, supabaseServiceRoleKey) => {
    const now = Date.now();
    if (cachedBuckets && now - cachedBucketFetchedAt < 5 * 60 * 1000) {
        return cachedBuckets;
    }

    const res = await axios.get(`${supabaseUrl}/storage/v1/bucket`, {
        headers: {
            Authorization: `Bearer ${supabaseServiceRoleKey}`,
            apikey: supabaseServiceRoleKey,
        },
    });
    cachedBuckets = Array.isArray(res.data) ? res.data : [];
    cachedBucketFetchedAt = now;
    return cachedBuckets;
};

const uploadToSupabase = async (file, userId = "anonymous") => {
    const { supabaseUrl, supabaseServiceRoleKey, storageBucket } = getSupabaseConfig();
    let candidateBuckets = storageBucket
        ? [storageBucket]
        : ["secret-time-uploads", "uploads", "public", "public-files"];
    if (!storageBucket) {
        try {
            const buckets = await fetchSupabaseBuckets(supabaseUrl, supabaseServiceRoleKey);
            const bucketNames = buckets.map((b) => b?.name).filter(Boolean);
            if (bucketNames.length > 0) {
                candidateBuckets = [...bucketNames, ...candidateBuckets];
            }
        } catch (err) {
            // ignore bucket discovery errors and fall back to defaults
        }
    }
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const ext = path.extname(safeName).toLowerCase();
    const base = path.basename(safeName, ext);
    const fileKey = `secret-time/uploads/${userId}/${Date.now()}-${crypto
        .randomBytes(6)
        .toString("hex")}-${base}${ext}`;

    let lastError = null;
    for (const bucket of candidateBuckets) {
        try {
            await axios.post(
                `${supabaseUrl}/storage/v1/object/${bucket}/${fileKey}`,
                file.buffer,
                {
                    headers: {
                        Authorization: `Bearer ${supabaseServiceRoleKey}`,
                        apikey: supabaseServiceRoleKey,
                        "Content-Type": file.mimetype,
                        "x-upsert": "true",
                    },
                    maxBodyLength: Infinity,
                }
            );

            return {
                location: `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileKey}`,
                mimetype: file.mimetype,
                originalname: file.originalname,
            };
        } catch (err) {
            lastError = err;
        }
    }

    if (lastError) {
        throw lastError;
    }

    throw new Error("Supabase upload failed for all bucket candidates.");
};

exports.uploadFiles = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                const statusCode = err.code === "LIMIT_UNEXPECTED_FILE" ? 400 : 500;
                return res.status(statusCode).json(
                    helper.errorResponse(
                        { file: `${err.message} or more than ${maxCount} files are passed` },
                        statusCode,
                        err.message
                    )
                );
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json(helper.errorResponse([], 400, "Files required."));
            }

            try {
                const userId = req.user ? req.user.id || req.user._id : "public";
                const uploadedFiles = await Promise.all(
                    req.files.map((file) => uploadToSupabase(file, userId))
                );
                return res.status(200).json(
                    helper.successResponse(
                        { files: helper.imageUploadResponse(uploadedFiles) },
                        200,
                        "Assets uploaded successfully!"
                    )
                );
            } catch (uploadErr) {
                const status = uploadErr?.response?.status;
                const errorData = uploadErr?.response?.data;
                logger.info("file upload is failed", uploadErr.message, status, errorData);
                return res
                    .status(500)
                    .json(
                        helper.errorResponse(
                            uploadErr?.response?.data || uploadErr.message,
                            500,
                            "Image upload failed."
                        )
                    );
            }
        });
    } catch (err) {
        return res
            .status(400)
            .json(helper.errorResponse(err.message, 400, "Something went wrong catch.", err));
    }
};
