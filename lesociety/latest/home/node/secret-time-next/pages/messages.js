import React, { useState, useEffect, useRef } from "react";
import HeaderLoggedIn from "core/loggedInHeader";
import Footer from "core/footer";
import { Inputs } from "../core";
import { Field, reduxForm } from "redux-form";
import validate from "modules/auth/forms/validate/validate";
import { IoIosSend, IoMdSearch } from "react-icons/io";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Image from "next/image";
import { formatDisplayName } from "utils/formatDisplayText";
const UserImg = "/assets/img/userimg.jpg";
const UserImg2 = "/assets/img/profile.png";
const UserImg3 = "/assets/img/user-3.png";
const UserImg4 = "/assets/img/user-4.png";
const NoImage = "/assets/img/no-image.png";
import SubHeading from "@/core/SubHeading";
import Link from "next/link";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FiChevronRight } from "react-icons/fi";
import withAuth from "../core/withAuth";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { AUTHENTICATE_UPDATE } from "@/modules/auth/actionConstants";
import { apiRequest, getDateCategory } from "utils/Utilities";
import { getActiveDateCount } from "utils/dateState";
import { formatDateDuration } from "utils/dateDuration";
import { format } from "timeago.js";

import UserCardListForMessage from "./../core/UserCardListForMessage";
import RequestsModal from "./request/[messageId]";
import { useRouter } from "next/router";
import useWindowSize from "utils/useWindowSize";
// import { socket } from "./_app";
import { socket } from "./user/user-list";
import NoConversationShowView from "@/modules/messages/NoConversationShowView";
import MessageMobileHeader from "./../core/MessageMobileHeader";
const MessageSend = "/assets/Send.svg";
const MessageSend2 = "/assets/message_send2.png";
import { logout } from "@/modules/auth/authActions";
import { getUnreadConversationActivityCount } from "utils/chatState";
import moment from "moment";
const StarIcon = "/assets/star1.svg";
import PaywallModal from "@/core/PaywallModal";
import { usePaywall } from "../hooks/usePaywall";
import EmptyState from "../components/inbox/EmptyState";
import PendingRequests from "../components/inbox/PendingRequests";
import NewInterests from "../components/inbox/NewInterests";

const REQUESTS_RETURN_STATE_KEY = "messages-requests-return-state";
const CONVERSATIONS_CACHE_KEY = "messages-conversations-cache";
const CHAT_HISTORY_CACHE_KEY = "messages-chat-history-cache";

const getCachedConversations = (userId) => {
  if (typeof window === "undefined" || !userId) return [];

  try {
    const cachedState = window.sessionStorage.getItem(
      `${CONVERSATIONS_CACHE_KEY}:${userId}`
    );
    const parsedState = cachedState ? JSON.parse(cachedState) : null;
    return Array.isArray(parsedState?.conversations)
      ? parsedState.conversations
      : [];
  } catch (error) {
    console.log("Failed to read cached conversations", error);
    return [];
  }
};

const setCachedConversations = (userId, conversations) => {
  if (typeof window === "undefined" || !userId) return;

  try {
    window.sessionStorage.setItem(
      `${CONVERSATIONS_CACHE_KEY}:${userId}`,
      JSON.stringify({
        conversations,
        cachedAt: Date.now(),
      })
    );
  } catch (error) {
    console.log("Failed to cache conversations", error);
  }
};

const getCachedChatHistory = (roomId) => {
  if (typeof window === "undefined" || !roomId) return [];

  try {
    const cachedState = window.sessionStorage.getItem(
      `${CHAT_HISTORY_CACHE_KEY}:${roomId}`
    );
    const parsedState = cachedState ? JSON.parse(cachedState) : null;
    return Array.isArray(parsedState?.messages) ? parsedState.messages : [];
  } catch (error) {
    console.log("Failed to read cached chat history", error);
    return [];
  }
};

