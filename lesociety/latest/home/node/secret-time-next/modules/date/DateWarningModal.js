import React, { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { apiRequest } from "utils/Utilities";
import { logout } from "../auth/authActions";
import { useRouter } from "next/dist/client/router";
import { useDispatch, useSelector } from "react-redux";
import { AUTHENTICATE_UPDATE } from "../auth/actionConstants";

function DateWarningModal({ setHideModal, showAnimation }) {
  const [checked, setChecked] = useState(false);
  const user = useSelector((state) => state.authReducer.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const checkHandler = () => {
    setChecked(!checked);
  };

  const handleSubmit = async (values) => {
    if (!checked) {
      setHideModal(true);
      return;
    }
    try {
      const data = {
        date_warning_popup: checked,
      };
      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `user/update-date-warning-status`,
      });

      dispatch({
        type: AUTHENTICATE_UPDATE,
        payload: { date_warning_popup: true },
      });
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

  const getUpdatedUserDetails = async () => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `user/user-by-name?user_name=${user?.user_name}`,
      });
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
  };

  const closeDateWarningPopup = () => {
    setHideModal(true);
  };

  return (
    <div className="popup_container">
      <div
        className={`warning_popup ${showAnimation ? "show_1" : ""}`}
        style={{ padding: "65px 30px 30px" }}
      >
        {/* <IoIosClose
                    className="mouse-point"
                    size={35}
                    onClick={closeDateWarningPopup}
                    style={{
                        position: 'absolute',
                        top: 30,
                        right: 30,
                    }}
                /> */}
        <div className="popup_heading">
          <h2>Any content that contains the</h2>
          <h2>following will be removed.</h2>
        </div>
        <div className="list-of-warning">
          <ul>
            <li>Escorting/Prostitution</li>
            <li>Personal Contact Info</li>
            <li>Commercial Activity</li>
            <li>Criminal Activity</li>
            <li>Scamming</li>
          </ul>
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
        </div>
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
        <div className="warning_modal_footer">
          <button
            type="button"
            className="agree-btn"
            onClick={() => handleSubmit()}
          >
            Agree and Continue
          </button>
          <p className="footer-text-war">No Refunds will be Issued</p>
        </div>
      </div>
    </div>
  );
}

export default DateWarningModal;
