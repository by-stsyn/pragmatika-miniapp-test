import React, { useEffect, useState } from "react";
import { Range } from "react-range";
import { 
  ArrowUp, 
  ArrowLeft, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  MapPin, 
  RotateCcw,
  Gauge,
  Calendar,
  Sparkles,
  Phone,
  User,
  Check,
  Car as CarIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import translations from "./translations";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";

const translateValue = (value) => {
  if (!value) return value;
  return translations[value.toLowerCase()] || value;
};

const defaultFilterState = {
  vendor: [],
  model: [],
  color: [],
  body: [],
  transmission: [],
  drive: [],
  dealer: [],
  price: [0, 9999999],
  run: [0, 500000],
  year: [1990, 2026],
};

export default function CarShowcaseUsed() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [priceRange, setPriceRange] = useState([0, 9999999]);
  const [runRange, setRunRange] = useState([0, 500000]);
  const [yearRange, setYearRange] = useState([1990, 2026]);

  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem("usedFilters");
      return saved ? JSON.parse(saved) : defaultFilterState;
    } catch (e) {
      return defaultFilterState;
    }
  });

  const [openFilters, setOpenFilters] = useState({
    vendor: false,
    model: false,
    dealer: false,
    body: false,
    transmission: false,
    drive: false,
    color: false,
  });

  const [filteredOptions, setFilteredOptions] = useState({
    vendors: [],
    models: [],
    colors: [],
    bodies: [],
    transmissions: [],
    drives: [],
    dealers: [],
  });

  const [modalCar, setModalCar] = useState(null);
  const [modalFilters, setModalFilters] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [visibleCount, setVisibleCount] = useState(() => {
    try {
      const saved = localStorage.getItem("usedVisibleCount");
      return saved ? parseInt(saved, 10) : 24;
    } catch (e) {
      return 24;
    }
  });

  // Обработка кнопки Назад (браузер + нативный Telegram)
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const tgBack = window.Telegram?.WebApp?.BackButton;
    if (tgBack) {
      try {
        tgBack.show();
        tgBack.onClick(handleBack);
      } catch (e) {
        // Safe fallback
      }
    }

    return () => {
      if (tgBack) {
        try {
          tgBack.offClick(handleBack);
          tgBack.hide();
        } catch (e) {
          // Safe fallback
        }
      }
    };
  }, []);

  // Загрузка фида авто с пробегом
  useEffect(() => {
    let isMounted = true;
    const fetchFeed = async () => {
      try {
        const res = await fetch("/api/fetch-feed-used");
        const xmlText = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");

        const carsArray = Array.from(xml.querySelectorAll("vehicle")).map((car) => {
          const get = (tag) => car.querySelector(tag)?.textContent?.trim() || "";

          return {
            id: get("id"),
            vendor: get("brand"),
            model: get("model"),
            price: parseInt(get("price"), 10) || 0,
            maxDiscount: parseInt(get("maxDiscount"), 10) || 0,
            images: Array.from(car.querySelectorAll("photos > photo")).map((img) => img.textContent?.trim()).filter(Boolean),
            color: get("bodyColor"),
            body: get("bodyType"),
            transmission: get("gearboxType"),
            drive: get("driveType"),
            year: parseInt(get("year"), 10) || 0,
            run: parseInt(get("mileage"), 10) || 0,
            dealer: car.querySelector("dealer")?.textContent?.trim() || "",
            engineType: get("engineType"),
            description: get("description"),
            engineVolume: get("engineVolume"),
            enginePower: get("enginePower"),
            complectation: get("complectation"),
            extras: Array.from(car.querySelectorAll("equipment group element"))
              .map((e) => e.textContent?.trim())
              .filter(Boolean),
          };
        });

        if (!isMounted) return;

        const prices = carsArray.map((c) => c.price).filter((p) => p > 0);
        const runs = carsArray.map((c) => c.run).filter((r) => r >= 0);
        const years = carsArray.map((c) => c.year).filter((y) => y > 0);

        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 9999999;
        const minRun = runs.length ? Math.min(...runs) : 0;
        const maxRun = runs.length ? Math.max(...runs) : 500000;
        const minYear = years.length ? Math.min(...years) : 1990;
        const maxYear = years.length ? Math.max(...years) : 2026;

        setCars(carsArray);
        setFiltered(carsArray);

        setPriceRange([minPrice, maxPrice]);
        setRunRange([minRun, maxRun]);
        setYearRange([minYear, maxYear]);

        setFilters((prev) => {
          const isDefaultPrice = !prev.price || (prev.price[0] === 0 && prev.price[1] === 9999999);
          const isDefaultRun = !prev.run || (prev.run[0] === 0 && prev.run[1] === 500000);
          const isDefaultYear = !prev.year || (prev.year[0] === 1990 && prev.year[1] === 2025);

          return {
            ...prev,
            price: isDefaultPrice ? [minPrice, maxPrice] : prev.price,
            run: isDefaultRun ? [minRun, maxRun] : prev.run,
            year: isDefaultYear ? [minYear, maxYear] : prev.year,
          };
        });

        setLoading(false);
      } catch (error) {
        console.error("Ошибка загрузки фида:", error);
        if (isMounted) setLoading(false);
      }
    };

    fetchFeed();
    return () => {
      isMounted = false;
    };
  }, []);

  // Фильтрация списка автомобилей
  useEffect(() => {
    const result = cars.filter((car) => {
      const matchVendor = filters.vendor.length === 0 || filters.vendor.includes(car.vendor);
      const matchModel = filters.model.length === 0 || filters.model.includes(car.model);
      const matchColor = filters.color.length === 0 || filters.color.includes(car.color);
      const matchBody = filters.body.length === 0 || filters.body.includes(car.body);
      const matchTransmission = filters.transmission.length === 0 || filters.transmission.includes(car.transmission);
      const matchDrive = filters.drive.length === 0 || filters.drive.includes(car.drive);
      const matchDealer = filters.dealer.length === 0 || filters.dealer.includes(car.dealer);

      const matchPrice =
        (!filters.price || (car.price >= filters.price[0] && car.price <= filters.price[1]));
      const matchRun =
        (!filters.run || (car.run >= filters.run[0] && car.run <= filters.run[1]));
      const matchYear =
        (!filters.year || (car.year >= filters.year[0] && car.year <= filters.year[1]));

      return (
        matchVendor &&
        matchModel &&
        matchColor &&
        matchBody &&
        matchTransmission &&
        matchDrive &&
        matchDealer &&
        matchPrice &&
        matchRun &&
        matchYear
      );
    });

    setFiltered(result);

    let carsToFilter = cars;
    if (filters.vendor.length > 0) {
      carsToFilter = carsToFilter.filter((c) => filters.vendor.includes(c.vendor));
    }

    setFilteredOptions({
      vendors: [...new Set(cars.map((c) => c.vendor))].filter(Boolean).sort(),
      models: [...new Set(carsToFilter.map((c) => c.model))].filter(Boolean).sort(),
      colors: [...new Set(carsToFilter.map((c) => c.color))].filter(Boolean).sort(),
      bodies: [...new Set(carsToFilter.map((c) => c.body))].filter(Boolean).sort(),
      transmissions: [...new Set(carsToFilter.map((c) => c.transmission))].filter(Boolean).sort(),
      drives: [...new Set(carsToFilter.map((c) => c.drive))].filter(Boolean).sort(),
      dealers: [...new Set(carsToFilter.map((c) => c.dealer))].filter(Boolean).sort(),
    });
  }, [filters, cars]);

  // Восстановление позиции скролла при возврате со страницы авто
  useEffect(() => {
    const scrollToId = localStorage.getItem("scrollToUsedCarId");
    if (!scrollToId || !filtered.length) return;

    const index = filtered.findIndex((car) => car.id === scrollToId);
    if (index === -1) return;

    if (index >= visibleCount) {
      setVisibleCount(index + 1);
    }
  }, [filtered]);

  useEffect(() => {
    const scrollToId = localStorage.getItem("scrollToUsedCarId");
    if (!scrollToId) return;

    let attempts = 0;
    const maxAttempts = 15;

    const tryScroll = () => {
      const el = document.getElementById(`car-${scrollToId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        localStorage.removeItem("scrollToUsedCarId");
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryScroll, 120);
      }
    };

    tryScroll();
  }, [cars, visibleCount]);

  // Сохранение фильтров и пагинации
  useEffect(() => {
    try {
      localStorage.setItem("usedFilters", JSON.stringify(filters));
    } catch (e) {}
  }, [filters]);

  useEffect(() => {
    try {
      localStorage.setItem("usedVisibleCount", visibleCount.toString());
    } catch (e) {}
  }, [visibleCount]);

  const toggleFilterVisibility = (filter) => {
    setOpenFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const handleCheckboxChange = (name, value) => {
    setFilters((prev) => {
      const currentList = prev[name] || [];
      const newValues = currentList.includes(value)
        ? currentList.filter((v) => v !== value)
        : [...currentList, value];
      return { ...prev, [name]: newValues };
    });
  };

  const resetFilters = () => {
    setFilters({
      vendor: [],
      model: [],
      color: [],
      body: [],
      transmission: [],
      drive: [],
      dealer: [],
      price: [...priceRange],
      run: [...runRange],
      year: [...yearRange],
    });
  };

  const activeFiltersCount =
    (filters.vendor?.length || 0) +
    (filters.model?.length || 0) +
    (filters.color?.length || 0) +
    (filters.body?.length || 0) +
    (filters.transmission?.length || 0) +
    (filters.drive?.length || 0) +
    (filters.dealer?.length || 0) +
    (filters.price && (filters.price[0] > priceRange[0] || filters.price[1] < priceRange[1]) ? 1 : 0) +
    (filters.run && (filters.run[0] > runRange[0] || filters.run[1] < runRange[1]) ? 1 : 0) +
    (filters.year && (filters.year[0] > yearRange[0] || filters.year[1] < yearRange[1]) ? 1 : 0);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          car: {
            vendor: modalCar?.vendor || "",
            model: modalCar?.model || "",
            dealer: modalCar?.dealer || "",
            year: modalCar?.year || "",
            price: modalCar?.price || 0,
          },
        }),
      });

      if (res.ok) {
        alert("Заявка успешно отправлена! Наш менеджер свяжется с вами в ближайшее время.");
        setFormData({ name: "", phone: "" });
        setModalCar(null);
      } else {
        alert("Ошибка при отправке. Попробуйте позже.");
      }
    } catch (error) {
      console.error("Ошибка отправки заявки:", error);
      alert("Ошибка сети. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Компонент аккордеона фильтра
  const renderFilterAccordion = (title, key, items, isTranslate = false) => {
    const selectedCount = filters[key]?.length || 0;
    const isOpen = openFilters[key];

    return (
      <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs transition">
        <button
          type="button"
          onClick={() => toggleFilterVisibility(key)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm">{title}</span>
            {selectedCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-[#8cc63f] text-white rounded-full">
                {selectedCount}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-slate-700" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="p-3 pt-1 border-t border-slate-100 max-h-52 overflow-y-auto space-y-1 scrollbar-thin">
            {items.length === 0 ? (
              <p className="text-xs text-slate-400 py-1 px-2">Нет доступных опций</p>
            ) : (
              items.map((item) => {
                const isChecked = filters[key]?.includes(item);
                const displayLabel = isTranslate ? translateValue(item) : item;
                return (
                  <label
                    key={item}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer text-sm transition select-none ${
                      isChecked ? "bg-[#8cc63f]/10 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={item}
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(key, item)}
                      className="accent-[#8cc63f] w-4 h-4 rounded text-[#8cc63f] focus:ring-0"
                    />
                    <span className="break-words leading-tight text-xs md:text-sm">{displayLabel}</span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/60 pb-32 text-slate-900">
      {/* Шапка страницы */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              aria-label="Назад"
              className="p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                Автомобили с пробегом
              </h1>
              <p className="text-xs text-slate-500">
                {!loading ? `В наличии: ${filtered.length} шт.` : "Загрузка каталога..."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalFilters(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 active:scale-95 transition shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8cc63f]" />
            <span>Фильтры</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#8cc63f] text-slate-950 font-bold text-[11px]">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Preloader />
            <p className="text-sm text-slate-500 mt-4 animate-pulse">Загружаем автомобили с пробегом...</p>
          </div>
        ) : (
          <>
            {/* Десктопная панель фильтрации */}
            <div className="hidden lg:block bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs mb-8">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#8cc63f]" />
                  <h2 className="text-base font-bold text-slate-900">Подбор по параметрам</h2>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Сбросить ({activeFiltersCount})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5">
                {renderFilterAccordion("Марка", "vendor", filteredOptions.vendors)}
                {renderFilterAccordion("Модель", "model", filteredOptions.models)}
                {renderFilterAccordion("Дилер", "dealer", filteredOptions.dealers)}
                {renderFilterAccordion("Кузов", "body", filteredOptions.bodies, true)}
                {renderFilterAccordion("Трансмиссия", "transmission", filteredOptions.transmissions, true)}
                {renderFilterAccordion("Привод", "drive", filteredOptions.drives, true)}
              </div>

              {/* Слайдеры для десктопа */}
              <div className="grid grid-cols-3 gap-6 pt-3 border-t border-slate-100">
                {/* Слайдер цены */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Цена</span>
                    <span className="text-xs font-bold text-slate-900">
                      {filters.price?.[0]?.toLocaleString()} ₽ — {filters.price?.[1]?.toLocaleString()} ₽
                    </span>
                  </div>
                  <Range
                    step={10000}
                    min={priceRange[0]}
                    max={priceRange[1]}
                    values={filters.price || priceRange}
                    onChange={(values) => setFilters({ ...filters, price: values })}
                    renderTrack={({ props, children }) => (
                      <div
                        {...props}
                        className="h-2 my-3 rounded-full relative cursor-pointer"
                        style={{
                          ...props.style,
                          background: `linear-gradient(
                            to right,
                            #cbd5e1 ${((filters.price[0] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%,
                            #8cc63f ${((filters.price[0] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%,
                            #8cc63f ${((filters.price[1] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%,
                            #cbd5e1 ${((filters.price[1] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%
                          )`,
                        }}
                      >
                        {children}
                      </div>
                    )}
                    renderThumb={({ props }) => {
                      const { key, ...thumbProps } = props;
                      return (
                        <div
                          key={key}
                          {...thumbProps}
                          className="w-5 h-5 rounded-full bg-white border-2 border-[#8cc63f] shadow-md cursor-grab active:cursor-grabbing focus:outline-none"
                        />
                      );
                    }}
                  />
                </div>

                {/* Слайдер пробега */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Пробег</span>
                    <span className="text-xs font-bold text-slate-900">
                      {filters.run?.[0]?.toLocaleString()} км — {filters.run?.[1]?.toLocaleString()} км
                    </span>
                  </div>
                  <Range
                    step={1000}
                    min={runRange[0]}
                    max={runRange[1]}
                    values={filters.run || runRange}
                    onChange={(values) => setFilters({ ...filters, run: values })}
                    renderTrack={({ props, children }) => (
                      <div
                        {...props}
                        className="h-2 my-3 rounded-full relative cursor-pointer"
                        style={{
                          ...props.style,
                          background: `linear-gradient(
                            to right,
                            #cbd5e1 ${((filters.run[0] - runRange[0]) / Math.max(1, runRange[1] - runRange[0])) * 100}%,
                            #8cc63f ${((filters.run[0] - runRange[0]) / Math.max(1, runRange[1] - runRange[0])) * 100}%,
                            #8cc63f ${((filters.run[1] - runRange[0]) / Math.max(1, runRange[1] - runRange[0])) * 100}%,
                            #cbd5e1 ${((filters.run[1] - runRange[0]) / Math.max(1, runRange[1] - runRange[0])) * 100}%
                          )`,
                        }}
                      >
                        {children}
                      </div>
                    )}
                    renderThumb={({ props }) => {
                      const { key, ...thumbProps } = props;
                      return (
                        <div
                          key={key}
                          {...thumbProps}
                          className="w-5 h-5 rounded-full bg-white border-2 border-[#8cc63f] shadow-md cursor-grab active:cursor-grabbing focus:outline-none"
                        />
                      );
                    }}
                  />
                </div>

                {/* Слайдер года */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Год выпуска</span>
                    <span className="text-xs font-bold text-slate-900">
                      {filters.year?.[0]} — {filters.year?.[1]}
                    </span>
                  </div>
                  <Range
                    step={1}
                    min={yearRange[0]}
                    max={yearRange[1]}
                    values={filters.year || yearRange}
                    onChange={(values) => setFilters({ ...filters, year: values })}
                    renderTrack={({ props, children }) => (
                      <div
                        {...props}
                        className="h-2 my-3 rounded-full relative cursor-pointer"
                        style={{
                          ...props.style,
                          background: `linear-gradient(
                            to right,
                            #cbd5e1 ${((filters.year[0] - yearRange[0]) / Math.max(1, yearRange[1] - yearRange[0])) * 100}%,
                            #8cc63f ${((filters.year[0] - yearRange[0]) / Math.max(1, yearRange[1] - yearRange[0])) * 100}%,
                            #8cc63f ${((filters.year[1] - yearRange[0]) / Math.max(1, yearRange[1] - yearRange[0])) * 100}%,
                            #cbd5e1 ${((filters.year[1] - yearRange[0]) / Math.max(1, yearRange[1] - yearRange[0])) * 100}%
                          )`,
                        }}
                      >
                        {children}
                      </div>
                    )}
                    renderThumb={({ props }) => {
                      const { key, ...thumbProps } = props;
                      return (
                        <div
                          key={key}
                          {...thumbProps}
                          className="w-5 h-5 rounded-full bg-white border-2 border-[#8cc63f] shadow-md cursor-grab active:cursor-grabbing focus:outline-none"
                        />
                      );
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Активные фильтры быстрыми чипсами */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-slate-400 font-medium mr-1">Фильтры:</span>
                {filters.vendor.map((v) => (
                  <button
                    key={v}
                    onClick={() => handleCheckboxChange("vendor", v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-full shadow-2xs hover:bg-slate-50 transition"
                  >
                    <span>{v}</span>
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
                {filters.model.map((m) => (
                  <button
                    key={m}
                    onClick={() => handleCheckboxChange("model", m)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-full shadow-2xs hover:bg-slate-50 transition"
                  >
                    <span>{m}</span>
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
                {filters.dealer.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleCheckboxChange("dealer", d)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-full shadow-2xs hover:bg-slate-50 transition"
                  >
                    <span>{d}</span>
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
                {filters.body.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleCheckboxChange("body", b)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-full shadow-2xs hover:bg-slate-50 transition"
                  >
                    <span>{translateValue(b)}</span>
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
                {filters.transmission.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleCheckboxChange("transmission", t)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-full shadow-2xs hover:bg-slate-50 transition"
                  >
                    <span>{translateValue(t)}</span>
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
                {filters.drive.map((dr) => (
                  <button
                    key={dr}
                    onClick={() => handleCheckboxChange("drive", dr)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-full shadow-2xs hover:bg-slate-50 transition"
                  >
                    <span>{translateValue(dr)}</span>
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-500 font-bold hover:underline px-2 py-1"
                >
                  Очистить все
                </button>
              </div>
            )}

            {/* Карточки авто */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto my-12">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-4">
                  <CarIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Ничего не найдено</h3>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  По заданным параметрам сейчас нет автомобилей в наличии. Попробуйте сбросить некоторые фильтры.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {filtered.slice(0, visibleCount).map((car) => {
                  const finalPrice = car.price - (car.maxDiscount || 0);
                  const firstPhoto = car.images?.[0];

                  return (
                    <article
                      key={car.id}
                      id={`car-${car.id}`}
                      onClick={() => {
                        try {
                          localStorage.setItem("scrollToUsedCarId", car.id);
                        } catch (e) {}
                        navigate("/UsedCarDetails", { state: { car } });
                      }}
                      className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
                    >
                      {/* Блок фотографии с бейджами */}
                      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                        {firstPhoto ? (
                          <img
                            src={firstPhoto}
                            alt={`${car.vendor} ${car.model}`}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <CarIcon className="w-12 h-12" />
                          </div>
                        )}

                        {/* Бейджи поверх фото */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                          {car.year > 0 && (
                            <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold rounded-lg shadow-sm">
                              {car.year} г.
                            </span>
                          )}
                          {car.run !== undefined && (
                            <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium rounded-lg shadow-sm flex items-center gap-1">
                              <Gauge className="w-3 h-3 text-[#8cc63f]" />
                              {Number(car.run).toLocaleString()} км
                            </span>
                          )}
                        </div>

                        {car.maxDiscount > 0 && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="px-2 py-1 bg-rose-500 text-white text-[10px] font-extrabold uppercase rounded-lg shadow-sm tracking-wide">
                              Скидка {car.maxDiscount.toLocaleString()} ₽
                            </span>
                          </div>
                        )}

                        {/* Дилерский бейдж поверх фото */}
                        {car.dealer && (
                          <div className="absolute bottom-2 left-2 right-2 z-10">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-[11px] font-medium text-white max-w-full truncate shadow-xs">
                              <MapPin className="w-3 h-3 text-[#8cc63f] shrink-0" />
                              <span className="truncate">{car.dealer}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Информационный блок */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Марка, модель и год */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition">
                              {car.vendor} {car.model}
                            </h3>
                            {car.year > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold shrink-0">
                                {car.year}
                              </span>
                            )}
                          </div>

                          {/* Цены */}
                          <div className="mb-3">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-extrabold text-[#75ab32] tracking-tight">
                                {finalPrice.toLocaleString()} ₽
                              </span>
                              {car.maxDiscount > 0 && (
                                <span className="text-xs text-slate-400 line-through">
                                  {car.price.toLocaleString()} ₽
                                </span>
                              )}
                            </div>
                            {car.maxDiscount > 0 && (
                              <span className="text-[11px] font-bold text-emerald-600">
                                Выгода: -{car.maxDiscount.toLocaleString()} ₽
                              </span>
                            )}
                          </div>

                          {/* Характеристики (пилюли в едином стиле) */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {car.run !== undefined && (
                              <span className="inline-block px-2.5 py-1 bg-slate-100/80 text-slate-600 text-[11px] font-medium rounded-lg leading-none">
                                {Number(car.run).toLocaleString()} км
                              </span>
                            )}
                            {(car.engineVolume || car.enginePower) && (
                              <span className="inline-block px-2.5 py-1 bg-slate-100/80 text-slate-600 text-[11px] font-medium rounded-lg leading-none">
                                {car.engineVolume ? `${car.engineVolume} л.` : ""} {car.enginePower ? `${car.enginePower} л.с.` : ""}
                              </span>
                            )}
                            {car.transmission && (
                              <span className="inline-block px-2.5 py-1 bg-slate-100/80 text-slate-600 text-[11px] font-medium rounded-lg leading-none">
                                {translateValue(car.transmission)}
                              </span>
                            )}
                            {car.drive && (
                              <span className="inline-block px-2.5 py-1 bg-slate-100/80 text-slate-600 text-[11px] font-medium rounded-lg leading-none">
                                {translateValue(car.drive)}
                              </span>
                            )}
                            {car.body && (
                              <span className="inline-block px-2.5 py-1 bg-slate-100/80 text-slate-600 text-[11px] font-medium rounded-lg leading-none">
                                {translateValue(car.body)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Кнопка бронирования (от 50px высотой, как в каталоге новых авто) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalCar(car);
                          }}
                          className="w-full min-h-[50px] py-3 px-4 rounded-xl bg-gradient-to-r from-[#8cc63f] to-[#7db636] hover:from-[#7db636] hover:to-[#6ea02e] text-white font-bold text-sm tracking-wide shadow-sm hover:shadow active:scale-[0.98] transition flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Забронировать</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Кнопка Показать еще */}
            {visibleCount < filtered.length && (
              <div className="text-center mt-8 mb-12">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="min-h-[48px] px-8 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xs hover:bg-slate-50 active:scale-95 transition inline-flex items-center gap-2"
                >
                  <span>Показать еще 24 авто</span>
                  <span className="text-slate-400 font-normal">
                    (осталось {filtered.length - visibleCount})
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Плавающая кнопка фильтров (для мобильных, строго как в каталоге новых авто) */}
      <button
        onClick={() => setModalFilters(true)}
        aria-label="Открыть фильтры"
        className="lg:hidden fixed bottom-24 right-4 z-40 p-3.5 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 active:scale-90 transition border border-slate-700/50 flex items-center justify-center"
      >
        <SlidersHorizontal className="w-5 h-5 text-[#8cc63f]" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#8cc63f] text-slate-950 text-[10px] font-black flex items-center justify-center ring-2 ring-white">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Кнопка наверх (строго как в каталоге новых авто) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Наверх"
        className="fixed bottom-38 right-4 z-40 p-3 rounded-full bg-white/90 backdrop-blur-md text-slate-700 border border-slate-200 shadow-md hover:bg-white active:scale-90 transition"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Модальное окно фильтров на смартфонах (строго как в каталоге новых авто) */}
      {modalFilters && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-xl max-h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
            {/* Шапка модалки */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#8cc63f]" />
                <h3 className="text-base font-bold text-slate-900">Фильтры авто с пробегом</h3>
              </div>
              <button
                onClick={() => setModalFilters(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Тело фильтров */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Слайдер цены */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Цена</span>
                  <span className="text-xs font-bold text-slate-900">
                    {filters.price?.[0]?.toLocaleString()} ₽ — {filters.price?.[1]?.toLocaleString()} ₽
                  </span>
                </div>
                <Range
                  step={10000}
                  min={priceRange[0]}
                  max={priceRange[1]}
                  values={filters.price || priceRange}
                  onChange={(values) => setFilters({ ...filters, price: values })}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="h-2 my-3 rounded-full relative cursor-pointer"
                      style={{
                        ...props.style,
                        background: `linear-gradient(
                          to right,
                          #cbd5e1 ${((filters.price[0] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%,
                          #8cc63f ${((filters.price[0] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%,
                          #8cc63f ${((filters.price[1] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%,
                          #cbd5e1 ${((filters.price[1] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%
                        )`,
                      }}
                    >
                      {children}
                    </div>
                  )}
                  renderThumb={({ props }) => {
                    const { key, ...thumbProps } = props;
                    return (
                      <div
                        key={key}
                        {...thumbProps}
                        className="w-5 h-5 rounded-full bg-white border-2 border-[#8cc63f] shadow-md cursor-grab active:cursor-grabbing focus:outline-none"
                      />
                    );
                  }}
                />
              </div>

              {/* Слайдер пробега */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Пробег</span>
                  <span className="text-xs font-bold text-slate-900">
                    {filters.run?.[0]?.toLocaleString()} км — {filters.run?.[1]?.toLocaleString()} км
                  </span>
                </div>
                <Range
                  step={1000}
                  min={runRange[0]}
                  max={runRange[1]}
                  values={filters.run || runRange}
                  onChange={(values) => setFilters({ ...filters, run: values })}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="h-2 my-3 rounded-full relative cursor-pointer"
                      style={{
                        ...props.style,
                        background: `linear-gradient(
                          to right,
                          #cbd5e1 ${((filters.run[0] - runRange[0]) / Math.max(1, runRange[1] - runRange[0])) * 100}%,
                          #8cc63f ${((filters.run[0] - runRange[0]) / Math.max(1, runRange[1] - runRange[0])) * 100}%,
                          #8cc63f ${((filters.run[1] - runRange[0]) / Math.max(1, runRange[1] - runRange[0])) * 100}%,
                          #cbd5e1 ${((filters.run[1] - runRange[0]) / Math.max(1, runRange[1] - runRange[0])) * 100}%
                        )`,
                      }}
                    >
                      {children}
                    </div>
                  )}
                  renderThumb={({ props }) => {
                    const { key, ...thumbProps } = props;
                    return (
                      <div
                        key={key}
                        {...thumbProps}
                        className="w-5 h-5 rounded-full bg-white border-2 border-[#8cc63f] shadow-md cursor-grab active:cursor-grabbing focus:outline-none"
                      />
                    );
                  }}
                />
              </div>

              {/* Слайдер года */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Год выпуска</span>
                  <span className="text-xs font-bold text-slate-900">
                    {filters.year?.[0]} — {filters.year?.[1]}
                  </span>
                </div>
                <Range
                  step={1}
                  min={yearRange[0]}
                  max={yearRange[1]}
                  values={filters.year || yearRange}
                  onChange={(values) => setFilters({ ...filters, year: values })}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="h-2 my-3 rounded-full relative cursor-pointer"
                      style={{
                        ...props.style,
                        background: `linear-gradient(
                          to right,
                          #cbd5e1 ${((filters.year[0] - yearRange[0]) / Math.max(1, yearRange[1] - yearRange[0])) * 100}%,
                          #8cc63f ${((filters.year[0] - yearRange[0]) / Math.max(1, yearRange[1] - yearRange[0])) * 100}%,
                          #8cc63f ${((filters.year[1] - yearRange[0]) / Math.max(1, yearRange[1] - yearRange[0])) * 100}%,
                          #cbd5e1 ${((filters.year[1] - yearRange[0]) / Math.max(1, yearRange[1] - yearRange[0])) * 100}%
                        )`,
                      }}
                    >
                      {children}
                    </div>
                  )}
                  renderThumb={({ props }) => {
                    const { key, ...thumbProps } = props;
                    return (
                      <div
                        key={key}
                        {...thumbProps}
                        className="w-5 h-5 rounded-full bg-white border-2 border-[#8cc63f] shadow-md cursor-grab active:cursor-grabbing focus:outline-none"
                      />
                    );
                  }}
                />
              </div>

              {renderFilterAccordion("Марка", "vendor", filteredOptions.vendors)}
              {renderFilterAccordion("Модель", "model", filteredOptions.models)}
              {renderFilterAccordion("Дилер", "dealer", filteredOptions.dealers)}
              {renderFilterAccordion("Кузов", "body", filteredOptions.bodies, true)}
              {renderFilterAccordion("Трансмиссия", "transmission", filteredOptions.transmissions, true)}
              {renderFilterAccordion("Привод", "drive", filteredOptions.drives, true)}
              {renderFilterAccordion("Цвет", "color", filteredOptions.colors, true)}
            </div>

            {/* Подвал с кнопками (как в каталоге новых авто) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={resetFilters}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
              >
                Сбросить
              </button>
              <button
                type="button"
                onClick={() => setModalFilters(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Показать {filtered.length} авто
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно бронирования (как в каталоге новых авто) */}
      {modalCar && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSubmitBooking}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#8cc63f]/10 text-[#75ab32] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">Бронирование</h3>
                  <p className="text-xs text-slate-500">Закрепление цены и бронь автомобиля</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalCar(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Карточка выбранного авто */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 mb-4 flex items-center gap-3">
              {modalCar.images?.[0] ? (
                <img
                  src={modalCar.images[0]}
                  alt={modalCar.model}
                  className="w-16 h-12 object-cover rounded-lg shrink-0"
                />
              ) : (
                <div className="w-16 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                  <CarIcon className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-900 text-sm truncate">
                  {modalCar.vendor} {modalCar.model} {modalCar.year > 0 ? `(${modalCar.year})` : ""}
                </h4>
                <p className="text-xs text-[#75ab32] font-extrabold">
                  {(modalCar.price - (modalCar.maxDiscount || 0)).toLocaleString()} ₽
                </p>
                {modalCar.dealer && (
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{modalCar.dealer}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ваше имя
                </label>
                <input
                  type="text"
                  required
                  placeholder="Как к вам обращаться"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent transition"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (___) ___-__-__"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent transition"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalCar(null)}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 min-h-[50px] py-3 px-4 rounded-xl bg-gradient-to-r from-[#8cc63f] to-[#7db636] hover:from-[#7db636] hover:to-[#6ea02e] text-white text-xs font-bold shadow-md hover:shadow active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Отправка заявки...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Отправить заявку</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Нижняя навигация */}
      <BottomNav />
    </div>
  );
}
