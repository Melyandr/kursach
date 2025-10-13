import { useEffect, useState } from "react";
import API from "../api";

function ArticlesList() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    API.get("/articles/")
      .then((res) => setArticles(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Список статей</h1>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <h3>{article.title}</h3>
            <p>{article.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ArticlesList;
