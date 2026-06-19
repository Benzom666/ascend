import React from "react";
import useWindowSize from "../../../../../utils/useWindowSize";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { startOrResumeCreateDate } from "utils/createDateFlow";

const CompleteProfile = (props) => {
  const { width } = useWindowSize();
  const router = useRouter();
  const user = useSelector((state) => state.authReducer.user);

  return (
    <div className="upload-pics profile-completion">
      <span className="completion-sign">
        {/* <svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" className='success_svg'>
                    <g stroke="currentColor" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                        <path class="circle" d="M13 1C6.372583 1 1 6.372583 1 13s5.372583 12 12 12 12-5.372583 12-12S19.627417 1 13 1z" />
                        <path class="tick" d="M6.5 13.5L10 17 l8.808621-8.308621" />
                    </g>
                </svg> */}
        <svg
          width="55"
          height="49"
          viewBox="0 0 55 49"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="success_svg"
        >
          <path
            d="M13 20C13 20 16.2474 22.9845 18 25C19.7526 27.0155 23 31.5 23 31.5C23 31.5 30.2048 20.8885 36 15.5C41.7952 10.1115 51.5 5 51.5 5"
            stroke="white"
            stroke-width="5.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="circle"
          />
          <rect width="49" height="49" rx="16" fill="currentColor" />
          <mask
            id="mask0_2_1437"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="49"
            height="49"
          >
            <rect width="49" height="49" rx="16" fill="currentColor" />
          </mask>
          <g mask="url(#mask0_2_1437)">
            <path
              d="M14 20C14 20 17.2474 22.9845 19 25C20.7526 27.0155 24 31.5 24 31.5C24 31.5 31.2048 20.8885 37 15.5C42.7952 10.1115 52.5 5 52.5 5"
              stroke="white"
              stroke-width="5.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="circle"
            />
          </g>
        </svg>
      </span>
      <h2>Profile Completed</h2>
      <p>
        Please verify your email address, by clicking on the link in the email
        that was delivered to your inbox.
        {/* 
{/* 
                {/* 
                You're one step away from <span> meeting generous gents</span> */}
      </p>
      {/* <label className="text-label">
                Don’t wait any longer, start earning <br />
                now by posting your first date!
            </label> */}
      <div className="secret-input type-submit">
        <a
          href="#"
          className="next disable"
          onClick={(event) => {
            event.preventDefault();
            startOrResumeCreateDate(router, {
              token: user?.token,
              userName: user?.user_name,
            });
          }}
        >
          CREATE NEW DATE
        </a>
        {/* <a className="later-my-profile">Later, take me to My profile</a> */}
      </div>
    </div>
  );
};

export default CompleteProfile;
