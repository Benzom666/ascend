import React, { useState } from "react";
import {
  Form,
  DropdownButton,
  Dropdown,
  Button,
  Toast,
  Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { Link } from "react-router-dom";

import {
  getUserList,
  getUserProfile,
  postSendDefaulMsg,
  postUpdateUserStatus,
  updateDocumentVerification
} from "../pageContainer/action";
import Utils from "../../utility";
import ProfileImage from "../../assets/images/profleIamge.svg";
import { DefaultMsg } from "../pageContainer/DefaultMsg";
import { SearchDropdownSet } from "../pageContainer/Component";

function UserTable({ lastPostElementRef, endUser, status, showVerifyButton }) {
  const dispatch = useDispatch();
  const {
    userlist,
    pagination,
    tab,
    search,
    per_page,
    defaultMsg,
    rowSelected,
    emails,
  } = useSelector((state) => state.userListReducer);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [msg, setMsg] = useState();

  const [showA, setShowA] = useState(true);
  const toggleShowA = () => setShowA(!showA);

  const searchHandler = _.debounce((e) => {
    let payload = { search: e.target.value, userlist: [] };
    dispatch({
      type: Utils.ActionName.USER_LIST,
      payload,
    });
    dispatch(getUserList(status));
  }, 1500);
  const msgSubmit = () => {
    dispatch(postSendDefaulMsg("taglineAndDesc", 0, rowSelected, "", status, "user"));
    setShow(false);
  };
  
  return (
    <div>
      <SearchDropdownSet
        per_page={per_page}
        dispatch={dispatch}
        searchHandler={searchHandler}
        status={status}
        getFunc={getUserList}
        payload={{ userlist: [] }}
      />
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            {/* <th>
              <input
                type="checkbox"
                onChange={(e) => allCheckboxHandler(e)}
                id="all-check"
              />
            </th> */}
            <th />
            <th>User Name</th>
            <th>Gender</th>
            <th>Email</th>
            <th>Selfie photo</th>
            <th>documents</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(userlist) && userlist.length
            ? userlist.map((user, index) => {
              const selfieArr = user?.selfie?.split("/");
              const docsArr = user?.document?.split("/");
                return (
                  <tr
                    key={user.id}
                    ref={
                      userlist.length === index + 1 ? lastPostElementRef : null
                    }
                  >
                    <td />
                    <td>
                      <div className="userNameImage" key={index}>
                        <Link
                          to={"/profile/" + user.user_name}
                          onClick={(e) => {
                            dispatch(getUserProfile(user.user_name));
                          }}
                        >
                          <img
                            src={user.images[0] || ProfileImage}
                            alt="RyanUser"
                            border="0"
                          />{" "}
                          <p> {user.user_name} </p>
                        </Link>
                      </div>
                    </td>
                    <td>{user?.gender}</td>
                    <td>{user?.email}</td>
                    <td>{user?.selfie ? <a style={{color: "white"}} href={user?.selfie} target="_blank">view image</a> : '--'}</td>
                    <td>{user?.document ? <a style={{color: "white"}} href={user?.document} target="_blank">view document</a> : '--' }</td>
                    <td>
                      {!user?.documents_verified ? (
                        <DropdownButton
                          variant="outline-secondary"
                          title={
                            <img
                              src="https://i.ibb.co/jwq9z0R/moreIcon.png"
                              alt="moreIcon"
                              border="0"
                            />
                          }
                          id="input-group-dropdown-2"
                          align="end"
                        >
                          <Dropdown.Item
                            eventKey="1"
                            onClick={() => {
                              dispatch(updateDocumentVerification( user.email, status, userlist.length));
                            }}
                          >
                            Verify
                          </Dropdown.Item>
                        </DropdownButton>
                      ) : showVerifyButton && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            dispatch(postUpdateUserStatus(2, [user.email], "user-list", status));
                          }}
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </Table>
      {!!rowSelected && rowSelected.length > 0 ? (
        <Toast show={showA} onClose={toggleShowA} className="requestPopup">
          <Toast.Header></Toast.Header>
          <Toast.Body className="d-flex align-items-center w-100">
            <Form.Check type="checkbox" label="people" checked />
            <Button className="requestBtn" onClick={handleShow}>
              Request
            </Button>
            <Button
              className="verifyBtn"
              onClick={() =>
                dispatch(postUpdateUserStatus(2, !!rowSelected && rowSelected,"user-list" ,status))
              }
            >
              Verify
            </Button>
          </Toast.Body>
        </Toast>
      ) : null}
      <DefaultMsg
        defaultMsg={defaultMsg}
        show={show}
        msg={msg}
        setMsg={setMsg}
        msgSubmit={msgSubmit}
        handleClose={handleClose}
      />
    </div>
  );
}

export default UserTable;
