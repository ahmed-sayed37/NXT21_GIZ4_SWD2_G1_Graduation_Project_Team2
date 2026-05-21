import { useCallback, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContextStore";
import { getUserById } from "../api/mockApi";

export default function AuthContextProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("tkn"));
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) {
      setUserId(null);
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp && Date.now() > decoded.exp) {
        localStorage.removeItem("tkn");
        setToken(null);
        return;
      }
      setUserId(decoded.user);
    } catch {
      localStorage.removeItem("tkn");
      setToken(null);
      setUserId(null);
    }
  }, [token]);

  const refreshUser = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getUserById(userId);
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  }, [userId]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

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
      value={{ token, userId, user, insertUserToken, clearUserToken, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
