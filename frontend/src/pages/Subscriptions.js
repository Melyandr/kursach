import React, { useEffect, useState } from "react";
import "../styles/subscriptions.css";
import "../styles/components.css";
import "../styles/CreateArticlesAdmin.css";

function Subscriptions() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [content, setContent] = useState([]);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [editingChannel, setEditingChannel] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_staff") === "true";

  // === 1️⃣ Завантаження користувача ===
  useEffect(() => {
    if (!token) {
      setLoadingUser(false);
      return;
    }

    fetch("http://127.0.0.1:8000/api/users/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data))
      .catch(console.error)
      .finally(() => setLoadingUser(false));
  }, [token]);

  // === 2️⃣ Завантаження каналів ===
  const fetchChannels = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/channels/", {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error("Помилка завантаження каналів");
      const data = await res.json();
      setChannels(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError("Не вдалося завантажити канали");
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [token]);

  // === 3️⃣ Відкриття каналу ===
  const openChannel = async (channelId) => {
    setSelectedChannel(channelId);
    setError(null);

    try {
      const [articlesRes, pollsRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/channels/${channelId}/articles/`, {
          headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        }),
        fetch(`http://127.0.0.1:8000/api/channels/${channelId}/polls/`, {
          headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        }),
      ]);

      if (!articlesRes.ok || !pollsRes.ok) throw new Error("Не вдалося завантажити контент каналу");

      const articles = await articlesRes.json();
      const polls = await pollsRes.json();

      const combined = [
        ...articles.map((a) => ({ ...a, contentType: "article", created_at: a.created_at || a.publish_date })),
        ...polls.map((p) => ({ ...p, contentType: "poll", created_at: p.created_at })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setContent(combined);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setContent([]);
    }
  };

  // === 4️⃣ Підписка / відписка ===
  const toggleSubscription = async (channelId, isSubscribed) => {
    try {
      const url = `http://127.0.0.1:8000/api/channels/${channelId}/${isSubscribed ? "unsubscribe" : "subscribe"}/`;
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) } });
      if (!res.ok) throw new Error("Помилка підписки");
      setChannels((prev) => prev.map((ch) => (ch.id === channelId ? { ...ch, is_subscribed: !isSubscribed } : ch)));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };
