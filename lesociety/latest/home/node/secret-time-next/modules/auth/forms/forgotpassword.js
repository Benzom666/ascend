import React, { useState } from 'react';
import { Field, reduxForm, updateSyncErrors } from 'redux-form';
import { useSelector, useDispatch } from "react-redux";
import { Inputs } from 'core';
import Link from 'next/link'
import * as Yup from "yup";
import { toast } from 'react-toastify';
import useWindowSize from "../../../utils/useWindowSize";
import { apiRequest } from '../../../utils/Utilities'
import validate from './validate/validate'

const SimpleForm = props => {

  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const [showText, setShowText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    email: "",
  });

  const toggle = () => setShowText(!showText);

  const submitHandler = async (values) => {
    setLoading(true);
    try {
      const res = await apiRequest({
        data: values,
        method: 'POST',
        url: `user/forget-password`
      })
      if(!res.error) {
        setShowText(true);
      }
    } catch(error) {
      dispatch(updateSyncErrors('forgotpassword', {email: error.response?.data?.message}))
    }
    setLoading(false);
  }

  const handleClickBack = () => {
    setShowText(!showText);
  };

  const { handleSubmit, invalid, pristine, reset, submitting } = props

  return (
    <form className="forgot-password" autoComplete="off" onSubmit={handleSubmit(submitHandler)}>
      <>
        <Field
          name="email"
          type="text"
          component={Inputs.inputField}
          label="Email"
          placeholder="Enter your email"
        />
        {showText &&
          <p className="check-mail-text text-center">
            Please check your email and follow the link to recover your password.
          </p>
        }
        {showText &&
          <span onClick={handleSubmit(submitHandler)} className="resend-mail-text">
            Resend an email
          </span>
        }
        <div className="bottom-mobile">
          {!showText &&
            <Field
              component={Inputs.buttonField}
              type="submit"
              name="login"
              disabled={invalid}
              label="Next"
              loading={loading}
            />
          }
          {showText &&
            <div className="secret-input type-submit">
              <a className="next" onClick={handleClickBack}>Back</a>
            </div>
          }
        </div>

      </>
    </form>
  );
};

export default reduxForm({
  form: 'forgotpassword',
  validate
})(SimpleForm);
