import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ClipboardEdit, ArrowLeft } from "lucide-react";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";

export default function OffersList() {
  const [offers, setOffers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ action: [], dealer: [], brand: [] });
  const [openFilters, setOpenFilters] = useState({ action: false, dealer: false, brand: false });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleClickOffer = (offer, idx) => {
  sessionStorage.setItem("offersScroll", window.scrollY);
  sessionStorage.setItem("offersData", JSON.stringify(offers));
  sessionStorage.setItem("offersFilters", JSON.stringify(filters));
  navigate(`/offer/${idx}`, { state: { offer } });
};



// Восстанавливаем позицию и состояние после возврата
useEffect(() => {
  const savedData = sessionStorage.getItem("offersData");
  const savedFilters = sessionStorage.getItem("offersFilters");
  const savedScroll = sessionStorage.getItem("offersScroll");

  if (savedData) {
    const parsedData = JSON.parse(savedData);
    setOffers(parsedData);
    setFiltered(parsedData);
  }

  if (savedFilters) {
    setFilters(JSON.parse(savedFilters));
  }

  // Скролл восстанавливаем с небольшим отложением, чтобы рендер успел завершиться
  if (savedScroll) {
    setTimeout(() => {
      window.scrollTo(0, parseInt(savedScroll, 10));
    }, 50);
  }

  // ❗ Не удаляем данные сразу — пусть остаются на время возврата
  // Удалим их только после того, как фид заново загрузится
}, []);

// Загружаем свежие данные
useEffect(() => {
  fetch("/api/fetch-offers")
    .then((res) => {
      if (!res.ok) throw new Error("Ошибка сети");
      return res.json();
    })
    .then((data) => {
      const offers = Array.isArray(data) ? data : [];
      const sorted = offers.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      setOffers(sorted);
      setFiltered(sorted);
    })
    .catch((err) => console.error("Ошибка загрузки акций:", err))
    .finally(() => {
      // После загрузки можно очистить sessionStorage
      sessionStorage.removeItem("offersData");
      sessionStorage.removeItem("offersFilters");
      sessionStorage.removeItem("offersScroll");
      setLoading(false);
    });
}, []);



  useEffect(() => {
    fetch("/api/fetch-offers")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сети");
        return res.json();
      })
      .then((data) => {
        const offers = Array.isArray(data) ? data : [];
        const sorted = offers.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        setOffers(sorted);
        setFiltered(sorted);
      })
      .catch((err) => console.error("Ошибка загрузки акций:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filteredData = offers;
    if (filters.action.length > 0)
      filteredData = filteredData.filter((o) => filters.action.includes(o.action));
    if (filters.dealer.length > 0)
      filteredData = filteredData.filter((o) => filters.dealer.includes(o.dealer));
    if (filters.brand.length > 0)
      filteredData = filteredData.filter((o) => filters.brand.includes(o.brand));
    setFiltered(filteredData);
  }, [filters, offers]);

  const unique = (key) => {
    if (!Array.isArray(offers)) return [];
    return [...new Set(offers.map((o) => o?.[key]).filter(Boolean))];
  };

  const toggleFilterVisibility = (filterKey) => {
    setOpenFilters((prev) => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  const handleCheckboxChange = (filterKey, value) => {
    setFilters((prev) => {
      const currentValues = prev[filterKey];
      if (currentValues.includes(value)) {
        return { ...prev, [filterKey]: currentValues.filter((v) => v !== value) };
      } else {
        return { ...prev, [filterKey]: [...currentValues, value] };
      }
    });
  };

  const resetFilters = () => {
    setFilters({ action: [], dealer: [], brand: [] });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-20">
      <button onClick={() => navigate("/")} className="text-blue-600 flex items-center mb-4">
        <ArrowLeft className="mr-2" /> Назад
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Акции и предложения
      </h1>

      {/* Надпись загрузки под заголовком */}
      {loading && (
       <Preloader />
      )}

     {/* Фильтры */}
{!loading && (
  <div className="mb-4">
    {/* Первая строка — тип акции и марка */}
    <div className="grid grid-cols-2 gap-4 mb-3">
      {/* Тип акции */}
      <div className={`filter ${filters.action.length > 0 ? "active" : ""}`}>
        <h3
          className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleFilterVisibility("action")}
        >
          Тип акции
          <span
            className={`filter-arrow transform transition-transform ${
              openFilters.action ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </h3>
        {openFilters.action &&
          unique("action").map((a) => (
            <label key={a} className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={filters.action.includes(a)}
                onChange={() => handleCheckboxChange("action", a)}
                className="accent-[#8cc63f] w-5 h-5"
              />
              <span>{a}</span>
            </label>
          ))}
      </div>

      {/* Марка */}
      <div className={`filter ${filters.brand.length > 0 ? "active" : ""}`}>
        <h3
          className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleFilterVisibility("brand")}
        >
          Марка
          <span
            className={`filter-arrow transform transition-transform ${
              openFilters.brand ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </h3>
        {openFilters.brand &&
          unique("brand").map((b) => (
            <label key={b} className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={filters.brand.includes(b)}
                onChange={() => handleCheckboxChange("brand", b)}
                className="accent-[#8cc63f] w-5 h-5"
              />
              <span>{b}</span>
            </label>
          ))}
      </div>
    </div>

    {/* Вторая строка — дилер и кнопка сброс */}
    <div className="grid grid-cols-2 gap-4">
      {/* Дилер */}
      <div className={`filter ${filters.dealer.length > 0 ? "active" : ""}`}>
        <h3
          className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleFilterVisibility("dealer")}
        >
          Локация
          <span
            className={`filter-arrow transform transition-transform ${
              openFilters.dealer ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </h3>
        {openFilters.dealer &&
          unique("dealer").map((d) => (
            <label key={d} className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={filters.dealer.includes(d)}
                onChange={() => handleCheckboxChange("dealer", d)}
                className="accent-[#8cc63f] w-5 h-5"
              />
              <span>{d}</span>
            </label>
          ))}
      </div>

      {/* Сброс */}
      <div className="flex items-end py-1.5 ">
        <button
          onClick={resetFilters}
          className="self-start w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-xl"
        >
          Сбросить
        </button>
      </div>
    </div>
  </div>
)}

   

      {/* Список акций */}
      {!loading && (
        <div className="grid gap-4">
          {filtered.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row gap-4"
            >
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full sm:w-48 h-32 object-cover rounded-xl"
                />
              )}
              <div>
                <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
                <button
                  onClick={() => handleClickOffer(item, index)}
                  className="px-4 py-2 bg-[#8cc63f] text-white rounded hover:bg-[#7ab82c]"
                >
                  Подробнее
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
}








