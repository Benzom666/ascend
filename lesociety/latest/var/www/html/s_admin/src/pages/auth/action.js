import axios from "axios";
import Utils from "../../utility";
export const onSubmit = (values, navigate) => {
  return async (dispatch) => {
    const { email, password } = values;
    const dataToSend = {
      email,
      password,
    };
    Utils.api.postApiCall(
      Utils.endPoints.login,
      dataToSend,
      async (respData) => {
        const token = respData?.data?.data?.data?.token;
        try {
          const profileResponse = await axios.get(
            `${Utils.constants.API_URL}/user/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const role = Number(profileResponse?.data?.data?.user?.role || 0);

          if (role !== 2) {
            Utils.showAlert(2, "Admin access required.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("adminRole");
            return;
          }

          dispatch({
            type: "GET_TOKEN",
            payload: { token },
          });
          localStorage.setItem("accessToken", token);
          localStorage.setItem("adminRole", String(role));
          setTimeout(() => {
            window.location = "/dashboard";
          }, 100);
        } catch (profileError) {
          Utils.showAlert(
            2,
            profileError?.response?.data?.message ||
              profileError?.message ||
              "Unable to verify admin access."
          );
          localStorage.removeItem("accessToken");
          localStorage.removeItem("adminRole");
        }
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
        // setSubmitting(true);
      }
    );
  };
};

export const forgotPassword = (values, navigate, sendEmailSend) => {
  return (dispatch) => {
    const { email, password } = values;
    const dataToSend = {
      email,
      password,
    };
    Utils.api.postApiCall(
      Utils.endPoints.forgotPassword,
      dataToSend,
      (respData) => {
        sendEmailSend(true);
        // navigate("/dashboard");
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
        // setSubmitting(true);
      }
    );
  };
};

export const resetPassword = (values, navigate, token) => {
  return (dispatch) => {
    const { password } = values;
    const dataToSend = {
      password,
    };
    Utils.api.postApiCall(
      Utils.endPoints.resetPassword + `?token=${token}`,
      dataToSend,
      (respData) => {
        // navigate("/dashboard");
      },
      (error) => {
        let { data } = error;

        Utils.showAlert(2, data?.message);
        // setSubmitting(true);
      }
    );
  };
};
