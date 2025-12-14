import React, { useEffect, useState } from "react";
import "../styles/Notifications.css"; // можна створити файл CSS для стилів

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    fetch("http://127.0.0.1:8000/api/notifications/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch((err) => console.error(err));
  }, [token]);

  return (
    <div className="notifications-page">
      <h1>Сповіщення</h1>

      {notifications.length === 0 ? (
        <p className="no-notifications">Немає сповіщень</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((n) => (
            <li key={n.id} className="notification-item">
              <div className="notification-text">
                <strong>{n.channel_name ? `[${n.channel_name}] ` : ""}</strong>
                {n.text}
              </div>
              <div className="notification-date">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
