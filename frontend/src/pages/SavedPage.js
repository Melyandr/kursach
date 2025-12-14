import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommentsSection from "./CommentsSection";
import "../styles/articles.css";

function SavedPage({ token }) {
  const navigate = useNavigate();
  const [savedArticles, setSavedArticles] = useState([]);
  const [expandedArticles, setExpandedArticles] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Завантаження поточного користувача
  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/user/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCurrentUserId(Number(data.id));
        setIsAdmin(data.is_staff);
      })
      .catch(console.error);
  }, [token]);

  // Завантаження збережених статей
  const fetchSaved = () => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/saved/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSavedArticles(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchSaved();
  }, [token]);

  const toggleComments = (articleId) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  // Видалення зі збережених
  const toggleSave = async (articleId) => {
    if (!token) return;

    const savedItem = savedArticles.find((s) => s.article_detail.id === articleId);
    if (!savedItem) return;

    await fetch(`http://127.0.0.1:8000/api/saved/${savedItem.id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSaved(); // оновлюємо список
  };

  if (!token) return <p>Увійдіть, щоб переглянути збережене.</p>;
  if (savedArticles.length === 0) return <p>Немає збережених статей.</p>;

  return (
    <div className="articles-container">
      <h2 className="category-title">📚 Збережені статті</h2>
      <div className="articles-grid">
        {savedArticles.map((s) => {
          const a = s.article_detail;
          return (
            <div key={s.id} className="article-card">
              {a.image && <img src={a.image} alt={a.title} className="article-image" />}
              <h3>{a.title}</h3>
              <p>{a.excerpt || (a.content?.substring(0, 120) + "...")}</p>
              <small>
                {a.category} | {new Date(a.created_at).toLocaleDateString()}
              </small>

              <button
                onClick={() => toggleSave(a.id)}
                className="save-btn saved"
              >
                ❌ Видалити зі збережених
              </button>

              {isAdmin && (
                <div className="admin-controls">
                  <button onClick={() => navigate(`/edit-article/${a.id}`)}>✏️ Редагувати</button>
                </div>
              )}

              <button onClick={() => toggleComments(a.id)} className="comments-toggle-btn">
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
          );
        })}
      </div>
    </div>
  );
}

export default SavedPage;
