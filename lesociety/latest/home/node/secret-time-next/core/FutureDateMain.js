import React from 'react'
import Image from 'next/image'
import useWindowSize from "utils/useWindowSize";
//const Future_Video = "/assets/Future_Video.mp4"

function FutureDateMain(props) {
  const { heading, mainHeadingContent, imgText, imgUrl } = props;
  const { width } = useWindowSize();
  console.log(props);
  return (
    <>
      <div className="container my-5">
        <div className="row future-main-content">
          <div className="col-md-6 col-sm-12 text-right main-content-heading">
            <div className='main-content-headig-1'>
              <h3 dangerouslySetInnerHTML={{ __html: heading }}></h3>
              <p>{mainHeadingContent}</p>
            </div>
          </div>
          <div className="col-md-6 col-sm-12 main-content-image-text">
            <div className='main-content-headig-2' style={{ textAlign: "center" }}>
              <p className='futureDates-content-over-img' dangerouslySetInnerHTML={{ __html: imgText }}></p>
              <div className='main-imagefuture'>
                <img src={imgUrl} alt="mobileview" />
                {/* <video src={imgUrl} /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
  {/* <div className='future-vedio'>
  <video src={Future_Video} autoPlay="true" />
  </div> */}
    </>
  )
}

export default FutureDateMain