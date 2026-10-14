import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Newspaper,
  Sparkles,
  Search,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Подключение нативной кнопки "Назад" в Telegram WebApp
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.BackButton) {
      tg.BackButton.show();
      const onBack = () => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate("/");
        }
      };
      tg.BackButton.onClick(onBack);
      return () => {
        tg.BackButton.offClick(onBack);
        tg.BackButton.hide();
      };
    }
  }, [navigate]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    fetch("/api/fetch-news")
      .then((res) => res.json())
      .then((data) => {
        // Сортировка по дате (новые сверху)
        const sorted = data.sort(
          (a, b) => new Date(b.pubDate || b.date) - new Date(a.pubDate || a.date)
        );
        setNews(sorted);
      })
      .catch((err) => console.error("Ошибка загрузки новостей:", err))
      .finally(() => setLoading(false));
  }, []);

  // Форматирование даты (день.месяц.год)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Открытие ссылки с поддержкой Telegram WebApp openLink
  const handleOpenLink = (url, e) => {
    if (!url) return;
    const tg = window.Telegram?.WebApp;
    if (tg?.openLink) {
      e.preventDefault();
      tg.openLink(url);
    }
  };

  // Фильтрация по поисковому запросу
  const filteredNews = news.filter((item) => {
    if (!searchQuery.trim()) return true;
    return item.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased pb-28">
      {/* Шапка страницы */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors active:scale-95"
            aria-label="Назад"
          >
            <ArrowLeft size={16} className="text-slate-500" />
            <span>Назад</span>
          </button>

          <div className="text-center">
            <h1 className="text-sm font-bold text-slate-900">Новости</h1>
            <p className="text-[10px] text-slate-500 font-medium">
              Пресс-центр Прагматика
            </p>
          </div>

          <div className="w-16 flex justify-end">
            {!loading && (
              <span className="text-[11px] font-semibold text-lime-700 bg-lime-50 px-2 py-0.5 rounded-full border border-lime-200">
                {news.length}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Основной контейнер */}
      <div className="max-w-md mx-auto px-4 pt-3.5 space-y-4">
        {/* Баннер / Интро заголовок */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-28 h-28 bg-[#8cc63f]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-[11px] font-medium text-lime-300 mb-2 border border-white/10">
              <Sparkles size={12} />
              <span>События и новости</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Новости Прагматика
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Главные события автохолдинга, обзоры новых поступлений и важные объявления
            </p>
          </div>
        </div>

        {/* Поиск по новостям */}
        {!loading && news.length > 3 && (
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по новостям..."
              className="w-full pl-9 pr-8 py-2 bg-white rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-slate-800 placeholder-slate-400 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Очистить поиск"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {/* Загрузка */}
        {loading && <Preloader />}

        {/* Если новостей нет */}
        {!loading && filteredNews.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Newspaper size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {searchQuery ? "По вашему запросу ничего не найдено" : "Новостей пока нет"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-[#65a30d] font-semibold hover:underline"
              >
                Сбросить поиск
              </button>
            )}
          </div>
        )}

        {/* Список новостей */}
        {!loading && filteredNews.length > 0 && (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredNews.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                {/* Изображение с датой-бейджем */}
                <div className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || "Новость"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                      <Newspaper size={28} className="text-slate-300" />
                      <span className="text-[11px] font-medium text-slate-400">
                        Пресс-релиз
                      </span>
                    </div>
                  )}

                  {(item.pubDate || item.date) && (
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10 shadow-sm">
                      <Calendar size={11} className="text-lime-400" />
                      <span>{formatDate(item.pubDate || item.date)}</span>
                    </div>
                  )}
                </div>

                {/* Контент новости */}
                <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 group-hover:text-lime-700 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h2>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleOpenLink(item.link, e)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#8cc63f] to-[#7ab82c] hover:from-[#80b937] hover:to-[#6ea626] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                    >
                      <span>Читать полностью</span>
                      <ExternalLink size={13} className="opacity-90" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
