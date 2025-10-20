//
//
//import React, { useEffect, useState } from "react";
//import "../styles/home.css";
//
//function Home() {
//  const getImageUrl = (imagePath) => {
//    if (!imagePath) return "";
//    if (imagePath.startsWith("http")) return imagePath;
//    return `http://127.0.0.1:8000${imagePath}`;
//  };
//
//  const [articles, setArticles] = useState([]);
//
//  useEffect(() => {
//    const fetchRecent = async () => {
//      const token = localStorage.getItem("token");
//
//      const res = await fetch("http://127.0.0.1:8000/api/articles/recent/", {
//        headers: {
//          "Content-Type": "application/json",
//          ...(token && { Authorization: `Bearer ${token}` }),
//        },
//      });
//
//      const data = await res.json();
//      setArticles(data);
//    };
//
//    fetchRecent();
//  }, []);
//
//  return (
//    <div className="home-container">
//      <h2 className="home-title">Статті за місяць</h2>
//      {articles.length === 0 ? (
//        <p>Немає статей за останній місяць.</p>
//      ) : (
//        <ul className="articles-list">
//          {articles.map((a) => (
//            <li key={a.id} className="article-card">
//              {a.image && (
//                <img
//                  src={getImageUrl(a.image)}
//                  alt={a.title}
//                  className="article-image"
//                />
//              )}
//              <h3 className="article-title">{a.title}</h3>
//              <p className="article-excerpt">
//                {a.excerpt || a.content.substring(0, 120) + "..."}
//              </p>
//              <div className="article-meta">
//                {a.category} | {new Date(a.created_at).toLocaleDateString()}
//              </div>
//            </li>
//          ))}
//        </ul>
//      )}
//    </div>
//  );
//}
//
//export default Home;
//
import React, { useEffect, useState } from "react";
import "../styles/home.css";

function Home() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  // Функція формування URL зображення
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://127.0.0.1:8000${imagePath}`;
  };

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://127.0.0.1:8000/api/articles/recent/", {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        // якщо користувач не авторизований
        if (res.status === 401) {
          setError("Потрібно увійти, щоб побачити статті.");
          setArticles([]); // очищаємо попередні
          return;
        }

        const data = await res.json();

        // перевірка, щоб не було помилки при map()
        if (Array.isArray(data)) {
          setArticles(data);
        } else {
          setError("Некоректна відповідь сервера.");
          setArticles([]);
        }
      } catch (err) {
        console.error("Помилка при завантаженні статей:", err);
        setError("Не вдалося зʼєднатися з сервером.");
      }
    };

    fetchRecent();
  }, []);

  return (
    <div className="home-container">
      <h2 className="home-title">Статті за місяць</h2>

      {error ? (
        <p className="error-message">{error}</p>
      ) : Array.isArray(articles) && articles.length > 0 ? (
        <ul className="articles-list">
          {articles.map((a) => (
            <li key={a.id} className="article-card">
              {/* 🖼️ Фото */}
              {a.image && (
                <img
                  src={getImageUrl(a.image)}
                  alt={a.title}
                  className="article-image"
                />
              )}

              <h3 className="article-title">{a.title}</h3>
              <p className="article-excerpt">
                {a.excerpt || a.content.substring(0, 120) + "..."}
              </p>
              <div className="article-meta">
                {a.category} | {new Date(a.created_at).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Немає статей за останній місяць.</p>
      )}
    </div>
  );
}

export default Home;
