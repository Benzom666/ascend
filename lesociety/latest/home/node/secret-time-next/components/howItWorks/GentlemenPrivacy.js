import { CustomIcon } from "@/core/icon";
import React from "react";
const privacy = "/assets/howItWorks/privacy.png";

function GentlemenPrivacy() {
  return (
    <div className="gentlemen__privacy">
      <div className="gentlmen__privacy__image gentlmen__privacy__image__content">
        <img src={privacy} alt="logo" className="main__image" />
      </div>
      <div className="gentlemen__text__content text__content__gentlemen">
        <div className="text__content__heading gentlemen__privacy__priority__icon gentlemen__privacy__text__margin">
          <span className="ladies__text">Gentlemen, </span>
          <span>Your </span>
          <span className="commitment__text">PRIVACY</span>
          <span> Is Our Top Priority.</span>
        </div>

        <p className="text__content__ptext">
          <span className="text__content__p__spantext">
            Maintain complete control over your privacy:{" "}
          </span>
          Your profile remains locked until you initiate contact with a lady.
          Present yourself with unwavering confidence.
        </p>
        <br />

        <p className="text__content__ptext">
          <span className="text__content__p__spantext">
            Forget about token systems or steep paywalls:{" "}
          </span>
          Leave behind token systems, steep paywalls, and expensive membership
          fees; our unique approach levels the playing field in your favor,
          where being a gentleman isn't just courteous—it's strategic. Instead,
          demonstrate your willingness to support her journey and connect on
          your own terms, cutting out the middleman.
        </p>

        <div className="text__content__heading gentlemen__privacy__text__margin">
          <span className="ladies__text">All Users </span>
          <span>are </span>
          <span className="commitment__text">SCREENED</span>
          <span> prior to entry.</span>
        </div>

        <p className="text__content__ptext">
          At Ascend, your safety isn't just an option—it's a commitment.
          Before stepping into our exclusive yet welcoming haven, every profile
          undergoes meticulous ID verification. This ensures that the person
          you're connecting with is genuinely who they claim to be. Our
          continuous security monitoring further elevates this assurance,
          allowing you to focus on what truly matters: forging meaningful,
          exhilarating connections. Trust in our process as you take charge of
          your dating journey, knowing that respect and authenticity are our
          cornerstones.
        </p>
      </div>
    </div>
  );
}

export default GentlemenPrivacy;
