//import React, { useEffect, useState } from "react";
//import "../styles/home.css";
//
//function Home() {
//  const [articles, setArticles] = useState([]);
//
//  useEffect(() => {
//    fetch("http://127.0.0.1:8000/api/articles/recent/")
//      .then((res) => res.json())
//      .then((data) => setArticles(data))
//      .catch((err) => console.error("Помилка:", err));
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
import React, { useEffect, useState } from "react";
import "../styles/home.css";

function Home() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/articles/recent/")
      .then((res) => res.json())
      .then((data) => setArticles(data))
      .catch((err) => console.error("Помилка:", err));
  }, []);

  // Функція для отримання коректного шляху до зображення
  const getImageUrl = (img) => {
    if (!img) return null;
    return img.startsWith("http") ? img : `http://127.0.0.1:8000${img}`;
  };

  return (
    <div className="home-container">
      <h2 className="home-title">Статті за місяць</h2>
      {articles.length === 0 ? (
        <p>Немає статей за останній місяць.</p>
      ) : (
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
      )}
    </div>
  );
}

export default Home;
