import React from "react";
const LeSlogoWhite = "/assets/LeS logoWhite.png";
import HomeFooter from "@/core/HomeFooter";
import FooterHeader from "components/footerSection/FooterHeader";
const UpArrow = "/assets/up-arrow.png";
import Image from "next/image";
import OurStoryContent from "components/footerSection/OurStoryContent";
import useWindowSize from "utils/useWindowSize";

const styleBackground = {
  backgroundColor: "#000000",
};
function OurStory() {
  const { width } = useWindowSize();

  return (
    <div className="footer__content">
      <div className="footer_content_header">
        <FooterHeader />
      </div>
      <OurStoryContent />
      <HomeFooter logo={LeSlogoWhite} styleBackground={styleBackground} />
      {width < 769 && (
        <button
          // scroll to top
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
          className="footer__scroll__icon"
        >
          <Image src={UpArrow} alt="ascend-logo" width={25} height={25} />
        </button>
      )}
    </div>
  );
}

export default OurStory;
