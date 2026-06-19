import React, { useState } from "react";
import { Field, reduxForm, updateSyncErrors } from "redux-form";
import { useSelector, useDispatch } from "react-redux";
import { Inputs } from "core";
import Link from "next/link";
import * as Yup from "yup";
import { toast } from "react-toastify";
import useWindowSize from "../../../utils/useWindowSize";
import { apiRequest } from "../../../utils/Utilities";
import validate from "./validate/validate";
import { useRouter } from "next/router";

const SimpleForm = (props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submitHandler = async (values) => {
    setLoading(true);
    try {
      const res = await apiRequest({
        data: values,
        method: "POST",
        url: `user/reset-password?token=${router.query.token}`,
      });
      if (!res.error) {
        router.push("/auth/login");
      }
    } catch (error) {
      dispatch(
        updateSyncErrors("resetpassword", {
          password: error.response?.data?.message,
        })
      );
    }
    setLoading(false);
  };

  const { handleSubmit, invalid, pristine, reset, submitting } = props;

  return (
    <form
      className="forgot-password"
      autoComplete="off"
      onSubmit={handleSubmit(submitHandler)}
    >
      <>
        <Field
          name="password"
          type="text"
          component={Inputs.inputField}
          label="New Password"
          placeholder="Enter New Password"
          normalize={(value) => value.replace(/\s+/g, "")}
        />
        <div className="bottom-mobile">
          <Field
            component={Inputs.buttonField}
            type="submit"
            name="login"
            disabled={invalid}
            label="Next"
            loading={loading}
          />
        </div>
      </>
    </form>
  );
};

export default reduxForm({
  form: "resetpassword",
  validate,
})(SimpleForm);
