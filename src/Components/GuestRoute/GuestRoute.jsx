import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextStore";

export default function GuestRoute({ children }) {
  const { token } = useContext(AuthContext);

  if (token) return <Navigate to="/home" replace />;

  return children;
}
