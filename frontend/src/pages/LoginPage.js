import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Невірний email або пароль");
        return;
      }

      if (!data.access) {
        setError("Невірний email або пароль");
        return;
      }

      // Store authentication tokens and user data
      localStorage.setItem("token", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("is_staff", data.user.is_staff);
      localStorage.setItem("is_premium", data.user.is_premium);

      // Reload the page to trigger App.js authentication check
      // This ensures the user is automatically logged in
      window.location.href = "/";
    } catch (error) {
      console.error("Помилка входу:", error);
      setError("Помилка входу, спробуйте ще раз");
    }
  };

  return (
    <div className="auth-container">
      <div className="login-container">
        <h2>Вхід</h2>
        {error && <div className="error-message">{error}</div>}
        <form className="auth-form" onSubmit={handleLogin}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">Увійти</button>
        </form>
        <div className="auth-link">
          Немає акаунту? <Link to="/register">Зареєструватися</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
