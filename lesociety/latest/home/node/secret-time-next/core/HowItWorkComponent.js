import React from "react";
const Group225 = "/assets/img/Brunch Date (1).png";
const Group226 = "/assets/img/Evening Date.png";
const Group227 = "/assets/img/Take a class.png";
const Group228 = "/assets/img/Get Sporty.png";
const Group229 = "/assets/img/Entertainment  & Sports.png";
const Group230 = "/assets/img/Wine & Dine.png";
const Group236 = "/assets/img/Bottles & Dance.png";

export function HowItWorkMain({ title, image, content }) {
  return (
    <>
      {title === "Bottles & Dance" && (
        <div className={`col-lg-3 mt-5 howitwork__bottles__dance`}></div>
      )}
      <div className={`col-lg-6 col-md-12 mt-5`}>
        <div className="howitWork-image">
          <img src={image} style={{ width: "102%" }} alt="howitWork-image" />
        </div>
        <h3
          className="howitWork-heading"
          dangerouslySetInnerHTML={{ __html: title }}
        ></h3>
        <p className="howitWork-content"> {content}</p>
      </div>
    </>
  );
}

export const contentObject = [
  {
    heading: "Brunch Date",
    content:
      "Whether it’s grabbing an early-morning coffee from your favourite artisanal coffee shop, or going for a scenic stroll in one of your charming neighbourhoods, this option is for making the most out of your exciting new date earlier in the day.",
    imgUrl: Group225,
  },
  {
    heading: "Evening Date",
    content:
      "From enjoying a crisp glass of wine at a cozy patio nearby as the sun sets, to visiting a local bistro, or even try out a local festival together to discover new cultures or cuisines, our evening option is for experiences you can look forward to enjoying at the end of a long day.",
    imgUrl: Group226,
  },
  {
    heading: "Take a class",
    content:
      "Learn something new as a duo, whether it’s picking up sensual salsa moves at a Latin dance class or a culinary class with incredible chefs who can show you how to make a fantastic food. This option is great to learn new things together and to make the date memorable.",
    imgUrl: Group227,
  },
  {
    heading: "Get Sporty",
    content:
      "Show off your athletic skills with a one-on-one experience doing something you love, such as tennis, rock climbing, jogging or riding bikes throughout the city.",
    imgUrl: Group228,
  },
  {
    heading: "Entertainment </br> & Sports",
    content:
      "See your favourite celebrity performing on the big stage, head to a Broadway show, or even attend a basketball, football, or baseball game with your next date for the most memorable one-of-a-kind experience.",
    imgUrl: Group229,
  },
  {
    heading: "Wine & Dine",
    content:
      "Enjoy a relaxing experience with flavourful food and tasty wine pairings in a restaurant that provides excellent customer service. From steak and red wine to lobster and white wine, wining and dining is the perfect way to spend your evening after a long day.",
    imgUrl: Group230,
  },
  {
    heading: "Bottles & Dance",
    content:
      "Make the most of the night with a trip to the hottest lounges or clubs around - VIP style. Where you can dance the night away, enjoy a few good drinks, and have the time of your life with your date.",
    imgUrl: Group236,
  },
];
