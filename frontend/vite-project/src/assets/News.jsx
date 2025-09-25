import React, { useEffect, useState } from "react";

function News() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://influezone.onrender.com/api/news/top-headlines")
      .then((res) => res.json())
      .then((data) => {
        if (data.articles) {
          setArticles(data.articles);
        } else {
          setError("No articles found");
        }
      })
      .catch((err) => setError("Failed to fetch news: " + err.message));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">📰 Latest Business News</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {articles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((news, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
            >
              {news.urlToImage ? (
                <img
                  src={news.urlToImage}
                  alt={news.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              <div className="p-4 flex flex-col justify-between h-56">
                <div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {news.description || "No description available."}
                  </p>
                </div>
                <a
                  href={news.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-medium hover:underline mt-auto"
                >
                  🔗 Read more
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !error && <p className="text-center text-gray-500">Loading news...</p>
      )}
    </div>
  );
}

export default News;
