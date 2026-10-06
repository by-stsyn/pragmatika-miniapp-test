import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";
import { platform } from "./platform";

const BASE_URL = "/api/render"; // ваш прокси

export default function BonusPage() {
  const [loading, setLoading] = useState(true);
  const [bonus, setBonus] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
  const userId = platform.getId();
  const idParam = platform.isMax() ? "maxId" : "telegramId"; // ← универсальный параметр

  if (!userId) {
    setError("Не удалось получить идентификатор пользователя");
    setLoading(false);
    return;
  }

  const loadBonus = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}?path=communication/contact/bonus&${idParam}=${userId}`
      );

      if (!res.ok) throw new Error("Не удалось получить данные");

      const data = await res.json();
      setBonus(data.card || null);
    } catch (e) {
      console.error(e);
      setError("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  loadBonus();
}, []);

  return (
    <div className="p-4 pb-[90px]">
      {/* Назад */}
      <div className="mb-4">
        <a href="/" className="inline-flex items-center text-blue-600">
          <ArrowLeft className="mr-1" /> Назад
        </a>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Бонусные баллы
      </h1>

      {/* Загрузка */}
      {loading && <Preloader />}

      {/* Ошибка */}
      {!loading && error && (
        <p className="text-center text-red-600">{error}</p>
      )}

      {/* Нет данных */}
      {!loading && !error && !bonus && (
        <p className="text-center text-gray-600">
          Данные по бонусам не найдены.
        </p>
      )}

      {/* Контент */}
      {!loading && bonus && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
          {/* Баланс */}
          <div className="mb-6 text-center">
            <p className="text-gray-600 text-lg">Текущий баланс</p>
            <p className="text-4xl font-bold text-green-600">
              {bonus.balance} баллов
            </p>
          </div>

          {/* Карта */}
          <div className="mb-4 text-center">
            <p className="text-gray-500">Номер карты</p>
            <p className="text-xl font-semibold">{bonus.number}</p>
          </div>

          {/* Дата списания */}
          {bonus.dateOfDebit && (
            <div className="mb-6 text-center">
              <p className="text-gray-500">Ближайшее списание</p>
              <p className="text-lg font-medium text-red-600">
                {new Date(bonus.dateOfDebit).toLocaleDateString("ru-RU")} —{" "}
                {bonus.amountDebit} баллов
              </p>
            </div>
          )}

          {/* История */}
          <h2 className="text-xl font-bold mb-3 text-gray-800">
            История операций
          </h2>

          <div className="space-y-3">
            {bonus.history?.length > 0 ? (
              [...bonus.history]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((item, i) => (
                  <div
                    key={i}
                    className="p-3 border rounded-lg bg-gray-50 shadow-sm"
                  >
                    <p className="font-semibold">{item.type}</p>
                    <p className="text-gray-700">{item.amount} баллов</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(item.date).toLocaleString("ru-RU")}
                    </p>
                    {item.description && (
                      <p className="text-gray-600 text-sm mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))
            ) : (
              <p className="text-gray-600">Нет операций</p>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
