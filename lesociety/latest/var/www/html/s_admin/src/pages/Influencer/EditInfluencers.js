import React, { useState, useEffect } from 'react'
import {
    Form,
    InputGroup,
    DropdownButton,
    Dropdown,
    Button,
    Modal,
    Row,
    Col,
  } from "react-bootstrap";
  import { useDispatch, useSelector } from "react-redux";
import { getInfluencer, influencerUpdate } from '../pageContainer/action';
const EditInfluencers = (props) => {
    const dispatch = useDispatch();
    const {name, email, promo, code, source} = props
    const [userName, setUserName] = useState(name);
    const [userEmail, setUserEmail] = useState(email);
    const [userPromo, setUserPromo] = useState(promo);
    const [userCode, setUserCode] = useState(code);
    const [userSource, setUserSource] = useState(source);

    const [showPop, setShowPop] = useState(false);
    const handleShow = () => setShowPop(true);
    const popupClosed = async() => {
      await dispatch(influencerUpdate(userName,userEmail,userPromo,userCode,userSource))
      setShowPop(false)
      dispatch(getInfluencer())
    };
  return (
    <><Dropdown.Item eventKey="req" onClick={handleShow}>
        Edit </Dropdown.Item>
              <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={showPop}
                onHide={popupClosed}
                className="requestModal influencerModal"
              >
                <Modal.Header closeButton>
                  <Modal.Title> Edit Influencer </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {/* <Form> */}
                  <Form.Group className="mb-3" controlId="formGridAddress1">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={userEmail}
                      onChange={
                        (e) => {
                        setUserEmail(e.target.value)
                        }
                      }
                      placeholder="Enter Email"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formGridAddress1">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter Name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formGridAddress2">
                    <Form.Label>Source</Form.Label>
                    <select
                      class="form-control"
                      value={userSource}
                      onChange={(e) => setUserSource(e.target.value)}
                    >
                      <option>{userSource}</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">Tik tok</option>
                    </select>
                  </Form.Group>

                  <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridEmail">
                      <Form.Label>Code</Form.Label>
                      <Form.Control
                        type="text"
                        value={userCode}
                        onChange={(e) => {
                          setUserCode(e.target.value)
                          }}
                        placeholder="Enter Code"
                      />
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridPassword">
                      <Form.Label>Promo %</Form.Label>
                      <Form.Control
                        type="text"
                        value={userPromo}
                        onChange={(e) => setUserPromo(e.target.value)}
                        placeholder="Enter Promo %"
                      />
                    </Form.Group>
                  </Row>

                  <Button
                    variant="primary"
                    type="submit"
                    className="InfluencerSubmitBtn"
                    onClick={popupClosed}
                  >
                    Submit
                  </Button>
                  {/* </Form> */}
                </Modal.Body>
              </Modal>
    </>
  )
}
export default EditInfluencers;