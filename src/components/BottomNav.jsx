import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gift, Phone, MapPin, User, X } from "lucide-react";
import { formatRussianPhone } from "/src/utils/phone";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCallback, setShowCallback] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setStatus("Ваша заявка принята! Мы перезвоним.");
        setPhone("");
        setName("");
        setTimeout(() => setShowCallback(false), 1500);
      } else {
        setStatus("Ошибка: " + JSON.stringify(data.details));
      }
    } catch (err) {
      setStatus("Ошибка сервера");
    }
  };

  const navItems = [
    {
      label: "Главная",
      icon: Home,
      path: "/",
      isActive: location.pathname === "/",
    },
    {
      label: "Акции",
      icon: Gift,
      path: "/offers",
      isActive: location.pathname === "/offers" || location.pathname.startsWith("/offer/"),
    },
    {
      label: "Звонок",
      icon: Phone,
      onClick: () => setShowCallback(true),
      isAction: true,
    },
    {
      label: "Контакты",
      icon: MapPin,
      path: "/contacts",
      isActive: location.pathname === "/contacts",
    },
    {
      label: "Кабинет",
      icon: User,
      path: "/ProfilePage",
      isActive: location.pathname === "/ProfilePage" || location.pathname === "/BonusPage",
    },
  ];

  return (
    <>
      {/* Подложка для плавного перекрытия нижнего края */}
      <div className="fixed bottom-0 left-0 right-0 bg-white h-4 z-40" />

      {/* Нижнее меню */}
      <nav className="fixed bottom-2 left-3 right-3 bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex justify-around items-center py-2 z-50 rounded-2xl mx-auto max-w-lg transition-all">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const active = item.isActive;

          if (item.isAction) {
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-600 hover:text-[#8cc63f] transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-[#f0f7e8] group-hover:bg-[#8cc63f] flex items-center justify-center transition-colors">
                  <Icon size={18} className="text-[#6fa02f] group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-semibold text-gray-700 group-hover:text-[#6fa02f] mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                active
                  ? "text-[#6fa02f] font-bold"
                  : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-transform ${
                  active ? "scale-110 text-[#8cc63f]" : ""
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] mt-0.5 ${active ? "text-[#6fa02f]" : "text-gray-500"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Попап обратного звонка (Calltouch) */}
      {showCallback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCallback(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#f0f7e8] text-[#8cc63f] flex items-center justify-center">
                <Phone size={18} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Заказать звонок
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Перезвоним в течение 1 минуты в рабочее время
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Ваше имя
                </label>
                <input
                  type="text"
                  placeholder="Иван"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-[#8cc63f] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Номер телефона <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={(e) => setPhone(formatRussianPhone(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-[#8cc63f] focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                className="mt-1 w-full bg-[#8cc63f] hover:bg-[#7bb531] text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-98 text-sm"
              >
                Жду звонка
              </button>

              {status && (
                <div
                  className={`text-xs mt-1 p-2.5 rounded-lg text-center font-medium ${
                    status.startsWith("Ваша заявка")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
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
