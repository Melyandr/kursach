//import React, { useEffect, useState } from "react";
//import "../styles/subscriptions.css";
//
//function Subscriptions() {
//  const [channels, setChannels] = useState([]);
//  const [selectedChannel, setSelectedChannel] = useState(null);
//  const [articles, setArticles] = useState([]);
//  const [error, setError] = useState(null);
//
//  const token = localStorage.getItem("token");
//
//  // ✅ Завантаження списку каналів
//  useEffect(() => {
//    const fetchChannels = async () => {
//      try {
//        const res = await fetch("http://127.0.0.1:8000/api/channels/", {
//          headers: {
//            "Content-Type": "application/json",
//            ...(token && { Authorization: `Bearer ${token}` }),
//          },
//        });
//
//        if (!res.ok) {
//          const text = await res.text();
//          console.error("Fetch channels failed:", res.status, text);
//          setError("Не вдалося завантажити канали.");
//          return;
//        }
//
//        const data = await res.json();
//        console.log("Channels data:", data);
//
//        // Підтримка API, що повертає {results: [...]} або масив
//        const channelList = Array.isArray(data) ? data : data.results || [];
//        setChannels(channelList);
//      } catch (err) {
//        console.error("Fetch channels error:", err);
//        setError("Помилка при завантаженні каналів.");
//      }
//    };
//
//    fetchChannels();
//  }, [token]);
//
//  // ✅ Перемикання підписки
//  const toggleSubscription = async (channelId, isSubscribed) => {
//    try {
//      const url = `http://127.0.0.1:8000/api/channels/${channelId}/${
//        isSubscribed ? "unsubscribe" : "subscribe"
//      }/`;
//
//      const res = await fetch(url, {
//        method: "POST",
//        headers: {
//          "Content-Type": "application/json",
//          ...(token && { Authorization: `Bearer ${token}` }),
//        },
//      });
//
//      if (!res.ok) {
//        const text = await res.text();
//        console.error("Toggle subscription failed:", res.status, text);
//        setError("Не вдалося змінити підписку.");
//        return;
//      }
//
//      // Оновлення локального стану каналів
//      setChannels((prev) =>
//        prev.map((c) =>
//          c.id === channelId ? { ...c, is_subscribed: !isSubscribed } : c
//        )
//      );
//    } catch (err) {
//      console.error("Помилка при зміні підписки:", err);
//      setError("Помилка при зміні підписки.");
//    }
//  };
//
//  // ✅ Відкрити статті конкретного каналу
//  const openChannel = async (channelId) => {
//    setSelectedChannel(channelId);
//    try {
//      const res = await fetch(
//        `http://127.0.0.1:8000/api/channels/${channelId}/articles/`,
//        {
//          headers: {
//            "Content-Type": "application/json",
//            ...(token && { Authorization: `Bearer ${token}` }),
//          },
//        }
//      );
//
//      if (!res.ok) {
//        const text = await res.text();
//        console.error("Fetch articles failed:", res.status, text);
//        setError("Не вдалося завантажити статті каналу.");
//        return;
//      }
//
//      const data = await res.json();
//      console.log("Articles data:", data);
//
//      const articlesList = Array.isArray(data) ? data : data.results || [];
//      setArticles(articlesList);
//    } catch (err) {
//      console.error("Fetch articles error:", err);
//      setError("Не вдалося завантажити статті каналу.");
//    }
//  };
//
//  return (
//    <div className="subscriptions-container">
//      <h2>Підписки</h2>
//    {/* Діагностика: показуємо вміст channels */}
//    <pre>{JSON.stringify(channels, null, 2)}</pre>
//      {error && <p className="error">{error}</p>}
//
//      {!selectedChannel ? (
//        <ul className="channel-list">
//          {channels.map((ch) => (
//            <li key={ch.id} className="channel-item">
//              <span
//                className="channel-name"
//                onClick={() => openChannel(ch.id)}
//              >
//                {ch.name || "Без назви"}
//              </span>
//              <button
//                className={`subscribe-btn ${
//                  ch.is_subscribed ? "unsubscribe" : "subscribe"
//                }`}
//                onClick={() => toggleSubscription(ch.id, ch.is_subscribed)}
//              >
//                {ch.is_subscribed ? "Відписатись" : "Підписатись"}
//              </button>
//            </li>
//          ))}
//        </ul>
//      ) : (
//        <div>
//          <button className="back-btn" onClick={() => setSelectedChannel(null)}>
//            ← Назад
//          </button>
//          <h3>Статті каналу</h3>
//          {articles.length === 0 ? (
//            <p>У цього каналу поки немає статей.</p>
//          ) : (
//            <ul className="articles-list">
//              {articles.map((a) => (
//                <li key={a.id}>
//                  <h4>{a.title || "Без назви"}</h4>
//                  <p>{a.excerpt || (a.content ? a.content.substring(0, 120) + "..." : "")}</p>
//                </li>
//              ))}
//            </ul>
//          )}
//        </div>
//      )}
//    </div>
//  );
//}
//
//export default Subscriptions;
import React, { useEffect, useState } from "react";
import "../styles/subscriptions.css";

function Subscriptions() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Завантаження каналів
  useEffect(() => {
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

    fetchChannels();
  }, [token]);

  // Відкрити статті каналу
  const openChannel = async (channelId) => {
    setSelectedChannel(channelId);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/channels/${channelId}/articles/`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      if (!res.ok) throw new Error("Не вдалося завантажити статті каналу");
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Підписка / Відписка
  const toggleSubscription = async (channelId, isSubscribed) => {
    try {
      const url = `http://127.0.0.1:8000/api/channels/${channelId}/${
        isSubscribed ? "unsubscribe" : "subscribe"
      }/`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error("Помилка підписки");

      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === channelId ? { ...ch, is_subscribed: !isSubscribed } : ch
        )
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="subscriptions-container">
      <h2>Підписки</h2>
      {error && <p className="error">{error}</p>}

      {!selectedChannel ? (
        <>
          {channels.length === 0 ? (
            <p>Поки немає каналів</p>
          ) : (
            <ul className="channel-list">
              {channels.map((ch) => (
                <li key={ch.id} className="channel-item">
                  <span
                    className="channel-name"
                    onClick={() => openChannel(ch.id)}
                  >
                    {ch.name}
                  </span>
                  <button
                    className={`subscribe-btn ${
                      ch.is_subscribed ? "unsubscribe" : "subscribe"
                    }`}
                    onClick={() => toggleSubscription(ch.id, ch.is_subscribed)}
                  >
                    {ch.is_subscribed ? "Відписатись" : "Підписатись"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div>
          <button onClick={() => setSelectedChannel(null)}>← Назад</button>
          <h3>Статті каналу</h3>
          {articles.length === 0 ? (
            <p>У цього каналу поки немає статей.</p>
          ) : (
            <ul className="articles-list">
              {articles.map((a) => (
                <li key={a.id}>
                  <h4>{a.title}</h4>
                  <p>{a.excerpt || (a.content?.substring(0, 120) + "...")}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Subscriptions;
