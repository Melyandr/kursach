import React, { useState, useEffect } from "react";
import { createPoll } from "../services/pollService";
import "../styles/CreateArticlesAdmin.css";
import "../styles/components.css";
import "../styles/CreatePoll.css";

export default function CreatePollPage() {
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState(["", ""]); // два порожні поля для початку
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // Завантаження каналів
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/channels/", {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((data) => setChannels(Array.isArray(data) ? data : data.results || []))
      .catch((err) => console.error("Помилка завантаження каналів:", err));
  }, [token]);

  const handleChoiceChange = (index, value) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const removeChoice = (index) => {
    if (choices.length > 2) {
      const newChoices = choices.filter((_, i) => i !== index);
      setChoices(newChoices);
    }
  };

  const addChoice = () => setChoices([...choices, ""]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedChannel) {
      setError("Будь ласка, оберіть канал");
      return;
    }

    if (choices.filter(c => c.trim()).length < 2) {
      setError("Потрібно мінімум 2 варіанти відповіді");
      return;
    }

    try {
      await createPoll(
        { question, channelId: selectedChannel, choices: choices.filter(c => c.trim()) },
        token
      );
      setMessage("Опитування успішно створено!");
      setQuestion("");
      setChoices(["", ""]);
      setSelectedChannel("");
    } catch (err) {
      console.error("Помилка створення опитування:", err);
      setError("Не вдалося створити опитування");
    }
  };

  return (
    <div className="create-article-container">
      <h2 className="create-article-title">Створити опитування</h2>
      
      {error && <div className="create-article-message error">{error}</div>}
      {message && <div className="create-article-message success">{message}</div>}
      
      <form onSubmit={handleSubmit} className="create-article-form">
        <label>
          Питання:
          <input
            className="input"
            type="text"
            placeholder="Введіть питання опитування"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </label>

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
                  {ch.name}
                </option>
              ))
            )}
          </select>
        </label>

        <div className="choices-section">
          <label>Варіанти відповіді:</label>
          {choices.map((c, idx) => (
            <div key={idx} className="choice-row">
              <input
                className="input"
                type="text"
                placeholder={`Варіант ${idx + 1}`}
                value={c}
                onChange={(e) => handleChoiceChange(idx, e.target.value)}
                required
              />
              {choices.length > 2 && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => removeChoice(idx)}
                  title="Видалити варіант"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={addChoice}
          >
            + Додати варіант
          </button>
        </div>

        <button className="btn btn-primary create-article-button" type="submit">
          Створити опитування
        </button>
      </form>
    </div>
  );
}
