import { useEffect } from "react";
import { useState } from "react";
import useWindowSize from "utils/useWindowSize";

const slideStyles = {
  maxWidth: "100%",
  height: "100%",
  borderRadius: "10px",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
};

const rightArrowStyles = {
  position: "absolute",
  top: "50%",
  transform: "translate(0, -50%)",
  right: "-100px",
  fontSize: "45px",
  color: "#fff",
  zIndex: 1,
  cursor: "pointer",
};

const leftArrowStyles = {
  position: "absolute",
  top: "50%",
  transform: "translate(0, -50%)",
  left: "-100px",
  fontSize: "45px",
  color: "#fff",
  zIndex: 1,
  cursor: "pointer",
};

const sliderStyles = {
  position: "relative",
  height: "100%",
};

const dotsContainerStyles = {
  display: "flex",
  justifyContent: "center",
};

const dotStyle = {
  margin: "0 3px",
  cursor: "pointer",
  fontSize: "20px",
};

const redDotStyle = {
  margin: "0 3px",
  cursor: "pointer",
  fontSize: "20px",
  color: "#F24462",
};

const ImageSlideLoader = ({ slides }) => {
  const { width } = useWindowSize();

  const mobile = width < 768 ? true : false;

  const [currentIndex, setCurrentIndex] = useState(0);

  const slideStylesWidthBackground = {
    ...slideStyles,
    backgroundImage: `url(${slides[currentIndex].url})`,
  };

  return (
    <div style={sliderStyles}>
      {/* {!mobile && (
        <div>
          <div
            //   onClick={goToPrevious}
            style={leftArrowStyles}
          >
            ❰
          </div>
          <div
            //    onClick={goToNext}
            style={rightArrowStyles}
          >
            ❱
          </div>
        </div>
      )} */}

      <div style={slideStylesWidthBackground}></div>
      <div style={dotsContainerStyles}>
        {/* {slides.map((slide, slideIndex) => (
          <div
            style={currentIndex === slideIndex ? redDotStyle : dotStyle}
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
          >
            ●
          </div>
        ))} */}
      </div>
    </div>
  );
};

export default ImageSlideLoader;
