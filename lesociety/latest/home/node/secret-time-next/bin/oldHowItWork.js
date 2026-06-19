import React, { useState, useEffect } from "react";
import withAuth from "../core/withAuth";
import Image from "next/image";
import Link from "next/link";
import useWindowSize from "utils/useWindowSize";
import LeSlogoBlack from "../assets/LeS logo Black.png";
import HomePageMiddleNav from "@/core/HomePageMiddleNav";
import HomeFooter from "@/core/HomeFooter";
import { HowItWorkMain, contentObject } from "@/core/HowItWorkComponent";
import { HowitWorkCardComponent } from "@/core/HowitWorkCardComponent";

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.document.body.style.backgroundColor = "#f2f5f7";
      window.document.body.style.color = "black";
    }
  }, []);
  return (
    <>
      <div className="inner-part-page auth-section how-it-works">
        <div className="howItWork-navbar">
          <nav className="navbar navbar-light bg-#f2f5f7">
            <div className="LeSociety-Icon-White d-flex mt-3">
              <div className="ls-logo">
                <img src={LeSlogoBlack.src} alt="ls-logo" />
              </div>
              <div className="ls-text mt-2 ">
                <p> How it Works</p>
              </div>
            </div>
          </nav>
        </div>
        <HowitWorkCardComponent />
        <HomePageMiddleNav style={style1} styleText={style2} />
        <div className="container-2 mb-5">
          <div className=" col-xl-12 col-lg-12 col-md-12 container-2-title">
            <h3 className="heading">Date Experiences</h3>
            <h3 className="heading">you can enjoy</h3>
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
                  image={e.imgUrl.src}
                  content={e.content}
                />
              );
            })}
            <div className="col mt-5 mx-4 myCard-3">
              <h3
                className="The-future-of-Le-Society"
                style={{ paddingTop: "32px" }}
              >
                The future of
              </h3>
              <h3
                className="The-future-of-Le-Society"
                style={{ padding: "5px", marginBottom: "1rem" }}
              >
                Le Society
              </h3>
              <a href="/future-date" style={{ textDecoration: "none" }}>
                <button type="button" className="btn btn-danger Rectangle-1">
                  Sneak Peak
                </button>
              </a>
              <p className="In-App-Payment-GPS-Tracking-and-more">
                In App Payment <br />
                GPS Tracking
                <br />
                …and more
              </p>
            </div>
          </div>
        </div>
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
