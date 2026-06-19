import React, { useRef } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { CustomIcon } from "core/icon";
import Modal from "react-modal";

import { IoIosClose } from "react-icons/io";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { HiLockOpen } from "react-icons/hi";
import { useRouter } from "next/router";
import { apiRequest } from "utils/Utilities";
import H5 from "./../../core/H5";
import SkeletonElement from "./SkeletonElement";
import Shimmer from "./Shimmer";

const SkeletonUserCardListForMessage = ({
  conversation,
  isDesktopView,
  getConversations,
  setCurrentChat,
  tabIndexChange,
  selectedTabIndex,
  socket,
  profilePic,
}) => {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [dateDetailsIsOpen, setDateDetailsIsOpen] = React.useState(false);
  const [msgModal, setMsgModal] = React.useState(false);
  const user = useSelector((state) => state.authReducer.user);
  const router = useRouter();
  const growRef = useRef(null);

  function openModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }

  const postApprovedConversation = async (room_id, conversation) => {
    setCurrentChat(conversation);
    try {
      const data = {
        chatRoomId: room_id,
        senderId: user?._id,
      };
      const res = await apiRequest({
        data,
        method: "POST",
        url: `chat/accept`,
      });
      console.log("res.data", res.data);
      getConversations();
      closeModal();
      setCurrentChat((prev) => ({
        ...prev,
        status: res?.data?.data?.chatRoom?.status,
      }));

      tabIndexChange(0);
    } catch (err) {
      console.log("err", err);
    }

    const data = {
      chatRoomId: room_id ?? "",
      recieverId: conversation?.user?.id ?? "",
      message: "",
    };

    socket.emit("sendMessage", data);
  };

  const showText = (text) => {
    if (text?.length > 40) {
      return text.substring(0, 40) + "...";
    } else {
      return text;
    }
  };

  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0",
  };
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "310px",
      background: "transparent",
      height: "100%",
      overFlow: "hidden",
    },
  };

  return (
    <div className={`skeleton-wrapper dark`}>
      <div>
        <H5>
          <SkeletonElement type="request-title" />
        </H5>
        <SkeletonElement type="request-interested" />

        {/* <CustomIcon.IntrestedText color={"white"} size={140} /> */}
        <figure>
          {/* <Image src={profilePic} alt="user image" width={500} height={600} /> */}
          <SkeletonElement type="image-500h-600w" />

          <span className="image_tagline">{showText(" ")}</span>
        </figure>
        <div className="d-flex align-items-center my-4 header_btn_wrap">
          {/* <a
            className="create-date"
            onClick={() => {
              postApprovedConversation(
                conversation?.message?.room_id,
                conversation
              );
            }}
          >
            REPLY BACK
          </a> */}
          <SkeletonElement type="input" />
        </div>
        <div className="my-4 bottom_content">
          {/* <Link href="/user/user-profile"> */}
          {/* <a
            className="view_profile"
            onClick={() =>
              router.push(`/user/user-profile/${conversation?.user?.user_name}`)
            }
          >
            <HiLockOpen /> View Profile
          </a> */}
          <SkeletonElement type="input-view-profile" />

          {/* </Link> */}
          {/* <p>
            {conversation?.user?.user_name} has granted you the access to his
            profile
          </p> */}
          <SkeletonElement type="text" />
          <SkeletonElement type="text" />
        </div>
      </div>
      <Shimmer />
    </div>
  );
};

export default SkeletonUserCardListForMessage;
