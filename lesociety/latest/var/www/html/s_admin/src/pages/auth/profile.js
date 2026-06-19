import Head from 'next/head'
import { connect } from "react-redux";
import  Profile   from 'modules/auth/forms/profile';
import Header from 'core/header'
import LoggedInHeader from 'core/loggedInHeader'
import Footer from 'core/footer'
import Link from 'next/link'
import useWindowSize from "../../utils/useWindowSize";
import { useSelector, useDispatch } from "react-redux";
import _ from 'lodash'

function RegisterPage ({dispatch} ) {
  const user = useSelector(state => state.authReducer.user)
  const { width } = useWindowSize();
	return (
    <div className="inner-page">
      <Header />
      {/* {_.isEmpty(user) ? <Header /> : <LoggedInHeader/>} */}
              <Profile />
      <Footer />
    </div>
  )
}

export default RegisterPage ;