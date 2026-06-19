import Head from "next/head";
import Link from "next/link";
import ForgotPassword from "modules/auth/forms/forgotpassword";
import { connect } from "react-redux";
import Header from "core/header";
import Footer from "core/footer";
import useWindowSize from "../../utils/useWindowSize";
import { FaAngleLeft } from "react-icons/fa";

function ForgotPasswordPage({ dispatch }) {
  const { width } = useWindowSize();

  return (
    <>
      <Header />
      <div className="inner-part-page auth-section">
        <div className="container">
          <div className="auth-section">
            <div className="d-block d-md-none login-text">
              <a href="/auth/login">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-chevron-left"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </a>
              <span>
                Login
                <img src="/images/line.png" alt="line" />
              </span>
            </div>
            <h2 className="forgot-password-text">Password Recovery</h2>
            <ForgotPassword />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ForgotPasswordPage;
