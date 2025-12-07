import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://127.0.0.1:8000/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIsAdmin(data.is_staff);
      } catch (error) {
        console.error("Помилка отримання користувача:", error);
      }
    };
    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    setToken(null);
    setIsAdmin(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="nav-logo">
          Мій журнал
        </Link>
        <Link to="/category/news">Новини</Link>
        <Link to="/category/sport">Спорт</Link>
        <Link to="/category/fashion">Мода</Link>
        <li>
  <Link to="/notifications">Сповіщення</Link>
</li>
        {isAdmin && (
          <Link to="/create-poll">Створити опитування</Link>
        )}



        {/* 🔒 Показуємо вкладку “Підписки” тільки якщо користувач залогінений */}
        {token && <Link to="/subscriptions">Підписки</Link>}
        {token && (
          <li>
            <Link to="/saved">Збережене</Link>
          </li>
        )}
        {/* 🛠️ Показуємо лише якщо адмін */}
        {isAdmin && <Link to="/create-article">Створити статтю</Link>}
      </div>

      <div className="navbar-right">
        {token ? (
          <>
            {isAdmin && <Link to="/admin/users">Управління користувачами</Link>}
            <button onClick={handleLogout} className="logout-btn">
              Вийти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Увійти
            </Link>
            <Link to="/register" className="register-btn">
              Реєстрація
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

