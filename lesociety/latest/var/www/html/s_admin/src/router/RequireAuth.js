import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  const adminRole = localStorage.getItem("adminRole");

  if (!token || adminRole !== "2") {
    return <Navigate to="/"/>
  }
  return <>{children}</>;
};

export default RequireAuth;
