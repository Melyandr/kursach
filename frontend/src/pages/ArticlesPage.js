//import React, { useEffect, useState } from "react";
//import { useParams, useNavigate } from "react-router-dom";
//import "../styles/articles.css";
//
//function ArticlesPage() {
//  const { category } = useParams();
//  const [articles, setArticles] = useState([]);
//  const [isAdmin, setIsAdmin] = useState(false);
//  const navigate = useNavigate();
//  const token = localStorage.getItem("token");
//
//  // Отримати, чи користувач адмін
//  useEffect(() => {
//    const fetchUser = async () => {
//      if (!token) return;
//      try {
//        const res = await fetch("http://127.0.0.1:8000/api/user/", {
//          headers: { Authorization: `Bearer ${token}` },
//        });
//        const data = await res.json();
//        setIsAdmin(data.is_staff || data.is_superuser);
//      } catch (err) {
//        console.error("Помилка при отриманні користувача:", err);
//      }
//    };
//    fetchUser();
//  }, [token]);
//
////  // Завантаження статей
////  useEffect(() => {
////    fetch(`http://127.0.0.1:8000/api/articles/?category=${category}`)
////      .then((res) => res.json())
////      .then((data) => setArticles(data));
////  }, [category]);
//useEffect(() => {
//  const fetchArticles = async () => {
//    const token = localStorage.getItem("token");
//
//    const res = await fetch(`http://127.0.0.1:8000/api/articles/?category=${category}`, {
//      headers: {
//        "Content-Type": "application/json",
//        ...(token && { Authorization: `Bearer ${token}` }),
//      },
//    });
//
//    const data = await res.json();
//    setArticles(data);
//  };
//
//  fetchArticles();
//}, [category]);
//
//
//const handleDelete = async (id) => {
//  const token = localStorage.getItem("token");
//
//  if (!window.confirm("Видалити статтю?")) return;
//
//  const res = await fetch(`http://127.0.0.1:8000/api/articles/${id}/`, {
//    method: "DELETE",
//    headers: {
//      Authorization: `Bearer ${token}`,
//    },
//  });
//
//  if (res.ok) {
//    alert("✅ Статтю видалено!");
//    // ⬇️ ось тут оновлюємо стан
//    setArticles((prev) => prev.filter((a) => a.id !== id));
//  } else {
//    alert("❌ Помилка при видаленні статті");
//  }
//};
//  return (
//    <div className="articles-container">
//      <h2 className="category-title">{category.toUpperCase()}</h2>
//      {articles.length === 0 ? (
//        <p>Немає статей у цій категорії.</p>
//      ) : (
//        <div className="articles-grid">
//          {articles.map((a) => (
//            <div className="article-card" key={a.id}>
//              {a.image && (
//                <img src={a.image} alt={a.title} className="article-image" />
//              )}
//              <h3>{a.title}</h3>
//              <p>{a.excerpt || a.content.substring(0, 120) + "..."}</p>
//              <small>
//                {a.category} | {new Date(a.created_at).toLocaleDateString()}
//              </small>
//
//              {/* Кнопки редагування / видалення тільки для адміна */}
//              {isAdmin && (
//                <div className="admin-controls">
//                  <button
//                    className="edit-btn"
//                    onClick={() => navigate(`/edit-article/${a.id}`)}
//                  >
//                    ✏️ Редагувати
//                  </button>
//                  <button
//                    className="delete-btn"
//                    onClick={() => handleDelete(a.id)}
//                  >
//                    🗑️ Видалити
//                  </button>
//                </div>
//              )}
//            </div>
//          ))}
//        </div>
//      )}
//    </div>
//  );
//}
//
//export default ArticlesPage;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/articles.css";
import CommentsSection from "./CommentsSection"; // <-- новий компонент

function ArticlesPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [articles, setArticles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

useEffect(() => {
  if (!token) return;
  fetch("http://127.0.0.1:8000/api/user/", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      setIsAdmin(data.is_staff || data.is_superuser);
      setCurrentUserId(data.id);
    })
    .catch(console.error);
}, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/user/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.is_staff || data.is_superuser))
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/articles/?category=${category}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((data) => setArticles(data))
      .catch(console.error);
  }, [category, token]);

  const toggleComments = (articleId) => {
    setExpandedArticles((prev) => ({ ...prev, [articleId]: !prev[articleId] }));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Видалити статтю?")) return;

    fetch(`http://127.0.0.1:8000/api/articles/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) setArticles((prev) => prev.filter((a) => a.id !== id));
      })
      .catch(console.error);
  };

  return (
    <div className="articles-container">
      <h2>{category.toUpperCase()}</h2>
      {articles.length === 0 ? (
        <p>Немає статей у цій категорії.</p>
      ) : (
        <div className="articles-grid">
          {articles.map((a) => (
            <div key={a.id} className="article-card">
              {a.image && <img src={a.image} alt={a.title} className="article-image" />}
              <h3>{a.title}</h3>
              <p>{a.excerpt || (a.content?.substring(0, 120) + "...")}</p>
              <small>{a.category} | {new Date(a.created_at).toLocaleDateString()}</small>

              {isAdmin && (
                <div className="admin-controls">
                  <button onClick={() => navigate(`/edit-article/${a.id}`)}>✏️ Редагувати</button>
                  <button onClick={() => handleDelete(a.id)}>🗑️ Видалити</button>
                </div>
              )}

              <button onClick={() => toggleComments(a.id)}>
                💬 {expandedArticles[a.id] ? "Сховати коментарі" : "Показати коментарі"}
              </button>

              {expandedArticles[a.id] && (
              <CommentsSection
                articleId={a.id}
                token={token}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
            )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArticlesPage;


