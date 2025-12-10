import { Navigate } from "react-router-dom";

export const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  if(role !== "admin") return <Navigate to="/home" />;
  return children;
};
