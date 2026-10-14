import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Building2,
  Car,
  Maximize2,
} from "lucide-react";
import BottomNav from "/src/components/BottomNav";

export default function OfferDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const offer = state?.offer;

  const [modalOpen, setModalOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Подключение нативной кнопки Telegram WebApp
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.BackButton) {
      tg.BackButton.show();
      const onBack = () => {
        if (fullscreenImage) {
          setFullscreenImage(false);
          return;
        }
        if (modalOpen) {
          handleCloseModal();
          return;
        }
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate("/offers");
        }
      };
      tg.BackButton.onClick(onBack);
      return () => {
        tg.BackButton.offClick(onBack);
        tg.BackButton.hide();
      };
    }
  }, [navigate, fullscreenImage, modalOpen]);

  const handleBack = () => {
    if (fullscreenImage) {
      setFullscreenImage(false);
      return;
    }
    if (modalOpen) {
      handleCloseModal();
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/offers");
    }
  };

  if (!offer) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between text-slate-900 pb-20 font-sans">
        <div className="p-4 max-w-md mx-auto w-full pt-12 text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag size={28} />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-1.5">
            Акция не найдена
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Возможно, срок действия спецпредложения истёк или страница была обновлена.
          </p>
          <button
            onClick={() => navigate("/offers")}
            className="px-5 py-2.5 bg-gradient-to-r from-[#8cc63f] to-[#7bb630] text-white text-xs font-semibold rounded-xl shadow-sm hover:brightness-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Вернуться к акциям</span>
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          promoTitle: offer.title,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", phone: "" });
      } else {
        setErrorMessage("Не удалось отправить заявку. Пожалуйста, попробуйте еще раз.");
      }
    } catch (err) {
      console.error("Ошибка отправки заявки:", err);
      setErrorMessage("Ошибка сети. Пожалуйста, проверьте подключение и повторите попытку.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSubmitted(false);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-40 font-sans antialiased">
      {/* Шапка */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors active:scale-95 shrink-0"
          >
            <ArrowLeft size={16} className="text-slate-500" />
            <span>К акциям</span>
          </button>

          <span className="text-xs font-bold text-slate-800 truncate text-center flex-1">
            {offer.brand || "Спецпредложение"}
          </span>

          <div className="shrink-0 flex items-center justify-end">
            <span className="text-[11px] font-bold text-lime-700 bg-lime-50 px-2.5 py-1 rounded-full border border-lime-200/80 whitespace-nowrap">
              {offer.action || "Акция"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-3 space-y-4">
        {/* Главная карточка акции */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Обложка с возможностью открытия на весь экран */}
          {offer.thumbnail ? (
            <div
              onClick={() => setFullscreenImage(true)}
              className="relative w-full bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer group"
            >
              <img
                src={offer.thumbnail}
                alt={offer.title}
                className="w-full h-auto max-h-[380px] object-contain mx-auto block transition-transform duration-200 group-hover:scale-[1.01]"
              />
              {offer.action && (
                <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-lg border border-white/10 shadow-sm pointer-events-none">
                  {offer.action}
                </div>
              )}
              {/* Бейдж-кнопка для открытия на весь экран */}
              <div className="absolute bottom-3 right-3 bg-slate-950/80 hover:bg-slate-950 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-white/20 shadow-md flex items-center gap-1.5 backdrop-blur-sm transition-all active:scale-95">
                <Maximize2 size={13} className="text-lime-400" />
                <span>На весь экран</span>
              </div>
            </div>
          ) : (
            <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-between text-white">
              <div>
                <span className="text-xs text-lime-300 font-semibold flex items-center gap-1 mb-1">
                  <Sparkles size={13} />
                  Специальные условия
                </span>
                <span className="text-base font-bold">Официальное предложение</span>
              </div>
              <Tag size={28} className="text-white/20" />
            </div>
          )}

          {/* Инфо-блок */}
          <div className="p-4 space-y-3">
            {/* Теги дилера и бренда */}
            <div className="flex flex-wrap items-center gap-2">
              {offer.brand && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-lime-800 bg-lime-50 border border-lime-200 px-2.5 py-1 rounded-lg">
                  <Car size={12} />
                  {offer.brand}
                </span>
              )}
              {offer.dealer && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100/90 px-2.5 py-1 rounded-lg">
                  <MapPin size={12} className="text-slate-400" />
                  <span className="truncate max-w-[200px]">{offer.dealer}</span>
                </span>
              )}
            </div>

            {/* Название акции */}
            <h1 className="text-base font-bold text-slate-900 leading-snug">
              {offer.title}
            </h1>

            {/* Гарантия дилера */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck size={14} className="text-lime-600 flex-shrink-0" />
              <span>Официальный дилерский центр Прагматика</span>
            </div>
          </div>
        </div>

        {/* Описание акции */}
        {offer.description && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Условия и подробности</span>
            </h2>
            <div
              className="text-xs text-slate-600 leading-relaxed space-y-2 [&>p]:mb-2.5 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-4 [&>strong]:text-slate-800 [&>h3]:text-xs [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-3 [&>h3]:mb-1 [&>table]:w-full [&>table]:text-[11px] [&>table]:border-collapse [&_td]:p-1.5 [&_td]:border [&_td]:border-slate-200 [&_th]:p-1.5 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50"
              dangerouslySetInnerHTML={{ __html: offer.description }}
            />
          </div>
        )}

      </main>

      {/* Фиксированная нижняя плашка с CTA строго над меню навигации BottomNav */}
      <div className="fixed bottom-[66px] sm:bottom-[70px] left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto flex gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 min-h-[44px] py-2.5 px-4 bg-gradient-to-r from-[#8cc63f] to-[#7bb630] text-white text-xs font-bold rounded-xl shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Send size={14} />
            <span>Оставить заявку по акции</span>
          </button>
        </div>
      </div>

      {/* Модальное окно онлайн-заявки */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-slate-100 relative">
            {/* Кнопка закрытия */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            {submitted ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-14 h-14 bg-lime-100 text-[#65a30d] rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Заявка принята!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed px-2">
                  Спасибо! Наш менеджер свяжется с вами в ближайшее время, чтобы подробно рассказать об условиях и зафиксировать предложение.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleCloseModal}
                    className="w-full py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Понятно
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-lime-700 bg-lime-50 px-2 py-0.5 rounded mb-1">
                    <Sparkles size={11} />
                    <span>Специальные условия</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Заявка по спецпредложению
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {offer.title}
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Как к вам обращаться"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cc63f] focus:bg-white transition-all text-slate-900"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Номер телефона
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+7 (___) ___-__-__"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cc63f] focus:bg-white transition-all text-slate-900"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 leading-tight">
                  Нажимая кнопку, вы подтверждаете согласие на обработку персональных данных.
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#8cc63f] to-[#7bb630] text-white text-xs font-bold rounded-xl shadow-md hover:brightness-105 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <span>Отправка...</span>
                    ) : (
                      <>
                        <Send size={13} />
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

      {/* Полноэкранный просмотр изображения для мобильных устройств */}
      {fullscreenImage && offer?.thumbnail && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 animate-fadeIn select-none"
          onClick={() => setFullscreenImage(false)}
        >
          {/* Верхняя панель полноэкранного режима */}
          <div
            className="flex items-center justify-between text-white pt-2 pb-2 px-1 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-medium text-slate-300 truncate max-w-[80%]">
              {offer.title}
            </div>
            <button
              onClick={() => setFullscreenImage(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
          </div>

          {/* Изображение по центру */}
          <div className="flex-1 flex items-center justify-center overflow-hidden py-2">
            <img
              src={offer.thumbnail}
              alt={offer.title}
              className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Подсказка внизу */}
          <div className="text-center pb-3 text-[11px] text-slate-400">
            Нажмите в любом месте или на крестик, чтобы закрыть
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}












