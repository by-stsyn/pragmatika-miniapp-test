import React, { useEffect, useState } from "react";
import { Range } from "react-range";
import { ArrowUp, ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const [filtered, setFiltered] = useState([]);
  const defaultFilterState = {
  vendor: [],
  model: [],
  color: [],
  body: [],
  transmission: [],
  drive: [],
  price: [0, 9999999],
  run: [0, 500000],
  year: [1990, 2025],
  dealer: [],
};

const [filters, setFilters] = useState(() => {
  const saved = localStorage.getItem("usedFilters");
  return saved ? JSON.parse(saved) : defaultFilterState;
});

  const [priceRange, setPriceRange] = useState([0, 9999999]);
  const [runRange, setRunRange] = useState([0, 500000]);
  const [yearRange, setYearRange] = useState([1990, 2025]);

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
  const [modalFilters, setModalFilters] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);
 const [visibleCount, setVisibleCount] = useState(() => {
  const saved = localStorage.getItem("usedVisibleCount");
  return saved ? parseInt(saved, 22) : 24;
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

    const carsArray = Array.from(xml.querySelectorAll("vehicle")).map((car) => {
      const get = (tag) => car.querySelector(tag)?.textContent || "";

      return {
        id: get("id"),
        vendor: get("brand"),
        model: get("model"),
        price: parseInt(get("price")) || 0,
        maxDiscount: parseInt(get("maxDiscount")) || 0,
        images: Array.from(car.querySelectorAll("photos > photo")).map((img) => img.textContent),
        color: get("bodyColor"),
        body: get("bodyType"),
        transmission: get("gearboxType"),
        drive: get("driveType"),
        year: parseInt(get("year")) || 0,
        run: parseInt(get("mileage")) || 0,
        dealer: car.querySelector("dealer")?.textContent || "",
        engineType: get("engineType"),
        description: get("description"),
		engineVolume: get("engineVolume"),
		enginePower: get("enginePower"),
	    // комплектация
  complectation: get("complectation"),

  // список опций
  extras: Array.from(car.querySelectorAll("equipment group element"))
               .map(e => e.textContent.trim()),


      };
    });

    const prices = carsArray.map((c) => c.price).filter(Boolean);
    const runs = carsArray.map((c) => c.run).filter(Boolean);
    const years = carsArray.map((c) => c.year).filter(Boolean);

    setCars(carsArray);
    setFiltered(carsArray);

    if (prices.length) setPriceRange([Math.min(...prices), Math.max(...prices)]);
    if (runs.length) setRunRange([Math.min(...runs), Math.max(...runs)]);
    if (years.length) setYearRange([Math.min(...years), Math.max(...years)]);

    setFilters((prev) => ({
      ...prev,
      price: prices.length ? [Math.min(...prices), Math.max(...prices)] : prev.price,
      run: runs.length ? [Math.min(...runs), Math.max(...runs)] : prev.run,
      year: years.length ? [Math.min(...years), Math.max(...years)] : prev.year,
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
      return (
        (filters.vendor.length === 0 || filters.vendor.includes(car.vendor)) &&
        (filters.model.length === 0 || filters.model.includes(car.model)) &&
        (filters.color.length === 0 || filters.color.includes(car.color)) &&
        (filters.body.length === 0 || filters.body.includes(car.body)) &&
        (filters.transmission.length === 0 || filters.transmission.includes(car.transmission)) &&
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
      carsToFilter = carsToFilter.filter((c) => filters.vendor.includes(c.vendor));
    }

    setFilteredOptions({
      vendors: [...new Set(cars.map((c) => c.vendor))],
      models: [...new Set(carsToFilter.map((c) => c.model))],
      colors: [...new Set(carsToFilter.map((c) => c.color))],
      bodies: [...new Set(carsToFilter.map((c) => c.body))],
      transmissions: [...new Set(carsToFilter.map((c) => c.transmission))],
      drives: [...new Set(carsToFilter.map((c) => c.drive))],
      dealers: [...new Set(carsToFilter.map((c) => c.dealer))],
    });
  }, [filters, cars]);

	useEffect(() => {
  const scrollToId = localStorage.getItem("scrollToUsedCarId");
  if (!scrollToId || !filtered.length) return;

  // найти индекс нужной карточки
  const index = filtered.findIndex((car) => car.id === scrollToId);
  if (index === -1) return;

  // если нужная карточка за пределами visibleCount — увеличиваем его
  if (index >= visibleCount) {
    setVisibleCount(index + 1); // +1, чтобы точно попала
  }
}, [filtered]);

	useEffect(() => {
  localStorage.setItem("usedFilters", JSON.stringify(filters));
}, [filters]);

useEffect(() => {
  localStorage.setItem("usedVisibleCount", visibleCount.toString());
}, [visibleCount]);

	useEffect(() => {
  const savedFilters = localStorage.getItem("usedFilters");
  const savedVisibleCount = localStorage.getItem("usedVisibleCount");

  if (savedFilters) {
    setFilters(JSON.parse(savedFilters));
  }

  if (savedVisibleCount) {
    setVisibleCount(parseInt(savedVisibleCount, 10));
  }
}, []);

	useEffect(() => {
  const scrollToId = localStorage.getItem("scrollToUsedCarId");
  if (!scrollToId) return;

  let attempts = 0;
  const maxAttempts = 10;

  const tryScroll = () => {
    const el = document.getElementById(`car-${scrollToId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      localStorage.removeItem("scrollToUsedCarId");
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(tryScroll, 100); // повторяем через 100мс
    }
  };

  tryScroll();
}, [cars, visibleCount]);

  return (
    <div className="p-6 pb-[75px] bg-gray-50 min-h-screen relative">
	
	<div className="max-w-7xl mx-auto">
        {/* Кнопка назад */}
        <div className="mb-4">
          <a href="/" className="inline-flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="mr-1" /> Назад
          </a>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Автомобили с пробегом</h1>

        {loading ? (
  <Preloader />
) : (
  <>
	
      <div className="mb-4">
  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
    {/* Марка */}
    <div className={`filter ${openFilters.vendor ? 'active' : ''}`}>  
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer relative flex items-center justify-between"
        onClick={() => toggleFilterVisibility('vendor')}
      >
        Марка
	      <span className={`filter-arrow ${openFilters.vendor ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.vendor && filteredOptions.vendors.map((brand) => (
        <label key={brand} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={brand}
            checked={filters.vendor.includes(brand)}
            onChange={() => handleCheckboxChange('vendor', brand)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{brand}</span>
        </label>
      ))}
    </div>

    {/* Модель */}
    <div className={`filter ${openFilters.model ? 'active' : ''}`}>
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
        onClick={() => toggleFilterVisibility('model')}
      >
        Модель
	      <span className={`filter-arrow ${openFilters.model ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.model && filteredOptions.models.map((model) => (
        <label key={model} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={model}
            checked={filters.model.includes(model)}
            onChange={() => handleCheckboxChange('model', model)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{model}</span>
        </label>
      ))}
    </div>

    {/* Цвет */}
    <div className={`filter ${openFilters.color ? 'active' : ''}`}>
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
        onClick={() => toggleFilterVisibility('color')}
      >
        Цвет
	      <span className={`filter-arrow ${openFilters.color ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.color && filteredOptions.colors.map((color) => (
        <label key={color} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={color}
            checked={filters.color.includes(color)}
            onChange={() => handleCheckboxChange('color', color)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{translateValue(color)}</span>
        </label>
      ))}
    </div>

    {/* Трансмиссия */}
    <div className={`filter ${openFilters.transmission ? 'active' : ''}`}>
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
        onClick={() => toggleFilterVisibility('transmission')}
      >
        Трансмиссия
	      <span className={`filter-arrow ${openFilters.transmission ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.transmission && filteredOptions.transmissions.map((transmission) => (
        <label key={transmission} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={transmission}
            checked={filters.transmission.includes(transmission)}
            onChange={() => handleCheckboxChange('transmission', transmission)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{translateValue(transmission)}</span>
        </label>
      ))}
    </div>

    {/* Тип кузова */}
    <div className={`filter ${openFilters.body ? 'active' : ''}`}>
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
        onClick={() => toggleFilterVisibility('body')}
      >
        Кузов
	       <span className={`filter-arrow ${openFilters.body ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.body && filteredOptions.bodies.map((body) => (
        <label key={body} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={body}
            checked={filters.body.includes(body)}
            onChange={() => handleCheckboxChange('body', body)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{translateValue(body)}</span>
        </label>
      ))}
    </div>

    {/* Локация */}
    <div className={`filter ${openFilters.dealer ? 'active' : ''}`}>
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
        onClick={() => toggleFilterVisibility('dealer')}
      >
        Локация
	       <span className={`filter-arrow ${openFilters.dealer ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.dealer && filteredOptions.dealers.map((dealer) => (
        <label key={dealer} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={dealer}
            checked={filters.dealer.includes(dealer)}
            onChange={() => handleCheckboxChange('dealer', dealer)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{dealer}</span>
        </label>
      ))}
    </div>

    {/* Год выпуска */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Год выпуска: {filters.year[0]} – {filters.year[1]}
      </label>
      <Range
        step={1}
        min={yearRange[0]}
        max={yearRange[1]}
        values={filters.year}
        onChange={(values) => setFilters({ ...filters, year: values })}
        renderTrack={({ props, children }) => {
          const { key, ...restProps } = props;
          return (
            <div
              key={key}
              {...restProps}
        className="h-2 my-4 rounded"
        style={{
          ...props.style,
          background: `linear-gradient(
            to right,
            #e0e0e0 ${((filters.year[0] - yearRange[0]) / (yearRange[1] - yearRange[0])) * 100}%,
            #8cc63f ${((filters.year[0] - yearRange[0]) / (yearRange[1] - yearRange[0])) * 100}%,
            #8cc63f ${((filters.year[1] - yearRange[0]) / (yearRange[1] - yearRange[0])) * 100}%,
            #e0e0e0 ${((filters.year[1] - yearRange[0]) / (yearRange[1] - yearRange[0])) * 100}%
          )`,
          alignItems: 'center',
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
          ...props.style,
          height: '20px',
          width: '20px',
          backgroundColor: '#8cc63f',
          border: '2px solid white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
          />
          );
        }} />
    </div>

    {/* Пробег */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Пробег: {filters.run[0].toLocaleString()} км – {filters.run[1].toLocaleString()} км
      </label>
      <Range
        step={1000}
        min={runRange[0]}
        max={runRange[1]}
        values={filters.run}
        onChange={(values) => setFilters({ ...filters, run: values })}
        renderTrack={({ props, children }) => {
          const { key, ...restProps } = props;
          return (
            <div
              key={key}
              {...restProps}
        className="h-2 my-4 rounded"
        style={{
          ...props.style,
          background: `linear-gradient(
            to right,
            #e0e0e0 ${((filters.run[0] - runRange[0]) / (runRange[1] - runRange[0])) * 100}%,
            #8cc63f ${((filters.run[0] - runRange[0]) / (runRange[1] - runRange[0])) * 100}%,
            #8cc63f ${((filters.run[1] - runRange[0]) / (runRange[1] - runRange[0])) * 100}%,
            #e0e0e0 ${((filters.run[1] - runRange[0]) / (runRange[1] - runRange[0])) * 100}%
          )`,
          alignItems: 'center',
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
          ...props.style,
          height: '20px',
          width: '20px',
          backgroundColor: '#8cc63f',
          border: '2px solid white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
          />
          );
        }} />
    </div>

  </div>
<div className="col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Стоимость: {filters.price[0].toLocaleString()} ₽ – {filters.price[1].toLocaleString()} ₽
  </label>
  <Range
    step={10000}
    min={priceRange[0]}
    max={priceRange[1]}
    values={filters.price}
    onChange={(values) => setFilters({ ...filters, price: values })}
    renderTrack={({ props, children }) => {
          const { key, ...restProps } = props;
          return (
            <div
              key={key}
              {...restProps}
        className="h-2 my-4 rounded"
        style={{
          ...props.style,
          background: `linear-gradient(
            to right,
            #e0e0e0 ${((filters.price[0] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%,
            #8cc63f ${((filters.price[0] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%,
            #8cc63f ${((filters.price[1] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%,
            #e0e0e0 ${((filters.price[1] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%
          )`,
          alignItems: 'center',
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
          ...props.style,
          height: '20px',
          width: '20px',
          backgroundColor: '#8cc63f',
          border: '2px solid white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
          );
        }} />
</div>
  {/* Кнопка сброса фильтров */}
  <div className="col-span-2 flex justify-center mt-4">
    <button
      onClick={resetFilters}
      className="bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-semibold py-2 px-6 rounded-full transition"
    >
      Сбросить фильтры
    </button>
  </div>
</div>

{/* Список автомобилей */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {filtered.slice(0, visibleCount).map((car) => (
    <div
      key={car.id}
      id={`car-${car.id}`}
      onClick={() => {
  localStorage.setItem("scrollToUsedCarId", car.id); // 💾 сохранить ID
  navigate("/UsedCarDetails", { state: { car } });
}}
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition"
    >
      <img
        src={car.images[0]}
        alt={car.model}
        className="w-full h-48 object-cover"
        onLoad={() => setLoadingImages(false)}
      />
      <div className="p-4">
        <div className="text-xl font-semibold text-gray-900 mb-2">
          {car.vendor} {car.model} {car.year}
        </div>
        <div className="text-[#8cc63f] font-bold text-lg">
          {(car.price - car.maxDiscount).toLocaleString()} ₽
        </div>
        {car.maxDiscount > 0 && (
          <div className="text-sm line-through text-gray-500">
            {car.price.toLocaleString()} ₽
          </div>
        )}

        <div className="text-sm text-gray-600 mt-2 space-y-1">
          <div>Пробег: {car.run ? Number(car.run).toLocaleString() + " км" : "—"}</div>
          <div>Двигатель: {translateValue(car.engineType) || "—"}</div>
          <div>Кузов: {translateValue(car.body) || "—"}</div>
          <div>Цвет: {translateValue(car.color) || "—"}</div>
          <div>Трансмиссия: {translateValue(car.transmission) || "—"}</div>
          <div>Привод: {translateValue(car.drive) || "—"}</div>
          <div>Локация: {car.dealer || "—"}</div>
        </div>

        <button
          className="mt-4 w-full py-2 px-4 bg-[#8cc63f] text-white rounded-lg hover:bg-[#7ab82c] transition"
          onClick={(e) => {
            e.stopPropagation(); // чтобы клик не переходил на страницу
            setModalCar(car);
          }}
        >
          Забронировать
        </button>
      </div>
    </div>
  ))}
</div>


{/* Кнопка "Показать еще" */}
{visibleCount < filtered.length && (
  <div className="text-center mt-6 mb-24">
    <button
      className="px-6 py-2 bg-[#8cc63f] text-white rounded hover:bg-[#7ab82c] transition"
      onClick={() => setVisibleCount((prev) => prev + 24)}
    >
      Показать еще
    </button>
  </div>
    )}
          </>
        )}
      </div>
{/* Кнопка наверх */}
<button
  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  className="fixed bottom-36 right-6 bg-[#8cc63f] text-white p-3 rounded-full shadow-lg hover:bg-[#7ab82c] transition"
>
  <ArrowUp />
</button>

{/* Плавающая кнопка фильтра на мобилках */}
<button
  onClick={() => setModalFilters(true)}
  className="md:hidden fixed bottom-20 right-6 bg-[#8cc63f] text-white p-3 rounded-full shadow-lg hover:bg-[#7ab82c] transition"
>
  <SlidersHorizontal />
</button>

{/* Модальное окно фильтров */}
{modalFilters && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Фильтры</h2>
        <button onClick={() => setModalFilters(false)}>✖</button>
      </div>
      <div className="">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
    {/* Марка */}
    <div className={`filter ${openFilters.vendor ? 'active' : ''}`}>  
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer relative flex items-center justify-between"
        onClick={() => toggleFilterVisibility('vendor')}
      >
        Марка
	      <span className={`filter-arrow ${openFilters.vendor ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.vendor && filteredOptions.vendors.map((brand) => (
        <label key={brand} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={brand}
            checked={filters.vendor.includes(brand)}
            onChange={() => handleCheckboxChange('vendor', brand)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{brand}</span>
        </label>
      ))}
    </div>

    {/* Модель */}
    <div className={`filter ${openFilters.model ? 'active' : ''}`}>
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
        onClick={() => toggleFilterVisibility('model')}
      >
        Модель
	      <span className={`filter-arrow ${openFilters.model ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.model && filteredOptions.models.map((model) => (
        <label key={model} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={model}
            checked={filters.model.includes(model)}
            onChange={() => handleCheckboxChange('model', model)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{model}</span>
        </label>
      ))}
    </div>

    {/* Цвет */}
    <div className={`filter ${openFilters.color ? 'active' : ''}`}>
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
        onClick={() => toggleFilterVisibility('color')}
      >
        Цвет
	      <span className={`filter-arrow ${openFilters.color ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.color && filteredOptions.colors.map((color) => (
        <label key={color} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={color}
            checked={filters.color.includes(color)}
            onChange={() => handleCheckboxChange('color', color)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{translateValue(color)}</span>
        </label>
      ))}
    </div>

    {/* Трансмиссия */}
    <div className={`filter ${openFilters.transmission ? 'active' : ''}`}>
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
        onClick={() => toggleFilterVisibility('transmission')}
      >
        Трансмиссия
	      <span className={`filter-arrow ${openFilters.transmission ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.transmission && filteredOptions.transmissions.map((transmission) => (
        <label key={transmission} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={transmission}
            checked={filters.transmission.includes(transmission)}
            onChange={() => handleCheckboxChange('transmission', transmission)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{translateValue(transmission)}</span>
        </label>
      ))}
    </div>

    {/* Тип кузова */}
    <div className={`filter ${openFilters.body ? 'active' : ''}`}>
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
        onClick={() => toggleFilterVisibility('body')}
      >
        Кузов
	      <span className={`filter-arrow ${openFilters.body ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.body && filteredOptions.bodies.map((body) => (
        <label key={body} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={body}
            checked={filters.body.includes(body)}
            onChange={() => handleCheckboxChange('body', body)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{translateValue(body)}</span>
        </label>
      ))}
    </div>

    {/* Локация */}
    <div className={`filter ${openFilters.dealer ? 'active' : ''}`}>
      <h3
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
        onClick={() => toggleFilterVisibility('dealer')}
      >
        Локация
	      <span className={`filter-arrow ${openFilters.dealer ? 'active' : ''}`}>&#9660;</span>
      </h3>
      {openFilters.dealer && filteredOptions.dealers.map((dealer) => (
        <label key={dealer} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            value={dealer}
            checked={filters.dealer.includes(dealer)}
            onChange={() => handleCheckboxChange('dealer', dealer)}
            className="accent-[#8cc63f] w-5 h-5"
          />
          <span>{dealer}</span>
        </label>
      ))}
    </div>

    {/* Год выпуска */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Год выпуска: {filters.year[0]} – {filters.year[1]}
      </label>
      <Range
        step={1}
        min={yearRange[0]}
        max={yearRange[1]}
        values={filters.year}
        onChange={(values) => setFilters({ ...filters, year: values })}
        renderTrack={({ props, children }) => {
          const { key, ...restProps } = props;
          return (
            <div
              key={key}
              {...restProps}
        className="h-2 my-4 rounded"
        style={{
          ...props.style,
          background: `linear-gradient(
            to right,
            #e0e0e0 ${((filters.year[0] - yearRange[0]) / (yearRange[1] - yearRange[0])) * 100}%,
            #8cc63f ${((filters.year[0] - yearRange[0]) / (yearRange[1] - yearRange[0])) * 100}%,
            #8cc63f ${((filters.year[1] - yearRange[0]) / (yearRange[1] - yearRange[0])) * 100}%,
            #e0e0e0 ${((filters.year[1] - yearRange[0]) / (yearRange[1] - yearRange[0])) * 100}%
          )`,
          alignItems: 'center',
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
          ...props.style,
          height: '20px',
          width: '20px',
          backgroundColor: '#8cc63f',
          border: '2px solid white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
          />
          );
        }} />
    </div>

    {/* Пробег */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Пробег: {filters.run[0].toLocaleString()} км – {filters.run[1].toLocaleString()} км
      </label>
      <Range
        step={1000}
        min={runRange[0]}
        max={runRange[1]}
        values={filters.run}
        onChange={(values) => setFilters({ ...filters, run: values })}
        renderTrack={({ props, children }) => {
          const { key, ...restProps } = props;
          return (
            <div
              key={key}
              {...restProps}
        className="h-2 my-4 rounded"
        style={{
          ...props.style,
          background: `linear-gradient(
            to right,
            #e0e0e0 ${((filters.run[0] - runRange[0]) / (runRange[1] - runRange[0])) * 100}%,
            #8cc63f ${((filters.run[0] - runRange[0]) / (runRange[1] - runRange[0])) * 100}%,
            #8cc63f ${((filters.run[1] - runRange[0]) / (runRange[1] - runRange[0])) * 100}%,
            #e0e0e0 ${((filters.run[1] - runRange[0]) / (runRange[1] - runRange[0])) * 100}%
          )`,
          alignItems: 'center',
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
          ...props.style,
          height: '20px',
          width: '20px',
          backgroundColor: '#8cc63f',
          border: '2px solid white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
          />
          );
        }} />
    </div>

  </div>
<div className="col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Стоимость: {filters.price[0].toLocaleString()} ₽ – {filters.price[1].toLocaleString()} ₽
  </label>
  <Range
    step={10000}
    min={priceRange[0]}
    max={priceRange[1]}
    values={filters.price}
    onChange={(values) => setFilters({ ...filters, price: values })}
    renderTrack={({ props, children }) => {
          const { key, ...restProps } = props;
          return (
            <div
              key={key}
              {...restProps}
        className="h-2 my-4 rounded"
        style={{
          ...props.style,
          background: `linear-gradient(
            to right,
            #e0e0e0 ${((filters.price[0] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%,
            #8cc63f ${((filters.price[0] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%,
            #8cc63f ${((filters.price[1] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%,
            #e0e0e0 ${((filters.price[1] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%
          )`,
          alignItems: 'center',
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
          ...props.style,
          height: '20px',
          width: '20px',
          backgroundColor: '#8cc63f',
          border: '2px solid white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
          );
        }} />
</div>

      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={resetFilters}
          className="bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-semibold py-2 px-6 rounded-full transition"
        >
          Сбросить фильтры
        </button>
        <button
          onClick={() => setModalFilters(false)}
          className="text-[#8cc63f] font-semibold"
        >
          Применить
        </button>
      </div>
    </div>
  </div>
)}

{/* Модальное окно бронирования */}
{modalCar && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
    >
      <h2 className="text-xl font-bold mb-4">
        Бронирование: {modalCar.vendor} {modalCar.model} {modalCar.year}
      </h2>
      <input
        type="text"
        required
        placeholder="Имя"
        className="w-full p-2 mb-3 border rounded"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="tel"
        required
        placeholder="Телефон"
        className="w-full p-2 mb-3 border rounded"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setModalCar(null)}
          className="px-4 py-2 border rounded"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#8cc63f] text-white rounded hover:bg-[#7ab82c] transition"
        >
          Отправить
        </button>
      </div>
    </form>
  </div>
)}

		     <BottomNav />
    </div>
  );
}
