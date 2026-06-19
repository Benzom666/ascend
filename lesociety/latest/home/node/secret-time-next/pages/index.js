import Head from "next/head";
import { connect, useSelector } from "react-redux";
import Login from "modules/auth/forms/login";
import HomePage from "./home";
import React from "react";

const SITE_TITLE = "Ascend | Curated Online Dating Experiences";
const SITE_DESCRIPTION =
  "Ascend is an online dating platform designed for intentional connections, curated date experiences, and a safer way to meet.";

function Home({ dispatch }) {
  //   const user = useSelector((state) => state.authReducer.user);

  //   console.log('user', user)
  return (
    <React.Fragment>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <link rel="icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <HomePage />
    </React.Fragment>
  );
}

export default Home;
