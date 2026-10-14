import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gift, Phone, MapPin, User, X, CheckCircle } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [showCallback, setShowCallback] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val) {
      setPhone("");
      return;
    }
    if (val.startsWith("7") || val.startsWith("8")) {
      val = val.slice(1);
    }
    val = val.slice(0, 10);

    let formatted = "+7";
    if (val.length > 0) {
      formatted += ` (${val.slice(0, 3)}`;
    }
    if (val.length >= 3) {
      formatted += `) ${val.slice(3, 6)}`;
    }
    if (val.length >= 6) {
      formatted += `-${val.slice(6, 8)}`;
    }
    if (val.length >= 8) {
      formatted += `-${val.slice(8, 10)}`;
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
        }, 1800);
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
      {/* ======= Нижнее премиум-меню (Glassmorphism bar) ======= */}
      <nav
        aria-label="Основная навигация"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center px-1 py-1.5 pb-safe">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="group flex flex-col items-center justify-center min-h-[48px] py-1 px-1 transition-all active:scale-95"
                aria-label={item.label}
              >
                {/* Иконка */}
                <div
                  className={`relative flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${
                    active
                      ? "text-[#5e8f23]"
                      : "text-slate-400 group-hover:text-slate-700"
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : 1.7}
                    className="transition-transform group-active:scale-90"
                  />
                  {active && (
                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#8cc63f]" />
                  )}
                </div>

                {/* Подпись */}
                <span
                  className={`text-[10px] tracking-tight leading-none mt-1 font-medium transition-colors ${
                    active ? "text-[#5e8f23] font-bold" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ======= Попап обратного звонка (Calltouch) ======= */}
      {showCallback && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-slate-200 relative">
            {/* Кнопка закрытия */}
            <button
              onClick={() => setShowCallback(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              aria-label="Закрыть"
            >
              <X size={15} />
            </button>

            {status === "success" ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#8cc63f]/20 text-[#5e8f23] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Заявка принята!
                </h3>
                <p className="text-xs text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                  Мы свяжемся с вами в течение нескольких минут.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-md bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23]">
                      <Phone size={13} strokeWidth={2} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Заказать звонок
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Перезвоним и ответим на любые вопросы по авто и сервису.
                  </p>
                </div>

                {/* Поле Имя */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    placeholder="Как к вам обращаться"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#8cc63f] bg-slate-50/50"
                  />
                </div>

                {/* Поле Телефон */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Номер телефона *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#8cc63f] bg-slate-50/50"
                  />
                </div>

                {status && status !== "success" && (
                  <p className="text-[11px] font-medium text-red-500 text-center">
                    {status}
                  </p>
                )}

                <div className="pt-1.5">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-[#8cc63f] hover:bg-[#7db934] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    {submitting ? "Отправка…" : "Заказать звонок"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
