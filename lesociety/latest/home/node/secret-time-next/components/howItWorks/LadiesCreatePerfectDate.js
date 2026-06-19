import React from "react";
const DateExperience = "/assets/howItWorks/DateExperience.png";

function LadiesCreatePerfectDate() {
  return (
    <div className="gentlemen__privacy">
      <div className="gentlmen__privacy__image">
        <img src={DateExperience} alt="logo" className="main__image" />
      </div>
      <div className="gentlemen__text__content text__content__gentlemen">
        <div className="text__content__heading gentlemen__privacy__text__margin">
          <span className="ladies__text">Ladies, </span>
          <span className="commitment__text">CREATE</span>
          <span> Your perfect Date Experience.</span>
        </div>

        <p className="text__content__ptext">
          Create a customized date card by selecting from one of seven different
          <span className="text__content__p__spantext"> Date Experiences </span>
          and post it in any location of your choice.
        </p>
        <br />

        <p className="text__content__ptext">
          Each date card you create is paired with an experience that aligns
          with your interests. Choose between a relaxed outing or venture into a
          more lavish experience. Our gentlemen will then seize the opportunity
          to captivate you. So, feel empowered to express yourself.
        </p>

        <div className="text__content__heading gentlemen__eliminate__icon gentlemen__privacy__text__margin">
          <span className="ladies__text">Gentlemen, </span>
          <span className="commitment__text">ELIMINATE</span>
          <span> Guesswork.</span>
        </div>

        <p className="text__content__ptext">
          When ladies design their unique dates, it's not solely about them—it's
          about laying the groundwork for a meaningful connection with you.
          Here's why this is revolutionary.
        </p>
        <br />
        <p className="text__content__ptext">
          <span className="text__content__p__spantext">
            Clarity of Intent:{" "}
          </span>
          Each tailor-made date serves as a guide to her interests, simplifying
          your task of making a lasting impression.
        </p>
        <br />

        <p className="text__content__ptext">
          <span className="text__content__p__spantext">
            Comfort & Enjoyment:{" "}
          </span>
          She's already at ease with the planned activities, ensuring a relaxed
          and delightful outing for both parties.
        </p>
        <br />
        <p className="text__content__ptext">
          <span className="text__content__p__spantext">
            Efficient Matching:{" "}
          </span>
          Her personalized date serves as a snapshot of compatibility,
          accelerating your journey to the ideal connection.
        </p>
      </div>
    </div>
  );
}

export default LadiesCreatePerfectDate;
