import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/CreateArticlesAdmin.css";

export default function CreateArticleChannelPage() {
  const { id } = useParams(); // channel id
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setMessage("Заповни всі поля");
      return;
    }

    const articleData = {
      title,
      content,
      type: "channel",
      is_premium: isPremium
    };

    const res = await fetch(`http://127.0.0.1:8000/api/channels/${id}/articles/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });

    if (res.ok) {
      setMessage("Стаття опублікована в канал ✅");
      setTitle("");
      setContent("");
    } else {
      setMessage("Помилка при створенні статті в канал");
    }
  };

  return (
    <div className="create-article-container">
      <h2 className="create-article-title">Створити статтю в канал</h2>

      <form className="create-article-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="create-article-input"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="create-article-textarea"
          placeholder="Текст статті..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <label>
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
          />{" "}
          Premium стаття
        </label>

        <button className="create-article-button" type="submit">
          Опублікувати
        </button>

        {message && <div className="create-article-message success">{message}</div>}
      </form>
    </div>
  );
}
