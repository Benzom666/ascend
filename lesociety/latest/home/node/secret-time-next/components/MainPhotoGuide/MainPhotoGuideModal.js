import React, { useState } from "react";
import { apiRequest } from "utils/Utilities";
import { changeImageWaringPopup, logout } from "../../modules/auth/authActions";
import { useRouter } from "next/dist/client/router";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
const NoImage = "/assets/image_warning_popup.png";
import Image from "next/image";
import useWindowSize from "utils/useWindowSize";

const MainPhotoGuideModal = ({ hideModal, setHideModal, showAnimation }) => {
  const [checked, setChecked] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(!hideModal);
  const user = useSelector((state) => state.authReducer.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const checkHandler = () => {
    setChecked(!checked);
  };

  const { width } = useWindowSize();

  console.log("user?._id", user?._id);

  const modalHandleSubmit = async (values) => {
    if (!checked) {
      setHideModal(true);
      return;
    }
    try {
      const data = {
        image_warning_popup: checked,
      };
      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `user/update-image-warning-popup/${user?._id}`,
      });
      dispatch(changeImageWaringPopup(false));

      setHideModal(true);
    } catch (err) {
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
    <div className="image__popup__container">
      <div
        className={`image__warning__popup show_1 ${
          showAnimation ? "show_1" : ""
        }`}
      >
        <div className="popup_heading">Main Photo Guidelines</div>
        <div className="popup_text">
          For a top-notch experience,
          {width <= 600 && <br />}
          please follow the instructions.
        </div>
        <div className="popup__image">
          <Image src={NoImage} alt="NoImage" width={169} height={254} />
        </div>
        <div className="list-of-warning">
          <ul>
            <li> Should feature ONLY you</li>
            <li>Photo must be clear</li>
            <li>Filters are NOT allowed</li>
            <li>Keep it classy</li>
          </ul>
          <div className="follow_instruction_text">
            Please follow these rules to gain access.
            <br />
            No filters are allowed, as you cannot
            {width <= 600 && <br />} bring your filter to your date.
          </div>
          {/* <div className="dont-show">
            <div className="dont-show-checkBox">
              <input type="checkbox" checked={checked} />
              <span
                className="checkmark"
                aria-role="checkbox"
                onClick={checkHandler}
                aria-hidden={true}
              ></span>
            </div>
            <p className="dont-show-text">Don’t show this again.</p>
          </div> */}
          <div className="dont-show">
            <div className="dont-show-checkBox">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)} // Assuming you're using state to manage 'checked'
              />
              <label
                className="checkmark"
                aria-role="checkbox"
                onClick={() => setChecked(!checked)} // Also toggle the state on label click
              ></label>
            </div>
            <p className="dont-show-text">Don’t show this again.</p>
          </div>
        </div>
        <div className="warning_modal_footer">
          <button
            type="button"
            className="agree-btn"
            onClick={() => modalHandleSubmit()}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPhotoGuideModal;
