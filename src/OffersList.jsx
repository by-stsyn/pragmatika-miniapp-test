import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Filter,
  X,
  Tag,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Car,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";

export default function OffersList() {
  const [offers, setOffers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ action: [], dealer: [], brand: [] });
  const [openFilters, setOpenFilters] = useState({ action: false, dealer: false, brand: false });
  const [loading, setLoading] = useState(true);
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
    setOpenFilters((prev) => ({
      action: filterKey === "action" ? !prev.action : false,
      dealer: filterKey === "dealer" ? !prev.dealer : false,
      brand: filterKey === "brand" ? !prev.brand : false,
    }));
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
    setOpenFilters({ action: false, dealer: false, brand: false });
  };

  const hasActiveFilters =
    filters.action.length > 0 || filters.dealer.length > 0 || filters.brand.length > 0;

  const totalActiveFilterCount =
    filters.action.length + filters.dealer.length + filters.brand.length;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-28 text-slate-900 font-sans antialiased">
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
            <h1 className="text-sm font-bold text-slate-900">Спецпредложения</h1>
            <p className="text-[10px] text-slate-500 font-medium">
              Официальный дилер Прагматика
            </p>
          </div>

          <div className="w-16 flex justify-end">
            {!loading && (
              <span className="text-[11px] font-semibold text-lime-700 bg-lime-50 px-2 py-0.5 rounded-full border border-lime-200">
                {filtered.length}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-3.5 space-y-4">
        {/* Баннер / Интро заголовок */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-28 h-28 bg-[#8cc63f]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-[11px] font-medium text-lime-300 mb-2 border border-white/10">
              <Sparkles size={12} />
              <span>Выгода и привилегии</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Акции и спецпредложения
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Актуальные программы покупки, трейд-ин, кредитования и сервисного обслуживания
            </p>
          </div>
        </div>

        {/* Загрузка */}
        {loading && <Preloader />}

        {/* Блок фильтров */}
        {!loading && (
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <SlidersHorizontal size={14} className="text-[#65a30d]" />
                <span>Фильтры</span>
                {totalActiveFilterCount > 0 && (
                  <span className="bg-lime-100 text-lime-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {totalActiveFilterCount}
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-semibold text-lime-700 hover:text-lime-800 flex items-center gap-0.5 transition-colors"
                >
                  <X size={12} />
                  <span>Сбросить все</span>
                </button>
              )}
            </div>

            {/* Кнопки выпадающих фильтров */}
            <div className="grid grid-cols-3 gap-1.5">
              {/* Фильтр: Тип акции */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilterVisibility("action")}
                  className={`w-full py-2 px-2.5 rounded-xl border text-[11px] font-semibold flex items-center justify-between transition-all ${
                    filters.action.length > 0
                      ? "bg-lime-50/80 border-lime-400 text-lime-800 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                  }`}
                >
                  <span className="truncate">
                    {filters.action.length > 0 ? `Тип (${filters.action.length})` : "Тип"}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 flex-shrink-0 text-slate-400 ${
                      openFilters.action ? "rotate-180 text-lime-700" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Фильтр: Марка */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilterVisibility("brand")}
                  className={`w-full py-2 px-2.5 rounded-xl border text-[11px] font-semibold flex items-center justify-between transition-all ${
                    filters.brand.length > 0
                      ? "bg-lime-50/80 border-lime-400 text-lime-800 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                  }`}
                >
                  <span className="truncate">
                    {filters.brand.length > 0 ? `Марка (${filters.brand.length})` : "Марка"}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 flex-shrink-0 text-slate-400 ${
                      openFilters.brand ? "rotate-180 text-lime-700" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Фильтр: Дилер */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilterVisibility("dealer")}
                  className={`w-full py-2 px-2.5 rounded-xl border text-[11px] font-semibold flex items-center justify-between transition-all ${
                    filters.dealer.length > 0
                      ? "bg-lime-50/80 border-lime-400 text-lime-800 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                  }`}
                >
                  <span className="truncate">
                    {filters.dealer.length > 0 ? `Дилер (${filters.dealer.length})` : "Дилер"}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 flex-shrink-0 text-slate-400 ${
                      openFilters.dealer ? "rotate-180 text-lime-700" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Выпадающий список чекбоксов для выбранного фильтра */}
            {openFilters.action && (
              <div className="pt-2 border-t border-slate-100 space-y-1 max-h-48 overflow-y-auto pr-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tag size={11} />
                  <span>Тип предложения:</span>
                </div>
                {unique("action").map((a) => {
                  const isChecked = filters.action.includes(a);
                  return (
                    <label
                      key={a}
                      className={`flex items-center space-x-2.5 text-xs p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? "bg-lime-50 text-lime-900 font-medium" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange("action", a)}
                        className="accent-[#65a30d] w-4 h-4 rounded text-lime-600 focus:ring-lime-500"
                      />
                      <span className="truncate">{a}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {openFilters.brand && (
              <div className="pt-2 border-t border-slate-100 space-y-1 max-h-48 overflow-y-auto pr-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Car size={11} />
                  <span>Бренд автомобиля:</span>
                </div>
                {unique("brand").map((b) => {
                  const isChecked = filters.brand.includes(b);
                  return (
                    <label
                      key={b}
                      className={`flex items-center space-x-2.5 text-xs p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? "bg-lime-50 text-lime-900 font-medium" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange("brand", b)}
                        className="accent-[#65a30d] w-4 h-4 rounded text-lime-600 focus:ring-lime-500"
                      />
                      <span className="truncate">{b}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {openFilters.dealer && (
              <div className="pt-2 border-t border-slate-100 space-y-1 max-h-48 overflow-y-auto pr-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Building2 size={11} />
                  <span>Дилерский центр:</span>
                </div>
                {unique("dealer").map((d) => {
                  const isChecked = filters.dealer.includes(d);
                  return (
                    <label
                      key={d}
                      className={`flex items-center space-x-2.5 text-xs p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? "bg-lime-50 text-lime-900 font-medium" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange("dealer", d)}
                        className="accent-[#65a30d] w-4 h-4 rounded text-lime-600 focus:ring-lime-500"
                      />
                      <span className="truncate">{d}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Список акций */}
        {!loading && (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-sm text-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Tag size={22} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  Акции не найдены
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  По выбранным критериям спецпредложений сейчас нет
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gradient-to-r from-[#8cc63f] to-[#7bb630] text-white text-xs font-semibold rounded-xl shadow-sm hover:brightness-105 active:scale-95 transition-all"
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
                    className="group bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden hover:border-lime-400 hover:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer flex flex-col"
                  >
                    {/* Обложка акции */}
                    {item.thumbnail ? (
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
                        {/* Бейдж типа акции */}
                        {item.action && (
                          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                            {item.action}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-24 bg-gradient-to-r from-slate-900 to-slate-800 p-3.5 flex items-start justify-between">
                        {item.action && (
                          <span className="bg-lime-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                            {item.action}
                          </span>
                        )}
                        <Tag className="text-white/20" size={24} />
                      </div>
                    )}

                    {/* Контент карточки */}
                    <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
                      <div>
                        {/* Теги дилера и бренда */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2 flex-wrap">
                          {item.brand && (
                            <span className="font-semibold text-lime-800 bg-lime-50 border border-lime-200/60 px-2 py-0.5 rounded-md">
                              {item.brand}
                            </span>
                          )}
                          {item.dealer && (
                            <span className="flex items-center gap-1 text-slate-600 truncate max-w-[220px]">
                              <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                              <span className="truncate">{item.dealer}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-lime-700 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </div>

                      {/* Нижняя плашка перехода */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-lime-700 group-hover:text-lime-800 flex items-center gap-1 transition-colors">
                          Узнать условия
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-lime-50 border border-lime-200/60 flex items-center justify-center text-lime-700 group-hover:bg-[#8cc63f] group-hover:text-white transition-all duration-200">
                          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
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

