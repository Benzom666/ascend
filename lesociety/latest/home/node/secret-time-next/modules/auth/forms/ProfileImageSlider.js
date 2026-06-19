import React from "react";
const close1 = "/assets/close1.png";
import Image from "next/image";

function ProfileImageSlider({
  viewFullPage,
  setViewFullPage,
  userImageProfile,
}) {
  const nextPage = () => {
    console.log("next page");
  };
  return (
    <div>
      <div
        id="myNav"
        className={viewFullPage ? "overlay" : ""}
        // onClick={() => setViewFullPage(false)}
      >
        <div
          className={viewFullPage ? "closebtn" : "image-display-none"}
          onClick={() => setViewFullPage(false)}
        >
          <Image src={close1} alt="user image" width={30} height={30} />
        </div>

        {/* <div className=""> */}
        {/* <div
            className="pagination-wrapper"
            // onClick={prevPage}
          >
            <AiOutlineLeft className="pagination-icon" />
          </div> */}
        <div
          className={viewFullPage ? "overlay-content" : "image-display-none"}
        >
          <img
            src={userImageProfile}
            // onClick={() =>
            //   setViewFullPage(!viewFullPage)
            // }
            alt="img"
            className="fullpage"
          />
        </div>
        {/* <div
            className="pagination-wrapper p-0"
            //    onClick={nextPage}
          >
            <AiOutlineRight className="pagination-icon" onClick={nextPage} />
          </div> */}
        {/* </div> */}
      </div>
    </div>
  );
}

export default ProfileImageSlider;
