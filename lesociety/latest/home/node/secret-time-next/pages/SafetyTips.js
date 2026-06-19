import React from "react";
const LeSlogoWhite = "/assets/LeS logoWhite.png";
import HomeFooter from "@/core/HomeFooter";
import FooterHeader from "components/footerSection/FooterHeader";
import SafetyTipsContent from "components/footerSection/SafetyTipsContent";
import Image from "next/image";
const UpArrow = "/assets/up-arrow.png";

const styleBackground = {
  backgroundColor: "#000000",
};

function SafetyTips() {
  return (
    <div className="footer__content">
      <div className="footer_content_header">
        <FooterHeader />
      </div>
      <SafetyTipsContent />
      <HomeFooter logo={LeSlogoWhite} styleBackground={styleBackground} />
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
    </div>
  );
}

export default SafetyTips;
