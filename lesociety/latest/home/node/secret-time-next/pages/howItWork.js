import React, { useState, useEffect } from "react";
import withAuth from "../core/withAuth";
import Image from "next/image";
import Link from "next/link";
import useWindowSize from "utils/useWindowSize";
const LeSlogoBlack = "/assets/LeS logo Black.png";
import HomePageMiddleNav from "@/core/HomePageMiddleNav";
import HomeFooter from "@/core/HomeFooter";
import { HowItWorkMain, contentObject } from "@/core/HowItWorkComponent";
import { HowitWorkCardComponent } from "@/core/HowitWorkCardComponent";
import { CustomIcon } from "@/core/icon";
import LadiesFirstHowItWorks from "components/howItWorks/LadiesFirstHowItWorks";
import GentlemenSecondHowItWorks from "components/howItWorks/GentlemenSecondHowItWorks";
import GentlemenPrivacy from "components/howItWorks/GentlemenPrivacy";
import LadiesCreatePerfectDate from "components/howItWorks/LadiesCreatePerfectDate";
import LadiesExplore from "components/howItWorks/LadiesExplore";
import Loader from "@/modules/Loader/Loader";

const style1 = {
  opacity: "0.9",
  backgroundColor: "#1A1A1A",
};

const style2 = {
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
};

const style3 = {
  backgroundColor: "#030303",
};
function HowItWork() {
  const { width } = useWindowSize();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.document.body.style.backgroundColor = "#f2f5f7";
      window.document.body.style.color = "black";
    }
  }, []);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
  }, [loading]);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
      // also hide scrollbar for all browsers
      document.documentElement.style.overflow = "hidden";
    } else {
      // scroll to top

      document.body.style.overflow = "unset";
      // also unhide scrollbar for all browsers
      document.documentElement.style.overflow = "unset";
    }
  }, [loading]);

  return (
    <>
      {loading && (
        <div className="home__loader__layout">
          <div className="home__loader__section">
            <Loader />
          </div>
        </div>
      )}
      <div className="inner-part-page auth-section how-it-works">
        <div className="howItWork__navbar">
          <div className="LeSociety__Icon__White">
            <div className="ls__logo">
              <img src={LeSlogoBlack} alt="ls__logo" />
            </div>
            <div className="ls__text mt-2 ">
              <p> Learn More</p>
            </div>
          </div>
        </div>

        <LadiesFirstHowItWorks />
        <GentlemenSecondHowItWorks />
        <GentlemenPrivacy />
        <LadiesCreatePerfectDate />

        {!loading && <HomePageMiddleNav style={style1} styleText={style2} />}

        <div className="container-2 mb-5">
          <div className=" col-xl-12 col-lg-12 col-md-12 container-2-title">
            <h3 className="heading">
              <CustomIcon.DateExperiencesIcon color={"white"} size={150} />
            </h3>
            <h3 className="heading">You Can Enjoy</h3>
            <p className="sub-heading">
              Ladies, you can choose a date category while the men can select
              their preferred specifics of the date experience, with both
              parties agreeing on something fun and exciting to do within the
              man’s budget.
            </p>
          </div>
          <div className="row container howitwork-main-card-image-section howItWorkImageGroup">
            {contentObject.map((e, index) => {
              return (
                <HowItWorkMain
                  title={e.heading}
                  image={e.imgUrl}
                  content={e.content}
                />
              );
            })}
          </div>
        </div>

        <LadiesExplore />
        <a href="/home" style={{ textDecoration: "none" }}>
          <button type="btn" className="backtoHomepage-btn">
            Go back to homepage
          </button>
        </a>
        <HomeFooter styleBackground={style3} />
      </div>
    </>
  );
}

export default HowItWork;
