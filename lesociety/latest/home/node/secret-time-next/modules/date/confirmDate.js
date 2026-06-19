import React from "react";
import Modal from "react-modal";
import { useRouter } from "next/router";

const ConfirmDate = ({ toggle, isOpen, onClosePage }) => {
  const router = useRouter();

  const redirect = () => {
    if (onClosePage) {
      onClosePage();
      return;
    }
    router.push("/user/user-list");
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={toggle}
      bodyOpenClassName="open-modal-body"
      portalClassName="overlay-modal"
      className="date-wrapper"
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.82)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        },
        content: {
          position: "relative",
          inset: "auto",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          background:
            "linear-gradient(231.4deg, rgb(46, 49, 58) 18.16%, rgb(25, 25, 25) 95.56%)",
          borderRadius: "28px",
          padding: 0,
          width: "100%",
          maxWidth: "420px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
        },
      }}
    >
      <div
        className="model_content city-wrapper"
        style={{
          padding: "34px 28px 26px",
          textAlign: "center",
          color: "#FFFFFF",
        }}
      >
        <div className="header" style={{ marginBottom: "28px" }}>
          <h4
            className="text-bold-h4 pb-2"
            style={{
              fontSize: "28px",
              lineHeight: 1.1,
              marginBottom: "12px",
              color: "#FFFFFF",
            }}
          >
            Not Ready To Commit?
          </h4>
          <p
            style={{
              margin: 0,
              color: "rgba(255, 255, 255, 0.72)",
              fontSize: "15px",
              lineHeight: 1.5,
            }}
          >
            <strong>Your draft stays saved</strong> and you can resume this date later. 
            However, until you complete and publish, your date will <strong>not be visible</strong> 
            in the gallery — men cannot view or respond to it, and it will <strong>not earn</strong> any money.
          </p>
        </div>
        <div className="button-wrapper" style={{ marginBottom: "14px" }}>
          <button
            type="submit"
            className="next-button"
            onClick={toggle}
            style={{
              width: "100%",
              minHeight: "52px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(90deg, #F24462 0%, #F02D4E 100%)",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            Continue Creating
          </button>
        </div>
        <p
          type="submit"
          className="a-wrapper"
          onClick={redirect}
          style={{
            margin: 0,
            color: "#FF7A9E",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Save draft and close
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDate;
