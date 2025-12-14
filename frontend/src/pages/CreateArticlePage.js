import React, { useState, useEffect } from "react";
import "../styles/CreateArticlesAdmin.css";

export default function CreateArticlePage() {
const [mode, setMode] = useState("standard"); // standard / channel
const [title, setTitle] = useState("");
const [content, setContent] = useState("");
const [excerpt, setExcerpt] = useState("");
const [isPremium, setIsPremium] = useState(false);
const [category, setCategory] = useState("sport");
const [channels, setChannels] = useState([]);
const [selectedChannel, setSelectedChannel] = useState("");
const [image, setImage] = useState(null);
const [message, setMessage] = useState("");
const token = localStorage.getItem("token");

useEffect(() => {
  const fetchChannels = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/channels/", {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        console.error("Помилка завантаження каналів:", res.status);
        setChannels([]);
        return;
      }

      const data = await res.json();
      console.log("Завантажено каналів:", data);
      setChannels(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Помилка при завантаженні каналів:", err);
      setChannels([]);
    }
  };

  fetchChannels();
}, [token]);

const handleSubmit = async (e) => {
e.preventDefault();
setMessage("");


const articleType = mode === "standard" ? "standard" : "interactive";
const formData = new FormData();

formData.append("title", title);
formData.append("content", content);
formData.append("excerpt", excerpt);
formData.append("type", articleType);

if (articleType === "standard") {
  formData.append("category", category);
  formData.append("is_premium", isPremium);
} else {
  if (!selectedChannel) {
    setMessage(" Будь ласка, оберіть канал для статті");
    return;
  }
  // Важливо: відправляємо числове значення channel
  formData.append("channel", parseInt(selectedChannel));
}

if (image) formData.append("image", image);

try {
  const res = await fetch("http://127.0.0.1:8000/api/articles/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  setMessage(" Статтю успішно створено!");
  setTitle("");
  setContent("");
  setExcerpt("");
  setIsPremium(false);
  setCategory("sport");
  setSelectedChannel("");
  setImage(null);
} catch (err) {
  console.error("Помилка створення:", err);
  setMessage(" Не вдалося створити статтю");
}


};

return ( <div className="create-article-container"> <h2>Створити статтю</h2> <form onSubmit={handleSubmit} className="create-article-form"> <label>
Тип статті:
<select className="input" value={mode} onChange={(e) => setMode(e.target.value)}> <option value="standard">Звичайна стаття</option> <option value="channel">Стаття для каналу</option> </select> </label>


    <input
      className="input"
      type="text"
      placeholder="Заголовок"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      required
    />

    <textarea
      className="input create-article-textarea"
      placeholder="Текст статті"
      value={content}
      onChange={(e) => setContent(e.target.value)}
      required
    />

    <textarea
      className="input create-article-textarea"
      placeholder="Короткий опис"
      value={excerpt}
      onChange={(e) => setExcerpt(e.target.value)}
    />

    {mode === "standard" && (
      <>
        <label>
          Категорія:
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="sport">Спорт</option>
            <option value="fashion">Мода</option>
            <option value="News">Новини</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
          />
          Преміум
        </label>
      </>
    )}

    {mode === "channel" && (
        <label>
          Виберіть канал:
          <select
            className="input"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            required
          >
          <option value="">-- Оберіть канал --</option>
          {channels.length === 0 ? (
            <option value="" disabled>Немає доступних каналів</option>
          ) : (
            channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name || `Канал ${ch.id}`}
              </option>
            ))
          )}
        </select>
        {channels.length === 0 && (
          <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
            Канали не завантажені. Перевірте консоль на помилки.
          </small>
        )}
      </label>
    )}

    <label>
      Зображення:
      <input className="input" type="file" onChange={(e) => setImage(e.target.files[0])} />
    </label>

    <button className="btn btn-primary" type="submit">Створити</button>
    {message && <p>{message}</p>}
  </form>
</div>


);
}
