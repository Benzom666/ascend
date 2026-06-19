import Head from "next/head";
import { connect } from "react-redux";
import Profile from "modules/auth/forms/profile";
import Header from "core/header";
import Footer from "core/footer";
import LoggedInHeader from "core/loggedInHeader";
import Link from "next/link";
import useWindowSize from "../../utils/useWindowSize";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import router, { useRouter } from "next/router";
import { useState } from "react";

function RegisterPage({ dispatch }) {
  const user = useSelector((state) => state.authReducer.user);
  const { width } = useWindowSize();
  const router = useRouter();
  const [page, setPage] = useState(0);

  return (
    <div className="inner-page">
      <Header page={page} setPage={setPage} />
      {/* {_.isEmpty(user) ? <Header /> : <LoggedInHeader/>} */}
      <Profile page={page} setPage={setPage} />
      <Footer />
    </div>
  );
}

export default RegisterPage;
