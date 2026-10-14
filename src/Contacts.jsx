import React, { useEffect, useState } from "react";
import { Phone, MapPin, ArrowLeft } from "lucide-react";
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
        setLocations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки локаций:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto bg-[#f8fafc] min-h-screen pb-28 text-slate-900">
      <button
        onClick={() => navigate("/")}
        className="text-[#5e8f23] hover:text-[#4b731c] text-xs font-semibold flex items-center mb-3 transition-colors"
      >
        <ArrowLeft size={15} className="mr-1" /> Главная
      </button>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Дилерские центры
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Официальные салоны и сервисные центры Прагматика
        </p>
      </div>

      {loading ? (
        <Preloader />
      ) : locations.length === 0 ? (
        <p className="text-center text-gray-500">Нет доступных локаций</p>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc, idx) => {
            const coords = (loc.location || "").split(",").map((s) => Number(s.trim()));
            const lat = coords[0];
            const lon = coords[1];
            const key = loc.id || loc.diler || loc.adress || idx;

            // Мини-карта через iframe Яндекс с маркером
            const mapSrc =
              lat && lon
                ? `https://yandex.ru/map-widget/v1/?um=constructor%3A0&source=constructor&ll=${lon},${lat}&z=16`
                : null;

            return (
              <div key={key} className="bg-white shadow rounded-xl border border-slate-200/80 overflow-hidden">
                <div className="p-4">
                  <h2 className="text-base font-bold text-slate-900 mb-1">{loc.diler}</h2>
                  <p className="text-xs text-slate-600 mb-1.5">{loc.adress}</p>
                  {loc.Time && (
                    <p className="text-xs text-slate-500 mb-1.5">
                      <strong className="text-slate-700">Время работы:</strong> {loc.Time}
                    </p>
                  )}
                  {loc.Phone && (
                    <a
                      href={`tel:${loc.Phone.replace(/[^\d+]/g, "")}`}
                      className="text-xs flex items-center gap-1.5 mb-2 text-slate-700 hover:text-[#5e8f23] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#5e8f23]" /> {loc.Phone}
                    </a>
                  )}
                  {loc.mapUrl && (
                    <a
                      href={loc.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5e8f23] text-xs font-semibold flex items-center gap-1 mb-2 hover:underline"
                    >
                      <MapPin className="w-3.5 h-3.5" /> На карте
                    </a>
                  )}
                  {mapSrc && (
                    <iframe
                      title={`map-${idx}`}
                      src={mapSrc}
                      width="100%"
                      height="150"
                      className="border border-slate-200 rounded-lg mt-2"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        <BottomNav />
    </div>
  );
}
