import React, { useState } from "react";
import Modal from "react-modal";
import { apiRequest } from "utils/Utilities";
import { logout } from "../auth/authActions";
import { useRouter } from "next/dist/client/router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { AUTHENTICATE_UPDATE } from "../auth/actionConstants";
import { CSSTransition } from "react-transition-group";

const CreatedatesWarningPopUp = ({ setHideModal, hideModal, val }) => {
  const user = useSelector((state) => state.authReducer.user);
  const showWarningPopup = !hideModal && val.length > 0;
  const [modalIsOpen, setIsOpen] = useState(showWarningPopup);
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.date_warning_popup) {
      setHideModal(true);
    }
  }, [user]);

  useEffect(() => {
    setIsOpen(showWarningPopup);
  }, [showWarningPopup]);

  const handleSubmit = async () => {
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

  const closeDateWarningPopup = () => {
    setHideModal(true);
    setIsOpen(false);
  };

  return showWarningPopup ? (
    <div>
      <CSSTransition in={modalIsOpen} timeout={300} classNames="dialog">
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeDateWarningPopup}
          ariaHideApp={false}
          closeTimeoutMS={2000}
          contentLabel="Example Modal"
          overlayClassName="overlay-modal"
          className="Warning_Popup"
        >
          <div className="warning_modal_main">
            <div className="WarnigPopUp_Heading">
              <h2>Any content that contains the </h2>
              <h2>following will be removed</h2>
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
              <div className="dont-show">
                <div className="dont-show-checkBox">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                  />
                  <label
                    className="checkmark"
                    aria-role="checkbox"
                    onClick={() => setChecked(!checked)}
                  ></label>
                </div>
                <p className="dont-show-text">Don’t show this again.</p>
              </div>
            </div>
            <div className="warning_modal_footer">
              <button type="button" onClick={() => handleSubmit()}>
                Agree and Continue
              </button>
              <p className="footer-text-war">No Refunds will be Issued</p>
            </div>
          </div>
        </Modal>
      </CSSTransition>
    </div>
  ) : null;
};

export default CreatedatesWarningPopUp;
