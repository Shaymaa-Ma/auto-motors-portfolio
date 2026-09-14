
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import About from "./pages/About";
import Hero from "./pages/Hero";
import Services from "./pages/Services";
import Advantages from "./pages/Advantages";
import Gallery from "./pages/Gallery";
import Faqs from "./pages/Faqs";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Vehicles from "./pages/Vehicles";
import CompanyInfo from "./pages/CompanyInfo";
import SocialLinks from "./pages/SocialLinks";
import Contact from "./pages/Contact";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ===================================================
              LOGIN & REGISTER
          =================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* ===================================================
              PROTECTED ADMIN AREA
          =================================================== */}

          <Route element={<ProtectedRoute />}>

            <Route element={<AdminLayout />}>

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/home"
                element={<Hero />}
              />

              <Route
                path="/about"
                element={<About />}
              />

              <Route
                path="/services"
                element={<Services />}
              />

              <Route
                path="/advantages"
                element={<Advantages />}
              />

              <Route
                path="/gallery"
                element={<Gallery />}
              />

              <Route
                path="/faqs"
                element={<Faqs />}
              />

              <Route
                path="/categories"
                element={<Categories />}
              />

              <Route
                path="/products"
                element={<Products />}
              />

              <Route
                path="/vehicles"
                element={<Vehicles />}
              />

              <Route
                path="/company"
                element={<CompanyInfo />}
              />

              <Route
                path="/social-links"
                element={<SocialLinks />}
              />

              <Route
                path="/contact"
                element={<Contact />}
              />

            </Route>

          </Route>

          {/* ===================================================
              DEFAULT
          =================================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* ===================================================
              UNKNOWN ROUTES
          =================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
