import React from "react";
import Image from "next/image";

function Loader() {
  return (
    <div className="page-loading-logo">
      <Image
        src="/assets/logo.gif"
        alt="loading..."
        className=""
        width={200}
        height={400}
      />
      {/* Loading... */}
    </div>
  );
}

export default Loader;
