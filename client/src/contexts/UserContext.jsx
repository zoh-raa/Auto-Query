import { createContext, useState, useEffect } from "react";
import { http } from "../https";


const UserContext = createContext({
  user: null,
  setUser: () => {},
  loading: true
});


export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || !storedUser) {
      setLoading(false);
      return;
    }

    const endpoint = storedUser.role === "staff" ? "/staff/auth" : "/customer/auth";

    http.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setUser({ ...res.data.user, role: storedUser.role });
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
