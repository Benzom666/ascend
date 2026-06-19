import React from "react";
const firstLadiesIphone13pro = "/assets/howItWorks/firstLadiesIphone13pro.png";
const firstLadiesIphone13prodown = "/assets/howItWorks/firstLadiesIphone13prodown.png";
import { CustomIcon } from "@/core/icon";

function LadiesFirstHowItWorks() {
  return (
    <div className="ladies__first__page ladies__first__page__margin">
      <div className="ladies__iphone__group__img text__content__ladies__image__icon">
        <img
          src={firstLadiesIphone13pro}
          alt="logo"
          className="ladies-iphone-image"
        />
        <img
          src={firstLadiesIphone13prodown}
          alt="logo"
          className="ladies-down-iphone-image"
        />
      </div>
      <div className="text__content text__content__margin text__content__ladies__icon">
        <div className="text__content__heading">
          <span className="ladies__text">Ladies, </span>
          <span> He's Unveiling His </span>
          <span className="commitment__text">COMMITMENT.</span>
        </div>
        <div className="commitment__level">Level 1 Commitment:</div>
        <div className="shared__interested__text">
          <div className="shared__interest__text__icon">
            <CustomIcon.IntrestedBlackText color={"black"} />
          </div>
          <span className="shared__interested__equalTo">
            {" "}
            = <span className="border__bottom__red">Shared</span> Interests
          </span>
        </div>
        <p className="text__content__ptext">
          Let's be honest – Choosing a man who values your aspirations, shares
          the same interests, and willing to accept the customized date
          experience of your choice is a wise move. It showcases their openness,
          flexibility, and genuine desire to truly understand you.
        </p>

        <div className="Advantages">Advantages:</div>

        <p className="text__content__ptext">
          <span className="text__content__p__spantext">
            Higher Interest Level & Compatibility:{" "}
          </span>
          Selecting a date experience allows men to align their interests but
          also fosters a stronger bond right from the beginning, demonstrating a
          higher level of genuine interest in you.
        </p>

        <p className="text__content__ptext marginTop__20px">
          <span className="text__content__p__spantext">
            Quality Over Quantity:{" "}
          </span>
          With less competition, you have the opportunity to focus on quality
          interactions rather than feeling overwhelmed by an excessive volume of
          messages or matches.
        </p>

        <div className="commitment__level commitment__level__dish__icon">
          Level 2 Commitment:
        </div>

        <div className="shared__interested__text level__2__super__interested__text">
          <div className="super__interested__icon ">
            <CustomIcon.RequestSuperText color={"white"} />

            <CustomIcon.IntrestedBlackText color={"white"} />
          </div>
          <span className="shared__interested__equalTo">
            = <span className="border__bottom__red">Empowerment</span>
          </span>
        </div>
        <p className="text__content__ptext">
          Financial support demonstrates that the gentleman is invested in your
          goals and dreams, empowering you to pursue your aspirations with
          greater confidence.
        </p>
        <div className="Advantages">Advantages:</div>
        <p className="text__content__ptext">
          <span className="text__content__p__spantext">Investment in You:</span>
          With this level of commitment, each date becomes an investment in your
          future, making every encounter meaningful.
        </p>
      </div>
    </div>
  );
}

export default LadiesFirstHowItWorks;
