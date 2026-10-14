import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gift, Phone, MapPin, User, X, CheckCircle, PhoneCall, Copy, Check } from "lucide-react";

const DEALER_PHONE_DISPLAY = "+7 (812) 336-36-36";
const DEALER_PHONE_RAW = "+78123363636";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [showCallback, setShowCallback] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(DEALER_PHONE_RAW);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = DEALER_PHONE_RAW;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy phone:", err);
    }
  };

  const handleDirectCall = (e) => {
    // В Telegram WebApp ссылки tel: часто блокируются вебвью, пробуем через WebApp.openLink
    const telUri = `tel:${DEALER_PHONE_RAW}`;
    if (window.Telegram?.WebApp?.openLink) {
      try {
        window.Telegram.WebApp.openLink(telUri);
        return;
      } catch (err) {
        console.warn("Telegram openLink error:", err);
      }
    }
    window.location.href = telUri;
  };

  const handlePhoneChange = (e) => {
    const inputVal = e.target.value;
    const prevVal = phone || "";

    if (!inputVal) {
      setPhone("");
      return;
    }

    const isDeleting = inputVal.length < prevVal.length;
    let rawDigits = inputVal.replace(/\D/g, "");
    const prevDigits = prevVal.replace(/\D/g, "");

    // Если нажат Backspace на служебном символе (скобка, дефис, пробел),
    // удаляем предшествующую цифру
    if (isDeleting && rawDigits === prevDigits && rawDigits.length > 0) {
      rawDigits = rawDigits.slice(0, -1);
    }

    let digits = rawDigits;
    if (digits.startsWith("7") || digits.startsWith("8")) {
      digits = digits.slice(1);
    }

    // Если стираем и цифр не осталось — полностью сбрасываем поле
    if (isDeleting && digits.length === 0) {
      setPhone("");
      return;
    }

    digits = digits.slice(0, 10);

    let formatted = "";
    if (digits.length > 0) {
      formatted = `+7 (${digits.slice(0, 3)}`;
      if (digits.length > 3) {
        formatted += `) ${digits.slice(3, 6)}`;
      } else if (digits.length === 3 && !isDeleting) {
        formatted += ") ";
      }
      if (digits.length > 6) {
        formatted += `-${digits.slice(6, 8)}`;
      }
      if (digits.length > 8) {
        formatted += `-${digits.slice(8, 10)}`;
      }
    } else if (rawDigits === "7" || rawDigits === "8" || inputVal.includes("+7")) {
      formatted = "+7 (";
    }

    setPhone(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("Отправка...");

    try {
      const res = await fetch("/api/calltouch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name,
          callUrl: window.location.href,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setPhone("");
        setName("");
        setTimeout(() => {
          setShowCallback(false);
          setStatus("");
        }, 2000);
      } else {
        setStatus("Ошибка: " + (data.details?.message || "Попробуйте позже"));
      }
    } catch (err) {
      console.error("Calltouch error:", err);
      setStatus("Ошибка сети при отправке");
    } finally {
      setSubmitting(false);
    }
  };

  const navItems = [
    {
      label: "Главная",
      path: "/",
      icon: Home,
      isActive: currentPath === "/",
      onClick: () => navigate("/"),
    },
    {
      label: "Акции",
      path: "/offers",
      icon: Gift,
      isActive: currentPath.startsWith("/offers") || currentPath.startsWith("/offer/"),
      onClick: () => navigate("/offers"),
    },
    {
      label: "Позвонить",
      isAction: true,
      icon: Phone,
      isActive: showCallback,
      onClick: () => setShowCallback(true),
    },
    {
      label: "Контакты",
      path: "/contacts",
      icon: MapPin,
      isActive: currentPath.startsWith("/contacts"),
      onClick: () => navigate("/contacts"),
    },
    {
      label: "Гараж",
      path: "/ProfilePage",
      icon: User,
      isActive: currentPath.startsWith("/ProfilePage"),
      onClick: () => navigate("/ProfilePage"),
    },
  ];

  return (
    <>
      {/* ======= Нижнее премиум-меню (Safe Area & Rounded Screen Friendly) ======= */}
      <nav
        aria-label="Основная навигация"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(15,23,42,0.06)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center px-3 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] gap-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <button
                key={idx}
                type="button"
                onClick={item.onClick}
                className={`group flex flex-col items-center justify-center min-h-[54px] py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
                  active ? "bg-[#8cc63f]/10" : "hover:bg-slate-100/60"
                }`}
                aria-label={item.label}
              >
                {/* Иконка с комфортным touch target */}
                <div
                  className={`relative flex items-center justify-center w-9 h-7 rounded-lg transition-colors ${
                    active
                      ? "text-[#5e8f23]"
                      : "text-slate-400 group-hover:text-slate-700"
                  }`}
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.3 : 1.9}
                    className="transition-transform group-active:scale-90"
                  />
                  {active && (
                    <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#8cc63f]" />
                  )}
                </div>

                {/* Подпись - увеличенный размер, без переноса слов */}
                <span
                  className={`text-[11px] leading-tight mt-1 font-medium whitespace-nowrap transition-colors tracking-tight ${
                    active ? "text-[#5e8f23] font-bold" : "text-slate-600"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ======= Попап вызова / заказа звонка ======= */}
      {showCallback && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative animate-in slide-in-from-bottom-4 duration-250">
            {/* Кнопка закрытия */}
            <button
              type="button"
              onClick={() => setShowCallback(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>

            {status === "success" ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#8cc63f]/20 text-[#5e8f23] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={36} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Заявка принята!
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Специалист Прагматика свяжется с вами в течение нескольких минут.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Заголовок */}
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-9 h-9 rounded-xl bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23]">
                      <PhoneCall size={20} strokeWidth={2.2} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      Связь с дилером
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Позвоните напрямую или оставьте заявку — менеджер оперативно проконсультирует вас.
                  </p>
                </div>

                {/* Блок прямого звонка и копирования номера */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Прямой номер
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPhone}
                        className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5 hover:text-[#5e8f23] transition-colors"
                        title="Нажмите, чтобы скопировать"
                      >
                        <span>{DEALER_PHONE_DISPLAY}</span>
                      </button>
                    </div>

                    {/* Бейдж статуса копирования */}
                    {copied && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 animate-in fade-in duration-150">
                        <Check size={13} strokeWidth={2.5} />
                        Скопирован
                      </span>
                    )}
                  </div>

                  {/* Кнопки действий: Позвонить и Скопировать */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <a
                      href={`tel:${DEALER_PHONE_RAW}`}
                      onClick={handleDirectCall}
                      className="min-h-[46px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Phone size={15} className="text-[#8cc63f]" />
                      <span>Позвонить</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className={`min-h-[46px] px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] border ${
                        copied
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={15} strokeWidth={2.5} className="text-emerald-600" />
                          <span>Скопировано!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={15} className="text-slate-500" />
                          <span>Скопировать</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Разделитель */}
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-xs uppercase font-semibold text-slate-400 tracking-wider">
                    или обратный звонок
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Поле Имя */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      placeholder="Как к вам обращаться"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-12 px-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20 bg-slate-50/70 text-slate-900 placeholder-slate-400 transition-all"
                    />
                  </div>

                  {/* Поле Телефон */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Номер телефона *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+7 (___) ___-__-__"
                      className="w-full h-12 px-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20 bg-slate-50/70 text-slate-900 placeholder-slate-400 font-medium transition-all"
                    />
                  </div>

                  {status && status !== "success" && (
                    <p className="text-xs font-medium text-red-500 text-center bg-red-50 py-2 px-3 rounded-lg border border-red-100">
                      {status}
                    </p>
                  )}

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full min-h-[52px] rounded-2xl bg-[#8cc63f] hover:bg-[#7db934] disabled:opacity-50 text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {submitting ? "Отправка…" : "Заказать звонок"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
