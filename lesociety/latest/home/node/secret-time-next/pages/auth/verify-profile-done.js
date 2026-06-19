import React from "react";

import {useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Header from "core/header";
import Footer from "core/footer";
import withAuth from "@/core/withAuth";
import { EDIT_PROFILE_DONE } from "data/constants";
const TickMark = "/assets/svg/TickMark";
import { deAuthenticateAction } from "@/modules/auth/authActions";
import { initialize } from "redux-form";

const VerifyProfileDone = () => {
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
                <TickMark />
            <h2>Edit Profile Completed</h2>
            <p className="pt-4">
                { EDIT_PROFILE_DONE}
            </p>
            </div>
        </div>
        <div className='btn-container-2'>
            <button className='edit-btn-done' 
                onClick={() => {
                dispatch(deAuthenticateAction());
                router.push("/auth/login");
                dispatch(initialize("signupStep2", ""));
                dispatch(initialize("DatePreview", ""));
                dispatch(initialize("RegisterFormMale", ""));
                dispatch(initialize("signupStep3", ""));
                dispatch(initialize("RegisterForm", ""));
                dispatch(initialize("forgotpassword", ""));
                dispatch(initialize("LoginForm", ""));
                dispatch(initialize("SecondStep", ""));
                dispatch(initialize("ThirdStep", ""));
                dispatch(initialize("CreateStepFour", ""));
                dispatch(initialize("CreateStepOne", ""));
                dispatch(initialize("CreateStepThree", ""));
                dispatch(initialize("CreateStepTwo", ""));
                dispatch(initialize("SkeletonUserProfile", ""));
                dispatch(initialize("Messages", ""));
                dispatch(initialize("VerifiedProfilePage", ""));
                dispatch(initialize("ChooseCity", ""));
            }}>
                Close Page
            </button>
        </div>
        </div>
    </div>
    </div>
    <Footer />
</div>
);
};

export default withAuth(VerifyProfileDone);