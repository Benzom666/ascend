import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/router";
import useWindowSize from "utils/useWindowSize";
function VerifiedProfileMobileHeader() {
  const router = useRouter();
  // const width = useWindowSize();
  const goBack = () => {
    router.back();
  };
  return (
    <div className="message-mobile-header">
      <div
        className="message-mobile-header-container"
        style={{ marginLeft: "10px" }}
      >
        <span style={{ marginTop: "5px" }} onClick={goBack}>
          <IoIosArrowBack
            size={25}
            color={"FFFFFF"}
            className="message-mobile-header-icon"
          />
        </span>
        <span
          className="user-details"
          style={{
            fontSize: "20px",
            fontWeight: "400",
            lineHeight: "23px",
            marginTop: "10px",
          }}
        >
          <h3>VERIFICATION</h3>
        </span>
      </div>

      <div className="d-flex justify-content-center mt-1 me-0">
        {/* <div className="p-3"></div> */}
        <div>
          <svg
            width="86"
            height="2"
            viewBox="0 0 86 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="under-line-size"
          >
            <path d="M0 1H86" stroke="url(#paint0_linear_1502:2374)" />
            <defs>
              <linearGradient
                id="paint0_linear_1502:2374"
                x1="96.6181"
                y1="-1.73994"
                x2="7.45495"
                y2="-1.73994"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#FA789B" stopOpacity="0.01" />
                <stop offset="0.489981" stopColor="#F02D4E" />
                <stop offset="1" stopColor="#F24362" stopOpacity="0.01" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default VerifiedProfileMobileHeader;
