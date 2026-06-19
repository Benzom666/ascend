import React, { useEffect } from "react";
import { useRouter } from "next/router";
import MaxDatesReachedPopup from "@/components/popups/MaxDatesReachedPopup";
import { clearCreateDateFlow } from "utils/createDateFlow";

function CreateDateLimitReachedPage() {
  const router = useRouter();

  useEffect(() => {
    clearCreateDateFlow({ flowMode: "create" });
    clearCreateDateFlow({ flowMode: "draft-edit" });
  }, []);

  return (
    <div className="create-date-limit-page">
      <MaxDatesReachedPopup
        isOpen={true}
        onClose={() => router.push("/user/user-list")}
      />

      <style jsx>{`
        .create-date-limit-page {
          min-height: 100vh;
          background: #000000;
        }
      `}</style>
    </div>
  );
}

export default CreateDateLimitReachedPage;
