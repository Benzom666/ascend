import React from "react";
import Image from "next/image";
import Link from "next/link";
const LeSlogoBlack = "/assets/LeS logo Black.png";
const LeSlogoText = "/assets/LeSociety Logo Black.png";
import useWindowSize from "utils/useWindowSize";

function FooterHeader() {
  const { width } = useWindowSize();

  return (
    <div className="footer__header">
      <div className="LeSociety-Icon-Black d-flex">
        <div className="ls-logo">
          <Image
            src={LeSlogoBlack}
            alt="Ascend logo"
            width={42}
            height={42}
          />
        </div>
        {width > 768 && (
          <div className="ls-text">
            <Image
              className="leSocitey-heading"
              src={LeSlogoText}
              alt="Ascend"
              width={200}
              height={27}
            />
          </div>
        )}
      </div>

      <div>
        <Link href="/auth/login">
          <button className="login__button">Log In</button>
        </Link>
        <Link href="/">
          <button className="home__button">Home</button>
        </Link>
      </div>
    </div>
  );
}

export default FooterHeader;
