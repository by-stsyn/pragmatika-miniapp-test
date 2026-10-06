import React, { useEffect, useState } from "react";
import { Range } from "react-range";
import { ArrowUp, ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
	 "Прагматика Geely Василеостровский|knewstar":  "Knewstar Василеостровский",
};

const normalizeDealer = (dealerName, brand) => {
  if (!dealerName) return "";

  const brandKey = normalizeBrandKey(brand);
  const compoundKey = `${dealerName}|${brandKey}`;

  // 1️⃣ Строгое соответствие дилер + марка
  if (dealerNameMap[compoundKey]) {
  return dealerNameMap[compoundKey];
}


  // 2️⃣ Общий маппинг дилеров (если нужен)
  if (dealerNameMap?.[dealerName]) {
    return dealerNameMap[dealerName];
  }

  // 3️⃣ Фоллбек
  return dealerName;
};



export default function CarShowcase() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialBrand = location.state?.brand;
  const [loadingImages, setLoadingImages] = useState(true);
  const [cars, setCars] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    vendor: initialBrand ? [initialBrand] : [],
    model: [],
    color: [],
    body: [],
    transmission: [],
    dealer: [],
    price: [0, 9999999],
  });

  const [openFilters, setOpenFilters] = useState({
    vendor: !!initialBrand,
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
    const fetchHotOffers = async () => {
      try {
       const res = await fetch("/api/fetch-hot-feed");
const { vins } = await res.json();

setHotVins(new Set((vins || []).filter(Boolean)));

       
      } catch (err) {
        console.error("Ошибка загрузки горячих предложений", err);
      }
    };

    fetchHotOffers();
  }, []);
	
  /* =======================
     ЗАГРУЗКА ФИДА
  ======================= */
  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const res = await fetch("/api/fetch-feed-all");
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

    // 🔴 ВАЖНО: проверяем цену ДО return объекта
   // Получаем цены
const priceWithDiscount = Number(get("priceWithDiscount"));
const price = Number(get("price"));

// Если нет ни одной цены — пропускаем машину
if ((!priceWithDiscount || priceWithDiscount === 0) && (!price || price === 0)) return null;

