import React, { useState, useEffect } from "react";
import SecondStep from "./steps/secondStep";
import ThirdStep from "./steps/thirdStep";
import CompleteProfile from "./steps/completeProfile";
import UserProfile from "./userProfile";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
const {
  loadEditProfileFlowState,
  saveEditProfileFlowState,
  clearEditProfileFlowState,
} = require("utils/editProfileFlowState");

const RegisterForm = ({ page, setPage, ...props }) => {
  const router = useRouter();
  const isEditFlow = !!router?.query?.edit;
  const [hasRestoredEditPage, setHasRestoredEditPage] = useState(false);
  // const [page, setPage] = useState(0);
  const user = useSelector((state) => state.authReducer.user);
  const authState = useSelector((state) => state.authReducer);
  const nextPage = () => {
    setPage(page + 1);
    window.scrollTo(0, 0);
  };

  const exitEditProfileFlow = () => {
    clearEditProfileFlowState();
    router.push(user?.status === 2 ? "/user/user-list" : "/auth/verify-profile");
  };

  const previousPage = () => {
    if (page === 0) {
      if (isEditFlow) {
        exitEditProfileFlow();
      } else {
        router.push("/auth/registration");
      }
    } else {
      setPage(page - 1);
    }
    window.scrollTo(0, 0);
  };

  const startPage = () => {
    setPage(0);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (isEditFlow) {
      return;
    }

    if (user?.step_completed === 2) {
      setPage(1);
    }
    if (user?.step_completed === 3) {
      setPage(2);
    }
    if (user?.step_completed === 4) {
      setPage(3);
    }
  }, [isEditFlow, user]);

  useEffect(() => {
    if (isEditFlow) {
      const persistedState = loadEditProfileFlowState();
      const nextPage =
        Number.isInteger(persistedState?.page) && persistedState.page >= 0
          ? Math.min(persistedState.page, 3)
          : 0;
      setPage(nextPage);
      setHasRestoredEditPage(true);
      return;
    }

    setHasRestoredEditPage(false);
  }, [isEditFlow, router?.query]);

  useEffect(() => {
    if (!isEditFlow || !hasRestoredEditPage) {
      return;
    }

    saveEditProfileFlowState({ page });
  }, [hasRestoredEditPage, isEditFlow, page]);
  let notifObj;
  if (router?.query?.type) {
    notifObj = {
      fromNotifPage: true,
      notifType: router?.query?.type,
      id: router?.query?.id,
    };
  }

  return (
    <>
      {page != 2 && (
        <div className="inner-part-page auth-section">
          <div className="container">
            <div className="auth-section auth-section-register">
              <div>
                {page == 0 && !router?.query?.token && (
                  <SecondStep
                    previousPage={previousPage}
                    onSubmit={nextPage}
                    fromRegistration={true}
                    notifObj={notifObj}
                  />
                )}

                {page == 1 && !router?.query?.token && (
                  <ThirdStep previousPage={previousPage} onSubmit={nextPage} />
                )}

                {(page == 3 || router?.query?.token) && <CompleteProfile />}
              </div>
            </div>
          </div>
        </div>
      )}
      {page == 2 && !router?.query?.token && (
        <UserProfile
          editHandle={startPage}
          previousPage={previousPage}
          onSubmit={nextPage}
          preview={true}
        />
      )}
    </>
  );
};

export default RegisterForm;
