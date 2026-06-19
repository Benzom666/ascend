import React from "react";
import useWindowSize from "utils/useWindowSize";
import { CustomIcon } from "core/icon";
function NewHomePageMainSection(props) {
  const { title, maincardImage, children, styles } = props;
  const { width } = useWindowSize();
  return (
    <>
      <div className="new-home-main-container">
        {title === "LADIES" ? (
          <div className="ladies__container">
            <img src={maincardImage} alt="logo" className="main-image" />
            <div className="main__text__contents text__container__margin">
              <div className="gender__icon">
                <CustomIcon.NewHomePageLadiesText color={"white"} size={150} />
              </div>

              <div className="reach__your__goals">
                Reach Your Goals
                <span className="faster"> Faster.</span>
              </div>
              <p>
                Whether you're pursuing an education or building your own
                enterprise, there's no better foundation for a relationship than
                a gentleman who supports your aspirations from the start.
              </p>
              <p>
                {" "}
                Create your own date cards and design your perfect outing; our
                ambitious gentlemen will express their interest through two
                levels of commitment. On our site, you will be treated to a
                custom date of your choice, and this is just the beginning, as
                it starts with Level 1 commitment.
              </p>
            </div>
          </div>
        ) : (
          <div className="gentlemen__container">
            <div className="main__text__contents">
              <div className="gender__icon">
                <CustomIcon.NewHomePageGentlemenText
                  color={"white"}
                  size={150}
                />
              </div>

              <div className="reach__your__goals">
                Secure Your Dates
                <span className="faster"> Fast.</span>
              </div>
              <p>
                Tired of sinking funds into costly memberships, premium in-app
                packages, or high-priced dating agencies just to secure ideal
                dates? It's time to bypass the middlemen.
              </p>
              <p>
                {" "}
                Connect directly with goal-oriented women and select from two
                specialized levels of interest to convey your sincerity and
                secure a faster response.
              </p>
              <p>
                Fastest way to secure your dates. No Swipes. No Matches.
                Strictly Dating.
              </p>
            </div>
            <img src={maincardImage} alt="logo" className="main-image" />
          </div>
        )}
      </div>
    </>
  );
}

export default NewHomePageMainSection;
