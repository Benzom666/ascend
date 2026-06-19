import React from "react";
import App, { Container } from "next/app";
import Head from "next/head";
import { Provider } from "react-redux";
import withRedux from "next-redux-wrapper";
import withReduxSaga from "next-redux-saga";
import createStore from "engine";
import "bootstrap/dist/css/bootstrap.css";
import "react-rangeslider/lib/index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";

import Router from "next/router";
import Loader from "@/modules/Loader/Loader";
import io from "socket.io-client";

import "styles/style.scss";
import "styles/main.scss";
import "styles/membership.scss";
import "styles/sidebar-tokens.css";
import "styles/messages.css";
import "styles/create-date-flow.css";
import "modules/date/create-date.broken/styles/mobile.css";
import "modules/date/create-date.broken/styles/desktop.css";
import { removeCookie } from "utils/cookie";
import { apiRequest, socketURL } from "utils/Utilities";
import { getActiveDateCount } from "utils/dateState";
import { AUTHENTICATE_UPDATE } from "@/modules/auth/actionConstants";

const SITE_TITLE = "Ascend | Curated Online Dating Experiences";
const SITE_DESCRIPTION =
  "Ascend is an online dating platform designed for intentional connections, curated date experiences, and a safer way to meet.";
const SITE_URL = "https://lesociety.com";

const CREATE_DATE_ROUTES = [
  "/create-date/choose-city",
  "/create-date/choose-date-type",
  "/create-date/date-event",
  "/create-date/duration",
  "/create-date/description",
  "/create-date/review",
  "/create-date/success",
];

// Lazy socket initialization with reconnection for better reliability
// Socket will connect when first needed and auto-reconnect if disconnected
export let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(socketURL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
};

const CreateDateCountSync = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer.user);
  const syncedUserRef = React.useRef("");

  React.useEffect(() => {
    let cancelled = false;

    const syncCount = async () => {
      if (!user?.user_name || !user?.token) return;
      if (
        syncedUserRef.current === user.user_name &&
        typeof user?.active_dates_count === "number"
      ) {
        return;
      }

      try {
        const res = await apiRequest({
          method: "GET",
          url: "date",
          token: user?.token,
          params: {
            user_name: user?.user_name,
            current_page: 1,
            per_page: 10000,
          },
          timeout: 10000,
        });

        if (cancelled) return;

        const dates = res?.data?.data?.dates || [];
        const activeDatesCount = getActiveDateCount(dates);
        syncedUserRef.current = user.user_name;
        dispatch({
          type: AUTHENTICATE_UPDATE,
          payload: {
            active_dates_count: activeDatesCount,
          },
        });
      } catch (error) {
        if (!cancelled) {
          console.log("Failed to sync active date count", error);
          syncedUserRef.current = user.user_name;
          dispatch({
            type: AUTHENTICATE_UPDATE,
            payload: {
              active_dates_count: 0,
            },
          });
        }
      }
    };

    syncCount();

    return () => {
      cancelled = true;
    };
  }, [dispatch, user?.token, user?.user_name, user?.active_dates_count]);

  return null;
};

// export const socket = io(socketURL, {
//   autoConnect: true,
//   // reconnection: true,
//   // reconnectionDelay: 1000,
//   // reconnectionDelayMax: 5000,
//   // reconnectionAttempts: Infinity,
// });

class MyApp extends App {
  constructor(props) {
    super(props);
    const isHomepage = props.router?.asPath === "/";
    this.state = {
      isLoading: isHomepage,
      loadingStartedAt: isHomepage ? Date.now() : 0,
      history: [],
    };
  }

  prefetchCreateDateRoutes = () => {
    CREATE_DATE_ROUTES.forEach((route) => {
      Router.prefetch(route);
    });
  };

  syncCreateDateRouteClass = (path = this.props.router?.asPath || "") => {
    if (typeof document === "undefined") return;

    const isCreateDateRoute = path.startsWith("/create-date");
    document.documentElement.classList.toggle(
      "create-date-route-active",
      isCreateDateRoute
    );
    document.body.classList.toggle("create-date-route-active", isCreateDateRoute);
  };

  handleRouteChangeStart = (url) => {
    window.clearTimeout(this.loaderTimeout);
    window.clearTimeout(this.routeLoaderTimeout);
    const currentPath = this.props.router?.asPath || "";
    const isCreateDateTransition =
      currentPath.startsWith("/create-date") || url.startsWith("/create-date");

    if (isCreateDateTransition) {
      this.syncCreateDateRouteClass(url);
      this.prefetchCreateDateRoutes();
      return;
    }

    this.setState({
      isLoading: true,
      loadingStartedAt: Date.now(),
    });

    this.routeLoaderTimeout = window.setTimeout(() => {
      this.setState({
        isLoading: false,
        loadingStartedAt: 0,
      });
    }, 4500);
  };

  handleRouteChangeSettled = (url) => {
    window.clearTimeout(this.loaderTimeout);
    window.clearTimeout(this.routeLoaderTimeout);
    this.syncCreateDateRouteClass(url || this.props.router?.asPath || "");
    const elapsed = Date.now() - (this.state.loadingStartedAt || 0);
    const minimumLoaderDuration = 1200;
    const delay = Math.max(minimumLoaderDuration - elapsed, 0);

    this.loaderTimeout = window.setTimeout(() => {
      this.setState({
        isLoading: false,
        loadingStartedAt: 0,
      });
    }, delay);
  };

