import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContextStore";

export default function AuthContextProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("tkn"));
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!token) {
      setUserId(null);
      return;
    }

    try {
      setUserId(jwtDecode(token).user);
    } catch {
      localStorage.removeItem("tkn");
      setToken(null);
      setUserId(null);
    }
  }, [token]);

  function insertUserToken(authToken) {
    localStorage.setItem("tkn", authToken);
    setToken(authToken);
  }

  function clearUserToken() {
    localStorage.removeItem("tkn");
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, userId, insertUserToken, clearUserToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}
