import Image from "next/image";
const StarIcon = "/assets/star1.svg";
import {
  formatDisplayLocation,
  formatDisplayName,
  formatDisplayText,
} from "utils/formatDisplayText";
import { formatDateDuration } from "utils/dateDuration";

const UserCardDetail = ({
  user,
  cityState,
  dateSuggestion,
  timeState,
  priceState,
  dateDescription,
  imageSrc,
  showSwap,
  onSwap,
}) => {
  const Icon = dateSuggestion?.search_type?.icon;
  // CRITICAL FIX: Don't fallback to user.images[0] while imageSrc is loading
  // This prevents flash of profile picture before the correct image loads
  const resolvedImage = imageSrc;
  const displayName = formatDisplayName(user?.user_name);
  const displayLocation = formatDisplayLocation(
    cityState?.enter_city?.name,
    cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
      ? cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
      : cityState?.enter_city?.province[0]?.short_code
  );
  const displayAspiration = formatDisplayText(
    user?.aspirationName || user?.occupation || ""
  );
  const durationDisplay =
    timeState?.display_duration ||
    formatDateDuration(timeState?.education);
  const dateLabel =
    dateSuggestion?.search_type?.displayLabel ||
    dateSuggestion?.search_type?.label;

  return (
    <div className="date_card_wrap">
      <figure className="user_img_date">
        {showSwap && (
          <button
            type="button"
            className="swap-image-btn"
            onClick={onSwap}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              zIndex: 15,
              background: "rgba(0, 0, 0, 0.8)",
              color: "#FFFFFF",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "6px",
              padding: "4px 8px",
              minHeight: "24px",
              fontSize: "10px",
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: "0",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Swap Image
          </button>
        )}
        {resolvedImage ? (
          <Image
            src={resolvedImage}
            priority={true}
            fetchPriority="high"
            loading="eager"
            unoptimized
            alt="user image"
            width={500}
            height={500}
            sizes="(max-width: 767px) 100vw, 500px"
            className="date-preview-img"
            style={{
              opacity: 1,
              transition: 'none',
            }}
          />
        ) : (
          <div
            className="date-preview-img"
            style={{
              width: "100%",
              height: "100%",
              minHeight: "420px",
              background:
                "linear-gradient(180deg, rgba(18,18,18,1) 0%, rgba(35,35,35,1) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Loading image...
          </div>
        )}
        <div className="user-details">
          <div className="user-top-sec">
            <h5>
              <span>
                {displayName}, <span className="user_age">{user?.age}</span>
              </span>
            </h5>
          </div>
          <div className="user_location">
            <span className="d-flex align-items-start">
              <span className="address-wrap">
                <svg
                  width="12"
                  height="17"
                  viewBox="0 0 12 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.214355 5.46429C0.214355 6.36877 0.440493 7.26558 0.870389 8.06101L5.37983 16.2167C5.43986 16.3255 5.55425 16.3928 5.67864 16.3928C5.80303 16.3928 5.91743 16.3255 5.97746 16.2167L10.4886 8.05832C10.9168 7.26558 11.1429 6.36874 11.1429 5.46425C11.1429 2.45134 8.69159 0 5.67864 0C2.66569 0 0.214355 2.45134 0.214355 5.46429ZM2.94651 5.46429C2.94651 3.95781 4.17217 2.73216 5.67864 2.73216C7.18512 2.73216 8.41077 3.95781 8.41077 5.46429C8.41077 6.97076 7.18512 8.19641 5.67864 8.19641C4.17217 8.19641 2.94651 6.97076 2.94651 5.46429Z"
                    fill="#F24462"
                  />
                </svg>
                <span className="address px-2">{displayLocation}</span>
              </span>
              <div className="tag_wrap">
                <ul>
                  <li>
                    <span className="icon-white">{Icon}</span>
                    <span>{dateLabel}</span>
                  </li>
                </ul>
              </div>
            </span>
            <div className="user__aspiration">
              <span className="user__aspiration1">{displayAspiration}</span>
              <span className="user__aspiration2">ASPIRING</span>
            </div>
          </div>
        </div>
      </figure>
      <div className="date_details">
        <h4>Date Details</h4>
        <div className="date__detail__time__frame">
          <span className="time__frame">Time Frame:</span>
          <span className="time__value"> {durationDisplay}</span>
        </div>
        <div className="time__together">(Estimated Time Together)</div>
        <div className="interested__only">
          <span className="interested__span1">Interested?</span>
          <span className="interested__span2">
            Take her out on her choice of date experience.
          </span>
        </div>
        <div className="super__interested__div">
          <Image src={StarIcon} height={15} width={15} alt="" />

          <span className="super__interested">Super Interested?</span>
        </div>
        <div className="support__aspirations__div">
          <span className="support__aspirations">Support Her Aspirations:</span>
          <span className="support__price"> ${priceState?.education}</span>
        </div>
        <div className="suggested__gift">(Suggested Gift)</div>
        <p>{dateDescription?.date_description}</p>
      </div>
    </div>
  );
};

export default UserCardDetail;
