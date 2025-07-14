import { createContext, useState, useEffect } from "react";
import http from "../https";


const UserContext = createContext({
  user: null,
  setUser: () => {}
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role") || "customer";

    if (!token) return;

    const endpoint = role === "staff" ? "/staff/auth" : "/customer/auth";

    http.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => setUser({ ...res.data.user, role }))
      .catch(() => {
        localStorage.removeItem("accessToken");
        setUser(null);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
