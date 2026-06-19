import React from "react";

function ContentParagraph({ heading, content }) {
  return (
    <div className="content__paragraph">
      <p className="paragraph__heading">{heading}</p>
      <p>{content}</p>
    </div>
  );
}

export default ContentParagraph;
