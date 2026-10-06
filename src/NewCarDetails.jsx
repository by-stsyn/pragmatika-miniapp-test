import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import BottomNav from "/src/components/BottomNav";
import { platform } from "/src/platform";

export default function NewCarDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showStickyButtons, setShowStickyButtons] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [openGroups, setOpenGroups] = useState({});



  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      const triggerHeight = 400;
      setShowStickyButtons(window.scrollY > triggerHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!state?.car) {
    return <p className="p-6">Автомобиль не найден</p>;
  }

  const car = state.car;
  const images = car.pictures || [];
    const equipment = car.equipment || [];

  
  const yearParam = car.params?.find((p) => p.name === "Год")?.value;
  const driveParam = car.params?.find((p) => p.name === "Привод")?.value;
  
  
  
 const transliterate = (text) => {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd',
    е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n',
    о: 'o', п: 'p', р: 'r', с: 's', т: 't',
    у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch',
    ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
    э: 'e', ю: 'yu', я: 'ya',
  };

  return text
    .toLowerCase()
    .split('')
    .map(char => map[char] ?? char) // заменяем или оставляем
    .join('')
    .replace(/\s+/g, '-') // пробелы на дефисы
    .replace(/[^a-z0-9\-]/g, '') // убираем всё лишнее
    .slice(0, 30); // ограничим длину
};

  const vendorPayload = transliterate(car.vendor);
const modelPayload = transliterate(car.model);
const dealerPayload = transliterate(car.dealer);

  const payload = `${vendorPayload}-${modelPayload}-${dealerPayload}`;
  
  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

 

 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/send-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        car: {
          vendor: car.vendor,
          model: car.model,
          dealer: car.dealer,
        },
        action: modalType,
      }),
    });
    if (res.ok) {
      alert("Заявка отправлена!");
      setModalType(null);
      setForm({ name: "", phone: "" });
    } else {
      alert("Ошибка при отправке. Попробуйте позже.");
    }
  };

  return (
    <div className="p-4 pb-[90px] bg-gray-50 min-h-screen overflow-x-hidden">
      <button
  onClick={() => {
  navigate("/Showcase", { replace: true });
  window.location.reload();
}}
  className="text-blue-600 flex items-center mb-4"
>
  <ArrowLeft className="mr-2" /> Назад
</button>
 <h1 className="text-xl font-bold mb-1">
          {car.vendor} {car.model} {yearParam && `(${yearParam})`}
        </h1>
      <div className="relative mb-4">
        <Swiper
          modules={[Pagination]}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          spaceBetween={10}
          slidesPerView={1}
          className="rounded-lg overflow-hidden"
        >
          {images.map((src, i) => (
            <SwiperSlide key={i}>
              <img
                src={src}
                alt={`Фото ${i + 1}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images
            .slice(Math.max(0, activeIndex - 2), Math.min(images.length, activeIndex + 3))
            .map((_, i, visible) => {
              const actualIndex = activeIndex <= 2 ? i : activeIndex - 2 + i;
              const isActive = actualIndex === activeIndex;
              const sizeClass = i === 0 || i === visible.length - 1 ? "w-2 h-2" : "w-3 h-3";
              return (
                <span
                  key={actualIndex}
                  className={`rounded-full ${sizeClass} ${
                    isActive ? "bg-[#8cc63f]" : "bg-[#8cc63f]/50"
                  }`}
                />
              );
            })}
        </div>
      </div>

       <div className="bg-white p-4 rounded shadow mb-6">
      
        <div className="text-[#8cc63f] font-bold text-xl">{car.price.toLocaleString()} ₽</div>
        {car.oldPrice && (
          <div className="text-sm line-through text-gray-500 mb-1">
            {parseInt(car.oldPrice).toLocaleString()} ₽
          </div>
        )}
        <div className="text-sm text-gray-700 space-y-1 mt-2">
            <div>Год: {yearParam}</div>
<div>Кузов: {car.body}</div>
          <div>Цвет: {car.color}</div>
          <div>Трансмиссия: {car.transmission}</div>
          <div>Привод: {driveParam}</div>
          <div>Дилерский центр: {car.dealer}</div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setModalType("booking")}
          className="flex-1 bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-medium text-sm py-2 px-3 rounded-lg transition"
        >
          Забронировать
        </button>


  <button
  onClick={() => platform.openSupport(payload)}
  className="flex-1 flex items-center justify-center gap-2 bg-[#0088cc] text-white font-medium text-sm py-2 rounded-lg shadow hover:bg-[#007ab8] transition"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M9.036 15.803c-.376 0-.31-.143-.438-.502l-1.095-3.609L17.88 6.38" />
    <path
      fillRule="evenodd"
      d="M21.543 2.47c.683.327 1.026 1.226.756 2.329l-3.25 13.77c-.293 1.24-1.07 1.543-2.166.96l-5.998-4.422-2.893 2.788c-.32.32-.587.587-1.205.587l.43-6.108L18.63 5.618c.417-.287-.09-.446-.646-.16L5.88 10.63.862 9.086c-1.257-.394-1.28-1.257.263-1.864L20.23 1.584c.987-.38 1.846-.165 1.313.886z"
      clipRule="evenodd"
    />
  </svg>
  Задать вопрос
</button>






        
      </div>

      <div className="mt-8 space-y-4">
  <h2 className="text-xl font-semibold text-gray-800">Комплектация</h2>
        {equipment.map((group) => (
    <div key={group.name} className="border rounded-md">
      <button
        className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 font-medium flex justify-between items-center"
        onClick={() => toggleGroup(group.name)}
      >
        <span>{group.name}</span>
        <span>{openGroups[group.name] ? "▲" : "▼"}</span>
      </button>

      {openGroups[group.name] && (
        <ul className="px-4 py-2 list-disc list-inside text-sm text-gray-700">
          {group.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
        ))}
      </div>
      <div className="h-20" />
      {showStickyButtons && (
        <div className="fixed bottom-[80px] left-0 right-0 bg-white border-t border-gray-300 px-4 py-2 flex gap-4 z-50">
          <button
            onClick={() => setModalType("booking")}
            className="flex-1 bg-[#8cc63f] text-white py-2 rounded hover:bg-[#7ab82c]"
          >
            Забронировать
          </button>
        
        </div>
      )}

      {modalType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {modalType === "booking" ? "Забронировать автомобиль" : "Запросить отчет"}
            </h3>
            <input
              required
              type="text"
              placeholder="Ваше имя"
              className="w-full mb-3 px-3 py-2 border rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              type="tel"
              placeholder="Телефон"
              className="w-full mb-3 px-3 py-2 border rounded"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModalType(null)} className="text-gray-600">
                Отмена
              </button>
              <button type="submit" className="bg-[#8cc63f] text-white px-4 py-2 rounded">
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
