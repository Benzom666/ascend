import React, { useEffect, useState } from "react";
import Header from "core/header";
import Footer from "core/footer";
import useWindowSize from "../../utils/useWindowSize";
import withAuth from "@/core/withAuth";
import { apiRequest, apiURL, socketURL } from "utils/Utilities";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import HeaderLoggedIn from "@/core/loggedInHeader";
import io from "socket.io-client";
import { logout } from "@/modules/auth/authActions";
import { getUnreadActionableNotificationCount } from "utils/notificationState";
import { getUnreadConversationActivityCount } from "utils/chatState";

export const socket = io(socketURL, {
  autoConnect: true,
});

const Notifications = () => {
  const [notifData, setNotifData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.auth = { user: user };
    socket.connect();
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("disconnect", (reason) => {
      console.log("socket disconnected reason", reason);
    });
  }, [!socket.connected]);

  socket.on(
    "connect_error",
    () => {
      console.log("connect_error");
      socket.auth = { user: user };
      socket.connect();
    },
    [!socket.connected]
  );

  useEffect(() => {
    getConversations();
  }, []);

  useEffect(() => {
    socket.on(`request-${user?._id}`, (message) => {
      console.log("reqested message header", message);
      getConversations();
    });
  }, [socket.connected]);

  useEffect(() => {
    socket.on(`recieve-${user?._id}`, (message) => {
      console.log("recieve message header", message);
      getConversations();
    });
  }, [socket.connected]);

  const unReadedConversationLength = getUnreadConversationActivityCount(
    conversations,
    user?._id
  );

  const getConversations = async () => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `chat/chatroom-list`,
      });
      // console.log("res", res.data?.data?.chatRooms);
      const conversations =
        res.data?.data?.chatRooms.length > 0
          ? res.data?.data?.chatRooms.filter((chat) => chat !== null)
          : [];
      setConversations(conversations);
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

  useEffect(() => {
    console.log("Notif socket connected", socket.connected);
    // socket.on("connect", () => {
    //   console.log(socket.id);
    // });
    socket.on(`push-notification-${user.email}`, (message) => {
      console.log("notif received", message);
      setCount(getUnreadActionableNotificationCount(message?.notifications));
    });
  }, [socket.connected]);

  const user = useSelector((state) => state.authReducer.user);
  const { width } = useWindowSize();

  const fetchNotifications = async () => {
    try {
      const params = {
        user_email: user.email,
        sort: "sent_time",
      };
      const { data } = await apiRequest({
        method: "GET",
        url: `notification`,
        params: params,
      });
      const notifss = data?.data?.notification.filter(
        (item) => item.type !== "notification"
      );
      setNotifData(notifss);
      setCount(getUnreadActionableNotificationCount(notifss));
      setLoading(false);
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

  const readNotifications = async () => {
    try {
      const params1 = new URLSearchParams();
      params1.append("email", user.email);
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${user.token || ""}`,
        },
      };

      const url = `${`${apiURL}/api/v1`}/notification/read-all-notification`;
      const data = await axios.put(url, params1, config);
      console.log("Read all notifications ", data);
    } catch (err) {
      console.log("err here: ", err);
    }
  };

  useEffect(() => {
    readNotifications();
    fetchNotifications();
    //readNotifications()
  }, []);

  const getNotifTimeOrDate = (timestamp) => {
    let hr, min, days, ms;
    ms = Date.now() - new Date(timestamp);
    days = Math.floor(ms / (1000 * 3600 * 24));
    if (!days) {
      hr = Math.floor(ms / (1000 * 3600));
      min = Math.floor(ms / (1000 * 60));
      if (hr < 24 && min > 60) return hr + " hrs";
      else if (min < 60 && min > 0) return min + " mins";
      else return Math.floor(ms / 1000) + " secs";
    }
    return days + " days";
  };

  console.log("notif ", notifData);
  //const { width } = useWindowSize();
  if (loading) {
    return (
      <div className="date_details_desktop_loading-2">
        <Image
          src={"/assets/squareLogoNoBack.gif"}
          alt="loading..."
          className=""
          width={100}
          height={100}
        />
      </div>
    );
  } else {
    return (
      <div className="notifications">
        {/* <Header /> */}
        <HeaderLoggedIn
          fixed={width < 767}
          // isBlack={true}
          count={count}
          setCount={setCount}
          unReadedConversationLength={unReadedConversationLength}
        />
        <div
          className={
            notifData[0]
              ? "notification-wrapper"
              : "notification-wrapper no-notifWrap"
          }
        >
          <div className="main-header">
            <h1 className="header">{width > 767 && "Notifications"} </h1>
          </div>
          {notifData[0] ? (
            <ul>
              {notifData?.map((notifs) => (
                <li className="notif-items">
                  <p className="title">Ascend</p>
                  <p className="actions">Action Required</p>
                  <p className="msg">{notifs.message}</p>
                  <div className="notif-time">
                    <p className="timing">
                      {getNotifTimeOrDate(notifs.created_date)} ago
                    </p>
                    <div className="btn-container">
                      <button
                        className="edit-btn-verify"
                        onClick={() =>
                          router.push({
                            pathname: "/auth/profile",
                            query: {
                              edit: true,
                              type: notifs.type,
                              id: notifs._id,
                            },
                          })
                        }
                      >
                        Edit now
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-notif">
              You do not have any notifications at this time.
            </p>
          )}
        </div>
        <Footer />
      </div>
    );
  }
};

export default withAuth(Notifications);
