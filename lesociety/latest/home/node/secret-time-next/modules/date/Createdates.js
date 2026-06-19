import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import CreateStepOne from "modules/date/createStepOne";
import CreateStepTwo from "modules/date/createStepTwo";
import CreateStepThree from "modules/date/createStepThree";
import CreateStepFour from "modules/date/createStepFour";
import DatePreview from "modules/date/datePreview";
import ConfirmDate from "./confirmDate";
import { startOrResumeCreateDate } from "utils/createDateFlow";
import MaxDatesReachedPopup from "@/components/popups/MaxDatesReachedPopup";
import { useCreateDateAccessGuard } from "utils/createDateAccessGuard";

const CreateDate = () => {
  const [page, setPage] = useState(0);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const router = useRouter();
  const user = useSelector((state) => state?.authReducer?.user);
  const cityState = useSelector((state) => state?.form?.ChooseCity?.values);
  const { isCheckingLimit, isLimitBlocked } = useCreateDateAccessGuard({
    router,
    token: user?.token,
    userName: user?.user_name,
    enabled: Boolean(user?.token || user?.user_name),
  });

  const toggle = () => setConfirmPopup(!confirmPopup);

  useEffect(() => {
    if (router.query.new_edit) {
      setPage(3);
    }
  }, [router.query.new_edit]);

  useEffect(() => {
    if (!router.isReady) return;
    if (cityState?.enter_city) return;

    startOrResumeCreateDate(router, {
      token: user?.token,
      userName: user?.user_name,
    });
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [cityState?.enter_city, router]);

  if (!cityState?.enter_city) {
    return null;
  }

  if (isCheckingLimit) {
    return null;
  }

  if (isLimitBlocked) {
    return (
      <MaxDatesReachedPopup
        isOpen={true}
        onClose={() => router.push("/user/user-list")}
      />
    );
  }

  const nextPage = () => {
    setPage((currentPage) => currentPage + 1);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  const previousPage = () => {
    if (router?.query?.new_edit && page === 3) {
      router.push("/user/user-profile");
      return;
    }

    if (page === 0) {
      startOrResumeCreateDate(router, {
        token: user?.token,
        userName: user?.user_name,
      });
      return;
    }

    setPage((currentPage) => currentPage - 1);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="create-date-wizard-shell">
      {!router.query.drafted && page === 0 && (
        <CreateStepOne
          previousPage={previousPage}
          onSubmit={nextPage}
          onClose={toggle}
          confirmPopup={confirmPopup}
        />
      )}
      {!router.query.drafted && page === 1 && (
        <CreateStepTwo
          previousPage={previousPage}
          onSubmit={nextPage}
          onClose={toggle}
          confirmPopup={confirmPopup}
        />
      )}
      {!router.query.drafted && page === 2 && (
        <CreateStepThree
          previousPage={previousPage}
          onSubmit={nextPage}
          onClose={toggle}
          confirmPopup={confirmPopup}
        />
      )}
      {!router.query.drafted && page === 3 && (
        <CreateStepFour
          previousPage={previousPage}
          onSubmit={nextPage}
          onClose={toggle}
          confirmPopup={confirmPopup}
        />
      )}
      {(router.query.drafted || page === 4) && <DatePreview setPage={setPage} />}
      <ConfirmDate isOpen={confirmPopup} toggle={toggle} />
    </div>
  );
};

export default CreateDate;
