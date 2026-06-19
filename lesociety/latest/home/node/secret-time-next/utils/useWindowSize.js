import React from "react";


export default function useWindowSize() {
  const isBrowser = (typeof window !== "undefined");
  const [windowSize, setWindowSize] = React.useState({
    width: isBrowser ? window.innerWidth : 767,
    height: isBrowser ? window.innerHeight : 800,
  });

  function changeWindowSize() {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }
 
  React.useEffect(() => {
    changeWindowSize();
    window.addEventListener("resize", changeWindowSize);
    window.addEventListener("load", changeWindowSize);

    return () => {
      window.removeEventListener("resize", changeWindowSize);
      window.removeEventListener("load", changeWindowSize);  
    };
  }, []);

  return windowSize;
}