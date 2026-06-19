import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Field, reduxForm, change, initialize } from "redux-form";
import validate from "../../validate/validate";
import { Inputs } from "core";
import { FiArrowRight } from "react-icons/fi";
import { FiChevronLeft } from "react-icons/fi";
import { FiPlus } from "react-icons/fi";
import useWindowSize from "../../../../../utils/useWindowSize";
import { imageUploader } from "../../../../../utils/Utilities";
import { deAuthenticateAction } from "@/modules/auth/authActions";
import { useRouter } from "next/router";

const imageRequired = (value) => (!value ? "Image is required" : undefined);

const SecondStep = (props) => {
  const { width } = useWindowSize();
  const [images, setImages] = useState([]);
  const [imageURLs, setImagesURLs] = useState([]);
  const [uploadError, setUploadError] = useState(false);
  const [loading, setLoader] = useState(false);
  const [isImageValid, setImageError] = useState(false);
  const [isImageTouched, setImageTouched] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedChildImage, setSelectedChildImage] = useState(null);
  const [selectedChildImageTwo, setSelectedChildImageTwo] = useState(null);
  const [selectedChildImageThree, setSelectedChildImageThree] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (images.length < 4) {
      setUploadError(!uploadError);
    } else {
      setUploadError(!uploadError);
    }
    const newImageUrls = [];
    images.forEach((images) => newImageUrls.push(URL.createObjectURL(images)));
    setImagesURLs(newImageUrls);
  }, [images]);

  function onImageChange(e) {
    setImages([...e.target.files]);
  }

  const onSubmit = (values) => {
    // const imageUploaded = imageUploader([values.imageUpload, values.imageUpload2, values.imageUpload3, values.imageUpload4]);
    // console.log('object', imageUploaded)
    values.images = JSON.stringify(profileImages);
    values.email = user?.email;
    values.step_completed = 2;
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });
    dispatch(signupStep2(values, setLoader));
  };

  const {
    handleSubmit,
    invalid,
    previousPage,
    pristine,
    reset,
    submitting,
    touched,
  } = props;
  const reduxValues = useSelector((state) => state.form.signupStep2.values);

  return (
    <form className="upload-pics" onSubmit={handleSubmit(onSubmit)}>
      <div className="d-block d-md-none login-text mb-0">
        <a
          onClick={() => {
            previousPage();
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
        <svg
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
        </svg>
      </span>
      <p className="auth-register-p-text">Registration completed</p>
      <h2>Welcome, Dealone</h2>
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
      <div className="images-uploads">
        <div className="big-image">
          <label>
            <Field
              name="imageUpload"
              component={Inputs.uploadFileField}
              type="file"
              accept="image/*"
              onChange={(event) => {
                if (
                  !event.target.files[0].name.match(/\.(jpg|jpeg|png|gif)$/)
                ) {
                  setImageError(true);
                  event.preventDefault();
                } else {
                  setImageError(false);
                  setImageTouched(true);
                  change("imageUpload", event.target.files[0]);
                }
              }}
            />
            {reduxValues?.imageUpload?.length > 0 ? (
              <img
                alt="not fount"
                src={URL.createObjectURL(reduxValues?.imageUpload[0])}
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
        <div className="small-images big-image">
          <div>
            <label>
              <Field
                name="imageUpload2"
                component={Inputs.uploadFileField}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  if (
                    !event.target.files[0].name.match(/\.(jpg|jpeg|png|gif)$/)
                  ) {
                    setImageError(true);
                    event.preventDefault();
                  } else {
                    setImageError(false);
                    setImageTouched(true);
                    change("imageUpload2", event.target.files[0]);
                  }
                }}
              />
              {reduxValues?.imageUpload2?.length > 0 ? (
                <img
                  alt="not fount"
                  width={"250px"}
                  src={URL.createObjectURL(reduxValues?.imageUpload2[0])}
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
          <div>
            <label>
              <Field
                name="imageUpload3"
                component={Inputs.uploadFileField}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  if (
                    !event.target.files[0].name.match(/\.(jpg|jpeg|png|gif)$/)
                  ) {
                    setImageError(true);
                    event.preventDefault();
                  } else {
                    setImageError(false);
                    setImageTouched(true);
                    change("imageUpload3", event.target.files[0]);
                  }
                }}
              />
              {reduxValues?.imageUpload3?.length > 0 ? (
                <img
                  alt="not fount"
                  width={"250px"}
                  src={URL.createObjectURL(reduxValues?.imageUpload3[0])}
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
          <div>
            <label>
              <Field
                name="imageUpload4"
                component={Inputs.uploadFileField}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  if (
                    !event.target.files[0].name.match(/\.(jpg|jpeg|png|gif)$/)
                  ) {
                    setImageError(true);
                    event.preventDefault();
                  } else {
                    setImageError(false);
                    setImageTouched(true);
                    change("imageUpload4", event.target.files[0]);
                  }
                }}
              />
              {reduxValues?.imageUpload4?.length > 0 ? (
                <img
                  alt="not fount"
                  width={"250px"}
                  src={URL.createObjectURL(reduxValues?.imageUpload4[0])}
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
        </div>
        {isImageTouched &&
        (!reduxValues?.imageUpload ||
          !reduxValues?.imageUpload2 ||
          !reduxValues?.imageUpload3 ||
          !reduxValues?.imageUpload4) ? (
          <span className="error">* Upload at least 4 photos</span>
        ) : isImageValid ? (
          "Please Select Image Only"
        ) : (
          ""
        )}
        <Field
          name="tagline"
          component={Inputs.inputField}
          type="text"
          label="Your tagline"
          placeholder="Write a few words to tempt"
        />
        <div className="offer-textarea">
          <Field
            name="offer"
            component={Inputs.textarea}
            type="text"
            label="What do you offer?"
            placeholder="Describe yourself with as much detail as possible to ensure you connect with the right person. Write your likes and dislikes along with why someone should choose you as their date "
          />
        </div>
      </div>
      <div className="bottom-mobile register-bottom">
        <div className="secret-input type-submit next-prev">
          <a onClick={previousPage} className="prev">
            <FiChevronLeft />
          </a>
          <button type="submit" className="next" disabled={invalid}>
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
  );
};

export default reduxForm({
  form: "SecondStep", // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  validate,
})(SecondStep);
