import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import Dashboard from "../pages/dashboard/index.js";
import Login from "../pages/auth/login.js";
import ResetPassword from "../pages/auth/reset-password.js";
import ForgotPassword from "../pages/auth/forgot-password";
import RequireAuth from "./RequireAuth";
import PublicAuth from "./publicAuth";
const PostList = React.lazy(() => import("../pages/pageContainer/post.js"));
const VerifyPhoto = React.lazy(() => import("../pages/pageContainer/verifyPhoto.js"));
const UserProfile = React.lazy(() => import("../pages/pageContainer/userProfile"));
const UserList = React.lazy(() => import("../pages/UserList/UserList"));
const InfluencerPage = React.lazy(() => import("../pages/Influencer/Influencer.js"));
const CountryList = React.lazy(() => import("../pages/Country"));
const DocumentVerificationPage = React.lazy(() => import("../pages/DocumentVerification"));
const SubscriptionAnalytics = React.lazy(() => import("../pages/Subscriptions/SubscriptionAnalytics"));
const Console = React.lazy(() => import("../pages/Console/Console"));

function Router() {
  return (
    <Suspense>
      <BrowserRouter>
        <Routes>
          <Route
            path={"/"}
            element={
              // <PublicAuth>
              <Login />
              //  </PublicAuth>
            }
          />
          <Route
            path={"/dashboard"}
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path={"/profile/:username"}
            element={
              <RequireAuth>
                <UserProfile />
              </RequireAuth>
            }
          />
          <Route
            path={"/verifyPhoto"}
            element={
              <RequireAuth>
                <VerifyPhoto />
              </RequireAuth>
            }
          />
          <Route
            path={"/reset-Password"}
            element={
              <PublicAuth>
                <ResetPassword />
              </PublicAuth>
            }
          />
          <Route
            path={"/forgot-password"}
            element={
              <PublicAuth>
                <ForgotPassword />
              </PublicAuth>
            }
          />

          <Route
            path={"/userList"}
            element={
              <RequireAuth>
                <UserList />
              </RequireAuth>
            }
          />
          <Route
            path={"/country"}
            element={
              <RequireAuth>
                <CountryList />
              </RequireAuth>
            }
          />
          <Route
            path={"/document-verification"}
            element={
              <RequireAuth>
                <DocumentVerificationPage />
              </RequireAuth>
            }
          />
          <Route
            path={"/subscriptions"}
            element={
              <RequireAuth>
                <SubscriptionAnalytics />
              </RequireAuth>
            }
          />
          <Route
            path={"/console"}
            element={
              <RequireAuth>
                <Console />
              </RequireAuth>
            }
          />
          <Route path={"/post"} element={<PostList />} />
          <Route path={"/all-influencers"} element={<InfluencerPage />} />
          <Route path="*" element={<>Not found</>} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export default Router;
