//import React, { useEffect, useState, useCallback } from "react";
//
//function CommentsSection({ articleId, token }) {
//  const [comments, setComments] = useState([]);
//  const [newComment, setNewComment] = useState("");
//  const [loading, setLoading] = useState(true);
//
//  // --- Отримання коментарів ---
//  const fetchComments = useCallback(async () => {
//    setLoading(true);
//    try {
//      const res = await fetch(
//        `http://127.0.0.1:8000/api/comments/?article=${articleId}`
//      );
//      const data = await res.json();
//      setComments(data);
//    } catch (err) {
//      console.error("Помилка при завантаженні коментарів:", err);
//    } finally {
//      setLoading(false);
//    }
//  }, [articleId]);
//
//  useEffect(() => {
//    fetchComments();
//  }, [fetchComments]);
//
//  // --- Додати коментар ---
//  const handleAddComment = async () => {
//    if (!newComment.trim()) return;
//
//    try {
//      const res = await fetch(`http://127.0.0.1:8000/api/comments/`, {
//        method: "POST",
//        headers: {
//          "Content-Type": "application/json",
//          Authorization: `Bearer ${token}`,
//        },
//        body: JSON.stringify({ article: articleId, content: newComment }),
//      });
//
//      if (res.ok) {
//        setNewComment("");
//        fetchComments(); // оновлення списку коментарів
//      } else {
//        console.error("Помилка при додаванні коментаря");
//      }
//    } catch (err) {
//      console.error("Помилка при додаванні коментаря:", err);
//    }
//  };
//const handleDeleteComment = async (commentId) => {
//  if (!window.confirm("Видалити коментар?")) return;
//
//  try {
//    const res = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}/`, {
//      method: "DELETE",
//      headers: { Authorization: `Bearer ${token}` },
//    });
//
//    if (res.ok) {
//      setComments((prev) => prev.filter((c) => c.id !== commentId));
//    } else {
//      console.error("❌ Помилка при видаленні коментаря");
//    }
//  } catch (err) {
//    console.error("Помилка:", err);
//  }
//};
//  return (
//    <div className="comments-section">
//      <h4>Коментарі</h4>
//
//      {loading ? (
//        <p>Завантаження...</p>
//      ) : comments.length > 0 ? (
//        comments.map((c) => (
//          <div key={c.id} className="comment">
//            <strong>{c.user_username || "Користувач"}</strong>: {c.content}
//          </div>
//        ))
//      ) : (
//        <p>Немає коментарів.</p>
//      )}
//
//      {token ? (
//        <div className="add-comment">
//          <textarea
//            placeholder="Напишіть коментар..."
//            value={newComment}
//            onChange={(e) => setNewComment(e.target.value)}
//          />
//          <button onClick={handleAddComment}>Надіслати</button>
//        </div>
//      ) : (
//        <p>🔒 Увійдіть, щоб залишати коментарі</p>
//      )}
//    </div>
//  );
//}
//
//export default CommentsSection;
import React, { useEffect, useState, useCallback } from "react";

function CommentsSection({ articleId, token, currentUserId, isAdmin }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // --- Отримання коментарів ---
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/comments/?article=${articleId}`
      );
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Помилка при завантаженні коментарів:", err);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // --- Додати коментар ---
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ article: articleId, content: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        fetchComments(); // оновлення списку коментарів
      } else {
        console.error("Помилка при додаванні коментаря");
      }
    } catch (err) {
      console.error("Помилка при додаванні коментаря:", err);
    }
  };

  // --- Видалити коментар ---
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Видалити коментар?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        console.error("❌ Помилка при видаленні коментаря");
      }
    } catch (err) {
      console.error("Помилка:", err);
    }
  };

  return (
    <div className="comments-section">
      <h4>Коментарі</h4>

      {loading ? (
        <p>Завантаження...</p>
      ) : comments.length > 0 ? (
        comments.map((c) => (
          <div key={c.id} className="comment">
            <div className="comment-header">
              <strong>{c.user_username || "Користувач"}</strong>
{/*//              {(token && (c.user === currentUserId || isAdmin)) && (*/}
{(token && ((c.user === currentUserId || c.user?.id === currentUserId) || isAdmin)) && (
  <button
    className="delete-comment-btn"
    onClick={() => handleDeleteComment(c.id)}
  >
    🗑️
  </button>
)}
            </div>
            <p>{c.content}</p>
          </div>
        ))
      ) : (
        <p>Немає коментарів.</p>
      )}

      {token ? (
        <div className="add-comment">
          <textarea
            placeholder="Напишіть коментар..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Надіслати</button>
        </div>
      ) : (
        <p>🔒 Увійдіть, щоб залишати коментарі</p>
      )}
    </div>
  );
}

export default CommentsSection;
