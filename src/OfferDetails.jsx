import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Calendar, ShieldCheck, Tag, X, CheckCircle2 } from "lucide-react";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";
import { DEFAULT_OFFERS } from "/src/data/defaultOffers";
import { formatRussianPhone } from "/src/utils/phone";

export default function OfferDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(() => state?.offer || null);
  const [loading, setLoading] = useState(() => !state?.offer);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Если акция не была передана через state, восстанавливаем из кэша или API
  useEffect(() => {
    if (offer) return;

    let found = null;

    // 1. Проверяем сохраненные данные в sessionStorage
    try {
      const savedData = sessionStorage.getItem("offersData");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (id !== undefined && parsed[Number(id)]) {
            found = parsed[Number(id)];
          } else {
            found = parsed.find(
              (o, idx) => String(idx) === String(id) || o.id === id || o.link?.includes(id)
            );
          }
        }
      }
    } catch (e) {}

    // 2. Проверяем дефолтный список
    if (!found && id !== undefined) {
      const num = Number(id);
      if (!isNaN(num) && DEFAULT_OFFERS[num]) {
        found = DEFAULT_OFFERS[num];
      } else {
        found = DEFAULT_OFFERS.find(
          (o, idx) => String(idx) === String(id) || o.id === id || o.link?.includes(id)
        );
      }
    }

    if (found) {
      setOffer(found);
      setLoading(false);
      return;
    }

    // 3. Загружаем из API
    setLoading(true);
    fetch("/api/fetch-offers")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const num = Number(id);
          const item = (!isNaN(num) && data[num])
            ? data[num]
            : data.find((o, idx) => String(idx) === String(id) || o.id === id || o.link?.includes(id));
          if (item) {
            setOffer(item);
            return;
          }
        }
        // Fallback
        setOffer(DEFAULT_OFFERS[0]);
      })
      .catch(() => {
        setOffer(DEFAULT_OFFERS[0]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, offer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.replace(/\D/g, "").length < 11) {
      setSubmitStatus({ error: "Введите корректный номер телефона" });
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || "Клиент",
          phone: formData.phone,
          promoTitle: offer?.title || "Заявка по акции",
          callUrl: window.location.href,
        }),
      });

      if (res.ok) {
        setSubmitStatus({ success: "Заявка принята! Мы свяжемся с вами в течение пары минут." });
        setFormData({ name: "", phone: "" });
        setTimeout(() => {
          setModalOpen(false);
          setSubmitStatus(null);
        }, 2200);
      } else {
        setSubmitStatus({ error: "Не удалось отправить заявку. Попробуйте еще раз." });
      }
    } catch (err) {
      setSubmitStatus({ error: "Ошибка сети. Пожалуйста, попробуйте позже." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Preloader />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-[#425766] mb-2">Акция не найдена</h2>
        <p className="text-sm text-gray-500 mb-6">Возможно, срок действия предложения завершился</p>
        <button
          onClick={() => navigate("/offers")}
          className="px-5 py-2.5 bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-bold rounded-xl shadow-sm text-sm"
        >
          Все акции
        </button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-gray-900">
      {/* Верхний бар с кнопкой назад */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#425766] hover:text-[#8cc63f] transition-colors py-1 cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>Назад</span>
          </button>
          <span className="text-xs font-semibold text-gray-400">
            {offer.action || "Спецпредложение"}
          </span>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 sm:p-6 space-y-5">
        {/* Карточка акции */}
        <article className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200/80 space-y-4 overflow-hidden">
          {/* Изображение */}
          {offer.thumbnail && (
            <div className="aspect-[2/1] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-2xs">
              <img
                src={offer.thumbnail}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Теги и метаданные */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {offer.action && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-[#f0f7e8] text-[#6fa02f] border border-[#8cc63f]/30">
                <Tag size={12} />
                {offer.action}
              </span>
            )}
            {offer.dealer && (
              <span className="text-xs text-[#425766] font-medium bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                {offer.dealer}
              </span>
            )}
            {offer.brand && (
              <span className="text-xs text-gray-600 font-semibold bg-gray-100 px-2.5 py-1 rounded-full">
                {offer.brand}
              </span>
            )}
          </div>

          {/* Заголовок акции */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#425766] leading-tight">
            {offer.title}
          </h1>

          {/* Описание акции */}
          {offer.description && (
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed pt-2 border-t border-gray-100 space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:text-[#425766] [&_a]:text-[#8cc63f] [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: offer.description }}
            />
          )}

          {/* Кнопка действия */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3.5 bg-[#8cc63f] hover:bg-[#7ab82c] active:scale-[0.99] text-white font-bold rounded-2xl shadow-md shadow-[#8cc63f]/25 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={18} />
              <span>Воспользоваться предложением</span>
            </button>
          </div>
        </article>
      </main>

      {/* Модальное окно (шторка / Bottom Sheet) заявки */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-end z-50 transition-opacity animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-2 mb-2" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#425766]">
                  Заявка по спецпредложению
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                  {offer.title}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#425766] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#425766] mb-1">
                  Ваше имя
                </label>
                <input
                  type="text"
                  placeholder="Иван"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-black focus:outline-hidden focus:border-[#8cc63f] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#425766] mb-1">
                  Номер телефона <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: formatRussianPhone(e.target.value) })
                  }
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-black focus:outline-hidden focus:border-[#8cc63f] focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-bold py-3.5 rounded-xl shadow-md shadow-[#8cc63f]/20 transition-all active:scale-[0.98] text-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Отправка..." : "Отправить заявку"}
              </button>

              {submitStatus?.success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-medium">
                  <CheckCircle2 size={16} className="text-[#8cc63f] shrink-0" />
                  <span>{submitStatus.success}</span>
                </div>
              )}
              {submitStatus?.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                  {submitStatus.error}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