  // When the browser restores the page from the back/forward cache (bfcache),
  // React state, scroll locks and the loader overlay are frozen mid-state and
  // the page can render distorted (SignUpTC-2). Force a fresh load instead.
  handlePageShow = (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  };

  componentDidMount() {
    const { asPath } = this.props.router;

    window.addEventListener("pageshow", this.handlePageShow);

    // lets add initial route to `history`
    this.setState((prevState) => ({ history: [...prevState.history, asPath] }));
    Router.events.on("routeChangeStart", this.handleRouteChangeStart);
    Router.events.on("routeChangeComplete", this.handleRouteChangeSettled);
    Router.events.on("routeChangeError", this.handleRouteChangeSettled);

    // Safety net: ensure loader clears after minimumLoaderDuration on homepage
    const minimumLoaderDuration = 1200;
    const elapsed = Date.now() - (this.state.loadingStartedAt || 0);
    const remaining = Math.max(minimumLoaderDuration - elapsed, 0);
    this.loaderTimeout = setTimeout(() => {
      this.setState({ isLoading: false, loadingStartedAt: 0 });
    }, remaining + 400); // +400ms buffer to ensure GIF is fully loaded

    this.prefetchCreateDateRoutes();

    if (process.env.NODE_ENV === "production") {
      console.log = console.error = console.warn = function () {};
    }
    if (document.body.dataset.scrollLock !== "true") {
      document.body.style.overflow = "unset";
    }
    this.syncCreateDateRouteClass(asPath);
  }

  componentWillUnmount() {
    window.removeEventListener("pageshow", this.handlePageShow);
    Router.events.off("routeChangeStart", this.handleRouteChangeStart);
    Router.events.off("routeChangeComplete", this.handleRouteChangeSettled);
    Router.events.off("routeChangeError", this.handleRouteChangeSettled);
    window.clearTimeout(this.loaderTimeout);
    window.clearTimeout(this.routeLoaderTimeout);
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("create-date-route-active");
      document.body.classList.remove("create-date-route-active");
    }
  }

  componentDidUpdate() {
    const { history } = this.state;
    const { asPath } = this.props.router;

    // if current route (`asPath`) does not equal
    // the latest item in the history,
    // it is changed so lets save it
    if (history[history.length - 1] !== asPath) {
      this.setState((prevState) => ({
        history: [...prevState.history, asPath],
      }));
    }
    if (process.env.NODE_ENV === "production") {
      console.log = console.error = console.warn = function () {};
    }
    this.syncCreateDateRouteClass(asPath);
    if (document.body.dataset.scrollLock !== "true") {
      document.body.style.overflow = "unset";
    }
  }

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ ctx });
    }
    return { pageProps };
  }

  render() {
    const { Component, pageProps, store } = this.props;
    const { asPath } = this.props.router;
    // SignUpTC-2: the landing-page loader masks the home page while its heavy
    // layout settles on first paint — without it the sections render overlapping
    // / distorted. This loader must show on EVERY arrival at "/", whatever the
    // auth state. It used to be gated on "no stored auth object" (!accessToken),
    // which broke two real flows that legitimately land back on "/":
    //   - logged-out: selecting a gender persists an auth object to
    //     sessionStorage (SET_GENDER), so the loader was skipped on the way back.
    //   - logged-in: a real user (token present) returning from /user/user-list
    //     via the browser Back button had the loader skipped too.
    // In both cases the unmasked, still-settling layout showed as distorted.
    // withAuth does not redirect logged-in users away from "/", so they do view
    // this page and need the same masking. Tie the loader purely to the home
    // route + loading state — not to auth.
    const isCreateDateRoute = asPath.startsWith("/create-date");
    const isHomeRoute = asPath === "/";

    const lsLoader =
      this.state.isLoading && isHomeRoute && !isCreateDateRoute;

    return (
      <Provider store={store}>
        <CreateDateCountSync />
        <Head>
          <title>{SITE_TITLE}</title>
          <meta name="description" content={SITE_DESCRIPTION} />
          <meta name="robots" content="index, follow" />
          <link rel="icon" href="/favicon.svg" />
          <link rel="canonical" href={SITE_URL} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Ascend" />
          <meta property="og:title" content={SITE_TITLE} />
          <meta property="og:description" content={SITE_DESCRIPTION} />
          <meta property="og:url" content={SITE_URL} />
          <meta property="og:image" content={`${SITE_URL}/assets/Logo_Web.png`} />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={SITE_TITLE} />
          <meta name="twitter:description" content={SITE_DESCRIPTION} />
          <meta name="twitter:image" content={`${SITE_URL}/assets/Logo_Web.png`} />
          <link
            href="https://fonts.googleapis.com/css?family=Pacifico"
            rel="stylesheet"
          />
          <meta
            name="viewport"
            content="width=device-width, minimum-scale=1.0, maximum-scale = 1.0, user-scalable = no"
          />
        </Head>
        {lsLoader ? (
          <Loader />
        ) : (
          <Component
            {...pageProps}
            history={this.state.history}
            isLoading={this.state.isLoading}
          />
        )}

        <ToastContainer />
      </Provider>
    );
  }
}

export default withRedux(createStore)(withReduxSaga({ async: true })(MyApp));