const handleDeleteArticle = async (articleId) => {
  if (!window.confirm("Видалити статтю?")) return;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/articles/${articleId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // намагаємося прочитати тіло відповіді
      let errorText;
      try {
        const data = await res.json();
        errorText = data.detail || JSON.stringify(data); // Django REST часто повертає "detail"
      } catch {
        errorText = await res.text(); // якщо не JSON, просто текст
      }
      throw new Error(`Серверна помилка: ${res.status} ${res.statusText} — ${errorText}`);
    }

    // Видаляємо статтю зі стану
    setContent((prev) => prev.filter((item) => !(item.contentType === "article" && item.id === articleId)));
  } catch (err) {
    console.error("Помилка видалення статті:", err);
    setError(err.message);
  }
};


  // === 5️⃣ Голосування у опитуваннях ===
  const handleVote = async (pollId, choiceId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/polls/${pollId}/vote/${choiceId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Помилка голосування");
      }

      const updatedChoice = await res.json();

      setContent((prev) =>
        prev.map((item) => {
          if (item.contentType === "poll" && item.id === pollId) {
            return {
              ...item,
              has_voted: true,
              choices: item.choices.map((c) =>
                c.id === choiceId ? { ...c, votes: updatedChoice.choice_votes } : c
              ),
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // === 6️⃣ Видалення опитування (для адміна) ===
  const handleDeletePoll = async (pollId) => {
    if (!window.confirm("Видалити опитування?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/polls/${pollId}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (!res.ok) throw new Error("Не вдалося видалити опитування");
      setContent((prev) => prev.filter((item) => !(item.contentType === "poll" && item.id === pollId)));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // === 7️⃣ Створення каналу (для адміна) ===
  const handleCreateChannel = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    if (!formData.name.trim()) {
      setError("Назва каналу обов'язкова");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/channels/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || data.name?.[0] || "Помилка створення каналу");
        return;
      }

      setMessage("Канал успішно створено!");
      setFormData({ name: "", description: "" });
      setShowCreateForm(false);
      fetchChannels();
    } catch (err) {
      console.error("Помилка створення каналу:", err);
      setError("Помилка створення каналу, спробуйте ще раз");
    }
  };

  // === 8️⃣ Редагування каналу (для адміна) ===
  const handleEditChannel = (channel) => {
    setEditingChannel(channel.id);
    setFormData({ name: channel.name, description: channel.description || "" });
    setShowCreateForm(true);
    setError(null);
    setMessage("");
  };

  const handleUpdateChannel = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    if (!formData.name.trim()) {
      setError("Назва каналу обов'язкова");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/channels/${editingChannel}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || data.name?.[0] || "Помилка оновлення каналу");
        return;
      }

      setMessage("Канал успішно оновлено!");
      setFormData({ name: "", description: "" });
      setEditingChannel(null);
      setShowCreateForm(false);
      fetchChannels();
    } catch (err) {
      console.error("Помилка оновлення каналу:", err);
      setError("Помилка оновлення каналу, спробуйте ще раз");
    }
  };

  // === 9️⃣ Видалення каналу (для адміна) ===
  const handleDeleteChannel = async (channelId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей канал?")) {
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/channels/${channelId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Не вдалося видалити канал");
      }

      setMessage("Канал успішно видалено!");
      setChannels((prev) => prev.filter((ch) => ch.id !== channelId));
      if (selectedChannel === channelId) {
        setSelectedChannel(null);
        setContent([]);
      }
    } catch (err) {
      console.error("Помилка видалення каналу:", err);
      setError("Помилка видалення каналу");
    }
  };

  return (
    <div className="subscriptions-container">
      <h2>Підписки</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {loadingUser ? (
        <p>Завантаження користувача...</p>
      ) : !selectedChannel ? (
        <>
          {isAdmin && (
            <>
              {!showCreateForm ? (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowCreateForm(true);
                    setEditingChannel(null);
                    setFormData({ name: "", description: "" });
                    setError(null);
                    setMessage("");
                  }}
                  style={{ marginBottom: "var(--spacing-lg)" }}
                >
                  + Створити новий канал
                </button>
              ) : (
                <div className="card" style={{ marginBottom: "var(--spacing-lg)" }}>
                  <h3>{editingChannel ? "Редагувати канал" : "Створити новий канал"}</h3>
                  <form onSubmit={editingChannel ? handleUpdateChannel : handleCreateChannel}>
                    <label>
                      Назва каналу:
                      <input
                        className="input"
                        type="text"
                        placeholder="Введіть назву каналу"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </label>

                    <label>
                      Опис каналу (опціонально):
                      <textarea
                        className="input create-article-textarea"
                        placeholder="Введіть опис каналу"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </label>

                    <div style={{ display: "flex", gap: "var(--spacing-sm)", marginTop: "var(--spacing-md)" }}>
                      <button className="btn btn-primary" type="submit">
                        {editingChannel ? "Зберегти зміни" : "Створити канал"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingChannel(null);
                          setFormData({ name: "", description: "" });
                          setError(null);
                          setMessage("");
                        }}
                      >
                        Скасувати
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

          <ul className="channel-list">
            {channels.length === 0 ? (
              <p>Поки немає каналів</p>
            ) : (
              channels.map((ch) => (
                <li key={ch.id} className="channel-item">
                  <span className="channel-name" onClick={() => openChannel(ch.id)}>
                    {ch.name || "Без назви"}
                  </span>
                  <div style={{ display: "flex", gap: "var(--spacing-sm)", alignItems: "center" }}>
                    {isAdmin && (
                      <>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditChannel(ch);
                          }}
                          title="Редагувати канал"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChannel(ch.id);
                          }}
                          title="Видалити канал"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                    <button
                      className={`subscribe-btn ${ch.is_subscribed ? "unsubscribe" : "subscribe"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubscription(ch.id, ch.is_subscribed);
                      }}
                    >
                      {ch.is_subscribed ? "Відписатись" : "Підписатись"}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </>
      ) : (
        <div>
          <button className="back-btn" onClick={() => setSelectedChannel(null)}>
            ← Назад
          </button>
          <h3>Зміст каналу</h3>

          {content.length === 0 ? (
            <div className="empty-content">
              <p>Контент відсутній</p>
            </div>
          ) : (
            content.map((item) =>
              item.contentType === "article" ? (
                <div key={item.id} className="article-card">
                  {item.image && (
                    <img
                      src={item.image.startsWith("http") ? item.image : `http://127.0.0.1:8000${item.image}`}
                      alt={item.title}
                      className="article-image"
                    />
                  )}
                  <div className="article-content">
                    <h4>{item.title || "(Без назви)"}</h4>
                    <p>Автор: {item.author_name || "Невідомий"}</p>
                    {item.category && <p>Категорія: {item.category}</p>}
                    {item.created_at && (
                      <p>Опубліковано: {new Date(item.created_at).toLocaleDateString("uk-UA")}</p>
                    )}
                    <p className="article-content-text">{item.content || "(Без контенту)"}</p>
                    {isAdmin && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteArticle(item.id)}
                        style={{ marginTop: 'var(--spacing-md)', alignSelf: 'flex-start' }}
                      >
                        Видалити статтю
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div key={item.id} className="poll-card">
                  <h4 className="poll-question">{item.question}</h4>
                  
                  {(() => {
                    const totalVotes = item.choices.reduce((sum, c) => sum + (c.votes || 0), 0);
                    return (
                      <>
                        <div className="poll-total-votes">
                          Всього голосів: <strong>{totalVotes}</strong>
                        </div>
                        <div className="poll-stats">
                          {item.choices.map((c) => {
                        const votes = c.votes || 0;
                        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                        return (
                          <div key={c.id} className="poll-choice-item">
                            <div className="poll-choice-header">
                              <span className="choice-text">{c.text}</span>
                              <span className="choice-votes">
                                {votes} {votes === 1 ? 'голос' : votes < 5 ? 'голоси' : 'голосів'} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="poll-progress-bar">
                              <div 
                                className="poll-progress-fill" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            {!item.has_voted && (
                              <button 
                                className="vote-btn"
                                onClick={() => handleVote(item.id, c.id)}
                              >
                                Голосувати
                              </button>
                            )}
                          </div>
                          );
                        })}
                        </div>
                      </>
                    );
                  })()}

                  {localStorage.getItem("is_staff") === "true" && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeletePoll(item.id)}
                      style={{ marginTop: 'var(--spacing-md)' }}
                    >
                      Видалити опитування
                    </button>
                  )}
                </div>
              )
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Subscriptions;
