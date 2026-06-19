import React from "react";

function FAQContentParagraph({ heading, content }) {
  return (
    <div className="faq__content__paragraph">
      <p className="faq__paragraph__heading">{heading}</p>
      <p>{content}</p>
    </div>
  );
}

export default FAQContentParagraph;
