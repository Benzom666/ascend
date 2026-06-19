import React from "react";
import withAuth from "../core/withAuth";
import { formatDateDuration } from "utils/dateDuration";
const MessageSend = "/assets/Send.svg";
const MessageSend2 = "/assets/message_send2.png";
function Chat({ currentChat, category }) {
  return (
    <div className="message-content-side">
      {currentChat && currentChat?.status === 1 && (
        <div className="message-chat-wrap">
          <div className="top-head">
            <div className="user-thumb">
              <figure>
                <Image
                  src={
                    currentChat?.user?.images?.length > 0 &&
                    currentChat?.user?.images
                      ? currentChat?.user?.images[0]
                      : (user?.images && user?.images[0]) || NoImage
                  }
                  alt="user image"
                  width={40}
                  height={40}
                />
              </figure>
              <span className="user-details">
                <h3>{currentChat?.user?.user_name ?? ""}</h3>
              </span>
            </div>
            <div className="user-details">
              <div className="tag_wrap">
                <ul>
                  <li>
                    <span>{category?.icon}</span>
                  </li>
                  <li>
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
                <div className="dropdown-list" id="action_dropdown">
                  <ul>
                    <li>
                      <Link href="/">
                        <a>
                          Setting <FiChevronRight size={22} />{" "}
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/">
                        <a>
                          Privacy <FiChevronRight size={22} />
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/">
                        <a>
                          Terms <FiChevronRight size={22} />
                        </a>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="chat_message_wrap">
            <div className="message_list_wrap">
              <ul className="chat_message_scroll">
                {messages.length > 0 &&
                  messages.map((message, index) => {
                    return (
                      <li
                        className={
                          message.sender_id === user?._id ? "send" : "receive"
                        }
                        key={index}
                        ref={scrollRef}
                      >
                        <div className="message_content">
                          <span className="message_time">
                            {format(message?.sent_time)}
                          </span>
                          {message?.message}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
            <div className="input_write_sec">
              <input
                type="text"
                placeholder="Type your message here…"
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
                onKeyPress={(event) => {
                  event.key === "Enter" &&
                    newMessage !== "" &&
                    sendMessage(event);
                }}
              />
              <button type="button" className="send_btn" onClick={sendMessage}>
                {/* <IoIosSend size={25} color={"#F24462"} /> */}
                <Image
                  src={newMessage === "" ? MessageSend : MessageSend2}
                  alt="send-btn"
                  size={25}
                  width={35}
                  height={35}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(Chat);
