import { useRouter } from "next/router";
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AUTHENTICATE_UPDATE } from "@/modules/auth/actionConstants";
import { apiRequest, getDateCategory } from "utils/Utilities";
import io from "socket.io-client";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { format } from "timeago.js";
import { IoIosSend, IoMdSearch } from "react-icons/io";
import Image from "next/image";
import { formatDisplayName } from "utils/formatDisplayText";
import { formatDateDuration } from "utils/dateDuration";
import withAuth from "@/core/withAuth";
import { socket } from "../user/user-list";
const NoImage = "/assets/img/no-image.png";
import { IoIosArrowBack } from "react-icons/io";
const MessageSend = "/assets/Send.svg";
const MessageSend2 = "/assets/message_send2.png";
import { logout } from "@/modules/auth/authActions";
import PaywallModal from "@/core/PaywallModal";
import { usePaywall } from "hooks/usePaywall";
// const socket = io.connect(socketURL);

const REQUESTS_RETURN_STATE_KEY = "messages-requests-return-state";

function ChatMessages({ ...props }) {
  const [currentChat, setCurrentChat] = React.useState(null);
  const user = useSelector((state) => state.authReducer.user);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState("");
  const [isActive, setActive] = useState(false);
  const router = useRouter();
  const scrollRef = useRef();
  const lockedScrollYRef = useRef(0);
  const isBodyLockedRef = useRef(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [hasResolvedConversation, setHasResolvedConversation] = useState(false);
  const [hasResolvedHistory, setHasResolvedHistory] = useState(false);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const [embeddedBackLoading, setEmbeddedBackLoading] = useState(false);
  const embeddedChatReadySentRef = useRef(false);
  const {
    paywallConfig,
    pricingConfig,
    showLadiesChatPaywall,
    closePaywall,
  } = usePaywall();

  const dispatch = useDispatch();
  const isRequestEmbed = router?.query?.embedRequest === "1";

  const lockBodyScroll = () => {
    if (typeof window === "undefined" || isBodyLockedRef.current) return;
    lockedScrollYRef.current = window.scrollY || window.pageYOffset || 0;
    isBodyLockedRef.current = true;
    document.body.dataset.scrollLock = "true";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollYRef.current}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  };

  const unlockBodyScroll = () => {
    if (typeof window === "undefined" || !isBodyLockedRef.current) return;
    const scrollY = lockedScrollYRef.current || 0;
    isBodyLockedRef.current = false;
    delete document.body.dataset.scrollLock;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.scrollTo(0, scrollY);
  };

  useEffect(() => {
    socket.auth = { user: user };
    socket.connect();
    const handleConnect = () => {
      console.log("connected mobile", socket.connected);
    };
    const handleDisconnect = (reason) => {
      console.log("socket disconnected reason", reason);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    const handleConnectError = () => {
      console.log("connect_error");
      socket.auth = { user: user };
      socket.connect();
    };

    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect_error", handleConnectError);
    };
  }, [user]);

  useEffect(() => {
    if (router?.query?.chatRoomId) {
      setChatLoading(true);
      setHasResolvedConversation(false);
      setHasResolvedHistory(false);
      getChatHistory(router?.query?.chatRoomId);
      getConversations();
    }
    return () => {
      setChatLoading(false);
    };
  }, [router?.query]);

  useEffect(() => {
    if (!chatLoading || (hasResolvedConversation && hasResolvedHistory)) return;

    const loadingTimeout = window.setTimeout(() => {
      setChatLoading(false);
      setHasResolvedConversation(true);
      setHasResolvedHistory(true);
    }, 12000);

    return () => {
      window.clearTimeout(loadingTimeout);
    };
  }, [chatLoading, hasResolvedConversation, hasResolvedHistory]);

  const isChatBootstrapping =
    chatLoading || !hasResolvedConversation || !hasResolvedHistory;

  useEffect(() => {
    if (!isRequestEmbed) {
      return;
    }

    if (isChatBootstrapping) {
      embeddedChatReadySentRef.current = false;
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.parent !== window &&
      !embeddedChatReadySentRef.current &&
      router?.query?.chatRoomId
    ) {
      embeddedChatReadySentRef.current = true;
      window.parent?.postMessage(
        {
          type: "request-chat-ready",
          roomId: router?.query?.chatRoomId,
        },
        window.location.origin
      );
    }
  }, [isRequestEmbed, isChatBootstrapping, router?.query?.chatRoomId]);

  useEffect(
    () => {
      const eventName = `requestAccept-${user?._id}`;
      const handleRequestAccept = (message) => {
        console.log("requestAccept message", message);
        getConversations();
      };

      socket.on(eventName, handleRequestAccept);

      return () => {
        socket.off(eventName, handleRequestAccept);
      };
    },
    [user?._id]
  );

  useEffect(
    () => {
      const eventName = `request-${user?._id}`;
      const handleRequest = (message) => {
        console.log("reqested message", message);
        getConversations();
      };

      socket.on(eventName, handleRequest);

      return () => {
        socket.off(eventName, handleRequest);
      };
    },
    [user?._id]
  );

  useEffect(
    () => {
      const eventName = `recieve-${user?._id}`;
      const handleReceive = (message) => {
        console.log("reciever message", message);
        if (message.message == "") {
          return getConversations();
        }
        return setArrivalMessage({
          ...message,
          message: message.message,
          sender_id: message.sender_id,
          sent_time: Date.now(),
          room_id: message?.room_id,
          receiver_id: message?.receiver_id,
          _id: message?._id,
        });
      };

      socket.on(eventName, handleReceive);

      return () => {
        socket.off(eventName, handleReceive);
      };
    },
    [user?._id]
  );

  useEffect(() => {
    if (arrivalMessage && currentChat?._id === arrivalMessage?.room_id) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    if (arrivalMessage && conversations.length > 0) {
      console.log("coversation updated");
      const updatedConversations = conversations.map((conversation) => {
        if (
          conversation._id === arrivalMessage.room_id &&
          arrivalMessage?.message
        ) {
          return {
            ...conversation,
            message: arrivalMessage,
          };
        } else {
          return conversation;
        }
      });
      setConversations(updatedConversations);
    }
  }, [arrivalMessage]);

  useEffect(() => {
    const eventName = `requestBlock-${user?._id}`;
    const handleRequestBlock = (message) => {
      console.log("Blocked Chat", message);
      setCurrentChat((prev) => ({
        ...prev,
        status: message?.status,
      }));
    };

    socket.on(eventName, handleRequestBlock);

    return () => {
      socket.off(eventName, handleRequestBlock);
    };
  }, [user?._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  useEffect(() => {
    if (isComposerFocused) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }

    return () => {
      unlockBodyScroll();
    };
  }, [isComposerFocused]);

  useEffect(() => {
    if (currentChat && messages.length > 0 && socket.connected) {
      const messageData = messages[messages.length - 1];
      if (
        messageData?.sender_id !== user?._id &&
        !messageData?.read_date_time &&
        messageData?.room_id === currentChat?._id
      ) {
        // console.log("messageData", messageData);
        const data = {
          chatId: messageData?._id,
          recieverId: messageData?.receiver_id,
          senderId: messageData?.sender_id,
        };
        console.log("data", data);

        console.log("socket readMessage fired from chatRoom");
        socket.emit(`readMessage`, data);
        setConversations((prev) => {
          return prev.map((conversation) => {
            if (conversation._id === messageData?.room_id) {
              return {
                ...conversation,
                message: {
                  ...conversation.message,
                  read_date_time: Date.now(),
                },
              };
            } else {
              return conversation;
            }
          });
        });
      }
    }
  }, [messages, currentChat, socket.connected]);

  useEffect(() => {
    const eventName = `readed-${user?._id}`;
    const handleRead = (message) => {
      console.log("message read", message);
      setConversations((prev) => {
        return prev.map((conversation) => {
          if (conversation?.message?._id === message?.id) {
            return {
              ...conversation,
              message: {
                ...conversation.message,
                read_date_time: Date.now(),
              },
            };
          } else {
            return conversation;
          }
        });
      });
    };

    socket.on(eventName, handleRead);

    return () => {
      socket.off(eventName, handleRead);
    };
  }, [user?._id]);

  useEffect(
    () => {
      const eventName = `chatRoomCleared-${user?._id}`;
      const handleChatRoomCleared = (message) => {
        console.log("chatRoomCleared", message);
        if (message?.deleted) {
          setMessages([]);
          setArrivalMessage("");
          getConversations();
        }
      };

      socket.on(eventName, handleChatRoomCleared);

      return () => {
        socket.off(eventName, handleChatRoomCleared);
      };
    },
    [user?._id]
  );

  const toggleClass = () => {
    setActive(!isActive);
    // document.body.classList.toggle("open-sidebar");
  };

  const getChatHistory = async (chatRoomId) => {
    setChatLoading(true);
    try {
      const data = {
        chatRoomId: chatRoomId,
      };

      const res = await apiRequest({
        method: "GET",
        url: `chat/chatroom-history`,
        params: data,
        timeout: 10000,
      });
      setMessages(res.data?.data?.chat);
      setChatLoading(false);
      setHasResolvedHistory(true);
    } catch (err) {
      console.log("err", err);
      setHasResolvedHistory(true);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };
  const category = getDateCategory(currentChat?.date_id);
  const getConversations = async () => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `chat/chatroom-list`,
        timeout: 10000,
      });
      // console.log("res", res.data?.data?.chatRooms);
      const conversations =
        res.data?.data?.chatRooms.length > 0
          ? res.data?.data?.chatRooms.filter(
              (chat) => chat !== null && chat._id === router?.query?.chatRoomId
            )?.length > 0
            ? res.data?.data?.chatRooms.filter(
                (chat) =>
                  chat !== null && chat._id === router?.query?.chatRoomId
              )[0]
            : ""
          : "";
      setCurrentChat(conversations);
      setChatLoading(false);
      setHasResolvedConversation(true);
    } catch (err) {
      console.log("err", err);
      setChatLoading(false);
      setHasResolvedConversation(true);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };

  const blockChat = async (currentChat) => {
    try {
      const data = {
        chatRoomId: currentChat?.message?.room_id ?? currentChat?._id,
        recieverId: currentChat?.user?.id,
      };

      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `chat/block`,
      });
      console.log("res", res);
      setCurrentChat((prev) => ({
        ...prev,
        status: res?.data?.data?.chatRoom?.status,
        blocked_by: {
          _id: user?._id,
        },
      }));
    } catch (err) {
      console.log("err", err);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };

  const unblockChat = async (currentChat) => {
    try {
      const data = {
        chatRoomId: currentChat?.message?.room_id ?? currentChat?._id,
        recieverId: currentChat?.user?.id,
      };

      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `chat/unblock`,
      });
      console.log("res", res);
      if (res?.data?.message === "Accepted!!") {
        setCurrentChat(
          (prev) =>
            prev && {
              ...prev,
              status: 1,
            }
        );
      }
      getConversations();
      getChatHistory(currentChat?.message?.room_id);
    } catch (err) {
      console.log("err", err);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };

  const deleteChat = async (currentChat) => {
    try {
      const data = {
        chatRoomId: currentChat?.message?.room_id ?? currentChat?._id,
        recieverId: currentChat?.user?.id,
      };

      const res = await apiRequest({
        data: data,
        method: "DELETE",
        url: `chat/chat-clear`,
      });
      console.log("res", res);
      setMessages([]);
      setNewMessage("");
      setArrivalMessage("");
      getConversations();
    } catch (err) {
      console.log("err", err);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };
  const sendMessage = async (e) => {
    e.preventDefault();
    const isFemale = user?.gender === "female";
    const chatTokens = user?.chat_tokens || 0;
    const remainingChats = user?.remaining_chats || 0;
    const chatRoomId = currentChat?.message?.room_id ?? currentChat?._id;

    if (isFemale && chatTokens === 0 && remainingChats === 0) {
      showLadiesChatPaywall();
      return;
    }

    if (isFemale && currentChat?.status === 0) {
      try {
        const acceptResponse = await apiRequest({
          data: {
            chatRoomId: currentChat?.message?.room_id ?? currentChat?._id,
            senderId: currentChat?.user?.id,
          },
          method: "POST",
          url: `chat/accept`,
        });

        if (
          acceptResponse?.status === 403 ||
          acceptResponse?.data?.status === 403
        ) {
          showLadiesChatPaywall();
          return;
        }

        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(REQUESTS_RETURN_STATE_KEY);
          if (isRequestEmbed && window.parent !== window) {
            window.parent?.postMessage(
              {
                type: "request-chat-replied",
                roomId: chatRoomId,
              },
              window.location.origin
            );
          }
        }

        setCurrentChat((prev) =>
          prev
            ? {
                ...prev,
                status: acceptResponse?.data?.data?.chatRoom?.status ?? 1,
              }
            : prev
        );
      } catch (err) {
        if (err?.response?.status === 403) {
          showLadiesChatPaywall();
          return;
        }
        if (
          err?.response?.status === 401 &&
          err?.response?.data?.message === "Failed to authenticate token!"
        ) {
          setTimeout(() => {
            logout(router, dispatch);
          }, 100);
        }
        return err;
      }
    }

    const data = {
      chatRoomId,
      recieverId: currentChat?.user?.id ?? "",
      message: newMessage,
    };

    // console.log("socket.connected data", socket.connected, data);
    if (socket.connected) {
      setTimeout(() => {
        socket.emit("sendMessage", data);
      }, 500);
    }
    setMessages((prev) => [
      ...prev,
      {
        message: newMessage,
        sender_id: user?._id,
        sent_time: Date.now(),
      },
    ]);
    setNewMessage("");

    // Refresh balances after send so sidebar updates immediately.
    try {
      const freshUserRes = await apiRequest({
        method: "GET",
        url: "user/me",
      });
      if (freshUserRes?.data?.data?.user) {
        dispatch({
          type: AUTHENTICATE_UPDATE,
          payload: freshUserRes.data.data.user,
        });
      }
    } catch (refreshErr) {
      console.log("balance refresh failed", refreshErr);
    }
  };

  // go to previous page
  const goBack = () => {
    if (isRequestEmbed) {
      if (embeddedBackLoading) {
        return;
      }

      setEmbeddedBackLoading(true);
      if (typeof window !== "undefined" && window.parent !== window) {
        window.parent?.postMessage(
          {
            type: "request-chat-close",
            roomId: router?.query?.chatRoomId || null,
          },
          window.location.origin
        );
      }
      return;
    }

    if (
      typeof window !== "undefined" &&
      user?.gender === "female" &&
      currentChat?.status === 0
    ) {
      window.sessionStorage.setItem(
        REQUESTS_RETURN_STATE_KEY,
        JSON.stringify({
          source: "messages-requests",
          requestId: currentChat?._id || null,
          roomId: currentChat?.message?.room_id || null,
          reopenModal: true,
        })
      );
    }
    router.back();
  };

  // console.log("currentChat", currentChat);
  console.log("socket connected message mobile", socket.connected);

  return (
    <div
      className="inner-page"
      onClick={() => {
        if (isActive) {
          setActive(false);
        }
      }}
    >
      <PaywallModal
        isOpen={paywallConfig.isOpen}
        onClose={closePaywall}
        type={paywallConfig.type}
        expiresIn={paywallConfig.expiresIn}
        userName={paywallConfig.userName}
        pricingConfig={pricingConfig}
      />
      <div className="inner-part-page">
        <div className="">
          <div className="message h-100">
            <div className="message-content-side">
              {isChatBootstrapping ? (
                <div className="date_details_desktop_loading-2">
                  <Image
                    src={"/assets/squareLogoNoBack.gif"}
                    alt="loading..."
                    width={100}
                    height={100}
                  />
                </div>
              ) : (
                <>
              {currentChat &&
                (currentChat?.status === 0 ||
                  currentChat?.status === 1 ||
                  currentChat?.status === 2) && (
                  <div className="message-chat-wrap">
                    <div className="top-head message-header-dates">
                      <div className="user-thumb user-thumb-data">
                        <span onClick={goBack}>
                          {isRequestEmbed && embeddedBackLoading ? (
                            <span className="spin-loader-button header-back-loader message-back-loader"></span>
                          ) : (
                            <IoIosArrowBack
                              size={20}
                              color={"rgba(255, 255, 255, 0.7)"}
                              className="user-thumb-data-icon"
                            />
                          )}
                        </span>
                        <div
                          className="d-flex me-auto"
                          onClick={() =>
                            router.push(
                              isRequestEmbed
                                ? `/user/user-profile/${currentChat?.user?.user_name}?embedRequest=1`
                                : `/user/user-profile/${currentChat?.user?.user_name}`
                            )
                          }
                          >
                          <figure className="user_img_header">
                            <img
                              src={
                                currentChat?.user?.images?.length > 0 &&
                                currentChat?.user?.images
                                  ? currentChat?.user?.images[0]
                                  : (user?.images && user?.images[0]) || (NoImage?.src || NoImage)
                              }
                              alt="user image"
                              onError={(e) => {
                                const fallback = NoImage?.src || NoImage;
                                if (e.currentTarget.src !== fallback) {
                                  e.currentTarget.src = fallback;
                                }
                              }}
                            />
                          </figure>
                          <span className="user-details">
                            <h3>{formatDisplayName(currentChat?.user?.user_name) ?? ""}</h3>
                          </span>
                        </div>
                        <div className="">
                          <div className="action_btn_list">
                            <span onClick={toggleClass}>
                              <BiDotsHorizontalRounded
                                size={35}
                                color={"rgba(255, 255, 255, 0.7)"}
                              />
                            </span>
                            {isActive && (
                              <div
                                className="dropdown-list"
                                id="action_dropdown"
                              >
                                <ul>
                                  {currentChat?.status === 2 ? (
                                    currentChat?.blocked_by?._id ==
                                      user?._id && (
                                      <li
                                        onClick={() => unblockChat(currentChat)}
                                      >
                                        <a>Unblock</a>
                                      </li>
                                    )
                                  ) : (
                                    <li onClick={() => blockChat(currentChat)}>
                                      <a>Block</a>
                                    </li>
                                  )}
                                  <li onClick={() => deleteChat(currentChat)}>
                                    <a>Delete Conversation</a>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="message-header-dates-data">
                        <div className="tag_wrap">
                          <ul>
                            <li>
                              <span>{category?.icon}</span>
                              <span>{category?.label}</span>
                            </li>
                          </ul>
                        </div>
                        <h4 className="price_per_hour">
                          ${currentChat?.date_id?.price} /{" "}
                          <span>{formatDateDuration(currentChat?.date_id?.date_length)}</span>
                        </h4>
                      </div>
                    </div>
                    <div className="chat_message_wrap">
                      <div className="message_list_wrap">
                        <ul className="chat_message_scroll">
                          {messages &&
                            messages.length > 0 &&
                            messages?.filter(
                              (message) => message?.message !== ""
                            ).length > 0 &&
                            messages
                              .filter((message) => message?.message !== "")
                              .map((message, index) => {
                                return (
                                  <li
                                    className={
                                      message.sender_id === user?._id
                                        ? "send"
                                        : "receive"
                                    }
                                    key={index}
                                    ref={scrollRef}
                                  >
                                    <div
                                      className={`message_content ${
                                        message.sender_id === user?._id
                                          ? "message_content_send"
                                          : "message_content_receive"
                                      }`}
                                    >
                                      <span className="message_time">
                                        {format(message?.sent_time)}
                                      </span>
                                      <span className="message_text">
                                        {message?.message}
                                      </span>
                                    </div>
                                  </li>
                                  );
                                })}
                        </ul>
                      </div>
                      {currentChat?.status === 2 ? (
                        currentChat?.date_id?.is_blocked_by_admin ? (
                          <div className="text-center">
                            Admin has removed this date.
                          </div>
                        ) : currentChat?.blocked_by?._id == user?._id ? (
                          <div className="text-center">
                            User has been blocked
                          </div>
                        ) : (
                          <div className="text-center">
                            You have been blocked
                          </div>
                        )
                      ) : (
                        <div
                          className="input_write_sec_message"
                          onClick={(event) => event.stopPropagation()}
                          onPointerDown={(event) => event.stopPropagation()}
                          onTouchStart={(event) => event.stopPropagation()}
                        >
                          <div
                            className="input_write_sec_message_mobile"
                            onClick={(event) => event.stopPropagation()}
                            onPointerDown={(event) => event.stopPropagation()}
                            onTouchStart={(event) => event.stopPropagation()}
                          >
                            <input
                              type="text"
                              placeholder="Type your message here…"
                              onChange={(e) => setNewMessage(e.target.value)}
                              value={newMessage}
                              onFocus={() => setIsComposerFocused(true)}
                              onBlur={() => setIsComposerFocused(false)}
                              onKeyPress={(event) => {
                                event.key === "Enter" &&
                                  newMessage.trim() !== "" &&
                                  sendMessage(event);
                              }}
                            />
                            <button
                              type="button"
                              className="send_btn"
                              onClick={
                                newMessage.trim() !== ""
                                  ? sendMessage
                                  : undefined
                              }
                              disabled={newMessage.trim() === ""}
                              style={{
                                background: "transparent",
                              }}
                            >
                              {/* <IoIosSend
                                size={25}
                                color={
                                  newMessage.trim() === ""
                                    ? "#686868"
                                    : "#F24462"
                                }
                              /> */}
                              <Image
                                src={
                                  newMessage === "" ? MessageSend : MessageSend2
                                }
                                alt="send-btn"
                                width={25}
                                height={25}
                              />
                            </button>
                          </div>
                        </div>
                          )}
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ChatMessages);
