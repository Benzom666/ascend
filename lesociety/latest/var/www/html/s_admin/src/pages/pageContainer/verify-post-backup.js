import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import VerifyProfileImages from "./profileImage";
import { useDispatch, useSelector } from "react-redux";
import { Nav, Tab, Badge, Form, Card, Button } from "react-bootstrap";
import Utils from "../../utility/index.js";
import {
  getUserList,
  postVerfiyUser,
} from "./action.js";

export default function DataTablePagination(props) {
  const { data } = props;
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 4;
  const dispatch = useDispatch();
  const { usersAdminStatus } = useSelector(
    (state) => state.userListReducer
  );
  const [isActive, setIsActive] = useState(false);
  const [cardId, setCardId] = useState();
  const [show, setShow] = useState();
  const handlePic = () => {
    setIsActive(false);
  };
  const handleShow = () => setShow(true);
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(data.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(data.length / itemsPerPage));
  }, [itemOffset, itemsPerPage]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % data.length;
    setItemOffset(newOffset);
  };

  return (
    <>
      <Tab.Container defaultActiveKey="link-1">
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link tabIndex={-1}
              eventKey="link-1"
              onClick={() => {
                dispatch({
                  type: Utils.ActionName.USER_LIST,
                  payload: { tab: 2, search: "", per_page: 10, userlist: [] },
                });
                dispatch(getUserList());
              }}
            >
              Total Users
              <Badge pill bg="secondary">
                {usersAdminStatus?.total_users}
              </Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link tabIndex={-1}
              eventKey="link-2"
              onClick={() => {
                dispatch({
                  type: Utils.ActionName.USER_LIST,
                  payload: { tab: 2, search: "", per_page: 10, userlist: [] },
                });
                dispatch(getUserList(5));
              }}
            >
              New Users
              <Badge pill bg="secondary">
                {usersAdminStatus?.new_photos}
              </Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link tabIndex={-1}
              eventKey="link-2"
              onClick={() => {
                dispatch({
                  type: Utils.ActionName.USER_LIST,
                  payload: { tab: 2, search: "", per_page: 10, userlist: [] },
                });
                dispatch(getUserList(2));
              }}
            >
              Verified Users
              <Badge pill bg="secondary">
                {usersAdminStatus?.verified_users}
              </Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link tabIndex={-1}
              eventKey="link-3"
              onClick={() => {
                dispatch({
                  type: Utils.ActionName.USER_LIST,
                  payload: { tab: 2, search: "", per_page: 10, userlist: [] },
                });
                dispatch(getUserList(1));
              }}
            >
              Pending Verification
              <Badge pill bg="secondary">
                {usersAdminStatus?.pending_users}
              </Badge>
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="link-1">
            {currentItems.map((post) => {
              return(
                <Card
                className={"text-white verifyPhotoCard"}
                key={post.id}
              >
                <div className="cardActionBox">
                  <Form.Check className="checkboxUI" type="checkbox" />
                </div>
                <div className="userProfileDetail">
                  {cardId === undefined || cardId != post?._id ? (
                    <VerifyProfileImages img={post?.images} />
                  ) : (
                    ""
                  )}
                  {isActive === false ||
                    (cardId === post?._id && (
                      <VerifyProfileImages img={post?.images} />
                    ))}
                  {isActive === true ||
                    (cardId === post?._id && (
                      <Card.Body>
                        <Card.Text>{post?.description}</Card.Text>
                        <Card.Title>{post?.tagline}</Card.Title>
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
                    <Button className="requestBtn" onClick={handleShow}>
                      Request
                    </Button>
                    {post?.status == 2 ? (
                      <Button className={"verifyBtn verified-user-card"} disabled>
                        verify
                      </Button>
                    ) : (
                      <Button
                        className={"verifyBtn"}
                        onClick={() => {
                          dispatch(postVerfiyUser(post.email));
                        }}
                      >
                        verify
                      </Button>
                    )}
                  </div>
                </div>
                <Card.Footer>
                  Email <span>{post?.email}</span>
                </Card.Footer>
              </Card>
              )
            })
            }
          </Tab.Pane>
          <Tab.Pane eventKey="link-2">
          {  currentItems.map((post) => (
            <Card
              className={"text-white verifyPhotoCard"}
              key={post.id}
            >
              <div className="cardActionBox">
                <Form.Check className="checkboxUI" type="checkbox" />
              </div>
              <div className="userProfileDetail">
                {cardId === undefined || cardId != post?._id ? (
                  <VerifyProfileImages img={post?.images} />
                ) : (
                  ""
                )}
                {isActive === false ||
                  (cardId === post?._id && (
                    <VerifyProfileImages img={post?.images} />
                  ))}
                {isActive === true ||
                  (cardId === post?._id && (
                    <Card.Body>
                      <Card.Text>{post?.description}</Card.Text>
                      <Card.Title>{post?.tagline}</Card.Title>
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
                  <Button className="requestBtn" onClick={handleShow}>
                    Request
                  </Button>
                  {post?.status == 2 ? (
                    <Button className={"verifyBtn verified-user-card"} disabled>
                      Verify
                    </Button>
                  ) : (
                    <Button
                      className={"verifyBtn"}
                      onClick={() => {
                        dispatch(postVerfiyUser(post.email));
                      }}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
              <Card.Footer>
                Email <span>{post?.email}</span>
              </Card.Footer>
            </Card>
            ))
            }
          </Tab.Pane>
          <Tab.Pane eventKey="link-3">
            {currentItems.map((post) => (
              <Card
                className={"text-white verifyPhotoCard"}
                key={post.id}
              >
                <div className="cardActionBox">
                  <Form.Check className="checkboxUI" type="checkbox" />
                </div>
                <div className="userProfileDetail">
                  {cardId === undefined || cardId != post?._id ? (
                    <VerifyProfileImages img={post?.images} />
                  ) : (
                    ""
                  )}
                  {isActive === false ||
                    (cardId === post?._id && (
                      <VerifyProfileImages img={post?.images} />
                    ))}
                  {isActive === true ||
                    (cardId === post?._id && (
                      <Card.Body>
                        <Card.Text>{post?.description}</Card.Text>
                        <Card.Title>{post?.tagline}</Card.Title>
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
                    <Button className="requestBtn" onClick={handleShow}>
                      Request
                    </Button>
                    {post?.status == 2 ? (
                      <Button
                        className={"verifyBtn verified-user-card"}
                        disabled
                      >
                        Verify
                      </Button>
                    ) : (
                      <Button
                        className={"verifyBtn"}
                        onClick={() => {
                          dispatch(postVerfiyUser(post.email));
                        }}
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
                <Card.Footer>
                  Email <span>{post?.email}</span>
                </Card.Footer>
              </Card>
            ))}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      <ReactPaginate
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="< previous"
        renderOnZeroPageCount={null}
      />
    </>
  );
}


