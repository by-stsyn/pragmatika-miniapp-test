import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Flame, Phone, User, X } from "lucide-react";
import { formatRussianPhone } from "/src/utils/phone";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCallback, setShowCallback] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 11) {
      setStatus("Введите корректный номер телефона");
      return;
    }

    setIsSubmitting(true);
    setStatus("Отправка...");

    try {
      const res = await fetch("/api/calltouch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: name || "Клиент",
          comment: "Заказ звонка из нижнего меню",
          callUrl: window.location.href,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("Заявка принята! Мы скоро перезвоним.");
        setPhone("");
        setName("");
        setTimeout(() => {
          setShowCallback(false);
          setStatus("");
        }, 2000);
      } else {
        setStatus("Ошибка: " + (data?.details?.message || "Попробуйте позже"));
      }
    } catch (err) {
      setStatus("Ошибка соединения. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    {
      id: "home",
      label: "Главная",
      icon: Home,
      path: "/",
      isActive: location.pathname === "/",
    },
    {
      id: "offers",
      label: "Акции",
      icon: Flame,
      path: "/offers",
      isActive:
        location.pathname === "/offers" ||
        location.pathname.startsWith("/offer/"),
    },
    {
      id: "call",
      label: "Звонок",
      icon: Phone,
      onClick: () => setShowCallback(true),
      isActive: false,
    },
    {
      id: "profile",
      label: "Кабинет",
      icon: User,
      path: "/ProfilePage",
      isActive:
        location.pathname === "/ProfilePage" ||
        location.pathname === "/BonusPage",
    },
  ];

  return (
    <>
      {/* Нижняя панель навигации (Bottom Tab Bar) согласно брендбуку */}
      <nav
        role="navigation"
        aria-label="Основное меню"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-lg shadow-black/5 safe-bottom"
      >
        <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            const handleClick = () => {
              if (item.onClick) {
                item.onClick();
              } else if (item.path) {
                navigate(item.path);
              }
            };

            return (
              <button
                key={item.id}
                onClick={handleClick}
                type="button"
                aria-label={item.label}
                className="flex flex-col items-center justify-center py-1 group select-none transition-all active:scale-95 cursor-pointer"
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-active:scale-90 ${
                    active
                      ? "text-pragmatika-green stroke-[2.2]"
                      : "text-pragmatika-light stroke-[1.8] group-hover:text-pragmatika-dark"
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 transition-colors whitespace-nowrap ${
                    active
                      ? "text-pragmatika-green font-bold"
                      : "text-pragmatika-light group-hover:text-pragmatika-dark font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Шторка (Bottom Sheet) для обратного звонка */}
      {showCallback && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-end z-50 transition-opacity animate-in fade-in duration-200"
          onClick={() => setShowCallback(false)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Хэндл шторки */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-2 mb-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pragmatika-green/15 text-pragmatika-green flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-pragmatika-dark">
                    Заказать звонок
                  </h3>
                  <p className="text-xs text-pragmatika-light">
                    Перезвоним в течение 1 минуты
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCallback(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-pragmatika-dark flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-pragmatika-dark mb-1">
                  Ваше имя
                </label>
                <input
                  type="text"
                  placeholder="Иван"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-pragmatika-black focus:outline-hidden focus:border-pragmatika-green focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-pragmatika-dark mb-1">
                  Номер телефона <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={(e) => setPhone(formatRussianPhone(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-pragmatika-black focus:outline-hidden focus:border-pragmatika-green focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full bg-pragmatika-green hover:brightness-105 text-white font-bold py-3.5 rounded-xl shadow-md shadow-pragmatika-green/20 transition-all active:scale-[0.98] text-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Отправка..." : "Жду звонка"}
              </button>

              {status && (
                <div
                  className={`text-xs mt-1 p-2.5 rounded-xl text-center font-medium ${
                    status.startsWith("Заявка")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {status}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