const setCachedChatHistory = (roomId, messages) => {
  if (typeof window === "undefined" || !roomId) return;

  try {
    window.sessionStorage.setItem(
      `${CHAT_HISTORY_CACHE_KEY}:${roomId}`,
      JSON.stringify({
        messages,
        cachedAt: Date.now(),
      })
    );
  } catch (error) {
    console.log("Failed to cache chat history", error);
  }
};

const getInitialRequestReturnState = () => {
  if (typeof window === "undefined") {
    return {
      isRestoring: false,
      requestId: null,
      shouldOpen: false,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const shouldOpenFromQuery = searchParams.get("openRequests") === "1";
  const queryRequestId =
    searchParams.get("requestId") || searchParams.get("roomId") || null;

  if (shouldOpenFromQuery) {
    return {
      isRestoring: true,
      requestId: queryRequestId,
      shouldOpen: true,
    };
  }

  const storedState = window.sessionStorage.getItem(REQUESTS_RETURN_STATE_KEY);

  if (!storedState) {
    return {
      isRestoring: false,
      requestId: null,
      shouldOpen: false,
    };
  }

  try {
    const parsedState = JSON.parse(storedState);
    if (parsedState?.source === "messages-requests") {
      return {
        isRestoring: true,
        requestId: parsedState.requestId || parsedState.roomId || null,
        shouldOpen: true,
      };
    }
  } catch (error) {
    console.log("Failed to read initial request return state", error);
  }

  return {
    isRestoring: false,
    requestId: null,
    shouldOpen: false,
  };
};

// const socket = io.connect(socketURL);

// const socket = io(socketURL, {
//   autoConnect: true,
// });

const Messages = (props) => {
  const {
    handleSubmit,
    invalid,
    previousPage,
    pristine,
    reset,
    submitting,
    touched,
  } = props;

  const [isActive, setActive] = useState(false);
  const user = useSelector((state) => state.authReducer.user);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState("");
  const scrollRef = useRef();
  const [chatModal, setChatModal] = useState(false);
  // Search functionality removed - const [search, setSearch] = useState("");
  const { width } = useWindowSize();
  const mobile = width < 768;
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [hasResolvedConversations, setHasResolvedConversations] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [countdownNow, setCountdownNow] = useState(Date.now());

  // for notification
  const [count, setCount] = useState(0);
  const [activeDatesCount, setActiveDatesCount] = useState(() =>
    typeof user?.active_dates_count === "number" ? user.active_dates_count : null
  );
  const [hasResolvedActiveDatesCount, setHasResolvedActiveDatesCount] = useState(
    () => typeof user?.active_dates_count === "number"
  );
  const [expiringInterestsCount, setExpiringInterestsCount] = useState(0); // About to expire
  const [totalExpiredInterestsCount, setTotalExpiredInterestsCount] = useState(0); // Already expired
  
  // Requests modal state for women
  const [initialRequestReturnState] = useState(getInitialRequestReturnState);
  const [showRequestsModal, setShowRequestsModal] = useState(
    initialRequestReturnState.shouldOpen
  );
  const [returnRequestId, setReturnRequestId] = useState(
    initialRequestReturnState.requestId
  );
  const [isRestoringRequestsModal, setIsRestoringRequestsModal] = useState(
    initialRequestReturnState.isRestoring
  );
  
  // Paywall integration for women
  const {
    paywallConfig,
    pricingConfig,
    showLadiesChatPaywall,
    closePaywall
  } = usePaywall();

  useEffect(() => {
    socket.auth = { user: user };
    socket.connect();
    const handleConnect = () => {
      console.log("connected", socket.connected);
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

  // useEffect(() => {
  // setTimeout(() => {
  //   socket.close();
  // }, 10000);
  // }, []);

  useEffect(() => {
    if (!user?._id) return;

    const cachedConversations = getCachedConversations(user._id);
    if (cachedConversations.length > 0) {
      setConversations(cachedConversations);
      setLoading(false);
      setHasResolvedConversations(true);
      getConversations({ silent: true });
      return;
    }

    setLoading(true);
    setHasResolvedConversations(false);
    getConversations();
  }, [user?._id]);

  useEffect(() => {
    if (!loading || hasResolvedConversations) return;

    const loadingTimeout = window.setTimeout(() => {
      setLoading(false);
      setHasResolvedConversations(true);
    }, 12000);

    return () => {
      window.clearTimeout(loadingTimeout);
    };
  }, [loading, hasResolvedConversations]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownNow(Date.now());
      if (user?.gender === "male") {
        getConversations();
      } else {
        setCount(0);
        getConversations();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.gender]);

  useEffect(() => {
    if (!router.isReady || user?.gender !== "female") {
      return;
    }

    const shouldOpenFromQuery = router?.query?.openRequests === "1";
    const queryRequestId =
      router?.query?.requestId || router?.query?.roomId || null;

    if (!shouldOpenFromQuery) {
      return;
    }

    setReturnRequestId(queryRequestId);
    setShowRequestsModal(true);
    setIsRestoringRequestsModal(true);

    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("openRequests");
      nextUrl.searchParams.delete("requestId");
      nextUrl.searchParams.delete("roomId");
      window.history.replaceState(
        window.history.state,
        "",
        `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
      );
    }
  }, [router.isReady, router.pathname, router.query, user?.gender]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      user?.gender !== "female" ||
      !hasResolvedConversations
    ) {
      return;
    }

    const storedState = window.sessionStorage.getItem(
      REQUESTS_RETURN_STATE_KEY
    );

    if (!storedState) {
      return;
    }

    try {
      const parsedState = JSON.parse(storedState);
      if (parsedState?.source === "messages-requests") {
        setReturnRequestId(parsedState.requestId || parsedState.roomId || null);
        setShowRequestsModal(true);
        setIsRestoringRequestsModal(true);
      }
    } catch (error) {
      console.log("Failed to restore request modal state", error);
    }

    window.sessionStorage.removeItem(REQUESTS_RETURN_STATE_KEY);
  }, [user?.gender, hasResolvedConversations, conversations.length]);

  useEffect(() => {
    if (!isRestoringRequestsModal || user?.gender !== "female") {
      return;
    }

    if (!hasResolvedConversations) {
      return;
    }

    setIsRestoringRequestsModal(false);
  }, [isRestoringRequestsModal, user?.gender, hasResolvedConversations]);

  useEffect(() => {
    if (typeof user?.active_dates_count === "number") {
      setActiveDatesCount(user.active_dates_count);
      setHasResolvedActiveDatesCount(true);
    }
  }, [user?.active_dates_count]);

  useEffect(() => {
    const fetchActiveDates = async () => {
      try {
        if (!user?.user_name) return;
        const res = await apiRequest({
          url: "date",
          params: {
            user_name: user?.user_name,
            current_page: 1,
            per_page: 10000,
          },
        });
        const dates = res?.data?.data?.dates || [];
        const activeCount = getActiveDateCount(dates);
        setActiveDatesCount(activeCount);
        setHasResolvedActiveDatesCount(true);
      } catch (err) {
        console.log("Failed to fetch active dates count", err);
        setActiveDatesCount((prev) =>
          typeof prev === "number"
            ? prev
            : typeof user?.active_dates_count === "number"
            ? user.active_dates_count
            : null
        );
        setHasResolvedActiveDatesCount(true);
      }
    };
    fetchActiveDates();
  }, [user?.user_name, user?.active_dates_count]);

  // Removed - no longer needed


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

  const customFormat = (date, normalDate) => {
    const now = moment(); // Current date and time
    const diff = now.diff(date, "hours"); // Time difference in hours

    if (diff < 24) {
      return format(normalDate); // Use relative time format
    } else {
      return date.format("DD/MM/YYYY"); // Full date format: DD/MM/YYYY
    }
  };

  const getChatHistoryConversation = async (chatRoomId) => {
    console.log("chatRoomId", chatRoomId);
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

      console.log("res", res);

      if (res?.data?.data?.chat?.length > 1) {
        const chat = res?.data?.data?.chat[0];
        console.log("first", chat);
        setConversations((prev) => {
          return prev.map((conversation) => {
            if (conversation._id === chat?.room_id) {
              console.log(
                "conversation._id === chat?.room_id",
                conversation._id === chat?.room_id
              );
              return {
                ...conversation,
                message: { ...chat },
              };
            } else {
              return conversation;
            }
          });
        });
      }
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

  useEffect(
    () => {
      const eventName = `recieve-${user?._id}`;
      const handleReceive = (message) => {
        console.log("reciever message", message);
        if (message.message == "") {
          // getChatHistoryConversation(message?.room_id);
          // getConversations();
          // setConversations((prev) => {
          //   const index = prev.findIndex((item) => item._id === message?.room_id);
          //   prev[index].status = 1;
          //   return [...prev];
          // });
          return;
        } else {
          return setArrivalMessage({
            ...message,
            message: message.message,
            sender_id: message.sender_id,
            sent_time: Date.now(),
            room_id: message?.room_id,
            receiver_id: message?.receiver_id,
            _id: message?._id,
          });
        }
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
      getConversations();
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
    if (currentChat) {
      const chatRoomId = currentChat?.message?.room_id ?? currentChat?._id;
      const cachedMessages = getCachedChatHistory(chatRoomId);

      if (cachedMessages.length > 0) {
        setMessages(cachedMessages);
        setChatLoading(false);
        getChatHistory(currentChat, { silent: true });
        return;
      }

      setMessages([]);
      setChatLoading(true);
      getChatHistory(currentChat);
    }
  }, [currentChat]);

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

  useEffect(() => {
    const eventName = `push-notification-${user.email}`;
    const handleNotification = (message) => {
      console.log("notif received", message);
      // Notifications are handled via conversation refresh which resets count to 0
      // Don't set localStorage or count here as it conflicts with the refresh cycle
    };

    socket.on(eventName, handleNotification);

    return () => {
      socket.off(eventName, handleNotification);
    };
  }, [user?.email]);
  // Fuctions

  //  show message time
  const showTime = (time) => {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const hours12 = hours % 12 || 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return hours12 + ":" + minutesStr + " " + ampm;
  };

  // if message is more 20 character then show only 20 character and add ...
  const showText = (text) => {
    if (text?.length > 20) {
      return text.substring(0, 20) + "...";
    } else {
      return text;
    }
  };

  const toggleChat = (currentChat) => {
    // setChatModal(true);
    router.push(`messages/${currentChat?._id}`);
  };

  const getConversations = async ({ silent = false } = {}) => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `chat/chatroom-list`,
        timeout: 10000,
      });
      // console.log("res", res.data?.data?.chatRooms);
      const conversations =
        res.data?.data?.chatRooms.length > 0
          ? res.data?.data?.chatRooms.filter((chat) => chat !== null)
          : [];
      setConversations(conversations);
      setCachedConversations(user?._id, conversations);
      localStorage.removeItem("unreadNotifCount");
      setCount(0);
      setLoading(false);
      setHasResolvedConversations(true);
    } catch (err) {
      setCount(0);
      if (!silent) {
        setLoading(false);
        setHasResolvedConversations(true);
      }
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
    // e.preventDefault();
    const isFemale = user?.gender === "female";
    const chatTokens = user?.chat_tokens || 0;
    const remainingChats = user?.remaining_chats || 0;

    if (isFemale && chatTokens === 0 && remainingChats === 0) {
      showLadiesChatPaywall();
      return;
    }

    const data = {
      chatRoomId: currentChat?.message?.room_id ?? currentChat?._id,
      recieverId: currentChat?.user?.id ?? "",
      message: newMessage,
    };

    socket.connect();

    if (socket.connected) {
      setTimeout(() => {
        console.log(
          "socket.connected:->",
          socket.connected,
          " data ->",
          data,
          " active ->",
          socket.active,
          " disconnected ->",
          socket.disconnected,
          " id ->",
          socket.id,
          " connection ->",
          socket.connect()
        );

        socket.emit("sendMessage", data);
      }, 100);
    }
    setMessages((prev) => [
      ...prev,
      {
        message: newMessage,
        sender_id: user?._id,
        sent_time: Date.now(),
      },
    ]);
    setConversations((prev) => {
      return prev.map((conversation) => {
        if (conversation._id === currentChat?._id) {
          return {
            ...conversation,
            message: {
              sent_time: Date.now(),
              message: newMessage,
              sender_id: user?._id,
              receiver_id: currentChat?.user?.id,
              room_id: currentChat?.message?.room_id ?? conversation?._id,
            },
          };
        } else {
          return conversation;
        }
      });
    });
    // getChatHistory(currentChat);
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

  const tabIndexChange = (index) => {
    setSelectedTabIndex(index);
    if (index === 1) {
      setCurrentChat();
    }
  };

  const getChatHistory = async (currentChat, { silent = false } = {}) => {
    try {
      const chatRoomId = currentChat?.message?.room_id ?? currentChat?._id;
      const data = {
        chatRoomId,
      };

      const res = await apiRequest({
        method: "GET",
        url: `chat/chatroom-history`,
        params: data,
        timeout: 10000,
      });
      const nextMessages = res.data?.data?.chat || [];
      setMessages(nextMessages);
      setCachedChatHistory(chatRoomId, nextMessages);
      setChatLoading(false);
    } catch (err) {
      if (!silent) {
        setChatLoading(false);
      }
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

  const blockChat = async (currentChat) => {
    try {
      const data = {
        chatRoomId: currentChat?.message?.room_id,
        recieverId: currentChat?.user?.id,
      };

      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `chat/block`,
      });
      console.log("res", res);
      if (res?.data?.message === "Accepted!!") {
        setCurrentChat(
          (prev) =>
            prev && {
              ...prev,
              status: 2,
              blocked_by: {
                ...prev.blocked_by,
                _id: user?._id,
              },
            }
        );
      }
      getConversations();

      getChatHistory(currentChat);
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
        chatRoomId: currentChat?.message?.room_id,
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
      getChatHistory(currentChat);
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
        chatRoomId: currentChat?.message?.room_id,
        recieverId: currentChat?.user?.id,
      };
      console.log("deletechat data", data);

      const res = await apiRequest({
        data: data,
        method: "DELETE",
        url: `chat/chat-clear`,
      });
      console.log("res", res);
      setMessages([]);
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

  const sidbarCloseOutsideClick = (event) => {
    const target = document.querySelector("#action_dropdown");
    const withinBoundaries = event.composedPath().includes(target);
    if (withinBoundaries) {
      setActive(false);
      // document.body.classList.remove("open-sidebar");
    }
  };

  useEffect(() => {
    document.addEventListener("click", sidbarCloseOutsideClick);
    return () => {
      document.removeEventListener("click", sidbarCloseOutsideClick);
    };
  }, []);
  const toggleClass = () => {
    setActive(!isActive);
    // document.body.classList.toggle("open-sidebar");
  };
  const category = getDateCategory(currentChat?.date_id);

  const conversationLength = conversations
    ?.filter(
      (c) =>
        (c.status == 1 || c.status == 2) && c.message
    )?.length;

  const requestedConversationLength = conversations?.filter(
    (c) => c.status == 0
  )?.length;

  const rejectedRequestsCount = conversations?.filter((c) => c.status == 3)?.length || 0;
  const ignoredRequestsCount = conversations?.filter((c) => c.status == 4)?.length || 0;
  const expiredFromPendingCount =
    conversations?.filter((c) => c.status == 0 && c.expires_at && new Date(c.expires_at).getTime() <= countdownNow)
      ?.length || 0;

  useEffect(() => {
    if (user?.gender !== "female") return;
    // Interests about to expire (still pending but will expire soon)
    setExpiringInterestsCount(expiredFromPendingCount || 0);
    // Total expired interests (ignored + already expired)
    setTotalExpiredInterestsCount(ignoredRequestsCount || 0);
  }, [user?.gender, ignoredRequestsCount, expiredFromPendingCount]);

  const unReadedConversationLength = getUnreadConversationActivityCount(
    conversations,
    user?._id
  );
  const visibleMessages = messages.filter((message) => message?.message !== "");

  // consoles
  // console.log("socket connected message", socket.connected);
  // console.log("conversationLength", conversationLength);
  // console.log("unReadedConversationLength", unReadedConversationLength);
  // console.log("socket", socket);
  // console.log("currentChat", currentChat);
  // console.log("arrivalMessage", arrivalMessage);
  // console.log("category", category);
  // console.log("conversation", conversations);
  // console.log("messages", messages);
  // console.log("arrivalMessage", arrivalMessage);

  const myLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 70}`;
  };

  const isInboxBootstrapping = !hasResolvedConversations || loading;
  const getConversationImage = (conversation) => {
    return (
      (conversation?.user?.images?.length > 0 && conversation?.user?.images[0]) ||
      conversation?.user?.profile_image ||
      (user?.images && user?.images[0]) ||
      NoImage
    );
  };

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
      {mobile ? (
        <MessageMobileHeader
          backHref={user?.gender === "female" ? "/user/user-list" : null}
        />
      ) : (
        <HeaderLoggedIn
          unReadedConversationLength={unReadedConversationLength}
          count={count}
          setCount={setCount}
        />
      )}

      <div className="inner-part-page">
        <div className="">
          <form onSubmit={(e) => e.preventDefault()}>
            {/* <div className="pl-4 pr-4 message"> */}
            <div className="container message">
              <div className="row">
                <div className="col-md-4 col-lg-3 p-0">
                  <div className="message_sidebar_wrap">
                    <Tabs
                      selectedIndex={selectedTabIndex}
                      onSelect={tabIndexChange}
                    >
                      <TabList>
                        <Tab>Active Conversations</Tab>
                      </TabList>
                      <TabPanel>
                        {hasResolvedConversations && user?.gender === "female" && (
                          <NewInterests
                            interestCount={requestedConversationLength}
                            activeDatesCount={activeDatesCount}
                            hasResolvedActiveDatesCount={hasResolvedActiveDatesCount}
                            expiringInterestsCount={expiringInterestsCount}
                            totalExpiredInterestsCount={totalExpiredInterestsCount}
                            onViewInterests={() => {
                              // Open the requests modal slider to show interest details
                              // Paywall check happens when user clicks "Reply" button
                              setReturnRequestId(null);
                              setShowRequestsModal(true);
                            }}
                          />
                        )}
                        {hasResolvedConversations && user?.gender === "male" && (
                          <PendingRequests
                            requests={conversations
                              ?.filter((c) => c.status == 0)
                              ?.map((c) => ({
                                id: c?._id,
                                profileImage: c?.user?.images?.[0],
                                userName: c?.user?.user_name,
                                isSuperInterested: c?.isSuperInterested,
                                expiresAt: c?.expires_at,
                                hoursRemaining: c?.expires_at
                                  ? Math.max(
                                      0,
                                      Math.ceil(
                                        (new Date(c.expires_at).getTime() - countdownNow) /
                                          (1000 * 60 * 60)
                                      )
                                    )
                                  : 0,
                              }))}
                            ignoredCount={ignoredRequestsCount}
                            rejectedCount={rejectedRequestsCount}
                          />
                        )}
                        <div className="active-conversations-header">
                          <h3>Active Conversations</h3>
                        </div>
                        <div className="user-list-wrap">
                          <ul>
                            {isInboxBootstrapping ? (
                              null
                            ) : conversations?.length > 0 ? (
                              conversations
                                .filter(
                                  (c) =>
                                    (c.status == 1 || c.status == 2) && c.message
                                )?.length > 0 ? (
                                conversations
                                  .filter(
                                    (c) =>
                                      (c.status == 1 || c.status == 2) && c.message
                                  )
                                  .sort((a, b) => {
                                    return (
                                      new Date(b?.message?.sent_time) -
                                      new Date(a?.message?.sent_time)
                                    );
                                  })
                                  ?.map((c) => {
                                    return (
                                      <li
                                        onClick={() => {
                                          setCurrentChat(c);
                                          if (mobile) {
                                            toggleChat(c);
                                          }
                                        }}
                                      >
                                        <div className="d-flex w-100">
                                          <figure className="user_img_header">
                                            <Image
                                              src={getConversationImage(c)}
                                              loader={myLoader}
                                              unoptimized
                                              priority={true}
                                              placeholder="blur"
                                              blurDataURL={getConversationImage(c)}
                                              alt="user image"
                                              width={36}
                                              height={36}
                                            />
                                          </figure>
                                          <div className="w-100">
                                            <div className="user-details">
                                              <h3 className="user__detail__star">
                                                {c?.isSuperInterested && (
                                                  <Image
                                                    src={StarIcon}
                                                    height={20}
                                                    width={20}
                                                  />
                                                )}

                                                <span
                                                  className={
                                                    c?.isSuperInterested
                                                      ? "super__interested__username"
                                                      : ""
                                                  }
                                                >
                                                  {formatDisplayName(c?.user?.user_name) ?? ""}
                                                </span>
                                              </h3>

                                              <span>
                                                {/* {c?.message &&
                                                  showTime(
                                                    c?.message?.sent_time
                                                  )} */}
                                                {c?.message &&
                                                  customFormat(
                                                    moment(
                                                      c?.message?.sent_time
                                                    ),
                                                    c?.message?.sent_time
                                                  )}
                                              </span>
                                            </div>
                                            {c?.message?.read_date_time ||
                                            c?.message?.sender_id ===
                                              user?._id ? (
                                              <div className="read">
                                                {showText(c?.message?.message)}
                                              </div>
                                            ) : (
                                              <div className="unread">
                                                {showText(c?.message?.message)}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {c?.message &&
                                        !c?.message?.read_date_time &&
                                        c?.message?.sender_id !== user?._id ? (
                                          <span className="unread_indicator"></span>
                                        ) : (
                                          <span className="read_indicator"></span>
                                        )}
                                      </li>
                                    );
                                  })
                              ) : mobile ? (
                                <div className="message-content-side">
                                  {conversationLength == 0 && (
                                    <EmptyState
                                      gender={user?.gender}
                                      activeDatesCount={activeDatesCount}
                                      hasResolvedActiveDatesCount={hasResolvedActiveDatesCount}
                                    />
                                  )}
                                </div>
                              ) : (
                                ""
                              )
                            ) : mobile ? (
                              <div className="message-content-side">
                                {conversationLength == 0 && (
                                  <EmptyState
                                    gender={user?.gender}
                                    activeDatesCount={activeDatesCount}
                                    hasResolvedActiveDatesCount={hasResolvedActiveDatesCount}
                                  />
                                )}
                              </div>
                            ) : (
                              ""
                            )}
                          </ul>
                        </div>
                      </TabPanel>
                    </Tabs>
                  </div>
                </div>
                <div className="col-md-8 col-lg-9 p-0">
                  {!mobile && (
                    <div className="message-content-side">
                      {currentChat && currentChat?.status === 0 ? (
                        <>{/* <UserCardList currentChat={currentChat} /> */}</>
                      ) : currentChat &&
                        (currentChat?.status === 1 ||
                          currentChat?.status === 2) ? (
                        <div className="message-chat-wrap">
                          <div className="top-head">
                            <div
                              className="user-thumb"
                              onClick={() =>
                                router.push(
                                  `/user/user-profile/${currentChat?.user?.user_name}`
                                )
                              }
                            >
                              <figure
                                className="user_img_header"
                                onClick={() =>
                                  router.push(
                                    `/user/user-profile/${currentChat?.user?.user_name}`
                                  )
                                }
                                >
                                <Image
                                  src={getConversationImage(currentChat)}
                                  loader={myLoader}
                                  unoptimized
                                  priority={true}
                                  placeholder="blur"
                                  blurDataURL={getConversationImage(currentChat)}
                                  alt="user image"
                                  width={36}
                                  height={36}
                                  onClick={() =>
                                    router.push(
                                      `/user/user-profile/${currentChat?.user?.user_name}`
                                    )
                                  }
                                />
                              </figure>

                              <span
                                className="user-details"
                                onClick={() =>
                                  router.push(
                                    `/user/user-profile/${currentChat?.user?.user_name}`
                                  )
                                }
                              >
                                <h3>{formatDisplayName(currentChat?.user?.user_name) ?? ""}</h3>
                              </span>
                            </div>
                            <div className="user-details">
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
                                            onClick={() =>
                                              unblockChat(currentChat)
                                            }
                                          >
                                            <a>Unblock</a>
                                          </li>
                                        )
                                      ) : (
                                        <li
                                          onClick={() => blockChat(currentChat)}
                                        >
                                          <a>Block</a>
                                        </li>
                                      )}
                                      <li
                                        onClick={() => deleteChat(currentChat)}
                                      >
                                        <a>Delete Conversation</a>
                                      </li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="chat_message_wrap">
                            <div className="message_list_wrap">
                              <ul className="chat_message_scroll">
                                {visibleMessages.length > 0 &&
                                  visibleMessages.map((message, index) => {
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
                                          <span
                                            className={` ${
                                              message.sender_id === user?._id
                                                ? "message_time"
                                                : "message_time_send"
                                            }`}
                                          >
                                            {customFormat(
                                              moment(message?.sent_time),
                                              message?.sent_time
                                            )}
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
                            {chatLoading ? (
                              ""
                            ) : currentChat?.status === 2 ? (
                              currentChat?.date_id?.is_blocked_by_admin ? (
                                <div className="text-center">
                                  Admin has removed this date.
                                </div>
                              ) : currentChat?.blocked_by?._id == user?._id ? (
                                <div className="text-center">
                                  {/* you have blocked this chat */}
                                  User has been blocked
                                </div>
                              ) : (
                                <div className="text-center">
                                  You have been blocked
                                </div>
                              )
                            ) : (
                              <div className="input_write_sec">
                                <input
                                  type="text"
                                  placeholder="Type your message here…"
                                  onChange={(e) =>
                                    setNewMessage(e.target.value)
                                  }
                                  value={newMessage}
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
                                    newMessage.trim() !== "" && sendMessage
                                  }
                                  disabled={newMessage.trim() === ""}
                                >
                                  <Image
                                    src={
                                      !newMessage
                                        ? "/images/message_send.png"
                                        : MessageSend2
                                    }
                                    alt="send-btn"
                                    width={25}
                                    height={25}
                                  />
                                </button>
                                {/* <div className="send_btn">
                                  {newMessage.trim() !== "" ? (
                                    <Image
                                      src={MessageSend2}
                                      alt="send-btn"
                                      onClick={
                                        newMessage.trim() !== "" && sendMessage
                                      }
                                    />
                                  ) : (
                                    <Image src={MessageSend} alt="send-btn" />
                                  )}
                                </div> */}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : isInboxBootstrapping ? (
                        null
                      ) : (
                        ((selectedTabIndex == 0 && conversationLength == 0) ||
                          (selectedTabIndex == 1 &&
                            requestedConversationLength == 0)) && (
                          <EmptyState
                            gender={user?.gender}
                            activeDatesCount={activeDatesCount}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
          
          {/* Requests Modal for Women */}
          {user?.gender === "female" && (
            <RequestsModal
              conversations={conversations}
              setConversations={setConversations}
              isDesktopView={!mobile}
              getConversations={getConversations}
              setCurrentChat={setCurrentChat}
              tabIndexChange={tabIndexChange}
              selectedTabIndex={selectedTabIndex}
              socket={socket}
              toggleChat={toggleChat}
              mobile={mobile}
              isOpen={showRequestsModal}
              initialRequestId={returnRequestId}
              onClose={() => {
                setReturnRequestId(null);
                setShowRequestsModal(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default reduxForm({
  form: "Messages", // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  validate,
})(withAuth(Messages));
