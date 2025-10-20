//import React, { useEffect, useState } from "react";
//import {
//  BrowserRouter as Router,
//  Routes,
//  Route,
//  Link,
//  useNavigate,
//} from "react-router-dom";
//
//import Home from "./pages/Home";
//import ArticlesPage from "./pages/ArticlesPage";
//import LoginPage from "./pages/LoginPage";
//import CreateArticlePage from "./pages/CreateArticlePage";
//import "./styles/navbar.css";
//import EditArticlePage from "./pages/EditArticlePage";
//
//function Navbar() {
//  const navigate = useNavigate();
////  const token = localStorage.getItem("token");
//  const [isAdmin, setIsAdmin] = useState(false);
//  const [token, setToken] = useState(localStorage.getItem("token"));
//
//useEffect(() => {
//  const fetchUser = async () => {
//    if (!token) return;
//    try {
//      const res = await fetch("http://127.0.0.1:8000/api/user/", {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      setIsAdmin(data.is_staff || data.is_superuser);
//    } catch (error) {
//      console.error("Помилка отримання користувача:", error);
//    }
//  };
//  fetchUser();
//}, [token]);
//
//const handleLogout = () => {
//  localStorage.removeItem("token");
//  localStorage.removeItem("refresh");
//  setToken(null);
//  setIsAdmin(false);
//  navigate("/login");
//};
//
//  return (
//    <nav className="navbar">
//      <div className="navbar-left">
//        <Link to="/" className="nav-logo">
//          Мій журнал
//        </Link>
//        <Link to="/category/news">Новини</Link>
//        <Link to="/category/sport">Спорт</Link>
//        <Link to="/category/fashion">Мода</Link>
//        <Link to="/category/subscriptions">Підписки</Link>
//
//        {/*  Показуємо лише якщо адмін */}
//        {isAdmin && <Link to="/create-article">Створити статтю</Link>}
//      </div>
//
//      <div className="navbar-right">
//        {token ? (
//          <button onClick={handleLogout} className="logout-btn">
//            Вийти
//          </button>
//        ) : (
//          <Link to="/login" className="login-btn">
//            Увійти
//          </Link>
//        )}
//      </div>
//    </nav>
//  );
//}
//
//function App() {
//  return (
//    <Router>
//      <Navbar />
//      <Routes>
//        <Route path="/" element={<Home />} />
//        <Route path="/category/:category" element={<ArticlesPage />} />
//        <Route path="/login" element={<LoginPage />} />
//        <Route path="/create-article" element={<CreateArticlePage />} />
//        <Route path="/edit-article/:id" element={<EditArticlePage />} />
//      </Routes>
//    </Router>
//  );
//}
//
//export default App;
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";


import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import ArticlesPage from "./pages/ArticlesPage";
import LoginPage from "./pages/LoginPage";
import CreateArticlePage from "./pages/CreateArticlePage";
import EditArticlePage from "./pages/EditArticlePage";
import Subscriptions from './pages/Subscriptions';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:category" element={<ArticlesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-article" element={<CreateArticlePage />} />
        <Route path="/edit-article/:id" element={<EditArticlePage />} />
        <Route path="/subscriptions" element={<Subscriptions />} />

      </Routes>
    </Router>
  );
}

export default App;
