import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Compass,
  Palette,
  Layers,
  MapPin,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  CheckCircle2,
  CarFront,
  Gauge,
  Fuel,
} from "lucide-react";
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
  const { state } = useLocation();
  const [modalType, setModalType] = useState(null); // 'booking' | 'autoteka' | null
  const [form, setForm] = useState({ name: "", phone: "" });
  const [activeIndex, setActiveIndex] = useState(0);
  const [openGroups, setOpenGroups] = useState({});
  const [showStickyButtons, setShowStickyButtons] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/showcaseused");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    // Native Telegram WebApp BackButton support
    const tgBack = window.Telegram?.WebApp?.BackButton;
    if (tgBack) {
      try {
        tgBack.show();
        tgBack.onClick(handleBack);
      } catch (e) {
        // Safe fallback
      }
    }

    const handleScroll = () => {
      const triggerHeight = 420;
      setShowStickyButtons(window.scrollY > triggerHeight);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
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

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  if (!state?.car) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <CarFront className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Автомобиль не найден</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-xs">
          Возможно, вы перешли по прямой ссылке или страница была обновлена.
        </p>
        <button
          onClick={() => navigate("/showcaseused")}
          className="px-6 py-3 bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-semibold rounded-xl shadow-sm transition-all"
        >
          Вернуться в каталог
        </button>
      </div>
    );
  }

  const car = state.car;
  const images = car.images || [];

  // Transliteration for Telegram Support deep link
  const transliterate = (text) => {
    if (!text) return "";
    const map = {
      а: "a", б: "b", в: "v", г: "g", д: "d",
      е: "e", ё: "e", ж: "zh", з: "z", и: "i",
      й: "y", к: "k", л: "l", м: "m", н: "n",
      о: "o", п: "p", р: "r", с: "s", т: "t",
      у: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
      ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
      э: "e", ю: "yu", я: "ya",
    };

    return text
      .toLowerCase()
      .split("")
      .map((char) => map[char] ?? char)
      .join("")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .slice(0, 30);
  };

  const vendorPayload = transliterate(car.vendor);
  const modelPayload = transliterate(car.model);
  const dealerPayload = transliterate(car.dealer);
  const payload = encodeURIComponent(
    `question_${vendorPayload}_${modelPayload}_${car.year}_${dealerPayload}`
  );

  // Group extras / equipment
  const extras = car.extras || [];
  const groupedExtras = {
    "Мультимедиа": extras.filter((e) =>
      /аудио|Розетка 12V|usb|bluetooth|aux|мультифункциональное|навигац|android|apple|carplay|мультимедиа/i.test(e)
    ),
    "Комфорт": extras.filter((e) =>
      /климат|подрулевые|электропривод|давления|автоматической парковки|старт-стоп|кондиционер|охлаждаемый|прикуриватель|пепельница|подогрев|регулировка|стеклоподъем|центральный замок|блокировка замков|бортовой|усилитель|ЭРА-ГЛОНАСС/i.test(e)
    ),
    "Безопасность": extras.filter((e) =>
      /abs|airbag|антиблокировочная|предотвращения столкновения|антипробуксовочная|курсовой|устойчивости|подушки|помощи|безопасности|сигнализация|иммобилайзер|контроль|ассистент|крепление/i.test(e)
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

  const usedExtras = Object.values(groupedExtras).flat();
  const otherExtras = extras.filter((e) => !usedExtras.includes(e));
  if (otherExtras.length > 0) groupedExtras["Прочее"] = otherExtras;

  const totalExtrasCount = extras.length;

  // Submit booking or autoteka request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
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
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setModalType(null);
          setForm({ name: "", phone: "" });
        }, 1800);
      } else {
        alert("Ошибка при отправке заявки. Попробуйте еще раз.");
      }
    } catch (err) {
      alert("Не удалось отправить заявку. Проверьте соединение.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalPrice = car.price - (car.maxDiscount || 0);

  const specs = [
    car.year && { icon: Calendar, label: "Год выпуска", val: `${car.year} г.` },
    car.run !== undefined && {
      icon: Gauge,
      label: "Пробег",
      val: `${Number(car.run).toLocaleString("ru-RU")} км`,
    },
    car.body && { icon: Layers, label: "Кузов", val: translateValue(car.body) },
    car.color && { icon: Palette, label: "Цвет", val: translateValue(car.color) },
    car.transmission && {
      icon: Layers,
      label: "КПП",
      val: translateValue(car.transmission),
    },
    car.drive && { icon: Compass, label: "Привод", val: translateValue(car.drive) },
    (car.engineType || car.engineVolume || car.enginePower) && {
      icon: Fuel,
      label: "Двигатель",
      val: `${translateValue(car.engineType) || ""} ${
        car.engineVolume ? `${car.engineVolume} см³` : ""
      } ${car.enginePower ? `${car.enginePower} л.с.` : ""}`.trim(),
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-[120px] pt-safe select-none">
      {/* Top sticky appbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 -ml-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Назад в каталог"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800 stroke-[2.2]" />
            <span className="text-sm font-semibold">Каталог</span>
          </button>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Авто с пробегом
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-3 space-y-4">
        {/* Car Title Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              В наличии
            </span>
            {car.run !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                <Gauge className="w-3 h-3 text-slate-400" />
                {Number(car.run).toLocaleString("ru-RU")} км
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
            {car.vendor} {car.model}, {car.year}
          </h1>
          {car.dealer && (
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8cc63f] shrink-0" />
              <span>{car.dealer}</span>
            </p>
          )}
        </div>

        {/* Gallery Slider */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm bg-slate-900 border border-slate-200/80">
          {car.maxDiscount > 0 && (
            <div className="absolute top-3 right-3 z-10 bg-amber-500/95 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1">
              <span>Скидка до {car.maxDiscount.toLocaleString("ru-RU")} ₽</span>
            </div>
          )}

          <Swiper
            modules={[Pagination]}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            spaceBetween={0}
            slidesPerView={1}
            className="w-full aspect-[4/3]"
          >
            {images.length > 0 ? (
              images.map((src, i) => (
                <SwiperSlide key={i} className="flex items-center justify-center bg-slate-900">
                  <img
                    src={src}
                    alt={`${car.vendor} ${car.model} фото ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-8">
                  <CarFront className="w-16 h-16 stroke-1 mb-2" />
                  <span className="text-sm">Фотографии готовятся</span>
                </div>
              </SwiperSlide>
            )}
          </Swiper>

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md z-10">
              {images
                .slice(Math.max(0, activeIndex - 2), Math.min(images.length, activeIndex + 3))
                .map((_, i) => {
                  const actualIndex = activeIndex <= 2 ? i : activeIndex - 2 + i;
                  const isActive = actualIndex === activeIndex;
                  return (
                    <span
                      key={actualIndex}
                      className={`transition-all duration-200 rounded-full ${
                        isActive
                          ? "w-4 h-1.5 bg-[#8cc63f]"
                          : "w-1.5 h-1.5 bg-white/70"
                      }`}
                    />
                  );
                })}
              <span className="text-[10px] text-white/80 font-medium ml-1">
                {activeIndex + 1}/{images.length}
              </span>
            </div>
          )}
        </div>

        {/* Price Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/70 space-y-3">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs uppercase font-medium text-slate-400 block">
                Цена автомобиля
              </span>
              <div className="text-2xl font-extrabold text-[#78ab31] tracking-tight">
                {Number(finalPrice).toLocaleString("ru-RU")} ₽
              </div>
            </div>

            {car.maxDiscount > 0 && (
              <div className="text-right">
                <span className="text-xs line-through text-slate-400 font-medium block">
                  {Number(car.price).toLocaleString("ru-RU")} ₽
                </span>
                <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Выгода: {Number(car.maxDiscount).toLocaleString("ru-RU")} ₽
                </span>
              </div>
            )}
          </div>

          {car.dealer && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-[#8cc63f] shrink-0" />
              <span className="font-medium truncate">{car.dealer}</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Booking, Autoteka Report, Support */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => setModalType("booking")}
              className="w-full min-h-[52px] px-5 py-3.5 bg-[#8cc63f] hover:bg-[#7ab82c] active:scale-[0.98] text-white font-bold text-base rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Забронировать</span>
            </button>

            <button
              onClick={() => setModalType("autoteka")}
              className="w-full min-h-[52px] px-5 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-base rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2.5"
            >
              <span>Отчёт</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 148 38"
                fill="none"
                className="h-5 shrink-0"
              >
                <path
                  d="m54.422 2.89-7.037 16.113h3.088l1.773-4.124h6.81l1.795 4.124h3.111L56.925 2.89h-2.503zm-1.017 9.314 2.244-5.16 2.244 5.16h-4.488zm88.356-4.858c-1.974 0-3.721.71-4.796 1.948l-.111.127 1.624 1.701.133-.14c.546-.561 1.517-1.23 3.059-1.23.984 0 2.604.282 2.734 2.123a10.414 10.414 0 0 0-2.377-.275c-2.695 0-5.572 1.032-5.572 3.932 0 2.533 2.211 3.689 4.264 3.689 1.484 0 2.877-.54 3.805-1.465l.13 1.24h2.436v-6.815c.003-3.563-2.751-4.835-5.329-4.835zm-.776 9.469c-1.218 0-1.854-.666-1.854-1.322 0-.835 1.003-1.679 2.919-1.679.714 0 1.455.12 2.315.374-.094 1.555-1.821 2.627-3.38 2.627zm-6.121-9.268h-3.475l-4.101 4.455V7.547h-2.809v11.456h2.809v-4.471l4.64 4.471h3.771l-6.008-5.825 5.173-5.631zm-41.728-.224c-3.361 0-5.995 2.614-5.995 5.952s2.634 5.95 5.995 5.95c3.36 0 5.994-2.615 5.994-5.95 0-3.338-2.63-5.952-5.994-5.952zm0 9.27c-1.832 0-3.163-1.396-3.163-3.318 0-1.922 1.331-3.319 3.163-3.319 1.818 0 3.14 1.397 3.14 3.32.003 1.921-1.318 3.318-3.14 3.318zm-18.838-3.71a2.803 2.803 0 0 0 .793-1.978c0-1.55-1.082-3.358-4.134-3.358h-5.241v11.456H71.6c3.095 0 4.199-1.792 4.199-3.468 0-1.088-.556-2.062-1.5-2.653zM68.525 9.89h2.52c.46 0 1.233.137 1.233 1.056 0 .974-.863 1.078-1.234 1.078h-2.52V9.89zm3.052 6.68h-3.052v-2.403h3.052c.896 0 1.413.442 1.413 1.211 0 .747-.526 1.192-1.413 1.192zm28.32-6.482h3.325v8.914h2.809V10.09h3.481V7.547h-9.619v2.542h.004zm16.571-2.766c-3.407 0-5.972 2.559-5.972 5.952 0 3.504 2.455 5.95 5.972 5.95 2.289 0 4.14-.946 5.211-2.66l.091-.146-2.166-1.55-.103.17c-.65 1.058-1.663 1.597-3.014 1.597-1.757 0-3.026-1.055-3.212-2.646h8.687l.01-.173c.022-.36.022-.568.022-.808.004-3.926-2.773-5.686-5.526-5.686zm-3.043 4.523c.445-1.539 1.848-2.091 2.955-2.091 1.383 0 2.439.812 2.744 2.091h-5.699zM76.763 10.09h3.325v8.914h2.81V10.09h3.48V7.547H76.76v2.542h.003z"
                  fill="#FFFFFF"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0 7.172A7.172 7.172 0 0 1 7.172 0h8.885v6.957H10.17a3.106 3.106 0 0 0-3.105 3.106v5.994H0V7.172z"
                  fill="#0AF"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.065 27.401a3.106 3.106 0 0 0 3.105 3.106h5.887V38H7.172A7.172 7.172 0 0 1 0 30.828v-8.885h7.065v5.458z"
                  fill="#A169F7"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M30.828 0A7.172 7.172 0 0 1 38 7.172v8.885h-7.386v-5.994a3.106 3.106 0 0 0-3.105-3.106h-5.566V0h8.885z"
                  fill="#FF6163"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M27.509 30.507a3.106 3.106 0 0 0 3.105-3.106v-5.458H38v8.885A7.172 7.172 0 0 1 30.828 38h-8.885v-7.493h5.566z"
                  fill="#97CF26"
                />
                <path
                  d="M48.133 34.315H49.5v-5h2.873v5h1.368v-6.218h-5.61v6.218zm8.847 2.599v-3.432c.348.497 1.107.957 2.002.957 1.704 0 2.998-1.455 2.998-3.233 0-1.779-1.294-3.234-2.998-3.234-.895 0-1.654.46-2.002.958v-.833h-1.368v8.817h1.368zm1.754-3.718c-1.107 0-1.866-.87-1.866-1.99s.759-1.99 1.866-1.99c1.094 0 1.853.87 1.853 1.99s-.759 1.99-1.853 1.99zm7.35 1.244c1.84 0 3.258-1.43 3.258-3.234 0-1.803-1.418-3.234-3.258-3.234s-3.258 1.43-3.258 3.234c0 1.803 1.417 3.233 3.258 3.233zm0-1.27c-1.107 0-1.878-.857-1.878-1.964s.771-1.965 1.878-1.965c1.094 0 1.865.858 1.865 1.965 0 1.107-.77 1.965-1.865 1.965zm7.346 1.27c1.305 0 2.275-.548 2.835-1.443l-1.045-.746c-.336.547-.895.945-1.778.945-1.045 0-1.853-.66-1.916-1.692h4.888c.012-.199.012-.31.012-.447 0-2.003-1.355-3.085-2.997-3.085-1.89 0-3.246 1.406-3.246 3.234 0 1.903 1.356 3.233 3.246 3.233zm-1.841-3.93c.199-.92.982-1.381 1.79-1.381.796 0 1.518.485 1.667 1.38h-3.457zm10.395 3.805h1.815l-3.258-3.159 2.81-3.06h-1.666l-2.45 2.662v-2.661h-1.368v6.218h1.368v-2.649l2.749 2.649zm3.754 0h1.368v-5h1.953v-1.218h-5.186v1.219h1.865v4.999zm6.615 0h1.505l.995-2.313h3.955l1.007 2.313h1.517l-3.855-8.83h-1.269l-3.855 8.83zm4.477-6.865 1.418 3.258h-2.836l1.418-3.258zm6.681 6.865h1.206l2.823-6.218h-1.529l-1.903 4.365-1.89-4.365H100.7l2.811 6.218zm5.482-7.574c.51 0 .908-.41.908-.92a.905.905 0 0 0-.908-.908c-.497 0-.92.41-.92.908 0 .51.423.92.92.92zm-.684 7.574h1.368v-6.218h-1.368v6.218zm5.859.062c.435 0 .734-.05 1.02-.137v-1.218c-.199.087-.473.124-.734.124-.709 0-1.044-.274-1.044-1.057v-2.773h1.778v-1.22h-1.778v-1.728h-1.368v1.729h-1.294v1.219h1.294v2.997c0 1.405.932 2.064 2.126 2.064zm4.997.063c1.84 0 3.258-1.43 3.258-3.234 0-1.803-1.418-3.234-3.258-3.234-1.841 0-3.258 1.43-3.258 3.234 0 1.803 1.417 3.233 3.258 3.233zm0-1.27c-1.107 0-1.878-.857-1.878-1.964s.771-1.965 1.878-1.965c1.094 0 1.865.858 1.865 1.965 0 1.107-.771 1.965-1.865 1.965z"
                  fill="#94A3B8"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={() => platform.openSupport(payload)}
            className="w-full min-h-[50px] px-5 py-3 bg-[#0088cc] hover:bg-[#007ab8] active:scale-[0.98] text-white font-semibold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            <span>Задать вопрос в Telegram</span>
          </button>
        </div>

        {/* Specifications Grid */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/70">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            Характеристики
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {specs.map((spec, i) => {
              const Icon = spec.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px] font-medium leading-none">{spec.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 break-words">
                    {spec.val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        {car.description && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/70 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Описание автомобиля
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line break-words">
              {car.description}
            </p>
          </div>
        )}

        {/* Equipment Accordions */}
        {totalExtrasCount > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Комплектация
              </h2>
              {car.complectation && (
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full truncate max-w-[180px]">
                  {car.complectation}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {Object.entries(groupedExtras).map(([group, items]) => {
                if (!items || items.length === 0) return null;
                const isOpen = !!openGroups[group];
                return (
                  <div
                    key={group}
                    className="border border-slate-200/80 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 font-semibold text-sm flex justify-between items-center transition-colors"
                      onClick={() => toggleGroup(group)}
                    >
                      <span className="text-slate-800 pr-2">{group}</span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                        <span>{items.length}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <ul className="px-4 py-3 bg-white text-xs text-slate-600 divide-y divide-slate-100">
                        {items.map((item, i) => (
                          <li key={i} className="py-1.5 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8cc63f] mt-1 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Bar when scrolled */}
      {showStickyButtons && (
        <div className="fixed bottom-[68px] left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2.5 z-40 transition-all">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-medium uppercase block leading-none mb-0.5 truncate">
                {car.vendor} {car.model}
              </span>
              <span className="text-base font-extrabold text-[#78ab31] leading-none">
                {Number(finalPrice).toLocaleString("ru-RU")} ₽
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setModalType("autoteka")}
                className="min-h-[44px] px-3.5 py-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
              >
                Отчёт
              </button>
              <button
                onClick={() => setModalType("booking")}
                className="min-h-[44px] px-4 py-2 bg-[#8cc63f] hover:bg-[#7ab82c] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
              >
                Забронировать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking / Autoteka Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {modalType === "booking"
                    ? "Бронирование автомобиля"
                    : "Запрос отчёта Автотеки"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {car.vendor} {car.model} • {Number(finalPrice).toLocaleString("ru-RU")} ₽
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {modalType === "booking" ? "Заявка на бронь принята!" : "Запрос на отчёт принят!"}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Менеджер дилерского центра свяжется с вами в течение 15 минут.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Ваше имя
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Например, Алексей"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20 transition-all"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Номер телефона
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20 transition-all"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Нажимая «Отправить», вы даете согласие на обработку персональных данных.
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    disabled={isSubmitting}
                    className="flex-1 min-h-[48px] py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 active:scale-[0.98] transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 min-h-[48px] py-3 rounded-xl bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-bold text-sm active:scale-[0.98] shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Отправить</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

