import React from 'react'
import {
  Form,
  Button,
  Modal,
  ListGroup,
} from "react-bootstrap";

export const DefaultMsg = (props) => {
  const { defaultMsg = [], setMsg, show, handleClose, msgSubmit } = props
  console.log(defaultMsg);
  let messageType = []
  if(defaultMsg[0] ) messageType = Object.keys(defaultMsg[0]);
  return (
    <Modal
      show={show}
      onHide={handleClose}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="requestModal"
    >
      <Modal.Header closeButton>
        <Modal.Title> Request Task</Modal.Title>
        <p> Select an Option </p>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          {messageType[0] ?  
           messageType.map((type, index) => {
            return (
              <ListGroup.Item key={index}>
                <Form.Check type="radio" id={index} name="requestmsg" value={type}
                  onChange={(e) => {
                    setMsg(e.target.value);
                  }} label={defaultMsg[0]?.[type]} />
              </ListGroup.Item>
            )
          })
        : ""}
        </ListGroup>
        <Button className="verifyBtn" onClick={() => msgSubmit()} type="button">Submit</Button>
      </Modal.Body>
    </Modal>
  )
}
