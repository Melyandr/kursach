import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/articles.css";
import CommentsSection from "./CommentsSection";

function ArticlesPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [savedArticles, setSavedArticles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [expandedArticles, setExpandedArticles] = useState({});
  const [currentUser, setCurrentUser] = useState(null); // {id, isAdmin}
  const [loading, setLoading] = useState(true);

const titles = {
  news: "Новини",
  sport: "Спорт",
  fashion: "Мода"
};
  // === Завантажуємо збережені статті ===
  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/saved/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSavedArticles(data.map((s) => s.article)))
      .catch(console.error);
  }, [token]);

  // === Завантажуємо користувача та після цього статті ===
  useEffect(() => {
    const fetchUserAndArticles = async () => {
      let userData = null;

      //  Завантажуємо користувача
      if (token) {
        try {
          const res = await fetch("http://127.0.0.1:8000/api/user/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            userData = await res.json();
            console.log("USER DATA:", userData);

            setCurrentUser({
              id: Number(userData.id),
              isAdmin: userData.is_staff,
            });
          }
        } catch (err) {
          console.error("Помилка при завантаженні користувача:", err);
        }
      }

      //  Завантажуємо статті
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/articles/?category=${category}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );
        let articlesData = await res.json();

        //  Фільтруємо статті для звичайного користувача
        const isPrivilegedUser =
          userData && (userData.is_staff || userData.is_superuser || userData.is_premium);

        if (!isPrivilegedUser) {
          articlesData = articlesData.filter((a) => !a.is_premium);
        }

        setArticles(articlesData);
      } catch (err) {
        console.error("Помилка при завантаженні статей:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndArticles();
  }, [category, token]);

  // === Кнопка показати/сховати коментарі ===
  const toggleComments = (articleId) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  // === Видалення статті (лише для адміна) ===
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

  // === Збереження / видалення зі збережених ===
  const toggleSave = async (articleId) => {
    if (!token) {
      alert("Увійдіть, щоб зберігати статті");
      return;
    }

    const isSaved = savedArticles.includes(articleId);

    if (isSaved) {
      const res = await fetch(
        `http://127.0.0.1:8000/api/saved/?article=${articleId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const saved = await res.json();
      const idToDelete = saved[0]?.id;
      if (idToDelete) {
        await fetch(`http://127.0.0.1:8000/api/saved/${idToDelete}/`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedArticles((prev) => prev.filter((id) => id !== articleId));
      }
    } else {
      const res = await fetch("http://127.0.0.1:8000/api/saved/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ article: articleId }),
      });
      if (res.ok) {
        setSavedArticles((prev) => [...prev, articleId]);
      }
    }
  };

  if (loading) return <p>Завантаження статей...</p>;

  return (
    <div className="articles-container">
      <h2>{titles[category] || category.toUpperCase()}</h2>
      {articles.length === 0 ? (
        <p>Немає статей у цій категорії.</p>
      ) : (
        <div className="articles-grid">
          {articles.map((a) => (
            <div key={a.id} className="article-card">
              {a.image && (
                <img src={a.image} alt={a.title} className="article-image" />
              )}
              <h3>{a.title}</h3>
              <p className="article-description">{a.excerpt || a.content || "Немає опису"}</p>
              <small>
                {a.category} | {new Date(a.created_at).toLocaleDateString()}
              </small>

              {/* === Кнопка Збереження === */}
              <button
                onClick={() => toggleSave(a.id)}
                className={`save-btn ${
                  savedArticles.includes(a.id) ? "saved" : ""
                }`}
              >
                {savedArticles.includes(a.id)
                  ? "💾 Збережено"
                  : "📥 Зберегти"}
              </button>

              {/* === Адмінські кнопки === */}
              {currentUser?.isAdmin && (
                <div className="admin-controls">
                  <button onClick={() => navigate(`/edit-article/${a.id}`)}>
                    ✏️ Редагувати
                  </button>
                  <button onClick={() => handleDelete(a.id)}>🗑️ Видалити</button>
                </div>
              )}

              {/* === Кнопка коментарів === */}
              <button 
                onClick={() => toggleComments(a.id)}
                className="comments-toggle-btn"
              >
                💬{" "}
                {expandedArticles[a.id]
                  ? "Сховати коментарі"
                  : "Показати коментарі"}
              </button>

              {/* === Секція коментарів === */}
              {expandedArticles[a.id] && (
                <CommentsSection
                  articleId={a.id}
                  token={token}
                  currentUserId={currentUser?.id}
                  isAdmin={currentUser?.isAdmin}
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
