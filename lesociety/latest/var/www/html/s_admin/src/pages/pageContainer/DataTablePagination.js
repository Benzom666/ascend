import React, { useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Nav, Tab, Form, Card, Button, Toast } from "react-bootstrap";
import moment from "moment";
import VerifyProfileImages from "./profileImage";
import { getUserList, postUpdateUserStatus, postSendDefaulMsg, getDefaultMsgList, postVerfiyUser } from "./action.js";
import VerifyPhotoCards from "./VerifyPhotoCards.js";
import { DefaultMsg } from "./DefaultMsg";
import { NavItemSet } from "./Component";

function PostList(props) {
  const { setEndUser } = props;
  const dispatch = useDispatch();
  const { usersAdminStatus, userlist, defaultMsg, pagination, loading } =
    useSelector((state) => state.userListReducer);
  const [emailSelected, setEmailSelected] = useState([]);
  const [postIdSelected, setPostIdSelected] = useState([]);
  const [showA, setShowA] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [show, setShow] = useState();
  const [msgType, setMsgType] = useState("");
  const [cardId, setCardId] = useState();
  const [page, setPage] = useState(2);
  const [status, setStatus] = useState(5);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const toggleShowA = () => setShowA(!showA);

  const msgSubmit = () => {
    dispatch(postSendDefaulMsg(msgType, 0, emailSelected, "6323e3ae8c8a4613fdf79256", status, "user"));
    setShow(false);
    setEmailSelected([]);
    setPostIdSelected([]);
  };
  const observer = useRef();
  const lastPostElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && pagination.total_pages >= page) {
        dispatch(getUserList(status, page));
        setPage(page + 1);
      } else {
        setEndUser("End of page");
      }
    });
    if (node) observer.current.observe(node);
  });
  const checkedUser = (event) => {
    if (event.target.checked) {
      setEmailSelected([...emailSelected, event.target.value]);
      setPostIdSelected([...postIdSelected, event.target.id]);
    } else {
      emailSelected.splice(emailSelected.indexOf(event.target.value), 1);
      setEmailSelected(emailSelected);
      postIdSelected.splice(postIdSelected.indexOf(event.target.id
      ), 1);
      setPostIdSelected(postIdSelected);
    }
  }
  const verifyUpdatedDetails = (email) => {
    // dispatch(postVerfiyUser(email, status))
    dispatch(postUpdateUserStatus(2, email));
  }
  const UserPostList = status === 10 ? 
  userlist.map((post, index) => {
    return (
    (post?.un_verified_tagline || post?.un_verified_images?.length !== 0 || post?.un_verified_description) &&
      <Card
        className={"text-white verifyPhotoCard"}
        key={post.id}
        ref={userlist.length === index + 1 ? lastPostElementRef : null}
      >
        <div className="cardActionBox">
          {status !== 6 ?
            <Form.Check className="checkboxUI" type="checkbox"
              onClick={checkedUser} id={post?._id} value={post?.email} />
            : null}
        </div>
        <div className="userProfileDetail">
          {cardId === undefined || cardId != post?._id ? (
            <VerifyProfileImages
              img={post?.images}
              unVerifiedImages={post?.un_verified_images}
              imageVerified={post?.image_verified}
            />
          ) : (
            ""
          )}
          {isActive === false ||
            (cardId === post?._id && (
              <VerifyProfileImages
                img={post?.images}
                unVerifiedImages={post?.un_verified_images}
                imageVerified={post?.image_verified}
              />
            ))}
          {isActive ||
            (cardId === post?._id && (
              <Card.Body>
                <Card.Text className="y-scroll">
                  {!post?.tag_desc_verified &&
                    post?.un_verified_description?.length
                    ? post?.un_verified_description
                    : post?.description}
                </Card.Text>
                <Card.Title className="y-scroll">
                  {!post?.tag_desc_verified &&
                    post?.un_verified_tagline?.length
                    ? post?.un_verified_tagline
                    : post?.tagline}
                </Card.Title>
              </Card.Body>
            ))}
          <Card.Title> {post?.user_name} </Card.Title>
          <div className="userInfoLink">
            <Card.Link
              onClick={() => {
                setIsActive(true);
                setCardId(post?._id);
              }}
            >
              picture
            </Card.Link>
            <Card.Link
              onClick={() => {
                setIsActive(false);
                setCardId(post?._id);
              }}
            >
              Info
            </Card.Link>
          </div>
          <div>
            {status !== 6 &&
              (status === 10 ? (
                <>
                  <Button
                    className="requestBtn"
                    onClick={() => {
                      setEmailSelected([post?.email]);
                      setShow(true);
                    }}
                  >
                    Request
                  </Button>
                  <Button className={"verifyBtn"} onClick={() => verifyUpdatedDetails(post?.email)}>
                    Verify
                  </Button>
                </>
              ) :
                post?.status === 2 ? (
                  <Button className={"verifyBtn verified-user-card"} disabled>
                    verified
                  </Button>
                ) : (
                  <>
                    <Button
                      className="requestBtn"
                      onClick={() => {
                        setEmailSelected([post?.email]);
                        setShow(true);
                      }}
                    >
                      Request
                    </Button>
                    <Button
                      className={"verifyBtn"}
                      onClick={() => {
                        dispatch(postUpdateUserStatus(2, post.email, "user-list", status));
                        dispatch(getDefaultMsgList("userRequestType"));
                      }}
                    >
                      Verify
                    </Button>
                  </>
                ))}
          </div>
        </div>
        <Card.Footer className="d-block">
          <div className="justify-space-between">Email <span>{post?.email}</span></div>
          {status === 6 && <div className="justify-space-between mt-3">Requested date <span>{moment(post?.requested_date).format("DD/MM/YYYY")}</span></div>}

        </Card.Footer>
      </Card>
    );
  }) : userlist.map((post, index) => {
    return (
      <Card
        className={"text-white verifyPhotoCard"}
        key={post.id}
        ref={userlist.length === index + 1 ? lastPostElementRef : null}
      >
        <div className="cardActionBox">
          {status !== 6 ?
            <Form.Check className="checkboxUI" type="checkbox"
              onClick={checkedUser} id={post?._id} value={post?.email} />
            : null}
        </div>
        <div className="userProfileDetail">
          {cardId === undefined || cardId != post?._id ? (
            <VerifyProfileImages
              img={post?.images}
              unVerifiedImages={post?.un_verified_images}
              imageVerified={post?.image_verified}
            />
          ) : (
            ""
          )}
          {isActive === false ||
            (cardId === post?._id && (
              <VerifyProfileImages
                img={post?.images}
                unVerifiedImages={post?.un_verified_images}
                imageVerified={post?.image_verified}
              />
            ))}
          {isActive ||
            (cardId === post?._id && (
              <Card.Body>
                <Card.Text className="y-scroll">
                  {!post?.tag_desc_verified &&
                    post?.un_verified_description?.length
                    ? post?.un_verified_description
                    : post?.description}
                </Card.Text>
                <Card.Title className="y-scroll">
                  {!post?.tag_desc_verified &&
                    post?.un_verified_tagline?.length
                    ? post?.un_verified_tagline
                    : post?.tagline}
                </Card.Title>
              </Card.Body>
            ))}
          <Card.Title> {post?.user_name} </Card.Title>
          <div className="userInfoLink">
            <Card.Link
              onClick={() => {
                setIsActive(true);
                setCardId(post?._id);
              }}
            >
              picture
            </Card.Link>
            <Card.Link
              onClick={() => {
                setIsActive(false);
                setCardId(post?._id);
              }}
            >
              Info
            </Card.Link>
          </div>
          <div>
            {status !== 6 &&
              (status === 10 ? (
                <>
                  <Button
                    className="requestBtn"
                    onClick={() => {
                      setEmailSelected([post?.email]);
                      setShow(true);
                    }}
                  >
                    Request
                  </Button>
                  <Button className={"verifyBtn"} onClick={() => verifyUpdatedDetails(post?.email)}>
                    Verify
                  </Button>
                </>
              ) :
                post?.status === 2 ? (
                  <Button className={"verifyBtn verified-user-card"} disabled>
                    verified
                  </Button>
                ) : (
                  <>
                    <Button
                      className="requestBtn"
                      onClick={() => {
                        setEmailSelected([post?.email]);
                        setShow(true);
                      }}
                    >
                      Request
                    </Button>
                    <Button
                      className={"verifyBtn"}
                      onClick={() => {
                        dispatch(postUpdateUserStatus(2, post.email, "user-list", status));
                        dispatch(getDefaultMsgList("userRequestType"));
                      }}
                    >
                      Verify
                    </Button>
                  </>
                ))}
          </div>
        </div>
        <Card.Footer className="d-block">
          <div className="justify-space-between">Email <span>{post?.email}</span></div>
          {status === 6 && <div className="justify-space-between mt-3">Requested date <span>{moment(post?.requested_date).format("DD/MM/YYYY")}</span></div>}

        </Card.Footer>
      </Card>
    );
  });

  return (
    <>
      <Tab.Container defaultActiveKey="link-2">
        <Nav variant="tabs">
          <NavItemSet
            eventKey="link-2"
            status={5}
            badge={usersAdminStatus?.new_users}
            setStatus={setStatus}
            title="New Users Pending Verification"
            setPage={setPage}
            payload={{ tab: 2, search: "", per_page: 10, userlist: [] }}
            getFunc={getUserList}
          />
          <NavItemSet
            eventKey="link-4"
            status={1}
            badge={usersAdminStatus?.pending_users}
            setStatus={setStatus}
            title="All Users Pending Verification"
            setPage={setPage}
            payload={{ tab: 4, search: "", per_page: 10, userlist: [] }}
            getFunc={getUserList}

          />
          <NavItemSet
            eventKey="link-5"
            status={6}
            badge={usersAdminStatus?.requested_by_admin}
            setStatus={setStatus}
            title="Details(Requested by admin)"
            setPage={setPage}
            payload={{ tab: 4, search: "", per_page: 10, userlist: [] }}
            getFunc={getUserList}
            noAction={true}
          />
          <NavItemSet
            eventKey="link-6"
            status={10}
            badge={usersAdminStatus?.updated_details}
            setStatus={setStatus}
            title="Updated Details"
            setPage={setPage}
            payload={{ tab: 4, search: "", per_page: 10, userlist: [] }}
            getFunc={getUserList}
          />
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="link-2">
            <VerifyPhotoCards
              UserPostList={status === 5 ? UserPostList : []}
              status={status}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="link-4">
            <VerifyPhotoCards
              UserPostList={status === 1 ? UserPostList : []}
              status={status}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="link-5">
            <VerifyPhotoCards
              UserPostList={status === 6 ? UserPostList : []}
              status={status}
              noAction={true}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="link-6">
            <VerifyPhotoCards
              UserPostList={status === 10 ? UserPostList : []}
              status={status}
            />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      {emailSelected.length ? (
        <Toast show={showA} onClose={toggleShowA} className="requestPopup">
          <Toast.Body className="d-flex align-items-center w-100">
            {/* <Form.Check type="checkbox" label="people" /> */}
            <Button className="requestBtn" onClick={handleShow}>
              Request
            </Button>
            <Button
              className="verifyBtn"
              onClick={() => {
                dispatch(postUpdateUserStatus(3, postIdSelected, status));
              }}
            >
              Block
            </Button>
          </Toast.Body>
        </Toast>
      ) : null}
      <DefaultMsg
        defaultMsg={defaultMsg}
        show={show}
        setMsg={setMsgType}
        msgSubmit={msgSubmit}
        handleClose={handleClose}
      />
    </>
  );
}

export default PostList;
