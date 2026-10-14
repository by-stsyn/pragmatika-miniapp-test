import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  CreditCard, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  ShieldCheck,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";
import { platform } from "./platform";

const BASE_URL = "https://telegram-miniapp-orpin.vercel.app/api/render"; // ваш прокси

export default function BonusPage() {
  const navigate = useNavigate();
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

  // Форматирование числа с разделителями тысяч
  const formatPoints = (val) => {
    if (val === null || val === undefined) return "0";
    const num = Number(val);
    return isNaN(num) ? String(val) : num.toLocaleString("ru-RU");
  };

  // Форматирование номера карты
  const formatCardNumber = (num) => {
    if (!num) return "—";
    const str = String(num).replace(/\s+/g, "");
    return str.replace(/(\d{4})/g, "$1 ").trim();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28">
      {/* Верхняя навигационная панель */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-slate-700 active:text-slate-900 font-medium py-1.5 px-2.5 -ml-2 rounded-xl active:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
            <span className="text-[15px]">Назад</span>
          </button>
          <h1 className="text-base font-semibold text-slate-800">Бонусная программа</h1>
          <div className="w-16"></div> {/* Балансир для центрирования */}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Загрузка */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <Preloader />
            <p className="text-slate-400 text-sm mt-3 font-medium">Загружаем данные бонусного счёта...</p>
          </div>
        )}

        {/* Ошибка */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center mt-6">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-base font-semibold text-rose-800 mb-1">Не удалось загрузить бонусы</p>
            <p className="text-sm text-rose-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2.5 bg-rose-600 text-white text-sm font-medium rounded-xl active:scale-95 transition-transform"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Нет данных */}
        {!loading && !error && !bonus && (
          <div className="bg-white border border-slate-200 rounded-3xl p-7 text-center shadow-sm mt-6">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Карта не найдена</h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Бонусная карта пока не привязана к вашему профилю. Обратитесь к менеджеру автосалона для выпуска карты.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full h-[50px] bg-slate-900 text-white font-medium text-[15px] rounded-2xl active:bg-slate-800 transition-colors"
            >
              Вернуться на главную
            </button>
          </div>
        )}

        {/* Основной контент */}
        {!loading && bonus && (
          <>
            {/* Виртуальная карта лояльности */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-950 text-white p-6 shadow-xl border border-slate-700/40">
              {/* Фоновые декоративные сферы */}
              <div className="absolute -right-12 -top-12 w-44 h-44 bg-[#8cc63f]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between min-h-[170px]">
                {/* Верхняя строка карты */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <Sparkles className="w-4 h-4 text-[#8cc63f]" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                        Автосалон
                      </div>
                      <div className="text-xs font-medium text-white/90">
                        Клуб привилегий
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Активна
                  </span>
                </div>

                {/* Баланс баллов */}
                <div className="my-5">
                  <div className="text-xs font-medium text-slate-300 mb-1">
                    Доступно для оплаты
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                      {formatPoints(bonus.balance)}
                    </span>
                    <span className="text-base font-semibold text-[#8cc63f]">
                      баллов
                    </span>
                  </div>
                </div>

                {/* Номер карты */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="text-xs text-slate-400 font-mono tracking-wider">
                    № {formatCardNumber(bonus.number)}
                  </div>
                  <div className="text-[11px] font-medium text-slate-300">
                    1 балл = 1 ₽
                  </div>
                </div>
              </div>
            </div>

            {/* Блок ближайшего списания (если есть) */}
            {bonus.dateOfDebit && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-0.5">
                    Внимание: сгорание баллов
                  </div>
                  <p className="text-[14px] text-slate-700 leading-snug">
                    <span className="font-bold text-amber-700 whitespace-nowrap">
                      {formatPoints(bonus.amountDebit)} баллов
                    </span>{" "}
                    сгорят{" "}
                    <span className="font-semibold text-slate-900 whitespace-nowrap">
                      {new Date(bonus.dateOfDebit).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Информационная плашка правил */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#8cc63f]/15 flex items-center justify-center shrink-0 text-[#5e8f23]">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-slate-800 mb-0.5">
                  Как использовать баллы
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  Оплачивайте до 30% стоимости услуг сервиса, технического обслуживания и оригинальных запчастей. Просто предупредите мастера при оформлении заказа.
                </p>
              </div>
            </div>

            {/* История операций */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  История операций
                </h2>
                {bonus.history?.length > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
                    {bonus.history.length}
                  </span>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {bonus.history?.length > 0 ? (
                  [...bonus.history]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((item, i) => {
                      const isDebit =
                        item.type?.toLowerCase().includes("спис") ||
                        item.type?.toLowerCase().includes("сгор") ||
                        Number(item.amount) < 0;

                      return (
                        <div key={i} className="py-3.5 first:pt-1 last:pb-1 flex items-start gap-3.5">
                          {/* Иконка типа операции */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isDebit
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}
                          >
                            {isDebit ? (
                              <TrendingDown className="w-5 h-5" />
                            ) : (
                              <TrendingUp className="w-5 h-5" />
                            )}
                          </div>

                          {/* Описание операции */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-slate-800 text-[14px] leading-snug">
                                {item.type || (isDebit ? "Списание" : "Начисление")}
                              </p>
                              <span
                                className={`text-[15px] font-bold whitespace-nowrap shrink-0 ${
                                  isDebit ? "text-slate-800" : "text-emerald-600"
                                }`}
                              >
                                {isDebit ? "−" : "+"}
                                {formatPoints(Math.abs(Number(item.amount) || item.amount))} б.
                              </span>
                            </div>

                            {item.description && (
                              <p className="text-[13px] text-slate-600 mt-0.5 leading-snug">
                                {item.description}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {new Date(item.date).toLocaleDateString("ru-RU", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                                {", "}
                                {new Date(item.date).toLocaleTimeString("ru-RU", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                      Операций по карте пока нет
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
