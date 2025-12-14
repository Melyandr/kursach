import React, { useState, useEffect } from "react";

export default function ChannelContent({ channelId }) {
  const [articles, setArticles] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchContent = async () => {
    setLoading(true);
    setError(null);

    try {
      // Статті через ChannelViewSet action
      const articlesRes = await fetch(
        `http://127.0.0.1:8000/api/channels/${channelId}/articles/`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      if (!articlesRes.ok) throw new Error("Не вдалося завантажити статті");
      const articlesData = await articlesRes.json();
      setArticles(articlesData);

      // Опитування через ChannelViewSet action
      const pollsRes = await fetch(
        `http://127.0.0.1:8000/api/channels/${channelId}/polls/`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      if (!pollsRes.ok) throw new Error("Не вдалося завантажити опитування");
      const pollsData = await pollsRes.json();
      setPolls(pollsData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [channelId]);

  const handleVote = async (pollId, choiceId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/polls/${pollId}/vote/${choiceId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Не вдалося проголосувати");
      }

      setPolls((prevPolls) =>
        prevPolls.map((p) =>
          p.id === pollId
            ? {
                ...p,
                choices: p.choices.map((c) =>
                  c.id === choiceId ? { ...c, votes: c.votes + 1 } : c
                ),
              }
            : p
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p style={{ color: "red" }}>Помилка: {error}</p>;

  return (
    <div>
      <h2>Статті каналу</h2>
      {articles.length === 0 ? (
        <p>Статей немає</p>
      ) : (
        <ul>
          {articles.map((a) => (
            <li key={a.id}>
              <strong>{a.title}</strong>
              <p>{a.excerpt}</p>
            </li>
          ))}
        </ul>
      )}

      <h2>Опитування каналу</h2>
      {polls.length === 0 ? (
        <p>Опитувань немає</p>
      ) : (
        <ul>
          {polls.map((p) => (
            <li key={p.id} style={{ marginBottom: "1em" }}>
              <strong>{p.question}</strong>
              <ul>
                {p.choices.map((c) => (
                  <li key={c.id}>
                    {c.text} ({c.votes} голосів){" "}
                    <button onClick={() => handleVote(p.id, c.id)}>
                      Проголосувати
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
