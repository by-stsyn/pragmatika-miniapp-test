import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import BottomNav from "/src/components/BottomNav";
import { platform } from "/src/platform";

import "swiper/css";
import "swiper/css/pagination";
import translations from "./translations";

const translateValue = (value) => {
  if (!value) return value;
  return translations[value.toLowerCase()] || value;
};

export default function UsedCarDetails() {
  const navigate = useNavigate();
  const { state } = useLocation(); // получаем авто из навигации
  const [modalType, setModalType] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [activeIndex, setActiveIndex] = useState(0);

  const [openGroups, setOpenGroups] = useState({});
  const [showStickyButtons, setShowStickyButtons] = useState(false);
  const buttonsRef = useRef(null);
  
  
  console.log(state.car);
  console.log(state.car.extras);

  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyButtons(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (buttonsRef.current) observer.observe(buttonsRef.current);

    return () => {
      if (buttonsRef.current) observer.unobserve(buttonsRef.current);
    };
  }, []);

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  if (!state?.car) {
    return <p className="p-6">Автомобиль не найден</p>;
  }

  const car = state.car;

  // Фото
const images = car.images || [];
// Для Телеграм бота
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
    .map(char => map[char] ?? char)
    .join('')
    .replace(/\s+/g, '-') // пробелы → дефисы
    .replace(/[^a-z0-9\-]/g, '') // всё лишнее вырезаем
    .slice(0, 30);
};

const vendorPayload = transliterate(car.vendor);
const modelPayload = transliterate(car.model);
const dealerPayload = transliterate(car.dealer);
const payload = encodeURIComponent(
  `question_${vendorPayload}_${modelPayload}_${car.year}_${dealerPayload}`
);

  // Группировка комплектации
  const extras = car.extras || [];

