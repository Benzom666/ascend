import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { emailValidator, passwordValidator } from "../../utility/utils";
import { useDispatch } from "react-redux";
import { onSubmit } from "./action";

const LoginPage = (props) => {
  const dispatch = useDispatch();
  let navigate = useNavigate();

  const [emailId, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordValid, setPasswordValid] = useState("");
  const [isUsernameValid, setUsernameValid] = useState("");
  const routeChange = () => {
    let path = `/forgot-password`;
    navigate(path);
  };

  const validateFields = (event) => {
    if (event.target.name === "email") {
      setUsernameValid(emailValidator(emailId));
    }

    if (event.target.name === "password") {
      setPasswordValid(passwordValidator(password));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || !emailId) {
      !emailId && setUsernameValid("Email is requir");
      !password && setPasswordValid("password is requir");
      return;
    }
    dispatch(onSubmit({ email: emailId, password }, navigate));
  };
  return (
    <div className="LoginUI">
      <Form
        className="authUI"
        onSubmit={(e) => handleSubmit(e)}
        autoComplete="off"
      >
        <h2>Let's sign you in.</h2>
        <Form.Group className="mb-4" controlId="formBasicEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            onBlur={validateFields}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
          />
          {isUsernameValid && <p>{isUsernameValid}</p>}
        </Form.Group>

        <Form.Group className="mb-4" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validateFields}
          />
          {isPasswordValid && <p>{isPasswordValid}</p>}
          <Form.Text className="text-muted">
            <a onClick={routeChange}> Forgot Password ? </a>
          </Form.Text>
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          className="loginBtn"
          disabled={
            (!emailId && !password) || (isPasswordValid && isUsernameValid)
          }
        >
          LOG IN
        </Button>
      </Form>
    </div>
  );
};

export default LoginPage;
