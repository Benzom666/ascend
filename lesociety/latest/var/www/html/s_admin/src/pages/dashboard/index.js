import React from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import SideBar from "../sideBar/sidebar.js";
import PageContainer from "../pageContainer/innerPageBody.js";
import { CheckExpiredToken } from "../../utility/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return navigate("/");
  }
  return (
    <div className="dashboardUi">
      <SideBar/>
      <PageContainer/>
    </div>
  )
}
export default Dashboard;