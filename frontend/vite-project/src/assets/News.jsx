import React, { useEffect, useState } from "react";

function News() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
fetch("http://localhost:5000/top-headlines")
  .then(res => res.json())
  .then(data => setArticles(data.articles));

  }, []);

  return (
    <div>
      <h2>Latest News</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {articles.length > 0 ? (
        articles.map((news, index) => (
          <div key={index} style={{ borderBottom: "1px solid #ccc", margin: "10px 0" }}>
            <h3>{news.title}</h3>
            <p>{news.description}</p>
            <a href={news.url} target="_blank" rel="noreferrer">
              Read more
            </a>
          </div>
        ))
      ) : (
        !error && <p>Loading news...</p>
      )}
    </div>
  );
}

export default News;
