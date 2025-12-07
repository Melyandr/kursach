import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";
import "../styles/components.css";

function AdminUserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_staff") === "true";

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Н/Д';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Н/Д';
      return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return 'Н/Д';
    }
  };

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }
    fetchUsers();
  }, [token, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const url = searchTerm
        ? `http://127.0.0.1:8000/api/admin/users/?search=${encodeURIComponent(searchTerm)}`
        : "http://127.0.0.1:8000/api/admin/users/";
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Не вдалося завантажити користувачів");
      }

      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Помилка завантаження користувачів:", err);
      setError("Помилка завантаження користувачів");
      setLoading(false);
    }
  };


  const handleTogglePremium = async (userId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/admin/users/${userId}/toggle_premium/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Не вдалося змінити статус преміум");
      }

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error("Помилка зміни статусу:", err);
      alert("Помилка зміни статусу преміум");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Управління користувачами</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="input"
          type="text"
          placeholder="Пошук за ім'ям або email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Пошук</button>
        {searchTerm && (
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setSearchTerm("");
              fetchUsers();
            }}
          >
            Очистити
          </button>
        )}
      </form>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ім'я користувача</th>
              <th>Email</th>
              <th>Адмін</th>
              <th>Преміум</th>
              <th>Дата реєстрації</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.is_staff ? "✓" : ""}</td>
                <td>{user.is_premium ? "✓" : ""}</td>
                <td>{formatDate(user.date_joined)}</td>
                <td>
                  <button
                    className={`table-action-btn ${user.is_premium ? 'table-action-btn-danger' : 'table-action-btn-success'}`}
                    onClick={() => handleTogglePremium(user.id)}
                  >
                    {user.is_premium ? "Прибрати преміум" : "Додати преміум"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="empty-state">
          <p>Користувачів не знайдено</p>
        </div>
      )}
    </div>
  );
}

export default AdminUserManagementPage;

