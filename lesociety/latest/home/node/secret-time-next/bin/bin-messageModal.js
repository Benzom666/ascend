import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { apiRequest } from "utils/Utilities";
import CustomInput from "Views/CustomInput";
import MessageSend from "assets/Send.svg";
import MessageSend2 from "assets/message_send2.png";
import * as Yup from "yup";
import Image from "next/image";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logout } from "@/modules/auth/authActions";

import MessageSend3 from "assets/message_new.svg";
import MessageSend4 from "assets/Path.svg";
import MessageSend5 from "assets/Send.svg";
import useWindowSize from "utils/useWindowSize";

function MessageModal({ user, date, toggle, userMessageNoModal, close }) {
  const [classPopup, setPopupClass] = React.useState("hide");
  const [receiverData, setReceiverData] = React.useState("");

  const [messageError, setMessageError] = React.useState("");
  const [textClass, setTextSlideClass] = React.useState("");

  const router = useRouter();
  const dispatch = useDispatch();

  const { width } = useWindowSize();

  const closePopup = () => {
    setPopupClass("hide");
  };

  const openPopup = (item) => {
    setPopupClass("show");
    const icon = document?.querySelector(".icon-move");
    const dummyIcon = document?.querySelector(".icon-move-1");
    const dimension = dummyIcon?.getBoundingClientRect();
    icon.style.left = dimension?.left + "px";
    icon.style.top = dimension?.top - 310 + "px";

    setReceiverData(item);
  };

  const moveIcon = () => {
    setTextSlideClass("show");
    const element = document.querySelector(".icon-move");
    const target = document.getElementById("message-icon");
    if (target && element) {
      element.style.opacity = 1;
      const xT = target.offsetLeft;
      const yT = target.offsetTop;
      const xE = element.offsetLeft;
      const yE = element.offsetTop;
      // set elements position to their position for smooth animation
      element.style.left = xE + "px";
      element.style.top = yE + "px";
      // set their position to the target position
      // the animation is a simple css transition
      element.style.left = xT + 5 + "px";
      element.style.top = yT + 5 + "px";
      target.scrollIntoView();
    }
    setTimeout(() => {
      element.style.opacity = 0;
      closePopup();
      setTextSlideClass("");
    }, 1000);
  };

  const handleUserMessageSubmit = async (values) => {
    // moveIcon();
    try {
      const data = {
        senderId: user?._id ?? "",
        recieverId: date?.user_data?.length > 0 ? date?.user_data[0]?._id : "",
        message: values.message ?? "",
        dateId: date?._id ?? "",
      };
      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `chat/request`,
      });

      console.log("res", res);
      values.message = "";
      close();
    } catch (err) {
      setMessageError(err.response?.data?.message ?? "");
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
    return;
  };

  const handleSubmit = async (values) => {
    if (userMessageNoModal) {
      handleUserMessageSubmit(values);
      return;
    }

    moveIcon();
    console.log("values", values);
    try {
      const data = {
        senderId: user?._id ?? "",
        recieverId:
          receiverData?.user_data?.length > 0
            ? receiverData?.user_data[0]?._id
            : "",
        message: values.message ?? "",
        dateId: receiverData?._id ?? "",
      };
      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `chat/request`,
      });
      toggle();
      closePopup();
      console.log("res", res);
      values.message = "";
    } catch (err) {
      setMessageError(err.response?.data?.message ?? "");
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
    return;
  };

  return (
    <>
      {userMessageNoModal ? (
        <div>
          <Formik
            initialValues={{
              message: "",
            }}
            validationSchema={Yup.object({
              message: Yup.string().required("Please enter your message"),
            })}
            onSubmit={(values) => {
              if (values.message?.trim() !== "") {
                handleSubmit(values);
              }
            }}
          >
            {(formProps) => {
              return (
                <Form>
                  <div className="user-message-popup">
                    <Field
                      className={`user-message-popup-input`}
                      placeholder="Type your message here…"
                      name="message"
                      id="message"
                      component={CustomInput}
                    />
                    <button
                      type="button"
                      style={{
                        // position: "absolute",
                        // right: width > 767 ? "5%" : "10%",
                        // bottom: "6.5%",
                        background: "transparent",
                        border: "none",
                        paddingBottom: "5px",
                        borderRadius: "0",
                        marginTop: "30px",
                        marginLeft: "8px",
                      }}
                      // className="icon-move-1"
                    >
                      <Image
                        src={
                          formProps.values.message === ""
                            ? MessageSend4
                            : MessageSend2
                        }
                        alt="send-btn"
                        type="submit"
                        onClick={() => {
                          handleSubmit(formProps.values);
                          formProps.resetForm();
                        }}
                        className="no-radius"
                        layout="intrinsic"
                        objectFit="contain"
                        width={45}
                        height={45}
                      />
                    </button>

                    {/* <button
                      //className="icon-move"
                      id="message-icon"
                      type="submit"
                      // className="message-user-popup-button icon-move-1"
                      className="message-user-popup-button"
                    >
                      <Image
                        src={
                          formProps.values.message === ""
                            ? MessageSend
                            : MessageSend2
                        }
                        alt="send-btn"
                        onClick={() => {
                          handleSubmit(formProps.values);
                          formProps.resetForm();
                        }}
                        className="no-radius"
                        width={30}
                        height={30}
                      />
                      <Image
                        src={MessageSend3}
                        alt="send-btn"
                        onClick={() => {
                          handleSubmit(formProps.values);
                          formProps.resetForm();
                        }}
                        className="no-radius"
                        width={50}
                        height={50}
                      />
                      <Image
                        src={MessageSend4}
                        alt="send-btn"
                        onClick={() => {
                          handleSubmit(formProps.values);
                          formProps.resetForm();
                        }}
                        className="no-radius"
                        width={50}
                        height={50}
                      />
                      <Image
                        src={MessageSend4}
                        alt="send-btn"
                        onClick={() => {
                          handleSubmit(formProps.values);
                          formProps.resetForm();
                        }}
                        className="no-radius"
                        width={50}
                        height={50}
                      />
                      <Image
                        src={MessageSend5}
                        alt="send-btn"
                        onClick={() => {
                          handleSubmit(formProps.values);
                          formProps.resetForm();
                        }}
                        className="no-radius"
                        width={50}
                        height={50}
                      />
                    </button> */}
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      ) : (
        <>
          <button onClick={() => openPopup(date)} className="next">
            Message
          </button>
          {/* <svg
            onClick={moveIcon}
            className="icon-move"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.6048 0.407386C13.2546 0.0480202 12.7364 -0.0858618 12.2532 0.0550622L0.9856 3.33166C0.47579 3.4733 0.114443 3.87988 0.0171013 4.39639C-0.0823407 4.92205 0.265006 5.58935 0.718788 5.86838L4.24193 8.03376C4.60328 8.25573 5.06967 8.20008 5.36869 7.89845L9.40303 3.83901C9.6061 3.62762 9.94224 3.62762 10.1454 3.83901C10.3484 4.04336 10.3484 4.37455 10.1454 4.58594L6.104 8.64612C5.80426 8.94698 5.74826 9.41556 5.96883 9.77914L8.12154 13.3377C8.37361 13.7604 8.80782 14 9.28396 14C9.34003 14 9.40303 14 9.4591 13.9929C10.0053 13.9225 10.4395 13.5491 10.6005 13.0206L13.9409 1.76735C14.088 1.2882 13.9549 0.766759 13.6048 0.407386Z"
              fill="#686868"
            />
          </svg> */}
          <div id="message-popup" className={`message-popup ${classPopup}`}>
            <span onClick={closePopup} className="close-button">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.9924 12.9926L1.00244 1.00006"
                  stroke="white"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12.9887 1.00534L1.00873 12.9853"
                  stroke="white"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <p className="msg">
              "
              {receiverData?.user_data?.length > 0 &&
                receiverData?.user_data[0]?.tagline}
              "
            </p>
            <div>
              <Formik
                initialValues={{
                  message: "",
                }}
                validationSchema={Yup.object({
                  message: Yup.string().required("Please enter your message"),
                })}
                onSubmit={(values) => {
                  if (values.message?.trim() !== "") {
                    handleSubmit(values);
                  }
                }}
              >
                {(formProps) => {
                  return (
                    <Form>
                      <div className="position-relative">
                        <Field
                          className={`${textClass}`}
                          placeholder="Type your message here…"
                          name="message"
                          id="message"
                          component={CustomInput}
                        />

                        <button
                          type="button"
                          style={{
                            position: "absolute",
                            left: "82%",
                            background: "transparent",
                            border: "none",
                            paddingBottom: "5px",
                            width: "12%",
                            borderRadius: "0",
                          }}
                          // className="icon-move-1"
                        >
                          <Image
                            src={
                              formProps.values.message === ""
                                ? MessageSend
                                : MessageSend2
                            }
                            alt="send-btn"
                            type="submit"
                            onClick={() => {
                              handleSubmit(formProps.values);
                              formProps.resetForm();
                            }}
                            className="no-radius"
                            width={30}
                            height={30}
                          />
                        </button>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
            <p className="tip">Tip: Maybe mention why you’re here.</p>
          </div>
        </>
      )}
    </>
  );
}

export default MessageModal;