const groupedExtras = {
  "Мультимедиа": extras.filter((e) =>
    /аудио|Розетка 12V|usb|bluetooth|aux|мультифункциональное|навигац|android|apple|carplay|мультимедиа/i.test(e)
  ),
  "Комфорт": extras.filter((e) =>
    /климат|подрулевые|электропривод|давления|автоматической парковки|старт-стоп|кондиционер|охлаждаемый|прикуриватель|пепельница|подогрев|регулировка|стеклоподъем|центральный замок|блокировка замков|бортовой|усилитель|ЭРА-ГЛОНАСС/i.test(e)
  ),
  "Безопасность": extras.filter((e) =>
    /abs|airbag|антиблокировочная|предотвращения столкновения|антипробуксовочная|курсовой|устойчивости|подушки|подушки|помощи|безопасности|сигнализация|иммобилайзер|контроль|ассистент|крепление/i.test(e)
  ),
  "Обзор": extras.filter((e) =>
    /камера|парктроник|корректор|фары|дальним|датчик света|омыватель|датчик дождя|зеркал/i.test(e)
  ),
  "Салон": extras.filter((e) =>
    /сиденья|сидение|ряд|люк|накладки на пороги|кажанные|отделка|кожей|сидения|подголовник|подлокотник|складывающееся|обивка|руль|ткань|система крепления|кресел|кожа|салон/i.test(e)
  ),
  "Экстерьер": extras.filter((e) =>
    /диски|бампер|молдинг|рейлинги|решетка|дисков|тонированные|стекло|стекла|спойлер/i.test(e)
  ),
};

  // Добавляем "Прочее"
  const usedExtras = Object.values(groupedExtras).flat();
  const otherExtras = extras.filter((e) => !usedExtras.includes(e));
  if (otherExtras.length > 0) groupedExtras["Прочее"] = otherExtras;

  // Отправка формы
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
        action: modalType, // бронь или автотека
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
      {/* Назад */}
      <button
        onClick={() => {
          navigate("/ShowcaseUsed", { replace: true });
          window.location.reload();
        }}
        className="text-blue-600 flex items-center mb-4"
      >
        <ArrowLeft className="mr-2" /> Назад
      </button>

      {/* Заголовок */}
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        {car.vendor} {car.model}, {car.year}
      </h1>

      {/* Слайдер */}
      <div className="relative mb-6">
        {/* бейдж "Скидка" */}
        {car.maxDiscount > 0 && (
          <span className="absolute top-2 right-2 z-10 bg-[#fc4f00] text-white text-xs font-semibold px-2 py-1 rounded shadow">
            Ваша выгода {car.maxDiscount.toLocaleString()} ₽
          </span>
        )}
        <div className="relative">
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
                  className="w-full h-64 object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Буллеты */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images
              .slice(
                Math.max(0, activeIndex - 2),
                Math.min(images.length, activeIndex + 3)
              )
              .map((_, i, visible) => {
                const actualIndex = activeIndex <= 2 ? i : activeIndex - 2 + i;
                const isActive = actualIndex === activeIndex;

                const sizeClass =
                  i === 0 || i === visible.length - 1 ? "w-2 h-2" : "w-3 h-3";

                return (
                  <span
                    key={actualIndex}
                    className={`rounded-full ${sizeClass} ${
                      isActive ? "bg-[#8cc63f]" : "bg-[#8cc63f]/50"
                    } transition`}
                  />
                );
              })}
          </div>
        </div>

        {/* Кнопки */}
        <div ref={buttonsRef}>
          <div className="mt-4 flex gap-3 justify-center max-w-md mx-auto">
            <button
              onClick={() => setModalType("booking")}
              className="flex-1 bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-medium text-sm py-2 px-3 rounded-lg transition"
            >
              Забронировать
            </button>
           <button
    onClick={() => setModalType("autoteka")}
    className="flex-1 flex items-center justify-center gap-1 bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-800 font-medium text-sm py-2 px-3 rounded-lg transition"
  >
    Отчёт
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 148 38"
      fill="none"
      className="h-5"
    >
      <path d="m54.422 2.89-7.037 16.113h3.088l1.773-4.124h6.81l1.795 4.124h3.111L56.925 2.89h-2.503zm-1.017 9.314 2.244-5.16 2.244 5.16h-4.488zm88.356-4.858c-1.974 0-3.721.71-4.796 1.948l-.111.127 1.624 1.701.133-.14c.546-.561 1.517-1.23 3.059-1.23.984 0 2.604.282 2.734 2.123a10.414 10.414 0 0 0-2.377-.275c-2.695 0-5.572 1.032-5.572 3.932 0 2.533 2.211 3.689 4.264 3.689 1.484 0 2.877-.54 3.805-1.465l.13 1.24h2.436v-6.815c.003-3.563-2.751-4.835-5.329-4.835zm-.776 9.469c-1.218 0-1.854-.666-1.854-1.322 0-.835 1.003-1.679 2.919-1.679.714 0 1.455.12 2.315.374-.094 1.555-1.821 2.627-3.38 2.627zm-6.121-9.268h-3.475l-4.101 4.455V7.547h-2.809v11.456h2.809v-4.471l4.64 4.471h3.771l-6.008-5.825 5.173-5.631zm-41.728-.224c-3.361 0-5.995 2.614-5.995 5.952s2.634 5.95 5.995 5.95c3.36 0 5.994-2.615 5.994-5.95 0-3.338-2.63-5.952-5.994-5.952zm0 9.27c-1.832 0-3.163-1.396-3.163-3.318 0-1.922 1.331-3.319 3.163-3.319 1.818 0 3.14 1.397 3.14 3.32.003 1.921-1.318 3.318-3.14 3.318zm-18.838-3.71a2.803 2.803 0 0 0 .793-1.978c0-1.55-1.082-3.358-4.134-3.358h-5.241v11.456H71.6c3.095 0 4.199-1.792 4.199-3.468 0-1.088-.556-2.062-1.5-2.653zM68.525 9.89h2.52c.46 0 1.233.137 1.233 1.056 0 .974-.863 1.078-1.234 1.078h-2.52V9.89zm3.052 6.68h-3.052v-2.403h3.052c.896 0 1.413.442 1.413 1.211 0 .747-.526 1.192-1.413 1.192zm28.32-6.482h3.325v8.914h2.809V10.09h3.481V7.547h-9.619v2.542h.004zm16.571-2.766c-3.407 0-5.972 2.559-5.972 5.952 0 3.504 2.455 5.95 5.972 5.95 2.289 0 4.14-.946 5.211-2.66l.091-.146-2.166-1.55-.103.17c-.65 1.058-1.663 1.597-3.014 1.597-1.757 0-3.026-1.055-3.212-2.646h8.687l.01-.173c.022-.36.022-.568.022-.808.004-3.926-2.773-5.686-5.526-5.686zm-3.043 4.523c.445-1.539 1.848-2.091 2.955-2.091 1.383 0 2.439.812 2.744 2.091h-5.699zM76.763 10.09h3.325v8.914h2.81V10.09h3.48V7.547H76.76v2.542h.003z" fill="#000"></path><path fillRule="evenodd" clipRule="evenodd" d="M0 7.172A7.172 7.172 0 0 1 7.172 0h8.885v6.957H10.17a3.106 3.106 0 0 0-3.105 3.106v5.994H0V7.172z" fill="#0AF"></path><path fillRule="evenodd" clipRule="evenodd" d="M7.065 27.401a3.106 3.106 0 0 0 3.105 3.106h5.887V38H7.172A7.172 7.172 0 0 1 0 30.828v-8.885h7.065v5.458z" fill="#A169F7"></path><path fillRule="evenodd" clipRule="evenodd" d="M30.828 0A7.172 7.172 0 0 1 38 7.172v8.885h-7.386v-5.994a3.106 3.106 0 0 0-3.105-3.106h-5.566V0h8.885z" fill="#FF6163"></path><path fillRule="evenodd" clipRule="evenodd" d="M27.509 30.507a3.106 3.106 0 0 0 3.105-3.106v-5.458H38v8.885A7.172 7.172 0 0 1 30.828 38h-8.885v-7.493h5.566z" fill="#97CF26"></path><path d="M48.133 34.315H49.5v-5h2.873v5h1.368v-6.218h-5.61v6.218zm8.847 2.599v-3.432c.348.497 1.107.957 2.002.957 1.704 0 2.998-1.455 2.998-3.233 0-1.779-1.294-3.234-2.998-3.234-.895 0-1.654.46-2.002.958v-.833h-1.368v8.817h1.368zm1.754-3.718c-1.107 0-1.866-.87-1.866-1.99s.759-1.99 1.866-1.99c1.094 0 1.853.87 1.853 1.99s-.759 1.99-1.853 1.99zm7.35 1.244c1.84 0 3.258-1.43 3.258-3.234 0-1.803-1.418-3.234-3.258-3.234s-3.258 1.43-3.258 3.234c0 1.803 1.417 3.233 3.258 3.233zm0-1.27c-1.107 0-1.878-.857-1.878-1.964s.771-1.965 1.878-1.965c1.094 0 1.865.858 1.865 1.965 0 1.107-.77 1.965-1.865 1.965zm7.346 1.27c1.305 0 2.275-.548 2.835-1.443l-1.045-.746c-.336.547-.895.945-1.778.945-1.045 0-1.853-.66-1.916-1.692h4.888c.012-.199.012-.31.012-.447 0-2.003-1.355-3.085-2.997-3.085-1.89 0-3.246 1.406-3.246 3.234 0 1.903 1.356 3.233 3.246 3.233zm-1.841-3.93c.199-.92.982-1.381 1.79-1.381.796 0 1.518.485 1.667 1.38h-3.457zm10.395 3.805h1.815l-3.258-3.159 2.81-3.06h-1.666l-2.45 2.662v-2.661h-1.368v6.218h1.368v-2.649l2.749 2.649zm3.754 0h1.368v-5h1.953v-1.218h-5.186v1.219h1.865v4.999zm6.615 0h1.505l.995-2.313h3.955l1.007 2.313h1.517l-3.855-8.83h-1.269l-3.855 8.83zm4.477-6.865 1.418 3.258h-2.836l1.418-3.258zm6.681 6.865h1.206l2.823-6.218h-1.529l-1.903 4.365-1.89-4.365H100.7l2.811 6.218zm5.482-7.574c.51 0 .908-.41.908-.92a.905.905 0 0 0-.908-.908c-.497 0-.92.41-.92.908 0 .51.423.92.92.92zm-.684 7.574h1.368v-6.218h-1.368v6.218zm5.859.062c.435 0 .734-.05 1.02-.137v-1.218c-.199.087-.473.124-.734.124-.709 0-1.044-.274-1.044-1.057v-2.773h1.778v-1.22h-1.778v-1.728h-1.368v1.729h-1.294v1.219h1.294v2.997c0 1.405.932 2.064 2.126 2.064zm4.997.063c1.84 0 3.258-1.43 3.258-3.234 0-1.803-1.418-3.234-3.258-3.234-1.841 0-3.258 1.43-3.258 3.234 0 1.803 1.417 3.233 3.258 3.233zm0-1.27c-1.107 0-1.878-.857-1.878-1.964s.771-1.965 1.878-1.965c1.094 0 1.865.858 1.865 1.965 0 1.107-.771 1.965-1.865 1.965z" fill="#333"></path>
    </svg>
  </button>



          </div>
