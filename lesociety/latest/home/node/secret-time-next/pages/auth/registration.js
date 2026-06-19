import Registration from "modules/auth/forms/registration";
import Header from "core/header";
import Footer from "core/footer";
import useWindowSize from "../../utils/useWindowSize";
import { useState } from "react";

function RegistrationPage({ dispatch }) {
  const { width } = useWindowSize();
  const [page, setPage] = useState(1);

  return (
    <div className="inner-page">
      <Header isSingUp={true} />
      <div className="inner-part-page auth-section">
        <div className="container">
          <div className="auth-section auth-section-register">
            <Registration page={page} setPage={setPage} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RegistrationPage;
