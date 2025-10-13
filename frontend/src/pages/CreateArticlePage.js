// src/pages/CreateArticlePage.js
import React, { useState } from "react";
import "../styles/CreateArticlesAdmin.css";

function CreateArticlePage() {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    status: "draft",
    type: "standard",
    category: "sport",
    is_premium: false,
    image: null,
  });

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    try {
      const res = await fetch("http://127.0.0.1:8000/api/articles/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (res.ok) {
        alert("✅ Статтю успішно створено!");
        window.location.href = "/";
      } else {
        const err = await res.json();
        console.error("Помилка:", err);
        alert(`Помилка при створенні статті: ${JSON.stringify(err)}`);
      }
    } catch (error) {
      console.error("Помилка запиту:", error);
    }
  };

  return (
    <div className="create-article-container">
      <h2 className="create-article-title">Створити нову статтю</h2>
      <form
        className="create-article-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <input
          type="text"
          name="title"
          className="create-article-input"
          placeholder="Заголовок"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="slug"
          className="create-article-input"
          placeholder="Slug (унікальний URL)"
          value={formData.slug}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          className="create-article-textarea"
          placeholder="Основний текст"
          rows="6"
          value={formData.content}
          onChange={handleChange}
          required
        />
        <textarea
          name="excerpt"
          className="create-article-textarea"
          placeholder="Короткий опис"
          rows="3"
          value={formData.excerpt}
          onChange={handleChange}
        />

        <label>Статус:</label>
        <select
          name="status"
          className="create-article-select"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="draft">Чернетка</option>
          <option value="published">Опубліковано</option>
        </select>

        <label>Тип:</label>
        <select
          name="type"
          className="create-article-select"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="standard">Звичайна</option>
          <option value="interactive">Інтерактивна</option>
        </select>

        <label>Категорія:</label>
        <select
          name="category"
          className="create-article-select"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="sport">Спорт</option>
          <option value="fashion">Мода</option>
          <option value="News">Новини</option>
        </select>

        <label>
          <input
            type="checkbox"
            name="is_premium"
            checked={formData.is_premium}
            onChange={handleChange}
          />
          Преміум стаття
        </label>

        <label>Картинка:</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          className="create-article-input"
          onChange={handleChange}
        />

        <button type="submit" className="create-article-button">
          Створити
        </button>
      </form>
    </div>
  );
}

export default CreateArticlePage;
