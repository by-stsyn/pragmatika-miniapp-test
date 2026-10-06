import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/fetch-news")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        // Сортировка по дате (новые сверху)
        const sorted = items.sort(
          (a, b) => new Date(b.pubDate || b.date) - new Date(a.pubDate || a.date)
        );
        setNews(sorted);
      })
      .catch((err) => {
        console.error("Ошибка загрузки новостей:", err);
        setNews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // форматирование даты (только день.месяц.год)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Кнопка Назад */}
      <button onClick={() => navigate("/")} className="text-blue-600 flex items-center mb-4">
        <ArrowLeft className="mr-2" /> Назад
      </button>

      {/* Заголовок */}
      <h1 className="text-2xl font-semibold mb-2 text-center">
        Новости Прагматика
      </h1>

      {/* Надпись Загрузка */}
      {loading && (
       <Preloader />
      )}

      {/* Если новостей нет */}
      {!loading && !news.length && (
        <div className="text-center text-gray-500 mb-4">Новостей пока нет</div>
      )}

      {/* Список новостей */}
      {!loading && news.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {news.map((item, idx) => (
            <div
              key={idx}
              className="bg-white shadow rounded-2xl overflow-hidden flex flex-col"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                  Без фото
                </div>
              )}
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
                <p className="text-sm text-gray-500 mb-3">
                  {formatDate(item.pubDate || item.date)}
                </p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center p-2 bg-[#8cc63f] text-white rounded hover:bg-[#7ab82c]"
                >
                  Подробнее
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      	     <BottomNav />
    </div>
    	 
  );
}





