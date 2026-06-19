import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import withAuth from "../core/withAuth";
const LeSlogoWhite = "/assets/LeS logoWhite.png";
const HomePageLogo = "/assets/homeLogo.png";
const LeSlogoText = "/assets/img/LeSocietylogotext.png";
const Sun = "/assets/svg/sun.svg";
const Bottle = "/assets/svg/bottle.svg";
const Dine = "/assets/svg/dine.svg";
const Ticket = "/assets/svg/ticket.svg";
const Paint = "/assets/svg/paint.svg";
const Sport = "/assets/svg/sport.svg";
const Moon = "/assets/svg/moon.svg";
const Gentalman4 = "/assets/img/Gentalman_4.png";
const GentalmanHomePage = "/assets/homePage/iPhone 13 Pro-gentleman.png";
const Ladies4 = "/assets/img/Ladies4.png";
const LadiesHomePage = "/assets/homePage/iPhone 13 Pro-Ladies.png";
const Goal4 = "/assets/img/Goal4.png";
const Choice4 = "/assets/img/Choice4.png";
const Ladies = "/assets/img/Ladies.png";
const Goal = "/assets/img/Goal.png";
const Choice = "/assets/img/Choice.png";
import HomePageMainSection from "@/core/HomePageMainSection";
import HomePageCardSection from "@/core/HomePageCardSection";
import HomeFooter from "@/core/HomeFooter";
import { content } from "@/core/HomePageContent";
import HomePageMiddleNav from "@/core/HomePageMiddleNav";
import HomePageCardSectionMobile from "@/core/HomePageCardSectionMobile";
import useWindowSize from "utils/useWindowSize";
import NewHomePageMainSection from "@/core/NewHomePageMainSection";
import AccelerateToFutureOfDating from "@/core/AccelerateToFutureOfDating";
import Loader from "@/modules/Loader/Loader";

const style1 = {
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
function HomePage({ items, isLoading }) {
  const { width } = useWindowSize();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.document.body.style.backgroundColor = "#080808";
    }
  }, []);

  // SignUpTC-2: take over scroll restoration so the browser never re-applies
  // a stale mid-page scroll position on top of a freshly loaded home page.
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  const desktop = width > 768;

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      // scroll to top so the page never renders mid-scroll after back-navigation
      window.scrollTo(0, 0);
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
  }, [isLoading]);

  return (
    <>
      <div className="inner-part-page auth-section home_page_style  new__home__page">
        {isLoading && (
          <div className="home__loader__layout">
            <div className="home__loader__section">
              <Loader />
            </div>
          </div>
        )}
        <div className="home-page-navbar">
          <nav className="navbar navbar-dark bg-#080808">
            <div className="LeSociety-Icon-White">
              <Image
                src={HomePageLogo}
                alt="ascend-logo"
                height={260}
                width={279}
              />
            </div>
          </nav>
        </div>

        <NewHomePageMainSection
          title="LADIES"
          maincardImage={LadiesHomePage}
        ></NewHomePageMainSection>

        {!isLoading && <HomePageMiddleNav style={style1} styleText={style2} />}

        <NewHomePageMainSection
          title="GENTLEMEN"
          maincardImage={GentalmanHomePage}
        ></NewHomePageMainSection>

        <AccelerateToFutureOfDating />

        <HomeFooter logo={LeSlogoWhite} styleBackground={styleBackground} />
      </div>
    </>
  );
}

export default withAuth(HomePage);
