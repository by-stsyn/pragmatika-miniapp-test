import React, { useEffect, useState } from "react";
import { Range } from "react-range";
import { 
  ArrowUp, 
  ArrowLeft, 
  SlidersHorizontal, 
  X, 
  Check, 
  ChevronDown, 
  MapPin, 
  Sparkles, 
  Flame, 
  RotateCcw,
  Car as CarIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";

/* =======================
   МАППЕРЫ
======================= */
const mapGearbox = (value) => {
  const map = {
    manual: "Механика",
    automatic: "Автомат",
    robotized: "Робот",
    variator: "Вариатор",
    robot: "Робот",
    cvt: "Вариатор",
  };
  return map[value] || value;
};

const mapDrive = (value) => {
  const map = {
    front: "Передний",
    rear: "Задний",
    full: "Полный",
    awd: "Полный",
    fwd: "Передний",
    rwd: "Задний",
    full_4wd: "Полный",
    optional_4wd: "Подключаемый полный",
  };
  return map[value] || value;
};

const mapColor = (value) => {
  const map = {
    grey: "Серый",
    silver: "Серебристый",
    green: "Зеленый",
    white: "Белый",
    azure: "Синий",
    blue: "Голубой",
    beige: "Бежевый",
    black: "Черный",
    brown: "Коричневый",
    purple: "Пурпурный",
    orange: "Оранжевый",
    red: "Красный",
    gold: "Золотой",
    violet: "Фиолетовый",
    yellow: "Желтый",
    pink: "Розовый",
  };
  return map[value] || value;
};

/* =======================
   НОРМАЛИЗАЦИЯ ДИЛЕРОВ
======================= */
const normalizeBrandKey = (brand) => {
  if (!brand) return "";
  const b = brand.toLowerCase();
  if (b.includes("knewstar")) return "knewstar";
  if (b.includes("geely")) return "geely";
  if (b.includes("belgee")) return "belgee";
  if (b.includes("changan")) return "changan";
  if (b.includes("lada")) return "lada";
  if (b.includes("xcite")) return "xcite";
  return b;
};

const dealerNameMap = {
  "Прагматика Лада Парнас|lada": "LADA Парнас",
  "Прагматика XCITE Парнас|xcite": "XCITE Парнас",
  "Прагматика Василеостровский|lada": "LADA Василеостровский",
  "Прагматика Василеостровский Xcite|xcite": "XCITE Василеостровский",
  "Changan Центр Прагматика|changan": "Changan Купчино",
  "Прагматика LADA Купчино|lada": "LADA Купчино",
  "ПРАГМАТИКА МУРМАНСК  Lada (ВАЗ)|lada": "LADA Мурманск",
  "Псков-Лада Lada (ВАЗ)|lada": "LADA Псков",
  "Прагматика Geely Василеостровский|geely": "Geely Василеостровский",
  "Прагматика Belgee Василеостровский|belgee": "Belgee Василеостровский",
  "Петрозаводск-Лада Lada (ВАЗ)|lada": "LADA Петрозаводск",
  "Прагматика LADA Великий Новгород|lada": "LADA Великий Новгород",
  "Прагматика LADA Великие Луки|lada": "LADA Великие Луки",
  "ПРАГМАТИКА ЛАДА Xcite|xcite": "XCITE Купчино",
  "Прагматика LADA Мончегорск|lada": "LADA Мончегорск",
  "Петрозаводск-Лада Lada (ВАЗ)|xcite": "XCITE Петрозаводск",
  "Прагматика LADA Великий Новгород|xcite": "XCITE Великий Новгород",
  "Прагматика LADA Великие Луки|xcite": "XCITE Великие Луки",
  "Прагматика LADA Мончегорск|xcite": "XCITE Мончегорск",
  "ПРАГМАТИКА МУРМАНСК  Lada (ВАЗ)|xcite": "XCITE Мурманск",
  "Псков-Лада Lada (ВАЗ)|xcite": "XCITE Псков",
  "Прагматика Geely Василеостровский|knewstar": "Knewstar Василеостровский",
};

const normalizeDealer = (dealerName, brand) => {
  if (!dealerName) return "";
  const brandKey = normalizeBrandKey(brand);
  const compoundKey = `${dealerName}|${brandKey}`;

  if (dealerNameMap[compoundKey]) {
    return dealerNameMap[compoundKey];
  }

  if (dealerNameMap?.[dealerName]) {
    return dealerNameMap[dealerName];
  }

  return dealerName;
};

export default function CarShowcase() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    vendor: [],
    model: [],
    color: [],
    body: [],
    transmission: [],
    dealer: [],
    price: [0, 9999999],
  });

  const [openFilters, setOpenFilters] = useState({
    vendor: false,
    model: false,
    color: false,
    body: false,
    transmission: false,
    dealer: false,
  });

  const [filteredOptions, setFilteredOptions] = useState({
    vendors: [],
    models: [],
    colors: [],
    bodies: [],
    transmissions: [],
    dealers: [],
  });

  const [priceRange, setPriceRange] = useState([0, 9999999]);
  const [visibleCount, setVisibleCount] = useState(24);
  const [modalCar, setModalCar] = useState(null);
  const [modalFilters, setModalFilters] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hotVins, setHotVins] = useState(new Set());

  const brands = filteredOptions.vendors;
  const models = filteredOptions.models;
  const colors = filteredOptions.colors;
  const bodies = filteredOptions.bodies;
  const transmissions = filteredOptions.transmissions;
  const dealers = filteredOptions.dealers;

  const toggleFilterVisibility = (filter) => {
    setOpenFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  /* =======================
     ЗАГРУЗКА ГОРЯЧЕГО RSS
  ======================= */
  useEffect(() => {
    let isMounted = true;
    const fetchHotOffers = async () => {
      try {
        const res = await fetch("/api/fetch-hot-feed");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data?.vins) {
          const vinsSet = new Set((data.vins || []).filter(Boolean));
          setHotVins(vinsSet);
        }
      } catch (err) {
        console.warn("Ошибка загрузки горячих предложений", err);
      }
    };
    fetchHotOffers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Быстрое обновление метки горячих авто без повторного скачивания всего фида
  useEffect(() => {
    if (hotVins.size > 0) {
      setCars((prev) =>
        prev.map((car) => ({ ...car, isHot: hotVins.has(car.vin) }))
      );
      setFiltered((prev) =>
        prev.map((car) => ({ ...car, isHot: hotVins.has(car.vin) }))
      );
    }
  }, [hotVins]);

  /* =======================
     ЗАГРУЗКА ФИДА
  ======================= */
  useEffect(() => {
    let isMounted = true;
    const fetchFeeds = async () => {
      try {
        const res = await fetch("/api/fetch-feed-all");
        if (!res.ok) {
          throw new Error(`Статус ответа: ${res.status}`);
        }
        const xmlText = await res.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");

        const vehicles = Array.from(xml.querySelectorAll("vehicle"));

        const allCars = vehicles
          .map((vehicle) => {
            const get = (tag) =>
              vehicle.querySelector(tag)?.textContent?.trim() || "";

            const brand = vehicle.querySelector("brand")?.textContent || "";
            const model = vehicle.querySelector("model")?.textContent || "";
            const vin = get("vin");
            const isHot = hotVins.has(vin);
            const rawDealer = vehicle.querySelector("dealer")?.textContent || "";
            const dealer = normalizeDealer(rawDealer, brand);

            const engineVolume = get("engineVolume");
            const enginePower = get("enginePower");
            const drive = get("driveType");

            const equipmentGroups = Array.from(
              vehicle.querySelectorAll("equipment > group")
            ).map((group) => {
              const groupName = group.getAttribute("name");
              const items = Array.from(group.querySelectorAll("element"))
                .map((el) => el.textContent.trim())
                .filter(Boolean);

              return {
                name: groupName,
                items,
              };
            });

            const priceWithDiscount = Number(get("priceWithDiscount"));
            const price = Number(get("price"));

            if ((!priceWithDiscount || priceWithDiscount === 0) && (!price || price === 0)) return null;

            return {
              id: get("id"),
              vendor: brand,
              model,
              year: get("year"),
              vin,
              isHot,
              price: priceWithDiscount && priceWithDiscount > 0 ? priceWithDiscount : price,
              oldPrice: priceWithDiscount && priceWithDiscount > 0 ? (price && price > priceWithDiscount ? price : null) : null,
              pictures: Array.from(vehicle.querySelectorAll("photos > photo")).map((p) => p.textContent),
              color: mapColor(get("bodyColor")),
              body: get("bodyConfiguration"),
              transmission: mapGearbox(get("gearboxType")),
              dealer,
              drive,
              equipment: equipmentGroups,
              params: [
                { name: "Кузов", value: get("bodyConfiguration") },
                { name: "Цвет", value: mapColor(get("bodyColor")) },
                { name: "Год", value: get("year") },
                { name: "Привод", value: mapDrive(drive) },
                { name: "Трансмиссия", value: mapGearbox(get("gearboxType")) },
                { name: "Двигатель", value: engineVolume || enginePower ? `${engineVolume} см³ / ${enginePower} л.с.` : "" },
              ].filter((p) => p.value),
            };
          })
          .filter(Boolean);

        if (!isMounted) return;

        const prices = allCars.map((c) => c.price);
        const min = prices.length ? Math.min(...prices) : 0;
        const max = prices.length ? Math.max(...prices) : 0;

        setCars(allCars);
        setFiltered(allCars);
        setPriceRange([min, max]);
        setFilters((prev) => ({ ...prev, price: [min, max] }));
        setLoading(false);
      } catch (e) {
        if (!isMounted) return;
        console.error("Ошибка загрузки фида", e);
        setLoading(false);
      }
    };

    fetchFeeds();
    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================
     ФИЛЬТРАЦИЯ
  ======================= */
  useEffect(() => {
    const result = cars.filter((car) => {
      return (
        (filters.vendor.length === 0 || filters.vendor.includes(car.vendor)) &&
        (filters.model.length === 0 || filters.model.includes(car.model)) &&
        (filters.color.length === 0 || filters.color.includes(car.color)) &&
        (filters.body.length === 0 || filters.body.includes(car.body)) &&
        (filters.transmission.length === 0 ||
          filters.transmission.includes(car.transmission)) &&
        (filters.dealer.length === 0 || filters.dealer.includes(car.dealer)) &&
        car.price >= filters.price[0] &&
        car.price <= filters.price[1]
      );
    });

    setFiltered(result);
    setVisibleCount(24);

    let carsToFilter = cars;
    if (filters.vendor.length)
      carsToFilter = carsToFilter.filter((c) =>
        filters.vendor.includes(c.vendor)
      );
    if (filters.model.length)
      carsToFilter = carsToFilter.filter((c) =>
        filters.model.includes(c.model)
      );

    setFilteredOptions({
      vendors: [...new Set(cars.map((c) => c.vendor))],
      models: [...new Set(carsToFilter.map((c) => c.model))],
      colors: [...new Set(cars.map((c) => c.color))],
      bodies: [...new Set(cars.map((c) => c.body))],
      transmissions: [...new Set(cars.map((c) => c.transmission))],
      dealers: [...new Set(cars.map((c) => c.dealer))],
    });
  }, [filters, cars]);

  const handleCheckboxChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter((v) => v !== value)
        : [...prev[name], value],
    }));
  };

  const resetFilters = () => {
    setFilters({
      vendor: [],
      model: [],
      color: [],
      body: [],
      transmission: [],
      dealer: [],
      price: [...priceRange],
    });
  };

  const activeFiltersCount = 
    filters.vendor.length +
    filters.model.length +
    filters.color.length +
    filters.body.length +
    filters.transmission.length +
    filters.dealer.length +
    (filters.price[0] > priceRange[0] || filters.price[1] < priceRange[1] ? 1 : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          car: {
            vendor: modalCar.vendor,
            model: modalCar.model,
            dealer: modalCar.dealer,
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
      console.error("Ошибка:", error);
      alert("Ошибка сети. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Компонент аккордеона фильтра
  const renderFilterAccordion = (title, key, items) => {
    const selectedCount = filters[key]?.length || 0;
    const isOpen = openFilters[key];

    return (
      <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs transition">
        <button
          type="button"
          onClick={() => toggleFilterVisibility(key)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition"
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
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-slate-700" : ""}`} 
          />
        </button>

        {isOpen && (
          <div className="p-3 pt-1 border-t border-slate-100 max-h-52 overflow-y-auto space-y-1.5 scrollbar-thin">
            {items.map((item) => {
              const isChecked = filters[key].includes(item);
              return (
                <label 
                  key={item} 
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer text-sm transition select-none ${
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
                  <span className="break-words leading-tight">{item}</span>
                </label>
              );
            })}
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
              onClick={() => navigate(-1)}
              aria-label="Назад"
              className="p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                Новые автомобили
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
            <p className="text-sm text-slate-500 mt-4 animate-pulse">Загружаем актуальные предложения...</p>
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
                {renderFilterAccordion("Марка", "vendor", brands)}
                {renderFilterAccordion("Модель", "model", models)}
                {renderFilterAccordion("Дилер", "dealer", dealers)}
                {renderFilterAccordion("Кузов", "body", bodies)}
                {renderFilterAccordion("Трансмиссия", "transmission", transmissions)}
                {renderFilterAccordion("Цвет", "color", colors)}
              </div>

              {/* Слайдер цены на десктопе */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ценовой диапазон</span>
                  <span className="text-sm font-bold text-slate-900">
                    {filters.price[0].toLocaleString()} ₽ — {filters.price[1].toLocaleString()} ₽
                  </span>
                </div>
                <Range
                  step={10000}
                  min={priceRange[0]}
                  max={priceRange[1]}
                  values={filters.price}
                  onChange={(values) => setFilters({ ...filters, price: values })}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="h-2 my-4 rounded-full relative cursor-pointer"
                      style={{
                        ...props.style,
                        background: `linear-gradient(
                          to right,
                          #e2e8f0 ${((filters.price[0] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%,
                          #8cc63f ${((filters.price[0] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%,
                          #8cc63f ${((filters.price[1] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%,
                          #e2e8f0 ${((filters.price[1] - priceRange[0]) / Math.max(1, priceRange[1] - priceRange[0])) * 100}%
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
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-500 font-bold hover:underline px-2 py-1"
                >
                  Очистить все
                </button>
              </div>
            )}

            {/* Сетка автомобилей */}
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
                  const hasDiscount = car.oldPrice && car.oldPrice > car.price;
                  const discountAmount = hasDiscount ? car.oldPrice - car.price : 0;

                  return (
                    <article
                      key={car.id}
                      onClick={() => navigate("/NewCarDetails", { state: { car } })}
                      className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
                    >
                      {/* Фото блок с бейджами */}
                      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                        {car.pictures && car.pictures[0] ? (
                          <img
                            src={car.pictures[0]}
                            alt={`${car.vendor} ${car.model}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <CarIcon className="w-12 h-12" />
                          </div>
                        )}

                        {/* Горячее предложение */}
                        {car.isHot && (
                          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-extrabold shadow-md tracking-tight uppercase">
                            <Flame className="w-3.5 h-3.5 fill-white text-white" />
                            <span>Хит</span>
                          </div>
                        )}

                        {/* Дилерский бейдж */}
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
                          {/* Заголовок */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition">
                              {car.vendor} {car.model}
                            </h3>
                            {car.year && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold shrink-0">
                                {car.year}
                              </span>
                            )}
                          </div>

                          {/* Цены */}
                          <div className="mb-3">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-extrabold text-[#75ab32] tracking-tight">
                                {car.price.toLocaleString()} ₽
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-slate-400 line-through">
                                  {car.oldPrice.toLocaleString()} ₽
                                </span>
                              )}
                            </div>
                            {hasDiscount && (
                              <span className="text-[11px] font-bold text-emerald-600">
                                Выгода: -{discountAmount.toLocaleString()} ₽
                              </span>
                            )}
                          </div>

                          {/* Характеристики (пилюли) */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {car.params
                              .filter((p) => ["Кузов", "Цвет", "Трансмиссия", "Привод", "Двигатель"].includes(p.name))
                              .slice(0, 4)
                              .map((p, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2.5 py-1 bg-slate-100/80 text-slate-600 text-[11px] font-medium rounded-lg leading-none"
                                >
                                  {p.value}
                                </span>
                              ))}
                          </div>
                        </div>

                        {/* Кнопка бронирования (от 50px высотой, удобная под палец) */}
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

            {/* Кнопка «Показать еще» */}
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

      {/* Плавающая кнопка фильтров (для мобильных) */}
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

      {/* Кнопка наверх */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Наверх"
        className="fixed bottom-38 right-4 z-40 p-3 rounded-full bg-white/90 backdrop-blur-md text-slate-700 border border-slate-200 shadow-md hover:bg-white active:scale-90 transition"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Модальное окно фильтров на смартфонах */}
      {modalFilters && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-xl max-h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
            {/* Шапка модалки */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#8cc63f]" />
                <h3 className="text-base font-bold text-slate-900">Фильтры каталога</h3>
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
                    {filters.price[0].toLocaleString()} ₽ — {filters.price[1].toLocaleString()} ₽
                  </span>
                </div>
                <Range
                  step={10000}
                  min={priceRange[0]}
                  max={priceRange[1]}
                  values={filters.price}
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

              {renderFilterAccordion("Марка", "vendor", brands)}
              {renderFilterAccordion("Модель", "model", models)}
              {renderFilterAccordion("Дилер", "dealer", dealers)}
              {renderFilterAccordion("Кузов", "body", bodies)}
              {renderFilterAccordion("Трансмиссия", "transmission", transmissions)}
              {renderFilterAccordion("Цвет", "color", colors)}
            </div>

            {/* Подвал с кнопками */}
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

      {/* Модалка бронирования */}
      {modalCar && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSubmit}
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
              {modalCar.pictures?.[0] ? (
                <img
                  src={modalCar.pictures[0]}
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
                  {modalCar.vendor} {modalCar.model}
                </h4>
                <p className="text-xs text-[#75ab32] font-extrabold">
                  {modalCar.price?.toLocaleString()} ₽
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
