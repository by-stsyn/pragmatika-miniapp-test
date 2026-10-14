import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Filter, X, Tag, Calendar, MapPin } from "lucide-react";
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
      try {
        const parsedData = JSON.parse(savedData);
        setOffers(parsedData);
        setFiltered(parsedData);
      } catch (e) {
        console.error("Ошибка парсинга savedData", e);
      }
    }

    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error("Ошибка парсинга savedFilters", e);
      }
    }

    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
      }, 50);
    }
  }, []);

  // Загружаем свежие данные
  useEffect(() => {
    fetch("/api/fetch-offers")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сети");
        return res.json();
      })
      .then((data) => {
        const offersList = Array.isArray(data) ? data : [];
        const sorted = offersList.sort(
          (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
        );
        setOffers(sorted);
        setFiltered(sorted);
      })
      .catch((err) => console.error("Ошибка загрузки акций:", err))
      .finally(() => {
        sessionStorage.removeItem("offersData");
        sessionStorage.removeItem("offersFilters");
        sessionStorage.removeItem("offersScroll");
        setLoading(false);
      });
  }, []);

  // Фильтрация
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

  const hasActiveFilters =
    filters.action.length > 0 || filters.dealer.length > 0 || filters.brand.length > 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-28 text-slate-900">
      <div className="max-w-md mx-auto p-4">
        {/* Кнопка Назад */}
        <div className="mb-3">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-xs font-semibold text-[#5e8f23] hover:text-[#4b731c] transition-colors"
          >
            <ArrowLeft size={15} className="mr-1" /> Главная
          </button>
        </div>

        {/* Заголовок */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Акции и спецпредложения
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Выгодные условия на покупку, сервис и trade-in от Прагматика
          </p>
        </div>

        {/* Загрузка */}
        {loading && <Preloader />}

        {/* Блок фильтров */}
        {!loading && (
          <div className="mb-4 bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Filter size={14} className="text-[#5e8f23]" />
                <span>Фильтры акций</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-semibold text-[#5e8f23] hover:underline flex items-center gap-0.5"
                >
                  <X size={12} />
                  <span>Сбросить</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Фильтр: Тип акции */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilterVisibility("action")}
                  className={`w-full py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-between transition-colors ${
                    filters.action.length > 0
                      ? "bg-[#8cc63f]/15 border-[#8cc63f] text-[#5e8f23]"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">
                    {filters.action.length > 0 ? `Тип (${filters.action.length})` : "Тип"}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform flex-shrink-0 ${
                      openFilters.action ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Фильтр: Марка */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilterVisibility("brand")}
                  className={`w-full py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-between transition-colors ${
                    filters.brand.length > 0
                      ? "bg-[#8cc63f]/15 border-[#8cc63f] text-[#5e8f23]"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">
                    {filters.brand.length > 0 ? `Марка (${filters.brand.length})` : "Марка"}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform flex-shrink-0 ${
                      openFilters.brand ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Фильтр: Дилер/Локация */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilterVisibility("dealer")}
                  className={`w-full py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-between transition-colors ${
                    filters.dealer.length > 0
                      ? "bg-[#8cc63f]/15 border-[#8cc63f] text-[#5e8f23]"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">
                    {filters.dealer.length > 0 ? `Дилер (${filters.dealer.length})` : "Дилер"}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform flex-shrink-0 ${
                      openFilters.dealer ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Выпадающий список чекбоксов для выбранного фильтра */}
            {openFilters.action && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5 max-h-40 overflow-y-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Тип предложения:
                </div>
                {unique("action").map((a) => (
                  <label
                    key={a}
                    className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                  >
                    <input
                      type="checkbox"
                      checked={filters.action.includes(a)}
                      onChange={() => handleCheckboxChange("action", a)}
                      className="accent-[#8cc63f] w-4 h-4 rounded"
                    />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
            )}

            {openFilters.brand && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5 max-h-40 overflow-y-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Бренд автомобиля:
                </div>
                {unique("brand").map((b) => (
                  <label
                    key={b}
                    className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                  >
                    <input
                      type="checkbox"
                      checked={filters.brand.includes(b)}
                      onChange={() => handleCheckboxChange("brand", b)}
                      className="accent-[#8cc63f] w-4 h-4 rounded"
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            )}

            {openFilters.dealer && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5 max-h-40 overflow-y-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Дилерский центр:
                </div>
                {unique("dealer").map((d) => (
                  <label
                    key={d}
                    className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                  >
                    <input
                      type="checkbox"
                      checked={filters.dealer.includes(d)}
                      onChange={() => handleCheckboxChange("dealer", d)}
                      className="accent-[#8cc63f] w-4 h-4 rounded"
                    />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Список акций */}
        {!loading && (
          <div className="space-y-3.5">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-slate-200/80 text-center">
                <p className="text-xs text-slate-500 mb-3">
                  По выбранным фильтрам акций не найдено
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[#8cc63f] text-white text-xs font-semibold rounded-lg"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              filtered.map((item, index) => {
                const cardKey = item.link || item.id || `offer-${index}`;

                return (
                  <div
                    key={cardKey}
                    onClick={() => handleClickOffer(item, index)}
                    className="group bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden hover:border-[#8cc63f] active:scale-[0.99] transition-all cursor-pointer flex flex-col"
                  >
                    {/* Обложка акции */}
                    {item.thumbnail ? (
                      <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Бейдж типа акции */}
                        {item.action && (
                          <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {item.action}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-20 bg-gradient-to-r from-slate-100 to-[#8cc63f]/10 p-3 flex items-start">
                        {item.action && (
                          <span className="bg-[#8cc63f] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {item.action}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Контент карточки */}
                    <div className="p-3.5 flex flex-col justify-between flex-grow">
                      <div>
                        {/* Теги дилера и бренда */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1.5 flex-wrap">
                          {item.brand && (
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.brand}
                            </span>
                          )}
                          {item.dealer && (
                            <span className="truncate max-w-[200px]">
                              {item.dealer}
                            </span>
                          )}
                        </div>

                        <h2 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#5e8f23] transition-colors">
                          {item.title}
                        </h2>
                      </div>

                      {/* Кнопка перехода */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#5e8f23]">
                          Узнать условия →
                        </span>
                        <div className="w-6 h-6 rounded-md bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23] group-hover:bg-[#8cc63f] group-hover:text-white transition-colors">
                          <Tag size={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
