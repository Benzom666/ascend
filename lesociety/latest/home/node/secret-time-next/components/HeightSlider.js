import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const HeightSlider = () => {
  const [heightFeet, setHeightFeet] = useState(5); // Initial value in feet

  const handleSliderChange = (value) => {
    setHeightFeet(value);
  };

  const heightCm = heightFeet * 30.48; // Convert feet to cm

  return (
    <div>
      <h2>Height Slider</h2>
      <Slider
        min={3}
        max={7}
        step={0.1}
        value={heightFeet}
        onChange={handleSliderChange}
      />
      <p>
        Height: {heightFeet} feet ({heightCm.toFixed(2)} cm)
      </p>
    </div>
  );
};

export default HeightSlider;
