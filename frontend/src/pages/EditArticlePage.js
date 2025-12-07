import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// можна використати той самий стиль

function EditArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const res = await fetch(`http://127.0.0.1:8000/api/articles/${id}/`);
      const data = await res.json();
      setTitle(data.title);
      setContent(data.content);
      setCategory(data.category);
      if (data.image) setPreview(data.image);
    };
    fetchArticle();
  }, [id]);

const handleUpdate = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  if (image) formData.append("image", image);

  const res = await fetch(`http://127.0.0.1:8000/api/articles/${id}/`, {
    method: "PATCH", // 👈 змінено з PUT на PATCH
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("❌ Помилка при оновленні:", err);
    alert(`Помилка при оновленні: ${JSON.stringify(err)}`);
    return;
  }

  alert("✅ Статтю оновлено!");
  navigate("/");
};

  return (
    <div className="create-article-container">
      <h2>✏️ Редагування статті</h2>
      <form onSubmit={handleUpdate} className="create-article-form">
        <label>Заголовок</label>
        <input
          className="input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Текст статті</label>
        <textarea
          className="input create-article-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <label>Категорія</label>
        <input
          className="input"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <label>Зображення</label>
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{
              width: "200px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          />
        )}
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button className="btn btn-primary" type="submit">💾 Зберегти зміни</button>
      </form>
    </div>
  );
}

export default EditArticlePage;
