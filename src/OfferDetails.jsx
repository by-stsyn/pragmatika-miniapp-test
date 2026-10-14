import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Phone, ClipboardEdit, ArrowLeft } from "lucide-react";
import BottomNav from "/src/components/BottomNav";

export default function OfferDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const offer = state?.offer;

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!offer) return <div className="p-4 text-center">Акция не найдена</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
        alert("Заявка успешно отправлена!");
        setFormData({ name: "", phone: "" });
        setModalOpen(false);
      } else {
        alert("Ошибка при отправке. Попробуйте позже.");
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка сети. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-20">
      {/* Кнопка назад */}
      <button onClick={() => navigate(-1)} className="text-blue-600 flex items-center mb-4">
        <ArrowLeft className="mr-2" /> Назад
      </button>

      {/* Контент акции */}
      <h1 className="text-xl font-bold mb-2">{offer.title}</h1>
      {offer.thumbnail && (
        <img
          src={offer.thumbnail}
          alt={offer.title}
          className="w-full rounded-xl mb-4"
        />
      )}
      <div
        className="prose max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: offer.description }}
      />

      {/* Кнопка открытия модального окна */}
      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 bg-[#8cc63f] text-white rounded hover:bg-[#7ab82c]"
      >
        Оставить заявку
      </button>

      {/* Модальное окно */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">
              Заявка по акции: {offer.title}
            </h2>

            <input
              type="text"
              required
              placeholder="Имя"
              className="w-full p-2 mb-3 border rounded"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
              type="tel"
              required
              placeholder="Телефон"
              className="w-full p-2 mb-3 border rounded"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#8cc63f] text-white rounded hover:bg-[#7ab82c]"
              >
                {loading ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </form>
        </div>
      )}
          <BottomNav />
    </div>
  );
}











