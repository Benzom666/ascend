import React, { useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useState } from "react";
import Header from "core/header";
import Footer from "core/footer";
import withAuth from "@/core/withAuth";

const Block = (props) => {
  const user = useSelector((state) => state.authReducer.user);
  const [tokenValid, setTokenValid] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <div className="inner-page">
      <Header />

      <div className="inner-part-page auth-section">
        <div className="container">
          <div className="auth-section auth-section-register">
            <div>
              <div className="upload-pics profile-completion">
                <h2>You’ve Been Blocked From Ascend</h2>
                <p className="pt-4">
                  Unfortunately, we've blocked you from Ascend because you
                  violated our policy during registration. We take our policy
                  seriously because it allows us to provide a safe and enjoyable
                  environment for our users. Thank you for understanding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default withAuth(Block);
