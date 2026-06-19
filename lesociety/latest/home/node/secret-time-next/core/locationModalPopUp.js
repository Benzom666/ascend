import React from "react";
const MapImage = "/assets/img/map-image.png";
const ManImage = "/assets/img/man-img.jpeg";
import useWindowSize from "utils/useWindowSize";
import { FiArrowRight } from "react-icons/fi";
const UserImg = "/assets/img/profile.png";
import { useSelector } from "react-redux";
import ImageShow from "@/modules/ImageShow";
import { Inputs } from ".";
import { useEffect } from "react";

function Modal({ currentLocationLoading, show, ...props }) {
  const user = useSelector((state) => state.authReducer.user);
  const { width } = useWindowSize();
  if (!show) {
    return null;
  }

  return (
    <div className="modal-1 modal-open">
      <div className="modal_content">
        <div className="modal_header">
          <h2 className="modal-title">
            Do you want to use your current location to find local dates ?
          </h2>
        </div>
        <div className="modal-body-1">
          <div className="modal-body-text">
            <p>
              We will never share this information with outside parties, it is
              solely used to enhance your experience,
            </p>
          </div>
          <div className="Modal-body-image">
            {/* <img
              // src={ManImage}
              src={!_.isEmpty(user) ? user?.images[0] : UserImg}
              alt="man-img"
              height={100}
              width={100}
              style={{
                borderRadius: "7px",
                border: "2px solid white",
                position: "absolute",
                top: "-4%",
                left: "32%",
              }}
            /> */}
            {width > 500 ? (
              <ImageShow
                alt="man-img"
                height={120}
                width={120}
                style={{
                  borderRadius: "7px",
                  border: "2px solid white",
                  position: "absolute",
                  top: "-4%",
                  left: "30%",
                }}
                src={!_.isEmpty(user) ? user?.images?.[0] : UserImg}
                placeholderImg="https://i.ibb.co/y8RhMrL/Untitled-design.png"
              />
            ) : (
              <ImageShow
                alt="man-img"
                height={120}
                width={120}
                style={{
                  borderRadius: "7px",
                  border: "2px solid white",
                  position: "absolute",
                  top: "-4%",
                  left: "33%",
                }}
                src={!_.isEmpty(user) ? user?.images?.[0] : UserImg}
                placeholderImg="https://i.ibb.co/y8RhMrL/Untitled-design.png"
              />
            )}
            <img
              style={{ borderRadius: "50%", textAlign: "center" }}
              src={MapImage}
              height="100%"
              width="100%"
              alt="map-img"
            />
          </div>
        </div>
        <div className="modal_footer">
          <p onClick={props.onClose} className="modal-footer-text">
            Skip this step
          </p>
          <button
            className="footer-btn"
            onClick={props.handleFectchCurrentLocation}
          >
            {currentLocationLoading ? (
              <span className="spin-loader"></span>
            ) : (
              <>
                {" "}
                Search nearby <FiArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
