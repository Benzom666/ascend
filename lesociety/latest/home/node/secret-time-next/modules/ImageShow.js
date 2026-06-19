import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";

export default ({
  src,
  placeholderImg,
  alt,
  setLoading,
  className="",
  ...props
}) => {
  const placeHolderImage =
    placeholderImg || "https://i.ibb.co/y8RhMrL/Untitled-design.png";

  const [imgSrc, setSrc] = useState(placeHolderImage || src);
  const onLoad = useCallback(() => {
    setSrc(src);
  }, [src]);
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.addEventListener("load", onLoad);

    return () => {
      img.removeEventListener("load", onLoad);
    };
  }, [src, onLoad]);

  useEffect(() => {
    if (imgSrc === src) {
      setLoading && setLoading(false);
    }
  }, [imgSrc, src]);
  return (
    <img
      {...props}
      alt={alt}
      className={className}
      src={imgSrc}
    />
  );
};
