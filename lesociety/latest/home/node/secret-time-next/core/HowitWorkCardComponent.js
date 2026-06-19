import React from "react";
const Group261 = "/assets/img/Group 261.png";
const DateCardImage = "/assets/img/Date Cards (1).png";
export function HowitWorkCardComponent() {
  return (
    <>
      <div className="container-1">
        <div className="parentdiv-1">
          <div className=" myCard">
            <div className="textContent">
              <p className="sub-heading">Introducing</p>
              <h3 className="main-heading">Date Cards</h3>
            </div>
            <div className="childImg ">
              <img src={Group261} alt="img-main" width="100%" />
            </div>
          </div>
        </div>
        <div className="parentdiv-2">
          <div
            className="myCard myCard-1 myCard-ladies"
            style={{ padding: "20px 8px" }}
          >
            <h3 className="subCard-heading">Ladies</h3>
            <span>You pay $10 to post 1 date card</span>
            <p className="subCard-sub-heading" style={{ padding: "5px 17px" }}>
              Each Date Card offers you the potential of being rewarded with
              anything between $80 to $500. talk about time well spent!
            </p>
            <p className="subCard-sub-heading" style={{ padding: "5px 17px" }}>
              {" "}
              Create and customize as many dates as you wish, and select a
              suggested date experience for each. Our Gentlemen will then take
              the lead, and hopefully impress you, so don’t be shy.
            </p>
          </div>
          <div
            className="myCard myCard-1 myCard-gentalman"
            style={{ height: "236px", padding: "20px 8px" }}
          >
            <h3 className="subCard-heading">Gentlemen,</h3>
            <span>
              You pay for her price, <br />
              and the experience
            </span>
            <p className="subCard-sub-heading" style={{ padding: "5px 17px" }}>
              With our service, all our features are at your fingertips, free of
              charge. If you don’t go on a date, you don’t pay for anything.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