<div className="mt-4 flex gap-3 justify-center max-w-md mx-auto">



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
        </div>
      </div>

      {/* Характеристики */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="mb-2">
          <p className="text-[#8cc63f] font-bold text-xl">
            {(car.price - (car.maxDiscount || 0)).toLocaleString()} ₽
          </p>
          {car.maxDiscount > 0 && (
            <p className="text-sm text-gray-500 line-through">
              {car.price.toLocaleString()} ₽
            </p>
          )}
        </div>
        <p>
          <strong>Год:</strong> {car.year}
        </p>
        <p> 
          <strong>Пробег:</strong> {car.run} км
        </p>
        <p>
          <strong>Цвет:</strong> {translateValue(car.color)}
        </p>
        <p>
          <strong>Кузов:</strong> {translateValue(car.body)}
        </p>
        <p>
          <strong>Трансмиссия:</strong> {translateValue(car.transmission)}
        </p>
        <p>
          <strong>Привод:</strong> {translateValue(car.drive)}
        </p>
        <p>
          <strong>Двигатель:</strong> {translateValue(car.engineType)} {car.engineVolume}{" "}
          см³, {car.enginePower} л.с.
        </p>
        <p>
          <strong>Дилерский центр:</strong> {car.dealer}
        </p>
      </div>

      {/* Комплектация */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Комплектация</h2>
        <p><strong>{car.complectation}</strong></p>
        {Object.entries(groupedExtras).map(([group, items]) =>
          items.length ? (
            <div key={group} className="border rounded-md">
              <button
                className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 font-medium flex justify-between items-center"
                onClick={() => toggleGroup(group)}
              >
                <span>{group}</span>
                <span>{openGroups[group] ? "▲" : "▼"}</span>
              </button>
              {openGroups[group] && (
                <ul className="px-4 py-2 list-disc list-inside text-sm text-gray-700">
                  {items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : null
        )}
      </div>

      {/* Описание */}
      {car.description && (
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Описание
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed break-words">
            {car.description}
          </p>
        </div>
      )}

      <div className="h-20" />

      {/* Модалка */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">
              {modalType === "booking"
                ? "Забронировать автомобиль"
                : "Заявка на автотеку"}
            </h2>
            <input
              type="text"
              required
              placeholder="Имя"
              className="w-full p-2 mb-3 border rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="tel"
              required
              placeholder="Телефон"
              className="w-full p-2 mb-3 border rounded"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
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

      {/* Sticky кнопки */}
      {showStickyButtons && (
        <div className="fixed bottom-[80px] left-0 w-full bg-white border-t border-gray-200 p-3 flex gap-3 z-50 shadow">
          <button
            onClick={() => setModalType("booking")}
            className="flex-1 bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-medium py-3 rounded-lg"
          >
            Забронировать
          </button>
          <button
      onClick={() => setModalType("autoteka")}
      className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-medium py-3 rounded-lg flex items-center justify-center gap-2"
    >
      Отчёт
       <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 148 38"
      fill="none"
      className="h-5"
    >
      <path d="m54.422 2.89-7.037 16.113h3.088l1.773-4.124h6.81l1.795 4.124h3.111L56.925 2.89h-2.503zm-1.017 9.314 2.244-5.16 2.244 5.16h-4.488zm88.356-4.858c-1.974 0-3.721.71-4.796 1.948l-.111.127 1.624 1.701.133-.14c.546-.561 1.517-1.23 3.059-1.23.984 0 2.604.282 2.734 2.123a10.414 10.414 0 0 0-2.377-.275c-2.695 0-5.572 1.032-5.572 3.932 0 2.533 2.211 3.689 4.264 3.689 1.484 0 2.877-.54 3.805-1.465l.13 1.24h2.436v-6.815c.003-3.563-2.751-4.835-5.329-4.835zm-.776 9.469c-1.218 0-1.854-.666-1.854-1.322 0-.835 1.003-1.679 2.919-1.679.714 0 1.455.12 2.315.374-.094 1.555-1.821 2.627-3.38 2.627zm-6.121-9.268h-3.475l-4.101 4.455V7.547h-2.809v11.456h2.809v-4.471l4.64 4.471h3.771l-6.008-5.825 5.173-5.631zm-41.728-.224c-3.361 0-5.995 2.614-5.995 5.952s2.634 5.95 5.995 5.95c3.36 0 5.994-2.615 5.994-5.95 0-3.338-2.63-5.952-5.994-5.952zm0 9.27c-1.832 0-3.163-1.396-3.163-3.318 0-1.922 1.331-3.319 3.163-3.319 1.818 0 3.14 1.397 3.14 3.32.003 1.921-1.318 3.318-3.14 3.318zm-18.838-3.71a2.803 2.803 0 0 0 .793-1.978c0-1.55-1.082-3.358-4.134-3.358h-5.241v11.456H71.6c3.095 0 4.199-1.792 4.199-3.468 0-1.088-.556-2.062-1.5-2.653zM68.525 9.89h2.52c.46 0 1.233.137 1.233 1.056 0 .974-.863 1.078-1.234 1.078h-2.52V9.89zm3.052 6.68h-3.052v-2.403h3.052c.896 0 1.413.442 1.413 1.211 0 .747-.526 1.192-1.413 1.192zm28.32-6.482h3.325v8.914h2.809V10.09h3.481V7.547h-9.619v2.542h.004zm16.571-2.766c-3.407 0-5.972 2.559-5.972 5.952 0 3.504 2.455 5.95 5.972 5.95 2.289 0 4.14-.946 5.211-2.66l.091-.146-2.166-1.55-.103.17c-.65 1.058-1.663 1.597-3.014 1.597-1.757 0-3.026-1.055-3.212-2.646h8.687l.01-.173c.022-.36.022-.568.022-.808.004-3.926-2.773-5.686-5.526-5.686zm-3.043 4.523c.445-1.539 1.848-2.091 2.955-2.091 1.383 0 2.439.812 2.744 2.091h-5.699zM76.763 10.09h3.325v8.914h2.81V10.09h3.48V7.547H76.76v2.542h.003z" fill="#000"></path><path fillRule="evenodd" clipRule="evenodd" d="M0 7.172A7.172 7.172 0 0 1 7.172 0h8.885v6.957H10.17a3.106 3.106 0 0 0-3.105 3.106v5.994H0V7.172z" fill="#0AF"></path><path fillRule="evenodd" clipRule="evenodd" d="M7.065 27.401a3.106 3.106 0 0 0 3.105 3.106h5.887V38H7.172A7.172 7.172 0 0 1 0 30.828v-8.885h7.065v5.458z" fill="#A169F7"></path><path fillRule="evenodd" clipRule="evenodd" d="M30.828 0A7.172 7.172 0 0 1 38 7.172v8.885h-7.386v-5.994a3.106 3.106 0 0 0-3.105-3.106h-5.566V0h8.885z" fill="#FF6163"></path><path fillRule="evenodd" clipRule="evenodd" d="M27.509 30.507a3.106 3.106 0 0 0 3.105-3.106v-5.458H38v8.885A7.172 7.172 0 0 1 30.828 38h-8.885v-7.493h5.566z" fill="#97CF26"></path><path d="M48.133 34.315H49.5v-5h2.873v5h1.368v-6.218h-5.61v6.218zm8.847 2.599v-3.432c.348.497 1.107.957 2.002.957 1.704 0 2.998-1.455 2.998-3.233 0-1.779-1.294-3.234-2.998-3.234-.895 0-1.654.46-2.002.958v-.833h-1.368v8.817h1.368zm1.754-3.718c-1.107 0-1.866-.87-1.866-1.99s.759-1.99 1.866-1.99c1.094 0 1.853.87 1.853 1.99s-.759 1.99-1.853 1.99zm7.35 1.244c1.84 0 3.258-1.43 3.258-3.234 0-1.803-1.418-3.234-3.258-3.234s-3.258 1.43-3.258 3.234c0 1.803 1.417 3.233 3.258 3.233zm0-1.27c-1.107 0-1.878-.857-1.878-1.964s.771-1.965 1.878-1.965c1.094 0 1.865.858 1.865 1.965 0 1.107-.77 1.965-1.865 1.965zm7.346 1.27c1.305 0 2.275-.548 2.835-1.443l-1.045-.746c-.336.547-.895.945-1.778.945-1.045 0-1.853-.66-1.916-1.692h4.888c.012-.199.012-.31.012-.447 0-2.003-1.355-3.085-2.997-3.085-1.89 0-3.246 1.406-3.246 3.234 0 1.903 1.356 3.233 3.246 3.233zm-1.841-3.93c.199-.92.982-1.381 1.79-1.381.796 0 1.518.485 1.667 1.38h-3.457zm10.395 3.805h1.815l-3.258-3.159 2.81-3.06h-1.666l-2.45 2.662v-2.661h-1.368v6.218h1.368v-2.649l2.749 2.649zm3.754 0h1.368v-5h1.953v-1.218h-5.186v1.219h1.865v4.999zm6.615 0h1.505l.995-2.313h3.955l1.007 2.313h1.517l-3.855-8.83h-1.269l-3.855 8.83zm4.477-6.865 1.418 3.258h-2.836l1.418-3.258zm6.681 6.865h1.206l2.823-6.218h-1.529l-1.903 4.365-1.89-4.365H100.7l2.811 6.218zm5.482-7.574c.51 0 .908-.41.908-.92a.905.905 0 0 0-.908-.908c-.497 0-.92.41-.92.908 0 .51.423.92.92.92zm-.684 7.574h1.368v-6.218h-1.368v6.218zm5.859.062c.435 0 .734-.05 1.02-.137v-1.218c-.199.087-.473.124-.734.124-.709 0-1.044-.274-1.044-1.057v-2.773h1.778v-1.22h-1.778v-1.728h-1.368v1.729h-1.294v1.219h1.294v2.997c0 1.405.932 2.064 2.126 2.064zm4.997.063c1.84 0 3.258-1.43 3.258-3.234 0-1.803-1.418-3.234-3.258-3.234-1.841 0-3.258 1.43-3.258 3.234 0 1.803 1.417 3.233 3.258 3.233zm0-1.27c-1.107 0-1.878-.857-1.878-1.964s.771-1.965 1.878-1.965c1.094 0 1.865.858 1.865 1.965 0 1.107-.771 1.965-1.865 1.965z" fill="#333"></path>
    </svg>
    </button>
        </div>
      )}

         <BottomNav />
    </div>
  );
}
