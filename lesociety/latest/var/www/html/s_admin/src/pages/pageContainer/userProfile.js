
import React, { useEffect, useState } from 'react';
import SideBar from "../sideBar/sidebar.js";
import { Card, Dropdown, Button, Row, Col, ListGroup } from "react-bootstrap";
import PageHeader from '../pageContainer/header'
import ProfileImages from './profileImage'
import { useDispatch, useSelector } from "react-redux";
import { TbDots } from "react-icons/tb";
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, getDefaultMsgList, postUpdateUserStatus, postSendDefaulMsg, postVerfiyUser } from './action.js';
import { DefaultMsg } from "./DefaultMsg";
import moment from 'moment';
import _ from 'lodash';

const PageContainer = props => {
  const dispatch = useDispatch();
  const { username } = useParams();
  const { userProfileData, defaultMsg, pushToUserPage } = useSelector(
    (state) => state.userListReducer
  );
  const { email, un_verified_images, un_verified_tagline, un_verified_description,
    user_name, images, tagline, description, image_verified, status, email_verified, request_change_fired
  } = userProfileData;
  const [show, setShow] = useState(false);
  const [msgType, setMsgType] = useState("");
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  useEffect(() => {
    dispatch(
      getUserProfile(username)
    )
    dispatch(getDefaultMsgList("userRequestType"))
  }, [])
  const msgSubmit = () => {
    dispatch(
      postSendDefaulMsg(msgType, 0, [email], "", username, "user-profile")
    );
    setShow(false);
  }
  let isFullyVerified = true;
  if(!_.isEmpty(userProfileData)) {
    isFullyVerified = !un_verified_images.length
    && !un_verified_tagline?.length
    && !un_verified_description?.length 
  }
  const verifyHandler = () => {
    dispatch(postUpdateUserStatus(2, email, 'user-profile', username));
    
  }
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return navigate("/");
  }
  if(pushToUserPage) return navigate("/userList");
  return (
    <div className='dashboardUi'>
      <SideBar />
      <div className="inner-page userProfile-page">
        <PageHeader title="Users profile" />
        <div className='userProfileDetail'>
          <ProfileImages 
            img={!!userProfileData && images} 
            imageVerified={image_verified}
            unVerifiedImages={un_verified_images}
          />
          <Card body className="userProfileName">
            <Card.Title>{user_name}</Card.Title>
            <Card.Subtitle className="mb-2 ">{!un_verified_tagline?.length ? 
            tagline : un_verified_tagline}</Card.Subtitle>
          </Card>
          {email_verified ? <div className='userProfilebtn'>
            {request_change_fired ? "" :
              status === 2 && isFullyVerified ?
                <button type="button" disabled class="verifyBtn verified-user-card btn btn-primary">verified</button> 
                : status === 3 ? <button type="button" disabled class="verifyBtn btn btn-primary">Blocked</button>
                :

                <>
                  <Button className="requestBtn" onClick={handleShow}>Request</Button>
                  <Button className="verifyBtn btn-success"
                    onClick={verifyHandler}
                  >Verify</Button>
                  <Button className="verifyBtn"
                    onClick={() => {
                      dispatch(postUpdateUserStatus(3, email, 'user-profile', username));
                    }}
                  >Block</Button>
                  {/* <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                      <TbDots />
                    </Dropdown.Toggle>
                    <Dropdown.Menu variant="dark">
                      <Dropdown.Item role="button" onClick={() => {
                        dispatch(postUpdateUserStatus(2, email))
                      }}>Verify</Dropdown.Item>
                      <Dropdown.Item role="button" onClick={handleShow}>Request a Change</Dropdown.Item>
                      <Dropdown.Item role="button" onClick={() => {
                        dispatch(postUpdateUserStatus(3, email))
                      }}>Block</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown> */}
                </>
            }
          </div> : ''}
        </div>
        <Row className='user-more-about'>
          <Col md="9" sm="8" className='pl-0' >
            <Card body className="profileCardBox">
              <Card.Title> More about {user_name}</Card.Title>
              <Card.Text>
                {un_verified_description?.length ?  un_verified_description : description}
              </Card.Text>
            </Card>

            <div className="profileCardBox">
              <ListGroup horizontal className='userPersonalDetail'>
                <ListGroup.Item>
                  <h6>{userProfileData?.body_type}</h6>
                  <p> Body Type </p>
                </ListGroup.Item>

                <ListGroup.Item>
                  <h6>{userProfileData?.max_education}</h6>
                  <p> Education Completed</p>
                </ListGroup.Item>

                <ListGroup.Item>
                  <h6> {userProfileData?.height} </h6>
                  <p> Height </p>
                </ListGroup.Item>

                <ListGroup.Item>
                  <h6> {userProfileData?.ethnicity} </h6>
                  <p> Ethnicity </p>
                </ListGroup.Item>

                <ListGroup.Item>
                  <h6> {userProfileData?.occupation} </h6>
                  <p> Occupation </p>
                </ListGroup.Item>

                <ListGroup.Item>
                  <h6> {userProfileData?.is_smoker} </h6>
                  <p> Smoker </p>
                </ListGroup.Item>

              </ListGroup>
            </div>
          </Col>
          <Col md="3" sm="4" className='pr-0'>
            <div className="profileCardBox py-0">
              <ListGroup variant="flush" className='userOfficalDetails'>
                <ListGroup.Item>
                  <h6>
                    Age
                    <span> {userProfileData?.age} </span>
                  </h6>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h6>
                    Joined
                    <span> {moment(userProfileData?.created_at).format("DD.MM.YYYY")} </span>
                  </h6>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h6>
                    Location
                    <span> {userProfileData?.location} </span>
                  </h6>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h6>
                    Email
                    <a> {userProfileData?.email} </a>
                  </h6>
                </ListGroup.Item>
              </ListGroup>
            </div>
          </Col>
        </Row>
      </div>
      <DefaultMsg
        defaultMsg={defaultMsg}
        show={show}
        setMsg={setMsgType}
        msgSubmit={msgSubmit}
        handleClose={handleClose}
      />
    </div>
  )
}
export default PageContainer;