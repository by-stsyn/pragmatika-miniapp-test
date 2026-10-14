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
} from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/showcase");
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

  if (!state?.car) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <CarFront className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Автомобиль не найден</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-xs">
          Возможно, вы перешли по прямой ссылке или страница была обновлена.
        </p>
        <button
          onClick={() => navigate("/showcase")}
          className="px-6 py-3 bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-semibold rounded-xl shadow-sm transition-all"
        >
          Вернуться в каталог
        </button>
      </div>
    );
  }

  const car = state.car;
  const images = car.pictures || [];
  const equipment = car.equipment || [];

  const yearParam = car.params?.find((p) => p.name === "Год")?.value;
  const driveParam = car.params?.find((p) => p.name === "Привод")?.value;

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
  const payload = `${vendorPayload}-${modelPayload}-${dealerPayload}`;

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

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

  const specs = [
    yearParam && { icon: Calendar, label: "Год выпуска", val: yearParam },
    car.body && { icon: Layers, label: "Кузов", val: car.body },
    car.color && { icon: Palette, label: "Цвет", val: car.color },
    car.transmission && { icon: Layers, label: "КПП", val: car.transmission },
    driveParam && { icon: Compass, label: "Привод", val: driveParam },
  ].filter(Boolean);

  const discount =
    car.oldPrice && parseInt(car.oldPrice) > car.price
      ? parseInt(car.oldPrice) - car.price
      : 0;

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
            Новый авто
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-3 space-y-4">
        {/* Car Title Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            В наличии
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
            {car.vendor} {car.model}
          </h1>
          {yearParam && (
            <p className="text-sm text-slate-500 font-medium">
              Модельный год: {yearParam}
            </p>
          )}
        </div>

        {/* Gallery Slider */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm bg-slate-900 border border-slate-200/80">
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
                {Number(car.price).toLocaleString("ru-RU")} ₽
              </div>
            </div>

            {car.oldPrice && parseInt(car.oldPrice) > car.price && (
              <div className="text-right">
                <span className="text-xs line-through text-slate-400 font-medium block">
                  {parseInt(car.oldPrice).toLocaleString("ru-RU")} ₽
                </span>
                <span className="inline-block text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  Выгода: {discount.toLocaleString("ru-RU")} ₽
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

        {/* Action Buttons (at least 50px tall, phone friendly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setModalType("booking")}
            className="w-full min-h-[52px] px-5 py-3.5 bg-[#8cc63f] hover:bg-[#7ab82c] active:scale-[0.98] text-white font-bold text-base rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Забронировать</span>
          </button>

          <button
            onClick={() => platform.openSupport(payload)}
            className="w-full min-h-[52px] px-5 py-3.5 bg-[#0088cc] hover:bg-[#007ab8] active:scale-[0.98] text-white font-semibold text-base rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            <span>Задать вопрос</span>
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

        {/* Equipment Accordions */}
        {equipment.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Комплектация
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                {equipment.length} {equipment.length === 1 ? "раздел" : "разделов"}
              </span>
            </div>

            <div className="space-y-2">
              {equipment.map((group) => {
                const isOpen = !!openGroups[group.name];
                return (
                  <div
                    key={group.name}
                    className="border border-slate-200/80 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 font-semibold text-sm flex justify-between items-center transition-colors"
                      onClick={() => toggleGroup(group.name)}
                    >
                      <span className="text-slate-800 pr-2">{group.name}</span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                        <span>{group.items?.length || 0}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <ul className="px-4 py-3 bg-white text-xs text-slate-600 divide-y divide-slate-100">
                        {group.items.map((item, i) => (
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

      {/* Floating Bottom Booking Bar when scrolled */}
      {showStickyButtons && (
        <div className="fixed bottom-[68px] left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2.5 z-40 transition-all">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-medium uppercase block leading-none mb-0.5">
                {car.vendor} {car.model}
              </span>
              <span className="text-base font-extrabold text-[#78ab31] leading-none">
                {Number(car.price).toLocaleString("ru-RU")} ₽
              </span>
            </div>
            <button
              onClick={() => setModalType("booking")}
              className="min-h-[46px] px-5 py-2.5 bg-[#8cc63f] hover:bg-[#7ab82c] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              Забронировать
            </button>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {modalType === "booking" ? "Бронирование автомобиля" : "Запрос отчета"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {car.vendor} {car.model} • {Number(car.price).toLocaleString("ru-RU")} ₽
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
                <h4 className="text-base font-bold text-slate-900">Заявка принята!</h4>
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
