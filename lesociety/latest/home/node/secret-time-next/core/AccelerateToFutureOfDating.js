import React from "react";
import { CustomIcon } from "./icon";
const Iphone15 = "/assets/homePage/iPhone 15.png";
const Iphone15Mobile = "/assets/homePage/iPhone 15 -mobile.png";
import { router, useRouter } from "next/router";
import useWindowSize from "utils/useWindowSize";

function AccelerateToFutureOfDating() {
  const router = useRouter();

  const { width } = useWindowSize();

  const accelarateImage = width > 768 ? Iphone15 : Iphone15Mobile;

  // detect for iphone
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  console.log("isIOS", isIOS);

  return (
    <>
      <div className="accelerate__wrapper">
        <h1 className="accelerate__future__dating__icon">
          <span>
            {width > 1024 ? (
              <CustomIcon.AccelerateFutureOfDatingIcon />
            ) : (
              <CustomIcon.AccelerateFutureOfDatingMobileIcon />
            )}
          </span>
          to the Future of Dating
        </h1>
        <div className="accelerate__container">
          <div className="level2">
            <h6>Level 2: </h6>
            <div className="super__interested__icon">
              <div className="super">
                <CustomIcon.RequestSuperText color={"white"} size={150} />
              </div>
              <CustomIcon.IntrestedText color={"white"} size={150} />
            </div>
            <p className="inerested__text beyond__date__experience">
              Beyond the date experience, you're also keen on supporting her
              aspirations, which accelerates the path to a memorable first date.
              This supercharges presence, making you stand out even more
            </p>
            {/* <div className="line__progress">
              <CustomIcon.AccelerateFutureOfDatingProgressBarIcon
                color={"white"}
                size={150}
              />
            </div> */}
            <div className="progress__line2__wrapper">
              <div class="progress-line"></div>
              <div className="progress__line__black"></div>
            </div>
            <p className="progress__text">
              Your Chance of Securing a Date Compared to Traditional Dating
              Sites.
            </p>
            {/* <div className="image__progress1">
              <CustomIcon.AccelerateFutureOfDatingImageProgressBarIcon1
                color={"white"}
                size={150}
              />
            </div> */}
            <div
              className={`image__progress1 ${
                isIOS ? "iphone__image__progress1" : undefined
              }`}
            >
              <div className="diagonal-line"></div>
              <div className="progress__circle"></div>
            </div>
          </div>
          <div className="accelerate-iphone-image__wrapper">
            <img
              src={accelarateImage}
              alt="logo"
              className="accelerate-iphone-image"
            />
          </div>
          <div className="level1">
            <h6>Level 1: </h6>
            <div className="only__interested__icon">
              <CustomIcon.IntrestedText color={"white"} size={150} />
            </div>
            <p className="inerested__text">
              You are interested in her and her aspirations, and you would like
              to treat her to the date experience she's handpicked, laying the
              foundation for a genuine connection.
            </p>
            {/* <div className="line__progress">
              {" "}
              <CustomIcon.AccelerateFutureOfDatingProgressBarIcon
                color={"white"}
                size={150}
              />
            </div> */}
            <div className="progress__line__wrapper">
              <div class="progress-line"></div>
              <div className="progress__line__black"></div>
            </div>
            <p className="progress__text">
              Your Chance of Securing a Date Compared to Traditional Dating
              Sites.
            </p>
            <div
              className={`image__progress2 ${
                isIOS ? "iphone__image__progress2" : undefined
              }`}
            >
              <div className="diagonal-line"></div>
              <div className="progress__circle"></div>
            </div>
          </div>
        </div>

        {/* <a
          href="/howItWork"
          className="learn__more__wrapper"
          id="howitworkbtn"
          // onClick={() => router.push("/howItWork")}
        >
          <div className="learn__more">Learn More</div>
        </a> */}
        <a href="/howItWork" className="learn__more__wrapper">
          <button type="btn" className="learn__more">
            Learn More
          </button>
        </a>
      </div>
    </>
  );
}

export default AccelerateToFutureOfDating;
