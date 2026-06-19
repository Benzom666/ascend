import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import withAuth from "../core/withAuth";
import LeSlogoWhite from "../assets/LeS logoWhite.png";
import LeSlogoText from "../assets/img/LeSocietylogotext.png";
import Sun from "../assets/svg/sun.svg";
import Bottle from "../assets/svg/bottle.svg";
import Dine from "../assets/svg/dine.svg";
import Ticket from "../assets/svg/ticket.svg";
import Paint from "../assets/svg/paint.svg";
import Sport from "../assets/svg/sport.svg";
import Moon from "../assets/svg/moon.svg";
import Gentalman4 from "../assets/img/Gentalman_4.png";
import Ladies4 from "../assets/img/Ladies4.png";
import Goal4 from "../assets/img/Goal4.png";
import Choice4 from "../assets/img/Choice4.png";
import Ladies from "../assets/img/Ladies.png";
import Goal from "../assets/img/Goal.png";
import Choice from "../assets/img/Choice.png";
import HomePageMainSection from "@/core/HomePageMainSection";
import HomePageCardSection from "@/core/HomePageCardSection";
import HomeFooter from "@/core/HomeFooter";
import { content } from "@/core/HomePageContent";
import HomePageMiddleNav from "@/core/HomePageMiddleNav";
import HomePageCardSectionMobile from "@/core/HomePageCardSectionMobile";
import useWindowSize from "utils/useWindowSize";
import Loader from "@/modules/Loader/Loader";

const style1 = {
  // opacity: "0.9",
  // backgroundColor: "#1A1A1A",
  opacity: "1",
  backgroundColor: "transparent",
};
const style2 = {
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
};
const styleBackground = {
  backgroundColor: "#000000",
};
function HomePage({ items }) {
  const { width } = useWindowSize();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, [loading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.document.body.style.backgroundColor = "#080808";
    }
  }, []);
  const desktop = width > 768;

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

  console.log("loading", loading);
  return (
    <>
      <div className="inner-part-page auth-section home_page_style">
        {loading && (
          <div className="home__loader__layout">
            <div className="home__loader__section">
              <Loader />
            </div>
          </div>
        )}
        <div className="home-page-navbar">
          <nav className="navbar navbar-dark bg-#080808">
            <div className="LeSociety-Icon-White d-flex">
              <div className="ls-logo">
                <Image src={LeSlogoWhite} alt="ls-logo" sizes={10} />
              </div>
              <div className="ls-text">
                <Image
                  className="leSocitey-heading"
                  src={LeSlogoText}
                  sizes={100}
                />
                <p className="leSocitey-subheading">Dating Reimagined</p>
              </div>
            </div>
          </nav>
        </div>

        <HomePageMainSection title="GENTLEMEN" maincardImage={Gentalman4}>
          <p className="info-text">{content.aboutCardContent}</p>
        </HomePageMainSection>
        {!loading && <HomePageMiddleNav style={style1} styleText={style2} />}

        <HomePageMainSection title="LADIES" maincardImage={Ladies4}>
          <div className="main-content">
            <p className="info-text info-text-Laidies">
              {content.aboutCardContent1}
            </p>
            <p className="info-text info-text-Laidies">
              {content.aboutCardContent4}
            </p>
            <p
              className="info-text"
              style={{
                textAlign: "center",
                fontSize: "16px",
                color: "#a2a2a2",
              }}
            >
              {content.aboutCardContent5}
            </p>
            <div className="main-content-icon">
              <div class="row align-items-center justify-content-evenly mt-3">
                <div
                  class="col-3"
                  style={{ maxWidth: "120px", textAlign: "center" }}
                >
                  <img src={Sun.src} alt="icon-img" height={35} width={35} />
                  <p
                    style={{
                      fontFamily: "Montserrat",
                      fontSize: "14px",
                      marginTop: "0.5rem",
                    }}
                  >
                    Brunch <br /> Date
                  </p>
                </div>
                <div
                  class="col-6"
                  style={{ maxWidth: "120px", textAlign: "center" }}
                >
                  <img
                    src={Ticket.src}
                    alt="icon-img"
                    height={35}
                    width={35}
                    style={{ marginLeft: "20px" }}
                  />
                  <p
                    style={{
                      fontFamily: "Montserrat",
                      fontSize: "14px",
                      marginTop: "0.5rem",
                      marginRight: "-13px",
                    }}
                  >
                    Entertainment
                    <br /> & Sports
                  </p>
                </div>
                <div
                  class="col-3"
                  style={{ maxWidth: "120px", textAlign: "center" }}
                >
                  <img src={Paint.src} alt="icon-img" height={35} width={35} />
                  <p
                    style={{
                      fontFamily: "Montserrat",
                      fontSize: "14px",
                      marginTop: "0.5rem",
                    }}
                  >
                    Take A <br />
                    Class
                  </p>
                </div>
              </div>
              <div class="row align-items-center justify-content-center mt-4">
                <div
                  class="col-6"
                  style={{
                    maxWidth: "120px",
                    textAlign: "center",
                    paddingLeft: "-7px",
                  }}
                >
                  <img src={Bottle.src} alt="icon-img" height={35} width={35} />
                  <p
                    style={{
                      fontFamily: "Montserrat",
                      fontSize: "14px",
                      marginTop: "0.5rem",
                    }}
                  >
                    Bottles <br />& Dance
                  </p>
                </div>
                <div
                  class="col-6"
                  style={{
                    maxWidth: "120px",
                    textAlign: "center",
                    marginRight: "-7px",
                  }}
                >
                  <img src={Dine.src} alt="icon-img" height={35} width={35} />
                  <p
                    style={{
                      fontFamily: "Montserrat",
                      fontSize: "14px",
                      marginTop: "0.5rem",
                    }}
                  >
                    Wine <br />& Dine
                  </p>
                </div>
              </div>
            </div>
          </div>
        </HomePageMainSection>
        <HomePageMainSection title="THE GOAL" maincardImage={Goal4}>
          <p className="info-text">{content.aboutCardContent2}</p>
        </HomePageMainSection>
        <HomePageMainSection
          title="A GENTLEMEN’S CHOICE"
          maincardImage={Choice4}
        >
          <p className="info-text">{content.aboutCardContent3}</p>
        </HomePageMainSection>

        {width > 768 ? <HomePageCardSection /> : <HomePageCardSectionMobile />}
        {/* <HomePageCardSection/> */}

        <HomeFooter logo={LeSlogoWhite} styleBackground={styleBackground} />
      </div>
    </>
  );
}
export default withAuth(HomePage);
// export default HomePage;
