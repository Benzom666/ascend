import React from "react";
import FAQContentParagraph from "./FAQContentParagraph";

function FAQContent() {
  return (
    <div className="content__wrapper safety__tips__content">
      <div className="content__header">
        <h3>Frequently Asked Questions</h3>
      </div>
      <div className="content__text">
        <p>
          <FAQContentParagraph
            heading={"1. Why are the gentlemen’s profiles private?"}
            content={
              <>
                We are anticipating a large community of gentlemen with high
                social status, and by securing their profiles we are preventing
                any member from attempting to commit identity theft, stalking,
                black mailing, or potentially having their colleagues stumble
                across their profile. On Ascend our gentlemen get to choose
                who can see their profile by simply sending a message to that
                specific female user.
              </>
            }
          />

          <FAQContentParagraph
            heading={`2. What are the photo guidelines?`}
            content={
              <>
                <p className="faq__photo__guide">
                  Please follow the rules listed below. Photos that violate the
                  guideline will be denied and your account may be suspended.
                </p>
                Photos can include:
                <ul>
                  <li> Photos must include  yourself.</li>
                  <li>Users must follow main photo guidelines.</li>
                  <li>Couple photos, only if you’re present in the photo.</li>
                  <li>
                    Houses, Cars, Yachts are allowed if you’re present in the
                    photo.
                  </li>
                  <li>
                    Fully covered lingerie, underwear, and bikini photos. Face
                    must be visible.
                  </li>
                  <li>Things that are not allowed:</li>
                  <li>
                    It’s important to note that violating the rules below may
                    result in a disabled account or discontinued use, without
                    warning.
                  </li>
                  <li>Nude or sexually explicit photos.</li>
                  <li>Duplicate photos.</li>
                  <li>
                    Any photos not featuring yourself. This includes
                    stock/celebrity photos.
                  </li>
                  <li>
                    Extreme Closeup photos- photos focused solely on
                    lips/hands/feet/chest will be denied.
                  </li>
                  <li>Improperly rotated or cropped images.</li>
                  <li>Photos including children.</li>
                  <li>Photos containing or depicting illegal content.</li>
                  <li>Copyrighted photos not belonging to you.</li>
                </ul>
                 
              </>
            }
          />
          <FAQContentParagraph
            heading={`3. I’m having trouble uploading my photos.`}
            content={
              <>
                <p className="faq__photo__guide">
                  If your photo isn’t uploading, please check that it meets the
                  following requirements:
                </p>
                <ul>
                  <li>Accepted formats: JPG, JPEG, or PNG.</li>
                  <li>Maximum file size: 5 MB per photo (up to 4 photos).</li>
                  <li>
                    Minimum dimensions: your main photo must be at least 350 x
                    350 pixels, and additional photos at least 200 x 200
                    pixels. Very small images will not be accepted.
                  </li>
                  <li>
                    Photos must follow the photo guidelines listed in question
                    #2 above.
                  </li>
                </ul>
                If your photo still won’t upload, try a different photo that
                meets the requirements above, or contact us for help.
              </>
            }
          />
          <FAQContentParagraph
            heading={`4. How do ladies get paid for their date?`}
            content={
              <>
                Ascend is a platform intended to establish the terms of the
                date and does not assist in the exchange of payment.
              </>
            }
          />
          <FAQContentParagraph
            heading={`5. How long does it take for my account and photos to be approved?`}
            content={
              <>
                Normally about 1 hour, but sometimes it can take up to 24hrs. Le
                Society reviews and approves each profile manually to ensure the
                quality and sincerity of the members. 
              </>
            }
          />
          <FAQContentParagraph
            heading={`6. Why was my account suspended?`}
            content={
              <>
                <p>
                  Please note that member accounts are suspended for the
                  following reasons: 
                </p>
                <p className="faq__photo__guide">
                  A violation of our Terms of Use (see list below).
                </p>
                  Terms of use violations can include:
                <ul>
                  <li>
                    Using the Website as an escort, or using the Service to
                    solicit clients for an escort service
                  </li>
                  <li>Asking for money up front or in advance of your date</li>
                  <li>Abusive, vulgar or sexually explicit language </li>
                  <li>
                    Suspected fraudulent use of the site and/or a payment method
                  </li>
                  <li>
                    {" "}
                    Reports by other members about your profile or conduct
                  </li>
                  <li>
                    Using the Website or Service to promote, solicit, or engage
                    in prostitution
                  </li>
                  <li>Recruiting members for commercial purposes</li>
                  <li>
                    Posting or sending material that exploits people under the
                    age of 18 in a sexual or violent manner, or solicits
                    personal information from anyone under 18
                  </li>
                  <li>
                    Soliciting passwords, bank information or other personal
                    identifying information for commercial or unlawful purposes
                    from other users
                  </li>
                  <li>
                    Posting any incomplete, false, misleading, or inaccurate
                    content about yourself and/or your profile
                  </li>
                  <li>
                    Posting any content that is not entirely your own or for
                    which you do not have full rights to use{" "}
                  </li>
                  <li>Having multiple active accounts</li>
                  <li>Creating a profile if you are under the age of 18</li>
                </ul>
                <p className="privacy__policies__cookies">
                    Our intentions are to detect and prevent violations, and
                  protect our member community. Please contact our Customer
                  Support Team to see if your account is eligible for
                  restoration.
                </p>
              </>
            }
          />
        </p>
      </div>
    </div>
  );
}

export default FAQContent;
