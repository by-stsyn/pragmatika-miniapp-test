import React, { useEffect, useState } from "react";
import { Phone, ClipboardEdit, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Promotions() {
  const navigate = useNavigate();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: [], location: [] });
  const [openFilters, setOpenFilters] = useState({ type: false, location: false });
  const [modalPromo, setModalPromo] = useState(null);
const [formData, setFormData] = useState({ name: "", phone: "" });

  const API_URL = "https://sheetdb.io/api/v1/mtp1z8i362ul2"; // замените на свой

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("/api/send-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        promoTitle: modalPromo.title,
      }),
    });

    if (res.ok) {
      alert("Заявка отправлена!");
      setModalPromo(null);
      setFormData({ name: "", phone: "" });
    } else {
      alert("Ошибка отправки. Попробуйте позже.");
    }
  } catch (err) {
    alert("Сетевая ошибка. Попробуйте позже.");
  }
};


  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setPromos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки акций:", err);
        setLoading(false);
      });
  }, []);

  const toggleFilterVisibility = (key) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckboxChange = (key, value) => {
    setFilters((prev) => {
      const updated = prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value];
      return { ...prev, [key]: updated };
    });
  };

  const filtered = promos.filter((p) =>
    (filters.type.length === 0 || filters.type.includes(p.type)) &&
    (filters.location.length === 0 || filters.location.includes(p.location))
  );

  const types = [...new Set(promos.map((p) => p.type))];
  const locations = [...new Set(promos.map((p) => p.location))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button onClick={() => navigate("/")} className="text-blue-600 flex items-center mb-4">
        <ArrowLeft className="mr-2" /> Назад
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Акции и предложения</h1>

      {/* Фильтры */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
        {/* Тип акции */}
        <div className={`filter ${filters.type.length > 0 ? "active" : ""}`}>
          <h3
            className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
            onClick={() => toggleFilterVisibility("type")}
          >
            Тип акции
            <span className={`filter-arrow ${openFilters.type ? "active" : ""}`}>&#9660;</span>
          </h3>
          {openFilters.type &&
            types.map((t) => (
              <label key={t} className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  checked={filters.type.includes(t)}
                  onChange={() => handleCheckboxChange("type", t)}
                  className="accent-[#8cc63f] w-5 h-5"
                />
                <span>{t}</span>
              </label>
            ))}
        </div>

        {/* Дилер */}
        <div className={`filter ${filters.location.length > 0 ? "active" : ""}`}>
          <h3
            className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
            onClick={() => toggleFilterVisibility("location")}
          >
            Дилер
            <span className={`filter-arrow ${openFilters.location ? "active" : ""}`}>&#9660;</span>
          </h3>
          {openFilters.location &&
            locations.map((loc) => (
              <label key={loc} className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  checked={filters.location.includes(loc)}
                  onChange={() => handleCheckboxChange("location", loc)}
                  className="accent-[#8cc63f] w-5 h-5"
                />
                <span>{loc}</span>
              </label>
            ))}
        </div>
      </div>

      {/* Карточки акций */}
      {loading ? (
        <p className="text-center text-gray-500">Загрузка акций...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">Нет акций по выбранным фильтрам</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((promo) => (
            <div key={promo.id} className="bg-white shadow rounded-lg overflow-hidden">
              <img
  src={promo.imageUrl}
  alt={promo.title}
  className="w-full h-auto object-contain"
/>

              <div className="p-4">
                <h2 className="text-lg font-bold mb-2">{promo.title}</h2>
                <p className="text-sm text-gray-700">{promo.description}</p>
              </div>

              
<div className="flex justify-between items-center mt-4 gap-2">




  
  <button
    onClick={() => setModalPromo(promo)}
    className="flex-1 flex items-center justify-center p-2 bg-[#8cc63f] text-white rounded hover:bg-[#7ab82c]"
    title="Оформить заявку"
  >
    <ClipboardEdit className="w-5 h-5" /> 
  </button>
</div>

              
            </div>
          ))}
        </div>
      )}



{modalPromo && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
    >
      <h2 className="text-xl font-bold mb-4">
        Заявка: {modalPromo.title}
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
          onClick={() => setModalPromo(null)}
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






















      
    </div>
  );
}
