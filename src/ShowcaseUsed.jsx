import React, { useEffect, useState } from "react";
import { Range } from "react-range";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import translations from "./translations";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";

const translateValue = (value) => {
  if (!value) return value;
  return translations[value.toLowerCase()] || value;
};

export default function CarShowcaseUsed() {
  const [cars, setCars] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const initialBrand = location.state?.brand;
  const [filtered, setFiltered] = useState([]);

  const defaultFilterState = {
    vendor: initialBrand ? [initialBrand] : [],
    model: [],
    color: [],
    body: [],
    transmission: [],
    drive: [],
    price: [0, 9999999],
    run: [0, 500000],
    year: [1990, 2026],
    dealer: [],
  };

  const [filters, setFilters] = useState(() => {
    if (initialBrand) {
      return { ...defaultFilterState, vendor: [initialBrand] };
    }
    const saved = localStorage.getItem("usedFilters");
    return saved ? JSON.parse(saved) : defaultFilterState;
  });

  const [priceRange, setPriceRange] = useState([0, 9999999]);
  const [runRange, setRunRange] = useState([0, 500000]);
  const [yearRange, setYearRange] = useState([1990, 2026]);

  const [filteredOptions, setFilteredOptions] = useState({
    vendors: [],
    models: [],
    colors: [],
    bodies: [],
    transmissions: [],
    drives: [],
    dealers: [],
  });

  const [openFilters, setOpenFilters] = useState({
    vendor: false,
    model: false,
    color: false,
    body: false,
    transmission: false,
    drive: false,
    dealer: false,
  });

  const [modalCar, setModalCar] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(true);

  const [visibleCount, setVisibleCount] = useState(() => {
    const saved = localStorage.getItem("usedVisibleCount");
    return saved ? parseInt(saved, 10) : 24;
  });

  const toggleFilterVisibility = (filter) => {
    setOpenFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const handleCheckboxChange = (name, value) => {
    setFilters((prev) => {
      const newValues = prev[name].includes(value)
        ? prev[name].filter((v) => v !== value)
        : [...prev[name], value];
      const updated = { ...prev, [name]: newValues };
      localStorage.setItem("usedFilters", JSON.stringify(updated));
      return updated;
    });
  };

  const resetFilters = () => {
    const fresh = {
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
    };
    setFilters(fresh);
    localStorage.removeItem("usedFilters");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        alert("Заявка успешно отправлена!");
        setFormData({ name: "", phone: "" });
        setModalCar(null);
      } else {
        alert("Ошибка при отправке. Попробуйте позже.");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка сети. Попробуйте позже.");
    }
  };

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch("/api/fetch-feed-used");
        const xmlText = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");

        const carsArray = Array.from(xml.querySelectorAll("vehicle")).map(
          (car) => {
            const get = (tag) => car.querySelector(tag)?.textContent || "";

            return {
              id: get("id"),
              vendor: get("brand"),
              model: get("model"),
              price: parseInt(get("price"), 10) || 0,
              maxDiscount: parseInt(get("maxDiscount"), 10) || 0,
              images: Array.from(
                car.querySelectorAll("photos > photo")
              ).map((img) => img.textContent),
              color: get("bodyColor"),
              body: get("bodyType"),
              transmission: get("gearboxType"),
              drive: get("driveType"),
              year: parseInt(get("year"), 10) || 0,
              run: parseInt(get("mileage"), 10) || 0,
              dealer: car.querySelector("dealer")?.textContent || "",
              engineType: get("engineType"),
              description: get("description"),
              engineVolume: get("engineVolume"),
              enginePower: get("enginePower"),
              complectation: get("complectation"),
              extras: Array.from(
                car.querySelectorAll("equipment group element")
              ).map((e) => e.textContent.trim()),
            };
          }
        );

        const prices = carsArray.map((c) => c.price).filter(Boolean);
        const runs = carsArray.map((c) => c.run).filter(Boolean);
        const years = carsArray.map((c) => c.year).filter(Boolean);

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

        setFilters((prev) => ({
          ...prev,
          price:
            prev.price[0] === 0 && prev.price[1] === 9999999
              ? [minPrice, maxPrice]
              : prev.price,
          run:
            prev.run[0] === 0 && prev.run[1] === 500000
              ? [minRun, maxRun]
              : prev.run,
          year:
            prev.year[0] === 1990 && prev.year[1] === 2026
              ? [minYear, maxYear]
              : prev.year,
        }));

        setLoading(false);
      } catch (error) {
        console.error("Ошибка загрузки фида:", error);
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  useEffect(() => {
    const result = cars.filter((car) => {
      const vendorMatch =
        filters.vendor.length === 0 ||
        filters.vendor.some(
          (fv) =>
            fv.toLowerCase() === car.vendor?.toLowerCase() ||
            car.vendor?.toLowerCase().includes(fv.toLowerCase()) ||
            fv.toLowerCase().includes(car.vendor?.toLowerCase())
        );

      return (
        vendorMatch &&
        (filters.model.length === 0 || filters.model.includes(car.model)) &&
        (filters.color.length === 0 || filters.color.includes(car.color)) &&
        (filters.body.length === 0 || filters.body.includes(car.body)) &&
        (filters.transmission.length === 0 ||
          filters.transmission.includes(car.transmission)) &&
        (filters.drive.length === 0 || filters.drive.includes(car.drive)) &&
        (filters.dealer.length === 0 || filters.dealer.includes(car.dealer)) &&
        car.price >= filters.price[0] &&
        car.price <= filters.price[1] &&
        car.run >= filters.run[0] &&
        car.run <= filters.run[1] &&
        car.year >= filters.year[0] &&
        car.year <= filters.year[1]
      );
    });

    setFiltered(result);
    setVisibleCount(24);

    let carsToFilter = cars;
    if (filters.vendor.length > 0) {
      carsToFilter = carsToFilter.filter((c) =>
        filters.vendor.some(
          (fv) =>
            fv.toLowerCase() === c.vendor?.toLowerCase() ||
            c.vendor?.toLowerCase().includes(fv.toLowerCase()) ||
            fv.toLowerCase().includes(c.vendor?.toLowerCase())
        )
      );
    }

    setFilteredOptions({
      vendors: [...new Set(cars.map((c) => c.vendor))].filter(Boolean),
      models: [...new Set(carsToFilter.map((c) => c.model))].filter(Boolean),
      colors: [...new Set(cars.map((c) => c.color))].filter(Boolean),
      bodies: [...new Set(cars.map((c) => c.body))].filter(Boolean),
      transmissions: [...new Set(cars.map((c) => c.transmission))].filter(Boolean),
      drives: [...new Set(cars.map((c) => c.drive))].filter(Boolean),
      dealers: [...new Set(cars.map((c) => c.dealer))].filter(Boolean),
    });
  }, [filters, cars]);

  useEffect(() => {
    const scrollToId = localStorage.getItem("scrollToUsedCarId");
    if (!scrollToId || !filtered.length) return;

    let attempts = 0;
    const maxAttempts = 10;

    const tryScroll = () => {
      const el = document.getElementById(`car-${scrollToId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        localStorage.removeItem("scrollToUsedCarId");
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryScroll, 100);
      }
    };

    tryScroll();
  }, [cars, visibleCount, filtered]);

  return (
    <div className="p-6 pb-28 bg-gray-50 min-h-screen relative font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Кнопка назад */}
        <div className="mb-4">
          <a
            href="/"
            className="inline-flex items-center text-orange-600 hover:underline font-semibold text-sm"
          >
            <ArrowLeft className="mr-1" size={16} /> Назад на главную
          </a>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
          Автомобили с пробегом
        </h1>

        {loading ? (
          <Preloader />
        ) : (
          <>
            <div className="mb-6 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                {/* Марка */}
                <div className={`filter ${openFilters.vendor ? "active" : ""}`}>
                  <h3
                    className="text-base font-semibold mb-2 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleFilterVisibility("vendor")}
                  >
                    Марка {filters.vendor.length > 0 && `(${filters.vendor.length})`}
                    <span className={`filter-arrow ${openFilters.vendor ? "active" : ""}`}>
                      &#9660;
                    </span>
                  </h3>
                  {openFilters.vendor &&
                    filteredOptions.vendors.map((brand) => (
                      <label key={brand} className="flex items-center space-x-2 mb-1.5 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          value={brand}
                          checked={filters.vendor.includes(brand)}
                          onChange={() => handleCheckboxChange("vendor", brand)}
                          className="accent-[#8cc63f] w-4 h-4 cursor-pointer"
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                </div>

                {/* Модель */}
                <div className={`filter ${openFilters.model ? "active" : ""}`}>
                  <h3
                    className="text-base font-semibold mb-2 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleFilterVisibility("model")}
                  >
                    Модель {filters.model.length > 0 && `(${filters.model.length})`}
                    <span className={`filter-arrow ${openFilters.model ? "active" : ""}`}>
                      &#9660;
                    </span>
                  </h3>
                  {openFilters.model &&
                    filteredOptions.models.map((model) => (
                      <label key={model} className="flex items-center space-x-2 mb-1.5 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          value={model}
                          checked={filters.model.includes(model)}
                          onChange={() => handleCheckboxChange("model", model)}
                          className="accent-[#8cc63f] w-4 h-4 cursor-pointer"
                        />
                        <span>{model}</span>
                      </label>
                    ))}
                </div>

                {/* Цвет */}
                <div className={`filter ${openFilters.color ? "active" : ""}`}>
                  <h3
                    className="text-base font-semibold mb-2 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleFilterVisibility("color")}
                  >
                    Цвет
                    <span className={`filter-arrow ${openFilters.color ? "active" : ""}`}>
                      &#9660;
                    </span>
                  </h3>
                  {openFilters.color &&
                    filteredOptions.colors.map((color) => (
                      <label key={color} className="flex items-center space-x-2 mb-1.5 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          value={color}
                          checked={filters.color.includes(color)}
                          onChange={() => handleCheckboxChange("color", color)}
                          className="accent-[#8cc63f] w-4 h-4 cursor-pointer"
                        />
                        <span>{translateValue(color)}</span>
                      </label>
                    ))}
                </div>

                {/* Трансмиссия */}
                <div className={`filter ${openFilters.transmission ? "active" : ""}`}>
                  <h3
                    className="text-base font-semibold mb-2 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleFilterVisibility("transmission")}
                  >
                    Трансмиссия
                    <span className={`filter-arrow ${openFilters.transmission ? "active" : ""}`}>
                      &#9660;
                    </span>
                  </h3>
                  {openFilters.transmission &&
                    filteredOptions.transmissions.map((transmission) => (
                      <label key={transmission} className="flex items-center space-x-2 mb-1.5 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          value={transmission}
                          checked={filters.transmission.includes(transmission)}
                          onChange={() =>
                            handleCheckboxChange("transmission", transmission)
                          }
                          className="accent-[#8cc63f] w-4 h-4 cursor-pointer"
                        />
                        <span>{translateValue(transmission)}</span>
                      </label>
                    ))}
                </div>

                {/* Кузов */}
                <div className={`filter ${openFilters.body ? "active" : ""}`}>
                  <h3
                    className="text-base font-semibold mb-2 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleFilterVisibility("body")}
                  >
                    Кузов
                    <span className={`filter-arrow ${openFilters.body ? "active" : ""}`}>
                      &#9660;
                    </span>
                  </h3>
                  {openFilters.body &&
                    filteredOptions.bodies.map((body) => (
                      <label key={body} className="flex items-center space-x-2 mb-1.5 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          value={body}
                          checked={filters.body.includes(body)}
                          onChange={() => handleCheckboxChange("body", body)}
                          className="accent-[#8cc63f] w-4 h-4 cursor-pointer"
                        />
                        <span>{translateValue(body)}</span>
                      </label>
                    ))}
                </div>

                {/* Привод */}
                <div className={`filter ${openFilters.drive ? "active" : ""}`}>
                  <h3
                    className="text-base font-semibold mb-2 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleFilterVisibility("drive")}
                  >
                    Привод
                    <span className={`filter-arrow ${openFilters.drive ? "active" : ""}`}>
                      &#9660;
                    </span>
                  </h3>
                  {openFilters.drive &&
                    filteredOptions.drives.map((drive) => (
                      <label key={drive} className="flex items-center space-x-2 mb-1.5 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          value={drive}
                          checked={filters.drive.includes(drive)}
                          onChange={() => handleCheckboxChange("drive", drive)}
                          className="accent-[#8cc63f] w-4 h-4 cursor-pointer"
                        />
                        <span>{translateValue(drive)}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Ползунки */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-gray-100">
                {/* Стоимость */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Стоимость: {filters.price[0].toLocaleString()} ₽ –{" "}
                    {filters.price[1].toLocaleString()} ₽
                  </label>
                  <Range
                    step={10000}
                    min={priceRange[0]}
                    max={priceRange[1]}
                    values={filters.price}
                    onChange={(values) =>
                      setFilters({ ...filters, price: values })
                    }
                    renderTrack={({ props, children }) => {
                      const { key, ...restProps } = props;
                      return (
                        <div
                          key={key}
                          {...restProps}
                          className="h-2 my-4 rounded"
                          style={{
                            ...restProps.style,
                            background: `linear-gradient(to right, #e0e0e0 ${
                              ((filters.price[0] - priceRange[0]) /
                                (priceRange[1] - priceRange[0] || 1)) *
                              100
                            }%, #8cc63f ${
                              ((filters.price[0] - priceRange[0]) /
                                (priceRange[1] - priceRange[0] || 1)) *
                              100
                            }%, #8cc63f ${
                              ((filters.price[1] - priceRange[0]) /
                                (priceRange[1] - priceRange[0] || 1)) *
                              100
                            }%, #e0e0e0 ${
                              ((filters.price[1] - priceRange[0]) /
                                (priceRange[1] - priceRange[0] || 1)) *
                              100
                            }%)`,
                          }}
                        >
                          {children}
                        </div>
                      );
                    }}
                    renderThumb={({ props }) => {
                      const { key, ...restProps } = props;
                      return (
                        <div
                          key={key}
                          {...restProps}
                          className="rounded-full shadow cursor-pointer"
                          style={{
                            ...restProps.style,
                            height: "20px",
                            width: "20px",
                            backgroundColor: "#8cc63f",
                            border: "2px solid white",
                          }}
                        />
                      );
                    }}
                  />
                </div>

                {/* Пробег */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пробег: {filters.run[0].toLocaleString()} км –{" "}
                    {filters.run[1].toLocaleString()} км
                  </label>
                  <Range
                    step={5000}
                    min={runRange[0]}
                    max={runRange[1]}
                    values={filters.run}
                    onChange={(values) =>
                      setFilters({ ...filters, run: values })
                    }
                    renderTrack={({ props, children }) => {
                      const { key, ...restProps } = props;
                      return (
                        <div
                          key={key}
                          {...restProps}
                          className="h-2 my-4 rounded"
                          style={{
                            ...restProps.style,
                            background: `linear-gradient(to right, #e0e0e0 ${
                              ((filters.run[0] - runRange[0]) /
                                (runRange[1] - runRange[0] || 1)) *
                              100
                            }%, #f97316 ${
                              ((filters.run[0] - runRange[0]) /
                                (runRange[1] - runRange[0] || 1)) *
                              100
                            }%, #f97316 ${
                              ((filters.run[1] - runRange[0]) /
                                (runRange[1] - runRange[0] || 1)) *
                              100
                            }%, #e0e0e0 ${
                              ((filters.run[1] - runRange[0]) /
                                (runRange[1] - runRange[0] || 1)) *
                              100
                            }%)`,
                          }}
                        >
                          {children}
                        </div>
                      );
                    }}
                    renderThumb={({ props }) => {
                      const { key, ...restProps } = props;
                      return (
                        <div
                          key={key}
                          {...restProps}
                          className="rounded-full shadow cursor-pointer"
                          style={{
                            ...restProps.style,
                            height: "20px",
                            width: "20px",
                            backgroundColor: "#f97316",
                            border: "2px solid white",
                          }}
                        />
                      );
                    }}
                  />
                </div>

                {/* Год */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Год выпуска: {filters.year[0]} – {filters.year[1]}
                  </label>
                  <Range
                    step={1}
                    min={yearRange[0]}
                    max={yearRange[1]}
                    values={filters.year}
                    onChange={(values) =>
                      setFilters({ ...filters, year: values })
                    }
                    renderTrack={({ props, children }) => {
                      const { key, ...restProps } = props;
                      return (
                        <div
                          key={key}
                          {...restProps}
                          className="h-2 my-4 rounded"
                          style={{
                            ...restProps.style,
                            background: `linear-gradient(to right, #e0e0e0 ${
                              ((filters.year[0] - yearRange[0]) /
                                (yearRange[1] - yearRange[0] || 1)) *
                              100
                            }%, #8cc63f ${
                              ((filters.year[0] - yearRange[0]) /
                                (yearRange[1] - yearRange[0] || 1)) *
                              100
                            }%, #8cc63f ${
                              ((filters.year[1] - yearRange[0]) /
                                (yearRange[1] - yearRange[0] || 1)) *
                              100
                            }%, #e0e0e0 ${
                              ((filters.year[1] - yearRange[0]) /
                                (yearRange[1] - yearRange[0] || 1)) *
                              100
                            }%)`,
                          }}
                        >
                          {children}
                        </div>
                      );
                    }}
                    renderThumb={({ props }) => {
                      const { key, ...restProps } = props;
                      return (
                        <div
                          key={key}
                          {...restProps}
                          className="rounded-full shadow cursor-pointer"
                          style={{
                            ...restProps.style,
                            height: "20px",
                            width: "20px",
                            backgroundColor: "#8cc63f",
                            border: "2px solid white",
                          }}
                        />
                      );
                    }}
                  />
                </div>
              </div>

              {/* Сброс фильтров */}
              <div className="flex justify-center mt-3">
                <button
                  onClick={resetFilters}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-full transition shadow-xs cursor-pointer text-sm"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>

            {/* Список карточек авто */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.slice(0, visibleCount).map((car) => (
                <div
                  key={car.id}
                  id={`car-${car.id}`}
                  onClick={() => {
                    navigate("/UsedCarDetails", { state: { car } });
                  }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-200/80 overflow-hidden cursor-pointer flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="overflow-hidden bg-gray-100 aspect-[16/10] relative">
                      {car.maxDiscount > 0 && (
                        <div className="absolute top-2.5 left-2.5 z-20 bg-orange-600 text-white px-2 py-0.5 rounded-md text-[11px] font-bold shadow-xs">
                          Скидка {car.maxDiscount.toLocaleString()} ₽
                        </div>
                      )}

                      <img
                        src={car.images[0] || "/auto-probeg-1.png"}
                        alt={car.model}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                        {car.vendor} {car.model}
                      </div>
                      <div className="text-gray-900 font-extrabold text-xl mb-1">
                        {car.price.toLocaleString()} ₽
                      </div>

                      <div className="text-xs text-gray-600 space-y-0.5 mt-2">
                        <div>
                          <b>Год:</b> {car.year} г. • <b>Пробег:</b>{" "}
                          {car.run.toLocaleString()} км
                        </div>
                        {car.transmission && (
                          <div>
                            <b>КПП:</b> {translateValue(car.transmission)}
                          </div>
                        )}
                        {car.dealer && (
                          <div className="text-gray-500 truncate pt-1">
                            {car.dealer}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition text-sm cursor-pointer shadow-2xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalCar(car);
                      }}
                    >
                      Забронировать
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Показать еще */}
            {visibleCount < filtered.length && (
              <div className="text-center mt-8 mb-16">
                <button
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-xs transition text-sm cursor-pointer"
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                >
                  Показать еще
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Модальное окно бронирования */}
      {modalCar && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4"
          onClick={() => setModalCar(null)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalCar(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Бронирование авто с пробегом
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {modalCar.vendor} {modalCar.model} • {modalCar.price.toLocaleString()} ₽
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Ваше имя
                </label>
                <input
                  type="text"
                  placeholder="Имя"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition text-sm cursor-pointer shadow-xs"
              >
                Отправить заявку
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
