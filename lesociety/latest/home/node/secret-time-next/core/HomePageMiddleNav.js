import React, { useState } from "react";
import useWindowSize from "utils/useWindowSize";
import { IoIosClose } from "react-icons/io";
import { storeUserGender } from "@/modules/auth/authActions";
import { useDispatch } from "react-redux";

function HomePageMiddleNav(props) {
  //console.log(props)
  const [openNav, setOpenNav] = useState(false);
  const [animate, setAnimate] = useState(false);
  const { width } = useWindowSize();

  const dispatch = useDispatch();

  const openNavBar = () => {
    setOpenNav(true);
    setAnimate(!animate);
  };
  const closeNavBar = () => {
    setOpenNav(false);
    setAnimate(!animate);
  };

  const backgroundHeightChange = width < 769 && openNav;
  return (
    <>
      <nav
        className="navbar fixed-bottom bg-none mt-4 navbarfixedmain"
        style={props.style}
      >
        <div
          className={
            backgroundHeightChange
              ? "home-background-navbar-open"
              : "home-background-navbar"
          }
        ></div>
        <div
          className={`container-fluid d-flex justify-content-end containernavbarfooter ${
            animate ? "animate-1" : ""
          }`}
        >
          <div className="navbarfooter-text">
            {width > 769 && (
              <div className="navfooter-text-1">
                <span style={props.styleText}>
                  Highly Secure & Exclusive.{" "}
                  <span
                    style={{
                      color: " #f24462",
                      fontSize: "16px",
                      fontWeight: 400,
                    }}
                  >
                    Already A Member?{" "}
                    <a
                      href="/auth/login"
                      style={{
                        textDecoration: "none",
                        color: " #f24462",
                      }}
                      className="already__login__member"
                    >
                      Login
                    </a>
                  </span>
                </span>
              </div>
            )}
            {width < 769 && (
              <div className="navfooter-text-1">
                <span
                  style={{
                    fontSize: "16px",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  Highly Secure & Exclusive.
                  <br />
                  <p
                    style={{
                      color: " #f24462",
                      paddingTop: "5px",
                      padding: "2px 5px 0px 5px",
                      fontSize: "15px",
                      fontWeight: 400,
                    }}
                  >
                    Already A Member?{" "}
                    <a
                      href="/auth/login"
                      style={{
                        textDecoration: "none",
                        color: " #f24462",
                      }}
                      className="already__login__member"
                    >
                      Login
                    </a>
                  </p>
                </span>
              </div>
            )}
            {width < 769 && (
              <div>
                {!openNav ? (
                  <button
                    id="signupbtn"
                    type="button"
                    className="signup-button"
                    onClick={openNavBar}
                  >
                    Sign Up
                  </button>
                ) : null}
              </div>
            )}
            {openNav && (
              <div className="closefooterbtn">
                {width < 769 && (
                  <IoIosClose
                    className="mouse-point"
                    size={55}
                    style={{
                      color: "#fff",
                    }}
                    onClick={closeNavBar}
                  />
                )}
              </div>
            )}
          </div>
          <div className="navbarfooter-btn">
            {openNav ? (
              <div id="sidebarhome" className="sidebarhome">
                <a href="/auth/registration" style={{ textDecoration: "none" }}>
                  <button
                    type="button"
                    className="signUpLadybtn"
                    onClick={() => dispatch(storeUserGender("female"))}
                  >
                    Sign Up as Lady
                  </button>
                </a>
                <a href="/auth/registration" style={{ textDecoration: "none" }}>
                  <button
                    type="button"
                    className="signUpLadybtn"
                    onClick={() => dispatch(storeUserGender("male"))}
                  >
                    Sign Up as Gentlemen
                  </button>
                </a>
                {width > 769 && (
                  <IoIosClose
                    className="mouse-point"
                    size={42}
                    style={{ color: "#fff" }}
                    onClick={closeNavBar}
                  />
                )}
              </div>
            ) : null}
            {width > 769 && (
              <div>
                {!openNav ? (
                  <>
                    <button
                      id="signupbtn"
                      type="button"
                      className="signup-button"
                      onClick={openNavBar}
                    >
                      Sign Up
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default HomePageMiddleNav;
