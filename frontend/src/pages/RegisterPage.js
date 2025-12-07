import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSecretKey, setAdminSecretKey] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }

    if (password.length < 8) {
      setError("Пароль повинен містити мінімум 8 символів");
      return;
    }

    if (isAdmin && !adminSecretKey) {
      setError("Введіть секретний ключ адміністратора");
      return;
    }

    try {
      const body = {
        email,
        password,
        username: username || undefined,
      };

      if (isAdmin && adminSecretKey) {
        body.admin_secret_key = adminSecretKey;
      }

      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Помилка реєстрації");
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
      console.error("Помилка реєстрації:", error);
      setError("Помилка реєстрації, спробуйте ще раз");
    }
  };

  return (
    <div className="auth-container">
      <div className="register-container">
        <h2>Реєстрація</h2>
        {error && <div className="error-message">{error}</div>}
        <form className="auth-form" onSubmit={handleRegister}>
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
            type="text"
            placeholder="Ім'я користувача (опціонально)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <input
            className="input"
            type="password"
            placeholder="Підтвердити пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <div className="admin-section">
            <div className="admin-checkbox-wrapper">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              <label htmlFor="isAdmin">Створити адміністраторський акаунт</label>
            </div>

            {isAdmin && (
              <div className="admin-secret-input">
                <input
                  className="input"
                  type="password"
                  placeholder="Секретний ключ адміністратора"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  required={isAdmin}
                />
                <small>
                  Введіть секретний ключ для створення адміністраторського акаунта
                </small>
              </div>
            )}
          </div>

          <button className="btn btn-primary" type="submit">Зареєструватися</button>
        </form>
        <div className="auth-link">
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

