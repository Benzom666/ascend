import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import withAuth from "../core/withAuth";
import useWindowSize from "utils/useWindowSize";
import LeSlogoWhite from "../assets/LeS logoWhite.png";
import MaskGroup22 from "../assets/img/Mask Group 22.png";
 //import Future_Vedio from "../assets/LSViedo.mp4";
import FutureDates from "@/core/FutureDates";
import HomePageMiddleNav from "@/core/HomePageMiddleNav";
import FutureDateMain from "@/core/FutureDateMain";
import HomeFooter from "@/core/HomeFooter";
import FutureDateVediosection from "@/core/FutureDateVediosection";

const futureDatesContent = {
  futureDatesContent1: {
    title: "The <span class='test'>Future</span> of Dating",
    datingContent:
      "Le Society is the fastest way to secure your dream date. By creating features that enhance the dating experience, security, and transparency, our team is committed to providing a service that benefits all parties.  See how we are raising the bar.",
  },
  futureDatesContent2: {
    title: "OUR MISSION",
    datingContent:
      "It’s time to uberize the dating industry and bridge the gap between beautiful women and regular men that can sometimes be overlooked. A service that empowers women, allowing them to benefit from financial incentives in exchange for their time providing companionship for any occasion or even the opportunity for a long-term relationship. Thus, creating a dating service that not only benefits and incentivizes both parties, but allows men to secure their dream dates faster than any other platform.",
  },
};

const futureDatesMiddleContent = {
  futureDatesMiddleContent1: {
    heading:
      "Full <span class='test'>Transparency</span> is the key to any great relationship.",
    mainHeadingContent:
      "No more ghosting. See where your date is and track how long until your agreed meeting time. You don’t need to process payment until your date has arrived. Use our simple swipe to pay feature to process payment once you have met and enjoy your date.",
    imgText: "GPS tracking <br/>& in app payment",
    imgUrl:""
  },
  futureDatesMiddleContent2: {
    heading: "Share your <span class='test'>live</span> location.",
    mainHeadingContent:
      "To thoroughly enjoy a date, both parties should feel relaxed and safe. To ensure you can fully settle into your date, turn any of your friends into a Le Society security agent. This gives your friends and family access to your exact location along with other important information such as the battery life of your device, push notifications when your phone turns off, and additional information on the gentlemen being met.",
    imgText: "REAL TIME,<br/> sharable data.",
    imgUrl: MaskGroup22,
  },
};
const style1 = {
  opacity: "0.9",
  backgroundColor:"#1A1A1A"
};

const styleBackground = {
  backgroundColor: "#000000",
};

function FutureDate() {
  const { width } = useWindowSize();
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.document.body.style.backgroundColor = "#080808";
    }
  }, []);
  
  return (
    <>
      <div className="inner-part-page auth-section future-dates-main">
        <div className="future-date-navbar">
        <nav className="navbar navbar-dark bg-#080808">
          <div className="LeSociety-Icon-White d-flex">
            <div className="ls-logo">
              <img src={LeSlogoWhite.src} alt="ls-logo" width="35px" />
            </div>
          </div>
        </nav>
        </div>
        <FutureDates title={futureDatesContent.futureDatesContent1.title}
          contentaboutDating={futureDatesContent.futureDatesContent1.datingContent} />
           <FutureDateVediosection heading={futureDatesMiddleContent.futureDatesMiddleContent1.heading}
           mainHeadingContent ={futureDatesMiddleContent.futureDatesMiddleContent1.mainHeadingContent}
           imgUrl={futureDatesMiddleContent.futureDatesMiddleContent1.imgUrl} 
           imgText={futureDatesMiddleContent.futureDatesMiddleContent1.imgText}
           />
        {/* <FutureDateMain heading={futureDatesMiddleContent.futureDatesMiddleContent1.heading}
        mainHeadingContent ={futureDatesMiddleContent.futureDatesMiddleContent1.mainHeadingContent}
        imgUrl={futureDatesMiddleContent.futureDatesMiddleContent1.imgUrl} 
        imgText={futureDatesMiddleContent.futureDatesMiddleContent1.imgText}
         /> */}
        <HomePageMiddleNav style={style1}/>
        <FutureDateMain heading={futureDatesMiddleContent.futureDatesMiddleContent2.heading}
        mainHeadingContent ={futureDatesMiddleContent.futureDatesMiddleContent2.mainHeadingContent}
        imgUrl={futureDatesMiddleContent.futureDatesMiddleContent2.imgUrl} 
        imgText={futureDatesMiddleContent.futureDatesMiddleContent2.imgText}
        />
        {/* <FutureDates title={futureDatesContent.futureDatesContent2.title}
          contentaboutDating={futureDatesContent.futureDatesContent2.datingContent} /> */}

          <a  href='/home' style={{textDecoration:"none"}}>
          <button type='btn' className='backtoHomepage-btn'>Go back to homepage</button>
          </a>
          
        <HomeFooter logo={LeSlogoWhite} height={50} styleBackground ={styleBackground} />
      </div>
    </>
  );
}

export default FutureDate;
