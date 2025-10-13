import React, { useState } from "react";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.access) {
        localStorage.setItem("token", data.access);
        localStorage.setItem("refresh", data.refresh);
        window.location.href = "/";
      } else {
        alert("Невірний логін або пароль");
      }
    } catch (error) {
      console.error("Помилка входу:", error);
    }
  };

  return (
    <div className="login-container">
      <h2>Вхід</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Логін"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Увійти</button>
      </form>
    </div>
  );
}

export default LoginPage;