// Используем priceWithDiscount, если есть, иначе price
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
  .filter(Boolean); // 👈 обязательно!

        const prices = allCars.map((c) => c.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        setCars(allCars);
        setFiltered(allCars);
        setPriceRange([min, max]);
        setFilters((prev) => ({ ...prev, price: [min, max] }));
        setLoading(false);
      } catch (e) {
        console.error("Ошибка загрузки фида", e);
        setError("Не удалось загрузить автомобили. Пожалуйста, проверьте соединение и попробуйте снова.");
        setLoading(false);
      }
    };

    fetchFeeds();
}, [hotVins]);
 

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        {/* Кнопка назад */}
        <div className="mb-4">
          <a href="/" className="inline-flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="mr-1" /> Назад
          </a>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Новые автомобили</h1>

        {loading ? (
          <Preloader />
        ) : error ? (
          <div className="text-center py-16 px-4 bg-white rounded-xl shadow-xs border border-gray-200 my-6">
            <p className="text-gray-800 font-semibold mb-3">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="bg-[#8cc63f] hover:bg-[#7ab82c] text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-xs"
            >
              Повторить попытку
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3 filter-container">
  {/* Бренд */}
  <div className={`filter ${filters.vendor.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('vendor')}
    >
      Марка
      <span className={`filter-arrow ${openFilters.vendor ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.vendor && brands.map((brand) => (
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
  <div className={`filter ${filters.model.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('model')}
    >
      Модель
      <span className={`filter-arrow ${openFilters.model ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.model && models.map((model) => (
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
  <div className={`filter ${filters.color.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('color')}
    >
      Цвет
      <span className={`filter-arrow ${openFilters.color ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.color && colors.map((color) => (
      <label key={color} className="flex items-center space-x-2 mb-1">
        <input
          type="checkbox"
          value={color}
          checked={filters.color.includes(color)}
          onChange={() => handleCheckboxChange('color', color)}
          className="accent-[#8cc63f] w-5 h-5"
        />
        <span>{color}</span>
      </label>
    ))}
  </div>

  {/* Трансмиссия */}
  <div className={`filter ${filters.transmission.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('transmission')}
    >
      Трансмиссия
      <span className={`filter-arrow ${openFilters.transmission ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.transmission && transmissions.map((transmission) => (
      <label key={transmission} className="flex items-center space-x-2 mb-1">
        <input
          type="checkbox"
          value={transmission}
          checked={filters.transmission.includes(transmission)}
          onChange={() => handleCheckboxChange('transmission', transmission)}
          className="accent-[#8cc63f] w-5 h-5"
        />
        <span>{transmission}</span>
      </label>
    ))}
  </div>

  {/* Тип кузова */}
  <div className={`filter ${filters.body.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('body')}
    >
      Кузов
      <span className={`filter-arrow ${openFilters.body ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.body && bodies.map((body) => (
      <label key={body} className="flex items-center space-x-2 mb-1">
        <input
          type="checkbox"
          value={body}
          checked={filters.body.includes(body)}
          onChange={() => handleCheckboxChange('body', body)}
          className="accent-[#8cc63f] w-5 h-5"
        />
        <span>{body}</span>
      </label>
    ))}
  </div>

  {/* Дилерский центр */}
  <div className={`filter ${filters.dealer.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('dealer')}
    >
      Дилер
      <span className={`filter-arrow ${openFilters.dealer ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.dealer && dealers.map((dealer) => (
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
            ...restProps.style,
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
            ...restProps.style,
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
    }}
  />
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
    key={car.id} onClick={() => {
    navigate("/NewCarDetails", { state: { car } });
  }}
   className="bg-white rounded-lg shadow-lg overflow-visible"
  >

					  <div className="relative">
                     {car.isHot && (
  <img
    src="/fire-offer.png"
    alt="Горячее предложение"
    className="absolute -top-6 -left-6 w-16 h-16 z-30 drop-shadow-xl rotate-[-10deg] transition-transform duration-300 hover:scale-110"
  />
)}
				  
				   <div className="overflow-hidden rounded-t-lg">
				  <img
                    src={car.pictures[0]}
                    alt={car.model}
                    className="w-full h-48 object-cover"
                    onLoad={() => setLoadingImages(false)}
                  />
					     </div>
                  <div className="p-4">
                    <div className="text-xl font-semibold text-gray-900 mb-2">
                      {car.vendor} {car.model}
                    </div>
                    <div className="text-[#8cc63f] font-bold text-xl">
                      {car.price.toLocaleString()} ₽
                    </div>
                    {car.oldPrice && (
                      <div className="text-sm line-through text-gray-500">
                        {parseInt(car.oldPrice).toLocaleString()} ₽
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-2">
                      {car.params.filter((p) => ["Кузов", "Цвет", "Трансмиссия", "Двигатель"].includes(p.name)).map((p) => `${p.name}: ${p.value}`).join(" · ")}
                    </div>
					 </div>
					 </div>
                    <button
    className="mt-4 w-full py-2 px-4 bg-[#8cc63f] text-white rounded-lg hover:bg-[#7ab82c]"
    onClick={(e) => {
      e.stopPropagation();
      setModalCar(car);
    }}
  >
                      Забронировать
                    </button>
                  </div>
                
              ))}
            </div>

            {/* Показать еще */}
            {visibleCount < filtered.length && (
              <div className="text-center mt-6 mb-24">
                <button
                  className="px-6 py-2 bg-[#8cc63f] text-white rounded hover:bg-[#7ab82c]"
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
        className="fixed bottom-36 right-6 bg-[#8cc63f] text-white p-3 rounded-full shadow-lg hover:bg-[#7ab82c]"
      >
        <ArrowUp />
      </button>

      {/* Плавающая кнопка фильтра на мобилках */}
      <button
        onClick={() => setModalFilters(true)}
        className="md:hidden fixed bottom-20 right-6 bg-[#8cc63f] text-white p-3 rounded-full shadow-lg hover:bg-[#7ab82c]"
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
<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3 filter-container">
  {/* Бренд */}
  <div className={`filter ${filters.vendor.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('vendor')}
    >
      Марка
      <span className={`filter-arrow ${openFilters.vendor ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.vendor && brands.map((brand) => (
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
  <div className={`filter ${filters.model.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('model')}
    >
      Модель
      <span className={`filter-arrow ${openFilters.model ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.model && models.map((model) => (
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
  <div className={`filter ${filters.color.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('color')}
    >
      Цвет
      <span className={`filter-arrow ${openFilters.color ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.color && colors.map((color) => (
      <label key={color} className="flex items-center space-x-2 mb-1">
        <input
          type="checkbox"
          value={color}
          checked={filters.color.includes(color)}
          onChange={() => handleCheckboxChange('color', color)}
          className="accent-[#8cc63f] w-5 h-5"
        />
        <span>{color}</span>
      </label>
    ))}
  </div>

  {/* Трансмиссия */}
  <div className={`filter ${filters.transmission.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('transmission')}
    >
      Трансмиссия
      <span className={`filter-arrow ${openFilters.transmission ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.transmission && transmissions.map((transmission) => (
      <label key={transmission} className="flex items-center space-x-2 mb-1">
        <input
          type="checkbox"
          value={transmission}
          checked={filters.transmission.includes(transmission)}
          onChange={() => handleCheckboxChange('transmission', transmission)}
          className="accent-[#8cc63f] w-5 h-5"
        />
        <span>{transmission}</span>
      </label>
    ))}
  </div>

  {/* Тип кузова */}
  <div className={`filter ${filters.body.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('body')}
    >
      Кузов
      <span className={`filter-arrow ${openFilters.body ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.body && bodies.map((body) => (
      <label key={body} className="flex items-center space-x-2 mb-1">
        <input
          type="checkbox"
          value={body}
          checked={filters.body.includes(body)}
          onChange={() => handleCheckboxChange('body', body)}
          className="accent-[#8cc63f] w-5 h-5"
        />
        <span>{body}</span>
      </label>
    ))}
  </div>

  {/* Дилерский центр */}
  <div className={`filter ${filters.dealer.length > 0 ? 'active' : ''}`}>
    <h3
      className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
      onClick={() => toggleFilterVisibility('dealer')}
    >
      Дилер
      <span className={`filter-arrow ${openFilters.dealer ? 'active' : ''}`}>&#9660;</span>
    </h3>
    {openFilters.dealer && dealers.map((dealer) => (
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
            ...restProps.style,
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
            ...restProps.style,
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
    }}
  />
</div>           
		   <div className="mt-4 flex justify-between">
              <button
  onClick={resetFilters}
  className="bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-semibold py-2 px-6 rounded-full transition"
>
  Сбросить фильтры
</button>
              <button onClick={() => setModalFilters(false)} className="text-blue-600">Применить</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка бронирования */}
      {modalCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">
              Бронирование: {modalCar.vendor} {modalCar.model}
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
                className="px-4 py-2 bg-[#8cc63f] text-white rounded hover:bg-[#7ab82c]"
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
