import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Gift, Phone, MapPin, User, X } from "lucide-react";
import InputMask from "react-input-mask";

export default function BottomNav() {
  const navigate = useNavigate();
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

  return (
    <>
      {/* ======= Подложка под меню (фон до самого низа) ======= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white h-3 z-40" />
      {/* ======= Нижнее меню ======= */}
      <nav className="fixed bottom-3 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-3 z-50 rounded-t-2xl mx-auto max-w-md">
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center text-gray-700 hover:text-[#7ab82c] text-xs"
        >
          <Home size={24} fill="#81869a" stroke="#000000" /> 
          Главная
        </button>
        <button
          onClick={() => navigate("/offers")}
          className="flex flex-col items-center text-gray-700 hover:text-[#7ab82c] text-xs"
        >
          <Gift size={24} fill="#fe5000" stroke="#000000" />
          Акции
        </button>
        <button
          onClick={() => setShowCallback(true)}
          className="flex flex-col items-center text-gray-700 hover:text-[#7ab82c] text-xs"
        >
          <Phone size={24} className="w-6 h-6 text-black"
  style={{ fill: "#8cc63f", stroke: "black" }} />
          Позвонить
        </button>
        <button
          onClick={() => navigate("/contacts")}
          className="flex flex-col items-center text-gray-700 hover:text-[#7ab82c] text-xs"
        >
          <MapPin size={24} className="w-6 h-6" fill="#d51818" stroke="#000000" />
          Контакты
        </button>

<button
  onClick={() => navigate("/ProfilePage")}
  className="flex flex-col items-center text-gray-700 hover:text-[#7ab82c] text-xs"
>
  <User size={24} className="w-6 h-6" fill="#8cc63f" stroke="#000000" />
  Профиль
</button>



        
      </nav>

      {/* ======= Попап обратного звонка ======= */}
      {showCallback && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-xl shadow-lg w-80 relative">
            <button
              onClick={() => setShowCallback(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Перезвоним за минуту
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 border border-gray-300 rounded"
              />
              <InputMask
                mask="+7 (999) 999-99-99"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              >
                {(inputProps) => (
                  <input
                    {...inputProps}
                    type="tel"
                    className="p-2 border border-gray-300 rounded"
                  />
                )}
              </InputMask>

              <button
                type="submit"
                className="bg-[#8cc63f] text-white px-4 py-2 rounded"
              >
                Заказать звонок
              </button>

              {status && (
                <p className="text-sm mt-1 text-gray-700 text-center">{status}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}



















