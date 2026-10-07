import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";
import { DEFAULT_OFFERS } from "/src/data/defaultOffers";

export default function OffersList() {
  const [offers, setOffers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ action: [], dealer: [], brand: [] });
  const [openFilters, setOpenFilters] = useState({
    action: false,
    dealer: false,
    brand: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleClickOffer = (offer, idx) => {
    sessionStorage.setItem("offersScroll", String(window.scrollY));
    sessionStorage.setItem("offersData", JSON.stringify(offers));
    sessionStorage.setItem("offersFilters", JSON.stringify(filters));
    navigate(`/offer/${idx}`, { state: { offer } });
  };

  // Восстанавливаем позицию и сохраненные данные
  useEffect(() => {
    const savedData = sessionStorage.getItem("offersData");
    const savedFilters = sessionStorage.getItem("offersFilters");
    const savedScroll = sessionStorage.getItem("offersScroll");

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setOffers(parsedData);
          setFiltered(parsedData);
          setLoading(false);
        }
      } catch {
        // ignore parse error
      }
    }

    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch {
        // ignore parse error
      }
    }

    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
      }, 50);
    }
  }, []);

  // Функция загрузки свежих данных
  const loadOffers = () => {
    setLoading(true);
    setError(null);
    fetch("/api/fetch-offers")
      .then((res) => {
        if (!res.ok) throw new Error(`Ошибка сети: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const sorted = data.sort(
            (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
          );
          setOffers(sorted);
          setFiltered(sorted);
        } else if (data?.error) {
          throw new Error(data.error);
        } else {
          setOffers(DEFAULT_OFFERS);
          setFiltered(DEFAULT_OFFERS);
        }
      })
      .catch((err) => {
        console.warn("API акций недоступно, используем актуальный локальный каталог:", err);
        setOffers(DEFAULT_OFFERS);
        setFiltered(DEFAULT_OFFERS);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // Фильтрация акций
  useEffect(() => {
    let filteredData = offers;
    if (filters.action.length > 0)
      filteredData = filteredData.filter((o) =>
        filters.action.includes(o.action)
      );
    if (filters.dealer.length > 0)
      filteredData = filteredData.filter((o) =>
        filters.dealer.includes(o.dealer)
      );
    if (filters.brand.length > 0)
      filteredData = filteredData.filter((o) =>
        filters.brand.includes(o.brand)
      );
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
        return {
          ...prev,
          [filterKey]: currentValues.filter((v) => v !== value),
        };
      } else {
        return { ...prev, [filterKey]: [...currentValues, value] };
      }
    });
  };

  const resetFilters = () => {
    setFilters({ action: [], dealer: [], brand: [] });
  };

  const activeFiltersCount =
    filters.action.length + filters.dealer.length + filters.brand.length;

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen pb-24">
      <button
        onClick={() => navigate("/")}
        className="text-[#425766] hover:text-[#8cc63f] inline-flex items-center font-medium transition-colors mb-3 py-1"
      >
        <ArrowLeft className="w-5 h-5 mr-1.5" /> Назад
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#425766]">
          Акции и спецпредложения
        </h1>
        {offers.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-[#87a5b6]/30 text-[#425766]">
            {filtered.length} из {offers.length}
          </span>
        )}
      </div>

      {loading && <Preloader />}

      {error && !loading && (
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-red-100 mb-6">
          <p className="text-gray-700 mb-3">{error}</p>
          <button
            onClick={loadOffers}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8cc63f] text-white rounded-xl font-medium shadow-sm hover:bg-[#7ab82c]"
          >
            <RotateCcw className="w-4 h-4" /> Повторить загрузку
          </button>
        </div>
      )}

      {/* Фильтры */}
      {!loading && offers.length > 0 && (
        <div className="mb-5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Тип акции */}
            <div className="border border-gray-100 rounded-xl p-2.5 bg-zinc-50">
              <button
                type="button"
                className="w-full text-sm font-semibold text-[#425766] flex items-center justify-between"
                onClick={() => toggleFilterVisibility("action")}
              >
                <span>
                  Тип акции{" "}
                  {filters.action.length > 0 && `(${filters.action.length})`}
                </span>
                <span
                  className={`text-xs transition-transform ${
                    openFilters.action ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {openFilters.action && (
                <div className="mt-2.5 pt-2 border-t border-gray-200 max-h-48 overflow-y-auto space-y-1.5">
                  {unique("action").map((a) => (
                    <label
                      key={a}
                      className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={filters.action.includes(a)}
                        onChange={() => handleCheckboxChange("action", a)}
                        className="accent-[#8cc63f] w-4 h-4 rounded"
                      />
                      <span className="truncate">{a}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Марка */}
            <div className="border border-gray-100 rounded-xl p-2.5 bg-zinc-50">
              <button
                type="button"
                className="w-full text-sm font-semibold text-[#425766] flex items-center justify-between"
                onClick={() => toggleFilterVisibility("brand")}
              >
                <span>
                  Марка{" "}
                  {filters.brand.length > 0 && `(${filters.brand.length})`}
                </span>
                <span
                  className={`text-xs transition-transform ${
                    openFilters.brand ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {openFilters.brand && (
                <div className="mt-2.5 pt-2 border-t border-gray-200 max-h-48 overflow-y-auto space-y-1.5">
                  {unique("brand").map((b) => (
                    <label
                      key={b}
                      className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={filters.brand.includes(b)}
                        onChange={() => handleCheckboxChange("brand", b)}
                        className="accent-[#8cc63f] w-4 h-4 rounded"
                      />
                      <span className="truncate">{b}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Локация / Дилер */}
            <div className="border border-gray-100 rounded-xl p-2.5 bg-zinc-50">
              <button
                type="button"
                className="w-full text-sm font-semibold text-[#425766] flex items-center justify-between"
                onClick={() => toggleFilterVisibility("dealer")}
              >
                <span>
                  Локация{" "}
                  {filters.dealer.length > 0 && `(${filters.dealer.length})`}
                </span>
                <span
                  className={`text-xs transition-transform ${
                    openFilters.dealer ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {openFilters.dealer && (
                <div className="mt-2.5 pt-2 border-t border-gray-200 max-h-48 overflow-y-auto space-y-1.5">
                  {unique("dealer").map((d) => (
                    <label
                      key={d}
                      className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={filters.dealer.includes(d)}
                        onChange={() => handleCheckboxChange("dealer", d)}
                        className="accent-[#8cc63f] w-4 h-4 rounded"
                      />
                      <span className="truncate">{d}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-[#425766] hover:text-[#8cc63f] underline transition-colors"
              >
                Сбросить фильтры ({activeFiltersCount})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Список акций */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item, index) => (
            <div
              key={item.link || index}
              onClick={() => handleClickOffer(item, index)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow group"
            >
              <div>
                {item.thumbnail ? (
                  <div className="aspect-[2.1/1] w-full rounded-xl overflow-hidden bg-gray-100 mb-3 relative">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-[2.1/1] w-full rounded-xl bg-[#425766]/5 flex items-center justify-center mb-3 text-[#87a5b6] text-xs font-medium">
                    Спецпредложение
                  </div>
                )}
                <h2 className="text-base font-semibold text-[#425766] line-clamp-2 mb-2 group-hover:text-[#8cc63f] transition-colors">
                  {item.title}
                </h2>
                {item.dealer && (
                  <p className="text-xs text-[#87a5b6] mb-3">{item.dealer}</p>
                )}
              </div>

              <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  {item.action || "Акция"}
                </span>
                <span className="px-3.5 py-1.5 bg-[#8cc63f] text-white text-xs font-semibold rounded-xl group-hover:bg-[#7ab82c] transition-colors">
                  Подробнее
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Если список пуст после фильтрации */}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <p className="text-[#425766] font-medium mb-3">
            {offers.length > 0
              ? "По выбранным параметрам акций не найдено"
              : "Акции временно недоступны"}
          </p>
          {activeFiltersCount > 0 ? (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-[#8cc63f] text-white rounded-xl text-sm font-medium hover:bg-[#7ab82c] transition-colors"
            >
              Сбросить все фильтры
            </button>
          ) : (
            <button
              onClick={loadOffers}
              className="px-4 py-2 bg-[#8cc63f] text-white rounded-xl text-sm font-medium hover:bg-[#7ab82c] transition-colors"
            >
              Обновить
            </button>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
