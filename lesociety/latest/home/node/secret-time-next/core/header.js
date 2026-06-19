import React, { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { deAuthenticateAction, logout } from "../modules/auth/authActions";
import { useRouter } from "next/router";
import _ from "lodash";
import { initialize, reset } from "redux-form";
const Logo_Web = "/assets/img/Logo_Web.png";
import { useEffect } from "react";

export default function Header({ page, setPage, ...props }) {
  const user = useSelector((state) => state.authReducer.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!router?.query?.token && _.isEmpty(user) && page == 0) {
      console.log("I am working");
      setTimeout(() => {
        logout(router, dispatch);
      }, 200);
    }
  }, [page, user]);

  return (
    <header className="py-4">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4">
            <div className="logo" style={{ cursor: "pointer" }}>
              {router?.query?.edit ? (
                <img
                  src={Logo_Web}
                  width="232"
                  alt="Logo"
                  className="d-none d-md-block cursor-pointer"
                />
              ) : (
                <Link href="/">
                  {/* <img src="/images/logo.svg" width="159" alt="Logo" /> */}
                  <img
                    src={Logo_Web}
                    width="232"
                    alt="Logo"
                    className="d-none d-md-block cursor-pointer"
                  />
                </Link>
              )}
            </div>
          </div>
          <div className="col-md-8 ">
            <nav>
              <ul className="d-flex justify-content-end mb-0">
                {!_.isEmpty(user) ? (
                  <li>
                    <Link href="#">
                      <a
                        onClick={() => {
                          logout(router, dispatch);
                        }}
                      >
                        Sign Out
                      </a>
                    </Link>
                  </li>
                ) : (
                  <>
                    {/* {!props.isSingUp ? (
                      <li>
                        <Link href="/auth/registration">Sign Up</Link>
                      </li>
                    ) : null}
                    <li>
                      <Link href="/auth/login">Sign In</Link>
                    </li> */}
                  </>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
