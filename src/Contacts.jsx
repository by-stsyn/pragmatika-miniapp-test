import React, { useEffect, useState } from "react";
import { Phone, MapPin, ArrowLeft, Clock, Navigation, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";

export default function Contacts() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://sheetdb.io/api/v1/mtp1z8i362ul2"; // google таблица

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setLocations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки локаций:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-32">
      {/* Шапка страницы */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 pt-3 pb-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-semibold transition-all"
          >
            <ArrowLeft size={16} />
            <span>Назад</span>
          </button>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Прагматика
          </span>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* Заголовок страницы */}
        <div className="pt-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8cc63f]/15 text-[#5e8f23] text-xs font-bold mb-2">
            <Building2 size={13} />
            <span>Официальные центры</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Дилерские центры
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Салоны продаж новых автомобилей и сервисные центры группы Прагматика
          </p>
        </div>

        {/* Содержимое */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <Preloader />
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Нет доступных локаций</p>
            <p className="text-xs text-slate-400 mt-1">Информация обновляется, зайдите позже</p>
          </div>
        ) : (
          <div className="space-y-4">
            {locations.map((loc, idx) => {
              const coords = (loc.location || "").split(",").map((s) => Number(s.trim()));
              const lat = coords[0];
              const lon = coords[1];
              const key = loc.id || loc.diler || loc.adress || idx;

              // Яндекс-карта виджет
              const mapSrc =
                lat && lon
                  ? `https://yandex.ru/map-widget/v1/?um=constructor%3A0&source=constructor&ll=${lon},${lat}&z=16`
                  : null;

              const cleanPhone = loc.Phone ? loc.Phone.replace(/[^\d+]/g, "") : null;

              return (
                <div
                  key={key}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <div className="p-5 space-y-3.5">
                    {/* Название дилера */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h2 className="text-base font-bold text-slate-900 leading-snug">
                          {loc.diler}
                        </h2>
                      </div>
                      
                      {/* Адрес */}
                      <div className="flex items-start gap-2 text-slate-600 text-xs mt-1.5 leading-relaxed">
                        <MapPin className="w-4 h-4 text-[#5e8f23] shrink-0 mt-0.5" />
                        <span>{loc.adress}</span>
                      </div>
                    </div>

                    {/* Время работы */}
                    {loc.Time && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          <strong className="font-semibold text-slate-700">Режим работы:</strong> {loc.Time}
                        </span>
                      </div>
                    )}

                    {/* Кнопки действий под палец */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {loc.Phone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          className="min-h-[48px] px-4 rounded-xl bg-[#8cc63f]/15 hover:bg-[#8cc63f]/25 text-[#4e791b] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                          <Phone className="w-4 h-4 text-[#5e8f23]" />
                          <span>Позвонить</span>
                        </a>
                      )}

                      {loc.mapUrl && (
                        <a
                          href={loc.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[48px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                          <Navigation className="w-4 h-4 text-slate-500" />
                          <span>Маршрут</span>
                        </a>
                      )}
                    </div>

                    {/* Мини-карта с закругленными углами */}
                    {mapSrc && (
                      <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100 mt-2">
                        <iframe
                          title={`map-${idx}`}
                          src={mapSrc}
                          width="100%"
                          height="160"
                          className="w-full border-0 block"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
