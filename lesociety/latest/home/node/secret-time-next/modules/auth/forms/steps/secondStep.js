import React, { useState, useEffect } from "react";
import { Field, reduxForm, change, initialize } from "redux-form";
import validate from "../validate/validate";
import { Inputs } from "core";
import { FiArrowRight } from "react-icons/fi";
import { FiPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { deAuthenticateAction, signupStep2 } from "../../authActions";
import { imageUploader, imageUploaderNew, showToast } from "../../../../utils/Utilities";
import { useRouter } from "next/router";
import FemaleSkeletonSecondStep from "../../../skeleton/Auth/FemaleSkeletonSecondStep";
import { reset } from "redux-form";
import useWindowSize from "utils/useWindowSize";
import ImageShow from "@/modules/ImageShow";
const BlurImage = "/assets/pexels-mike-navolta-670005.jpg";
import MainPhotoGuideModal from "components/MainPhotoGuide/MainPhotoGuideModal";
const {
  loadEditProfileFlowState,
  saveEditProfileFlowState,
  clearEditProfileFlowState,
  sanitizeStep2Draft,
  buildStep2InitialValues,
} = require("utils/editProfileFlowState");

const SecondStep = (props) => {
  const [loading, setLoader] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isImageValid, setImageError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [dimensionValid, setDimensionValid] = useState({ height: 0, width: 0 });
  const [isImageTouched, setImageTouched] = useState(false);
  const [uploadImage1Loading, setUploadImage1Loading] = useState(true);
  const [uploadImage2Loading, setUploadImage2Loading] = useState(true);
  const [uploadImage3Loading, setUploadImage3Loading] = useState(true);
  const [uploadImage4Loading, setUploadImage4Loading] = useState(true);
  const [firstTimeImageLoad, setFirstTimeImageLoad] = useState(true);

  const router = useRouter();
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const user = useSelector((state) => state.authReducer.user);
  const imageWarningPopupStatus = useSelector(
    (state) => state.authReducer.showImageWarningPopup
  );

  let fromNotifPage, notifType, notifId;
  if (props.notifObj) {
    fromNotifPage = props.notifObj.fromNotifPage;
    notifType = props.notifObj.notifType;
    notifId = props.notifObj.id;
  }
  // const {fromNotifPage, notifType} = props?.notifObj

  const [showWarningPopup, setShowWarningPopup] = useState(
    !imageWarningPopupStatus || user?.image_warning_popup || false
  );

  const [imageModal, setImageModal] = useState(false);

  const [hideModal, setHideModal] = useState(false);

  useEffect(() => {
    if (showWarningPopup) {
      // stop scrolling page
      document.body.style.overflow = "hidden";
    } else {
      // allow scrolling page
      document.body.style.overflow = "unset";
    }
  }, [showWarningPopup]);

  useEffect(() => {
    if ((!imageWarningPopupStatus || user?.image_warning_popup) && !hideModal) {
      setHideModal(true);
    }
  }, [imageWarningPopupStatus, user?.image_warning_popup]);

  useEffect(() => {
    if (!hideModal && imageModal) {
      setShowWarningPopup(true);
    }
  }, [hideModal, imageModal]);

  useEffect(() => {
    if (hideModal) {
      setShowWarningPopup(false);
    }
  }, [hideModal]);

  useEffect(() => {
    if (user) {
      const persistedState = router.query?.edit
        ? loadEditProfileFlowState()
        : null;
      const data = buildStep2InitialValues({
        user,
        isEdit: !!router.query?.edit,
        draft: persistedState?.step2Draft,
      });

      props.initialize(data);
    }
  }, [user, router.query?.edit]);

  // const onSubmit = async (values) => {
  //   console.log("values", values);
  //   try {
  //     setLoader(true);
  //     const imageUploaded = await imageUploader([
  //       values.imageUpload?.length > 0 ? values?.imageUpload : user?.images[0],
  //       values.imageUpload2?.length > 0 ? values.imageUpload2 : user?.images[1],
  //       values.imageUpload3?.length > 0 ? values.imageUpload3 : user?.images[2],
  //       values.imageUpload4?.length > 0 ? values.imageUpload4 : user?.images[3],
  //     ]);
  //     if (imageUploaded) {
  //       // values.un_verified_images = imageUploaded.map((image) => image?.url);
  //       values.images = imageUploaded.map((image) => image?.url);
  //       values.email = user?.email;
  //       // if(!router?.query?.edit) {
  //       values.step_completed = 2;
  //       // }
  //       const formData = new FormData();
  //       Object.keys(values).forEach((key) => {
  //         formData.append(key, values[key]);
  //       });

  //       dispatch(
  //         signupStep2({ ...values, isUpdate: router?.query?.edit }, setLoader)
  //       );
  //     }
  //   } catch (err) {
  //     setLoader(false);
  //   }
  // };

  const onSubmit = async (values) => {
    console.log("values", values);
    try {
      setLoader(true);

      const uploadImageArray = [
        {
          url: values.imageUpload?.length > 0 ? values?.imageUpload : "",
        },
        {
          url: values.imageUpload2?.length > 0 ? values.imageUpload2 : "",
        },
        {
          url: values.imageUpload3?.length > 0 ? values.imageUpload3 : "",
        },
        {
          url: values.imageUpload4?.length > 0 ? values.imageUpload4 : "",
        },
      ];

      const imageUploaded = await imageUploaderNew(uploadImageArray);

      const verifiedImageUploaded = await imageUploaderNew([
        { url: user?.images[0] ?? "" },
        { url: user?.images[1] ?? "" },
        { url: user?.images[2] ?? "" },
        { url: user?.images[3] ?? "" },
      ]);

      const unverifiedImageUploaded = await imageUploaderNew(uploadImageArray);

      // console.log("imageUploaded", imageUploaded);
      // console.log("verifiedImageUploaded", verifiedImageUploaded);
      // console.log("unverifiedImageUploaded", unverifiedImageUploaded);

      if (!imageUploaded || !unverifiedImageUploaded) {
        setLoader(false);
        showToast(
          "Image upload failed. Please try again.",
          "error"
        );
        return;
      }

      if (verifiedImageUploaded || unverifiedImageUploaded) {
        values.un_verified_images = unverifiedImageUploaded.map(
          (image) => image?.url
        );
        values.images = router?.query?.edit
          ? verifiedImageUploaded.map((image) => image?.url)
          : imageUploaded.map((image) => image?.url);

        let data;

        if (router.query.edit) {
          data = {
            tagline: user?.tagline,
            description: user?.description,
            images: user?.images,
            un_verified_images:
              (values.imageUpload?.length > 0 &&
                values?.imageUpload !== user?.images[0]) ||
              (values.imageUpload2?.length > 0 &&
                values.imageUpload2 !== user?.images[1]) ||
              (values.imageUpload3?.length > 0 &&
                values.imageUpload3 !== user?.images[2]) ||
              (values.imageUpload4?.length > 0 &&
                values.imageUpload4 !== user?.images[3])
                ? values.un_verified_images
                : [],
            un_verified_tagline:
              values.tagline !== user?.tagline ? values.tagline : "",
            un_verified_description:
              values.description !== user?.description
                ? values.description
                : "",
            email: user?.email,
            step_completed: 2,
            notificationId: notifId || "",
          };
        } else {
          data = {
            description: values?.description,
            tagline: values?.tagline,
            images: values.images,
            step_completed: 2,
            email: user?.email,
          };
        }

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key]);
        });

        console.log("data", data);

        dispatch(
          signupStep2(
            { ...data, isUpdate: router?.query?.edit },
            setLoader,
            props.onSubmit
          )
        );
      }
    } catch (err) {
      setLoader(false);
    }
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, must match API limit

  const validateImageDimension = (event, ht, wd, key) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Reject files larger than the API allows, with a clear message
    if (file.size > MAX_FILE_SIZE) {
      setTimeout(() => {
        props.change(key, "");
      }, 20);
      setFileSizeError(true);
      setImageError(false);
      setDimensionValid({ height: 0, width: 0 });
      setImageTouched(true);
      return;
    }
    setFileSizeError(false);

    const files = event.target.files;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      //Initiate the JavaScript Image object.
      const image = new Image();

      //Set the Base64 string return from FileReader as source.
      image.src = e.target.result;

      //Validate the File Height and Width.
      image.onload = function () {
        if (this.height >= ht && this.width >= wd) {
          setImageError(false);
          setImageTouched(true);
          setDimensionValid({ height: 0, width: 0 });
          if (files?.length > 0) {
            props.change(key, files);
          }
        } else {
          setTimeout(() => {
            props.change(key, "");
          }, 20);
          setImageError(true);
          setDimensionValid({ height: ht, width: wd });
          setImageTouched(true);
        }
      };
    };
  };

  // useEffect(() => {
  //   setTimeout(() => {
  //     if (
  //       (router?.query?.edit &&
  //         user?.images &&
  //         user?.images[0]?.length > 0 &&
  //         user?.images[1]?.length > 0 &&
  //         user?.images[2]?.length > 0 &&
  //         user?.images[3]?.length > 0) ||
  //       props.fromRegistration
  //     ) {
  //       setPageLoading(false);
  //     }
  //   }, 2000);
  // }, []);

  useEffect(() => {
    if (
      (!uploadImage1Loading &&
        !uploadImage2Loading &&
        !uploadImage3Loading &&
        !uploadImage4Loading) ||
      props.fromRegistration
    ) {
      setTimeout(() => {
        setPageLoading(false);
      }, 2000);
    }
  }, [
    uploadImage1Loading,
    uploadImage2Loading,
    uploadImage3Loading,
    uploadImage4Loading,
  ]);

  const { handleSubmit, invalid, previousPage } = props;

  const reduxValues = useSelector((state) => state.form.signupStep2.values);

  useEffect(() => {
    if (!router.query?.edit) {
      return;
    }

    saveEditProfileFlowState({
      step2Draft: sanitizeStep2Draft(reduxValues || {}),
    });
  }, [
    router.query?.edit,
    reduxValues?.tagline,
    reduxValues?.description,
    reduxValues?.imageUpload,
    reduxValues?.imageUpload2,
    reduxValues?.imageUpload3,
    reduxValues?.imageUpload4,
  ]);

  const un_verified_tagline = user?.un_verified_tagline ?? "";
  const un_verified_description = user?.un_verified_description ?? "";
  const un_verified_images = user?.un_verified_images ?? [];
  const existingImages = [0, 1, 2, 3].map((index) =>
    router?.query?.edit
      ? un_verified_images[index] || user?.images?.[index] || ""
      : user?.images?.[index] || ""
  );

  const imageValidation =
    reduxValues?.imageUpload?.length > 0 &&
    reduxValues?.imageUpload2?.length > 0 &&
    reduxValues?.imageUpload3?.length > 0 &&
    reduxValues?.imageUpload4?.length > 0;

  const taglineLength = reduxValues?.tagline?.trim?.().length || 0;
  const descriptionLength = reduxValues?.description?.trim?.().length || 0;
  const isStep2Valid =
    imageValidation &&
    taglineLength >= 8 &&
    taglineLength <= 100 &&
    descriptionLength >= 30 &&
    descriptionLength <= 500;

  // console.log("imageValidation", imageValidation);

  if (pageLoading) {
    return <FemaleSkeletonSecondStep />;
  } else {
    return (
      <>
        {showWarningPopup && (
          <MainPhotoGuideModal
            setHideModal={setHideModal}
            hideModal={hideModal}
          />
        )}
        <form className="upload-pics" onSubmit={handleSubmit(onSubmit)}>
          <div className="d-block d-md-none login-text mb-0">
            <a
              onClick={() => {
                if (router?.query?.edit) {
                  clearEditProfileFlowState();
                  return previousPage();
                } else {
                  dispatch(initialize("signupStep2", ""));
                  dispatch(initialize("DatePreview", ""));
                  dispatch(initialize("RegisterFormMale", ""));
                  dispatch(initialize("signupStep3", ""));
                  dispatch(initialize("RegisterForm", ""));
                  dispatch(initialize("forgotpassword", ""));
                  dispatch(initialize("LoginForm", ""));
                  dispatch(initialize("SecondStep", ""));
                  dispatch(initialize("ThirdStep", ""));
                  dispatch(initialize("CreateStepFour", ""));
                  dispatch(initialize("CreateStepOne", ""));
                  dispatch(initialize("CreateStepThree", ""));
                  dispatch(initialize("CreateStepTwo", ""));
                  dispatch(initialize("SkeletonUserProfile", ""));
                  dispatch(initialize("Messages", ""));
                  dispatch(initialize("VerifiedProfilePage", ""));
                  dispatch(initialize("ChooseCity", ""));
                  dispatch(deAuthenticateAction());
                  router.push("/auth/login");
                  // window.location.reload();
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-chevron-left"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </a>
            {/* <span>
              LADIES
              <img src="/images/line.png" alt="line" />
            </span> */}
          </div>
          <span className="completion-sign">
            {/* <svg
              viewBox="0 0 26 26"
              xmlns="http://www.w3.org/2000/svg"
              className="success_svg"
            >
              <g
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                fill-rule="evenodd"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  class="circle"
                  d="M13 1C6.372583 1 1 6.372583 1 13s5.372583 12 12 12 12-5.372583 12-12S19.627417 1 13 1z"
                />
                <path class="tick" d="M6.5 13.5L10 17 l8.808621-8.308621" />
              </g>
            </svg> */}

            {!router?.query?.edit && (
              <svg
                width="55"
                height="49"
                viewBox="0 0 55 49"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="success_svg"
              >
                <path
                  d="M13 20C13 20 16.2474 22.9845 18 25C19.7526 27.0155 23 31.5 23 31.5C23 31.5 30.2048 20.8885 36 15.5C41.7952 10.1115 51.5 5 51.5 5"
                  stroke="white"
                  stroke-width="5.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="circle"
                />
                <rect width="49" height="49" rx="16" fill="currentColor" />
                <mask
                  id="mask0_2_1437"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="49"
                  height="49"
                >
                  <rect width="49" height="49" rx="16" fill="currentColor" />
                </mask>
                <g mask="url(#mask0_2_1437)">
                  <path
                    d="M14 20C14 20 17.2474 22.9845 19 25C20.7526 27.0155 24 31.5 24 31.5C24 31.5 31.2048 20.8885 37 15.5C42.7952 10.1115 52.5 5 52.5 5"
                    stroke="white"
                    stroke-width="5.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="circle"
                  />
                </g>
              </svg>
            )}
          </span>
          {!router?.query?.edit && (
            <>
              <p className="auth-register-p-text">Registration Completed</p>
              <h2 style={{ textTransform: "capitalize", marginTop: "1rem" }}>
                Welcome, {user?.user_name || ""}
              </h2>
            </>
          )}
          {router?.query?.edit && (
            <h2 style={{ textTransform: "capitalize" }}>
              Edit Profile, {user?.user_name || ""}
            </h2>
          )}
          <div className="text-center">
            <svg
              width="86"
              height="2"
              viewBox="0 0 86 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H86" stroke="url(#paint0_linear_340_3843)" />
              <defs>
                <linearGradient
                  id="paint0_linear_340_3843"
                  x1="86"
                  y1="-2.65326"
                  x2="-7.09342e-05"
                  y2="-2.56604"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#FA789B" stop-opacity="0.01" />
                  <stop offset="0.489981" stop-color="#F02D4E" />
                  <stop offset="1" stop-color="#F24362" stop-opacity="0.01" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="text-label">
            {router.query?.edit && router?.query?.type
              ? "You can only edit what has been requested."
              : `Continue building your profile
              to maximize your opportunities.`}
          </div>
          <div
            className="text-label photo-requirements"
            style={{ fontSize: "12px", opacity: 0.8, marginTop: "8px" }}
          >
            Photos must be JPG, JPEG or PNG, up to 5 MB each. Main photo at
            least 350 x 350 pixels; other photos at least 200 x 200 pixels.
          </div>
          <div className="images-uploads">
            <div
              className="big-image"
              onClick={() => {
                if (imageWarningPopupStatus || !user?.image_warning_popup) {
                  setImageModal(true);
                }
              }}
            >
              <label>
                {hideModal && (
                  <Field
                    name="imageUpload"
                    component={Inputs.uploadFileField}
                    type="file"
                    accept="image/*"
                    onBeforeInput={() => {
                      if (
                        imageWarningPopupStatus ||
                        !user?.image_warning_popup
                      ) {
                        setImageModal(true);
                      }
                    }}
                    onChange={(event) => {
                      if (
                        // !event.target.files[0]?.name.match(
                        //   /\.(jpg|jpeg|png|gif)$/
                        // )
                        !event.target.files[0]?.name.match(/\.(jpg|jpeg|png)$/)
                      ) {
                        setImageError(true);
                        event.preventDefault();
                      } else {
                        validateImageDimension(event, 350, 350, "imageUpload");
                      }
                    }}
                    props={{
                      disabled:
                        fromNotifPage &&
                        (notifType === "description" ||
                          notifType === "tagline" ||
                          notifType === "taglineAndDesc"),
                    }}
                  />
                )}

                {reduxValues?.imageUpload?.length > 0 || existingImages[0] ? (
                  <ImageShow
                    alt="not fount"
                    style={{ objectFit: "cover" }}
                    width={"250px"}
                    setLoading={setUploadImage1Loading}
                    src={
                      typeof reduxValues?.imageUpload === "string"
                        ? reduxValues?.imageUpload
                        : reduxValues?.imageUpload?.length > 0
                        ? URL.createObjectURL(reduxValues?.imageUpload[0])
                        : existingImages[0]
                    }
                    placeholderImg="https://i.ibb.co/y8RhMrL/Untitled-design.png"
                  />
                ) : (
                  <>
                    <FiPlus />
                    <svg
                      className="dahsed-border"
                      width="424"
                      height="429"
                      viewBox="0 0 424 429"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="1.75789"
                        y="2.5721"
                        width="420.485"
                        height="423.814"
                        rx="47.4566"
                        stroke="#DDDDDD"
                        strokeWidth="3.5153"
                        strokeDasharray="35.15"
                      />
                    </svg>
                  </>
                )}
              </label>
            </div>
            <div className="small-images big-image row">
              <div className="col-4">
                <label style={{ margin: "0" }}>
                  <Field
                    name="imageUpload2"
                    component={Inputs.uploadFileField}
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      if (
                        // !event.target.files[0]?.name.match(
                        //   /\.(jpg|jpeg|png|gif)$/
                        // )
                        !event.target.files[0]?.name.match(/\.(jpg|jpeg|png)$/)
                      ) {
                        setImageError(true);
                        event.preventDefault();
                      } else {
                        validateImageDimension(event, 200, 200, "imageUpload2");
                      }
                    }}
                    props={{
                      disabled:
                        fromNotifPage &&
                        (notifType === "description" ||
                          notifType === "tagline" ||
                          notifType === "taglineAndDesc"),
                    }}
                  />
                  {reduxValues?.imageUpload2?.length > 0 || existingImages[1] ? (
                    // <img
                    //   alt="not fount"
                    //   style={{ objectFit: "cover" }}
                    //   width={"250px"}
                    // src={
                    //   typeof reduxValues?.imageUpload2 === "string"
                    //     ? reduxValues?.imageUpload2
                    //     : reduxValues?.imageUpload2?.length > 0
                    //     ? URL.createObjectURL(reduxValues?.imageUpload2[0])
                    //     : user?.images[1]
                    // }
                    // />
                    <ImageShow
                      alt="not fount"
                      style={{ objectFit: "cover" }}
                      width={"250px"}
                      setLoading={setUploadImage2Loading}
                      src={
                        typeof reduxValues?.imageUpload2 === "string"
                          ? reduxValues?.imageUpload2
                          : reduxValues?.imageUpload2?.length > 0
                          ? URL.createObjectURL(reduxValues?.imageUpload2[0])
                          : existingImages[1]
                      }
                      placeholderImg="https://i.ibb.co/y8RhMrL/Untitled-design.png"
                    />
                  ) : (
                    <>
                      <FiPlus />
                      <svg
                        className="dahsed-border"
                        width="424"
                        height="429"
                        viewBox="0 0 424 429"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="1.75789"
                          y="2.5721"
                          width="420.485"
                          height="423.814"
                          rx="47.4566"
                          stroke="#DDDDDD"
                          strokeWidth="3.5153"
                          strokeDasharray="35.15"
                        />
                      </svg>
                    </>
                  )}
                </label>
              </div>
              <div className="col-4">
                <label style={{ margin: "0" }}>
                  <Field
                    name="imageUpload3"
                    component={Inputs.uploadFileField}
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      if (
                        // !event.target.files[0]?.name.match(
                        //   /\.(jpg|jpeg|png|gif)$/
                        // )
                        !event.target.files[0]?.name.match(/\.(jpg|jpeg|png)$/)
                      ) {
                        setImageError(true);
                        event.preventDefault();
                      } else {
                        validateImageDimension(event, 200, 200, "imageUpload3");
                      }
                    }}
                    props={{
                      disabled:
                        fromNotifPage &&
                        (notifType === "description" ||
                          notifType === "tagline" ||
                          notifType === "taglineAndDesc"),
                    }}
                  />
                  {reduxValues?.imageUpload3?.length > 0 || existingImages[2] ? (
                    // <img
                    //   alt="not fount"
                    //   style={{ objectFit: "cover" }}
                    //   width={"250px"}
                    // src={
                    //   typeof reduxValues?.imageUpload3 === "string"
                    //     ? reduxValues?.imageUpload3
                    //     : reduxValues?.imageUpload3?.length > 0
                    //     ? URL.createObjectURL(reduxValues?.imageUpload3[0])
                    //     : user?.images[2]
                    // }
                    // />
                    <ImageShow
                      alt="not fount"
                      style={{ objectFit: "cover" }}
                      width={"250px"}
                      setLoading={setUploadImage3Loading}
                      src={
                        typeof reduxValues?.imageUpload3 === "string"
                          ? reduxValues?.imageUpload3
                          : reduxValues?.imageUpload3?.length > 0
                          ? URL.createObjectURL(reduxValues?.imageUpload3[0])
                          : existingImages[2]
                      }
                      placeholderImg="https://i.ibb.co/y8RhMrL/Untitled-design.png"
                    />
                  ) : (
                    <>
                      <FiPlus />
                      <svg
                        className="dahsed-border"
                        width="424"
                        height="429"
                        viewBox="0 0 424 429"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="1.75789"
                          y="2.5721"
                          width="420.485"
                          height="423.814"
                          rx="47.4566"
                          stroke="#DDDDDD"
                          strokeWidth="3.5153"
                          strokeDasharray="35.15"
                        />
                      </svg>
                    </>
                  )}
                </label>
              </div>
              <div className="col-4">
                <label style={{ margin: "0" }}>
                  <Field
                    name="imageUpload4"
                    component={Inputs.uploadFileField}
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      if (
                        // !event.target.files[0]?.name.match(
                        //   /\.(jpg|jpeg|png|gif)$/
                        // )
                        !event.target.files[0]?.name.match(/\.(jpg|jpeg|png)$/)
                      ) {
                        setImageError(true);
                        event.preventDefault();
                      } else {
                        validateImageDimension(event, 200, 200, "imageUpload4");
                      }
                    }}
                    props={{
                      disabled:
                        fromNotifPage &&
                        (notifType === "description" ||
                          notifType === "tagline" ||
                          notifType === "taglineAndDesc"),
                    }}
                  />
                  {reduxValues?.imageUpload4?.length > 0 || existingImages[3] ? (
                    // <img
                    //   alt="not fount"
                    //   style={{ objectFit: "cover" }}
                    //   width={"250px"}
                    // src={
                    //   typeof reduxValues?.imageUpload4 === "string"
                    //     ? reduxValues?.imageUpload4
                    //     : reduxValues?.imageUpload4?.length > 0
                    //     ? URL.createObjectURL(reduxValues?.imageUpload4[0])
                    //     : user?.images[3]
                    // }
                    // />
                    <ImageShow
                      alt="not fount"
                      style={{ objectFit: "cover" }}
                      width={"250px"}
                      setLoading={setUploadImage4Loading}
                      src={
                        typeof reduxValues?.imageUpload4 === "string"
                          ? reduxValues?.imageUpload4
                          : reduxValues?.imageUpload4?.length > 0
                          ? URL.createObjectURL(reduxValues?.imageUpload4[0])
                          : existingImages[3]
                      }
                      placeholderImg="https://i.ibb.co/y8RhMrL/Untitled-design.png"
                    />
                  ) : (
                    <>
                      <FiPlus />
                      <svg
                        className="dahsed-border"
                        width="424"
                        height="429"
                        viewBox="0 0 424 429"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="1.75789"
                          y="2.5721"
                          width="420.485"
                          height="423.814"
                          rx="47.4566"
                          stroke="#DDDDDD"
                          strokeWidth="3.5153"
                          strokeDasharray="35.15"
                        />
                      </svg>
                    </>
                  )}
                </label>
              </div>
              <div className="col-4 w-100 mb-4">
                <lable style={{ margin: "0" }}>
                  {isImageTouched &&
                    (fileSizeError ? (
                      <span className="error">
                        Photo is too large. Maximum file size is 5 MB.
                      </span>
                    ) : dimensionValid?.height ? (
                      <span className="error">
                        Photo is too small. It should be at least{" "}
                        {dimensionValid?.width} x {dimensionValid?.height}{" "}
                        pixels.
                      </span>
                    ) : !reduxValues?.imageUpload?.length > 0 ||
                      !reduxValues?.imageUpload2?.length > 0 ||
                      !reduxValues?.imageUpload3?.length > 0 ||
                      !reduxValues?.imageUpload4?.length > 0 ? (
                      <span className="error">* Upload at least 4 photos</span>
                    ) : isImageValid ? (
                      <span className="error">
                        Only JPG, JPEG or PNG photos are allowed.
                      </span>
                    ) : (
                      ""
                    ))}
                </lable>
              </div>
            </div>
            {/* {isImageTouched &&
              (dimensionValid?.height ? (
                <span className="error">
                  Image should be greater than {dimensionValid?.height}*
                  {dimensionValid?.width}
                </span>
              ) : !reduxValues?.imageUpload?.length > 0 ||
                !reduxValues?.imageUpload2?.length > 0 ||
                !reduxValues?.imageUpload3?.length > 0 ||
                !reduxValues?.imageUpload4?.length > 0 ? (
                <span className="error">* Upload at least 4 photos</span>
              ) : isImageValid ? (
                "Please Select Image Only"
              ) : (
                ""
              ))} */}
            <Field
              name="tagline"
              component={Inputs.inputField}
              type="text"
              label="Your tagline"
              placeholder="Write a few words to tempt"
              validationLength={100}
              props={{
                disabled:
                  fromNotifPage &&
                  (notifType === "description" ||
                    notifType === "photos" ||
                    notifType === "photosDescription"),
              }}
            />
            <div className="offer-textarea">
              <Field
                name="description"
                component={Inputs.textarea}
                type="text"
                label="What do you offer?"
                placeholder="Describe yourself with as much detail as possible to ensure you connect with the right person. Write your likes and dislikes along with why someone should choose you as their date "
                validationLength={500}
                disabled={
                  fromNotifPage &&
                  (notifType === "tagline" ||
                    notifType === "photos" ||
                    notifType === "photosTagline")
                    ? true
                    : false
                }
              />
            </div>
          </div>
          <div className="bottom-mobile register-bottom">
            <div className="secret-input type-submit next-prev">
              {/* <a onClick={previousPage} className="prev">
                         <FiChevronLeft />
                       </a> */}
              <button
                type="submit"
                className="next"
                disabled={!isStep2Valid || loading}
              >
                {loading ? (
                  <span className="spin-loader-button"></span>
                ) : (
                  <>
                    Next
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </>
    );
  }
};

export default reduxForm({
  form: "signupStep2", // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  validate,
})(SecondStep);
