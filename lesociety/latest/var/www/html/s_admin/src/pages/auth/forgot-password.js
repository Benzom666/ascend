import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "./action";
import { emailValidator } from "../../utility/utils";
import { useDispatch } from "react-redux";
const ResetPassword = (props) => {
  const dispatch = useDispatch();
  const [emailId, setEmail] = useState("");
  const [isUsernameValid, setUsernameValid] = useState("");
  const [emailSend, sendEmailSend] = useState(false);
  let navigate = useNavigate();
  const routeChange = () => {
    let path = `/`;
    navigate(path);
  };
  const validateFields = (event) => {
    if (event.target.name === "email") {
      setUsernameValid(emailValidator(emailId));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailId) {
      !emailId && setUsernameValid("Email is required");
      return;
    }
    if (!isUsernameValid)
      dispatch(forgotPassword({ email: emailId }, navigate, sendEmailSend));
  };
  
  return (
    <div className="LoginUI restPswdUI">
      <Form className="authUI" onSubmit={handleSubmit}>
        <h2>Password Recovery</h2>
        <Form.Group className="mb-4" controlId="formBasicEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="user@gmail.com"
            onBlur={validateFields}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
          />
          {isUsernameValid && <p>{isUsernameValid}</p>}
          {emailSend && (
            <Form.Text className="text-center mt-4 px-5">
              Please check your email and follow the link to recover your
              password.
            </Form.Text>
          )}
          {emailSend && (
            <div onClick={() => handleSubmit()}>Resend an email</div>
          )}
        </Form.Group>

        {!emailSend && (
          <Button
            variant="primary"
            type="submit"
            className="loginBtn"
            onClick={handleSubmit}
            disabled={isUsernameValid}
          >
            Next
          </Button>
        )}

        {emailSend && (
          <Button
            variant="primary"
            type="submit"
            className="loginBtn"
            onClick={routeChange}
          >
            BACK
          </Button>
        )}
      </Form>
    </div>
  );
};

export default ResetPassword;
