import Link from "next/link";
// Removed Next.js Image import - using regular img tags
const LeSlogoWhite = "/assets/LeS logoWhite.png";
const MaskGroup5 = "/assets/img/Mask Group 5.png";
const Facebook = "/assets/img/FB.png";
const Twitter = "/assets/img/Twitter (1).png";
const Insta = "/assets/img/Insta (1).png";
const Tiktok = "/assets/img/Tiktok (1).png";

export default function Footer(props) {
  console.log(props);
  return (
    <footer className="d-flex home-footer-main" style={props.styleBackground}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mx-0 home-footer">
          <div className="ls-logo-footer">
            <div
              className="ls-logo mb-0"
              style={{ width: "45px", margin: "auto" }}
            >
              <img src={LeSlogoWhite} alt="ascend-logo-footer" style={{ width: "100%" }} />
            </div>
            <p
              style={{
                color: "white",
                paddingTop: "10px",
                letterSpacing: "5.2px",
              }}
            >
              ASCEND
            </p>
          </div>
          <div className="footer-icon-box">
            <div className="footer-icon">
              <img src={Facebook} alt="fb-img" />
              <img src={Twitter} alt="twiter-img" />
              <img src={Insta} alt="Insta-img" />
              <img src={Tiktok} alt="tiktok-img" />
              {/* <img src={MaskGroup5} alt='youtube-img'/> */}
            </div>
            <div className="footer-text">
              <div className="footer-text-1 mb-2 mt-3">
                <span>
                  <Link href="/FAQ">FAQ </Link>
                </span>
                |
                <span>
                  <Link href="/SafetyTips"> Safety Tips </Link>
                </span>
                |
                <span>
                  <Link href="/TermOfUse"> Terms </Link>
                </span>
                |
                <span>
                  <Link href="/PrivacyPolicies"> Privacy </Link>
                </span>
                {/* |
                <span>
                  <Link href="/OurStory"> Our Story </Link>
                </span> */}
              </div>
              <div className="footer-text-2 mb-2 mt-3">
                <span>© 2026 Ascend | All Rights Reserved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
