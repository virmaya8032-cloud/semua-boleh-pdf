import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { ProtectedRoute } from "./components/ui.jsx";

import Home from "./pages/Home.jsx";
import AllTools from "./pages/AllTools.jsx";
import ToolPage from "./pages/ToolPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import { About, Contact, Privacy, Terms, Security, FAQ } from "./pages/Static.jsx";

function TatalKeAtas() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <TatalKeAtas />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alat" element={<AllTools />} />
          <Route path="/alat/:slug" element={<ToolPage />} />

          <Route path="/log-masuk" element={<Login />} />
          <Route path="/daftar" element={<Register />} />

          <Route
            path="/papan-pemuka"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pentadbir"
            element={
              <ProtectedRoute pentadbir>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/mengenai-kami" element={<About />} />
          <Route path="/hubungi" element={<Contact />} />
          <Route path="/polisi-privasi" element={<Privacy />} />
          <Route path="/terma" element={<Terms />} />
          <Route path="/keselamatan" element={<Security />} />
          <Route path="/soalan-lazim" element={<FAQ />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
