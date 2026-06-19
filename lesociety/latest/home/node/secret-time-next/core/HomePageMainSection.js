import { element } from "prop-types";
import React, { useState } from "react";
import useWindowSize from "utils/useWindowSize";
import Image from "next/image";

function HomePageMainSection(props) {
  const { title, maincardImage, children, styles } = props;
  const { width } = useWindowSize();
  const myLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 50}`;
  };
  return (
    <>
      <div className="container">
        {/* <div className={`row align-items-center mx-0 home-main-section ${styles}`}>
      {width >769 &&   <div className="col-lg-3 col-sm-12">
          <div className='main-title'>
            <h5>{title}</h5>
          </div>
        </div>}
        <div className="col-lg-5 col-sm-12 main-card-side-wraper">
          <div className='main-card'>
            <div className='main-card-side-wraper-1'>
              {<img src={maincardImage}  alt="main-img" style={{height:"47rem"}}/>}
            </div>
          </div>
        </div>
        {width <769 &&   <div className="col-lg-3 col-sm-12 mt-5">
          <div className='main-title'>
            <h5>{title}</h5>
          </div>
        </div>}
        <div className="col-lg-4 col-sm-12">
          {children}
        </div>
      </div> */}
      </div>
      <div className="main-container">
        {width > 769 && <h2 className="heading-text">{title}</h2>}
        <img
          src={maincardImage}
          alt="logo"
          className="main-image"
          style={{
            width: "100%",
          }}
        />
        {/* <Image
          src={maincardImage}
          alt="logo"
          className="main-image"
          // loader={myLoader}
          priority={true}
          height={width > 768 ? 980 : 695}
          width={width > 768 ? 450 : 320}
          // placeholder="blur"
          // blurDataURL="https://i.ibb.co/y8RhMrL/Untitled-design.png"
        /> */}
        {width < 769 && <h2 className="heading-text">{title}</h2>}
        <p className="info-text">{children}</p>
      </div>
    </>
  );
}

export default HomePageMainSection;
