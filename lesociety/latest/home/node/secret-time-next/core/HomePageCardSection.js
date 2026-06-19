import { urlObjectKeys } from "next/dist/shared/lib/utils";
import React from "react";
const Card_1 = "/assets/img/card_1.png";
const Card_2 = "/assets/img/card_2.png";

function HomePageCardSection() {
  return (
    <div className="container-fluid bottom-box-container mt-5 mb-5">
      <div className="bottom-box-card-1">
        <div className="mb-2 card_1">
          <h5 className="card-title">Need More</h5>
          <h5 className="card-title">Information?</h5>
          <a href="/howItWork" class="btn btn-danger" id="howitworkbtn">
            How it Works
          </a>
        </div>
      </div>
      <div className="bottom-box-card-2">
        <div className="card_2">
          <h5 className="card-title">The future of</h5>
          <h5 className="card-title"> Ascend</h5>
          <a href="/future-date" className="btn btn-danger" id="sneakPeakbtn">
            Sneak Peak
          </a>
          <p className="card-app-pay">In App Payment GPS Tracking …and more</p>
        </div>
      </div>
    </div>
  );
}

export default HomePageCardSection;
