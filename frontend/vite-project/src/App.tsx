import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard/Dashboard";
import CameraPage from "./Camera/CameraPage";
import { useFetch } from "../hooks/useFetch";

export default function App() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchData = useFetch(() => {
    setLoggedIn(false);
    navigate("/login");
  });

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetchData("/me");
      if (res && res.ok) {
        setLoggedIn(true);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-black/10 border-t-[#ff7828] animate-spin" />
        <p className="text-sm text-black/30">Зарежда се...</p>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={!loggedIn ? <Login onLogin={() => { setLoggedIn(true); navigate("/dashboard"); }} /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={loggedIn ? <Dashboard fetchData={fetchData} /> : <Navigate to="/login" />} />
      <Route path="/camera/:id" element={loggedIn ? <CameraPage fetchData={fetchData} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={loggedIn ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}