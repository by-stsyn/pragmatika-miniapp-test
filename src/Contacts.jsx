
import React, { useEffect, useRef, useState } from "react";
import { Phone, MapPin, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";

const API_URL = "https://sheetdb.io/api/v1/mtp1z8i362ul2";

// Безопасно разбираем координаты из таблицы
function getCoordinates(location) {
  if (typeof location !== "string") return null;

  const parts = location.split(",").map((part) => Number(part.trim()));

  if (
    parts.length !== 2 ||
    !Number.isFinite(parts[0]) ||
    !Number.isFinite(parts[1]) ||
    Math.abs(parts[0]) > 90 ||
    Math.abs(parts[1]) > 180
  ) {
    return null;
  }

  return { lat: parts[0], lon: parts[1] };
}

// Карта загружается только рядом с видимой областью экрана
function LazyMap({ location, id }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Если IntersectionObserver недоступен, загружаем карту сразу
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        rootMargin: "300px 0px",
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const coords = getCoordinates(location);

  if (!coords) {
    return (
      <div className="h-[150px] flex items-center justify-center bg-gray-100 rounded border text-sm text-gray-500">
        Координаты не указаны
      </div>
    );
  }

  const mapSrc =
    `https://yandex.ru/map-widget/v1/?ll=${coords.lon},${coords.lat}&z=16`;

  return (
    <div
      ref={containerRef}
      className="w-full h-[150px] border rounded overflow-hidden bg-gray-100"
    >
      {visible && (
        <iframe
          title={`map-${id}`}
          src={mapSrc}
          width="100%"
          height="150"
          className="border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  );
}

export default function Contacts() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLocations() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Некорректный формат ответа API");
        }

        setLocations(data.filter((loc) => loc && typeof loc === "object"));
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Ошибка загрузки локаций:", err);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadLocations();

    return () => controller.abort();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <button
        onClick={() => navigate("/")}
        className="text-blue-600 flex items-center mb-4"
      >
        <ArrowLeft className="mr-2" /> Назад
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Наши дилеры
      </h1>

      {loading ? (
        <Preloader />
      ) : error ? (
        <p className="text-center text-gray-500">
          Не удалось загрузить список дилеров. Попробуйте позже.
        </p>
      ) : locations.length === 0 ? (
        <p className="text-center text-gray-500">
          Нет доступных локаций
        </p>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc, index) => {
            const id = loc.id ?? index;

            return (
              <div
                key={id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-1">
                    {loc.diler || "Дилер"}
                  </h2>

                  {loc.adress && (
                    <p className="text-sm text-gray-700 mb-1">
                      {loc.adress}
                    </p>
                  )}

                  {loc.Time && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Время работы:</strong> {loc.Time}
                    </p>
                  )}

                  {loc.Phone && (
                    <p className="text-sm flex items-center gap-1 mb-2">
                      <Phone className="w-4 h-4" />
                      {loc.Phone}
                    </p>
                  )}

                  {loc.mapUrl && (
                    <a
                      href={loc.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm flex items-center gap-1 mb-2"
                    >
                      <MapPin className="w-4 h-4" />
                      На карте
                    </a>
                  )}

                  <LazyMap location={loc.location} id={id} />
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
