import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "./action";
import { passwordValidator } from "../../utility/utils";
import { useDispatch } from "react-redux";
const ResetPassword = (props) => {
  const dispatch = useDispatch();

  const [isPasswordValid, setPasswordValid] = useState("");
  const [password, setPassword] = useState("");

  let navigate = useNavigate();
  const routeChange = () => {
    let path = `/`;
    navigate(path);
  };
  const validateFields = (event) => {
    if (event.target.name === "password") {
      setPasswordValid(passwordValidator(password));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      !password && setPasswordValid("Password is required");
      return;
    }
    if (!isPasswordValid)
      dispatch(
        resetPassword(
          { password },
          navigate,
          "94f562a16e6f38f77cd77c236d7874c1b3f7c43f"
        )
      );
  };

  return (
    <div className="LoginUI restPswdUI">
      <Form className="authUI" onSubmit={handleSubmit}>
        <h2>Password Recovery</h2>
        <Form.Group className="mb-4" controlId="formBasicEmail">
          <Form.Label>New password</Form.Label>
          <Form.Control
            type="password"
            placeholder="password"
            onBlur={validateFields}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
          />
          {isPasswordValid && <p>{isPasswordValid}</p>}
          {/* <Form.Text className="text-center mt-4 px-5">
            Please check your email and follow the link to recover your
            password.
          </Form.Text> */}
        </Form.Group>
        <Button
          variant="primary"
          // type="bu"
          className="loginBtn"
          onClick={handleSubmit}
          disabled={isPasswordValid}
        >
          Next
        </Button>
      </Form>
    </div>
  );
};

export default ResetPassword;
