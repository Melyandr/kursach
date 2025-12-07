import React, { useEffect, useState, useCallback } from "react";

/**
 * Props:
 *  - articleId: number
 *  - token: string (JWT) or null
 *  - currentUserId: number | null
 *  - isAdmin: boolean
 */
function CommentsSection({ articleId, token, currentUserId, isAdmin }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Завантаження коментарів
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/comments/?article=${articleId}`
      );
      if (!res.ok) {
        throw new Error("Помилка завантаження коментарів");
      }
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Помилка при завантаженні коментарів:", err);
      setError("Не вдалося завантажити коментарі");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Додавання коментаря
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ article: articleId, content: newComment }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error("Помилка при додаванні коментаря", err);
        setError("Не вдалося додати коментар");
        return;
      }

      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Помилка при додаванні коментаря:", err);
      setError("Не вдалося додати коментар");
    }
  };

  // Видалення коментаря
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Видалити коментар?")) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/comments/${commentId}/`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error("Помилка при видаленні коментаря", err);
        setError("Не вдалося видалити коментар");
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Помилка при видаленні коментаря:", err);
      setError("Не вдалося видалити коментар");
    }
  };

  // Безпечне отримання id автора коментаря (comment.user може бути number або object або строка)
  const getCommentUserId = (comment) => {
    if (comment == null) return null;
    const u = comment.user;
    if (u == null) return null;
    // якщо це число (id)
    if (typeof u === "number") return u;
    // якщо це рядок, спробуємо перетворити
    if (typeof u === "string" && u.trim() !== "") {
      const n = Number(u);
      if (!Number.isNaN(n)) return n;
    }
    // якщо це об'єкт з id
    if (typeof u === "object" && u.id) {
      const n = Number(u.id);
      return Number.isNaN(n) ? null : n;
    }
    return null;
  };

  // Показ імені автора: використовуємо user_username, якщо немає — "Користувач" (без NaN)
  const displayAuthorName = (comment) => {
    const name = comment.user_username;
    if (name && String(name).toLowerCase() !== "nan" && String(name).trim() !== "") {
      return name;
    }
    // якщо є id — можна показати "Користувач #id" або просто "Користувач"
    const uid = getCommentUserId(comment);
    if (uid) return `Користувач ${uid}`;
    return "Користувач";
  };

  // Чи може поточний користувач видаляти коментар
  const canDelete = (comment) => {
    const authorId = getCommentUserId(comment);
    // Якщо адміністратор (isAdmin true) — може
    if (isAdmin) return true;
    // Якщо немає currentUserId — не може
    if (!currentUserId) return false;
    // Якщо автор ідентичний поточному користувачу — може
    return authorId !== null && Number(authorId) === Number(currentUserId);
  };

  return (
    <div className="comments-section">
      <h4>Коментарі</h4>

      {loading ? (
        <p>Завантаження коментарів...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : comments.length === 0 ? (
        <p>Немає коментарів.</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="comment">
            <div className="comment-header">
              <strong className="comment-author">{displayAuthorName(c)}</strong>
              {canDelete(c) && (
                <button
                  className="delete-comment-btn"
                  onClick={() => handleDeleteComment(c.id)}
                  title="Видалити коментар"
                >
                  🗑️
                </button>
              )}
            </div>
            <p className="comment-content">{c.content}</p>
          </div>
        ))
      )}

      {token ? (
        <div className="add-comment">
          <textarea
            placeholder="Напишіть коментар..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>
            Надіслати
          </button>
        </div>
      ) : (
        <p className="login-prompt">🔒 Увійдіть, щоб залишати коментарі</p>
      )}
    </div>
  );
}

export default CommentsSection;
