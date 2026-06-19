import React from "react";
const exploreFirst = "/assets/howItWorks/explore__first.png";
const exploreDown = "/assets/howItWorks/explore__down.png";

function LadiesExplore() {
  return (
    <div className="ladies__explore">
      <div className="ladies__iphone__group__img ladies__explore__iphone__group__img">
        <img
          src={exploreFirst}
          alt="logo"
          className="ladies-iphone-image"
        />
        <img
          src={exploreDown}
          alt="logo"
          className="ladies-down-iphone-image"
        />
      </div>

      <div className="ladies__explore__content">
        <div className="text__content__heading">
          <span className="ladies__text">Ladies, </span>
          <span className="commitment__text">EXPLORE</span>
          <span> While You Wait </span>
        </div>
        <p className="text__content__ptext">
          Due to the volume of gentlemen with high social status, their profiles
          are locked. Once a gentlemen is interested in you, they will send you
          a message, granting you access to their profile. Until then, you will
          have exclusive access to our gallery of other female date cards. This
          unique setup offers you some distinct advantages:
        </p>

        <ol>
          <li className="text__content__ptext">
            <span className="text__content__p__spantext">
              Community building:{" "}
            </span>
            Feel a sense of belonging by joining a gallery of like-minded women
            who are also committed to meaning dating. You’re not alone in this
            journey.
          </li>
          <li className="text__content__ptext">
            <span className="text__content__p__spantext">
              Inspiration and Creativity:{" "}
            </span>
            Inspiration and Creativity: Browse other women’s Date Cards to spark
            your own creativity. Elevate your dating game by learning from the
            unique date experiences others have crafted.{" "}
          </li>
        </ol>
      </div>
    </div>
  );
}

export default LadiesExplore;
