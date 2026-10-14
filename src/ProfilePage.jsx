import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CarFront,
  Wrench,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Phone,
  CheckCircle,
  X,
  User,
  Sparkles,
  Calendar,
} from "lucide-react";
import BottomNav from "/src/components/BottomNav";
import Preloader from "/src/components/Preloader";
import { BRANDS_MODELS } from "/src/data/brands";
import { platform } from "./platform";

const BASE_URL = "https://telegram-miniapp-orpin.vercel.app/api/render";

/* ===== Справочник типов заказ-нарядов ===== */
const REPAIR_TYPE_LABELS = {
  ТО: "Техническое обслуживание",
  МСР: "Ремонтные работы",
  "Эксперт МСР": "Ремонтные работы",
};

export default function ProfilePage() {
  const user = platform.getUser();
  const userId = platform.getId();
  const idParam = platform?.isMax?.() ? "maxId" : "telegramId";

  const [bonus, setBonus] = useState(null);
  const [cars, setCars] = useState([]);
  const [recommendations, setRecommendations] = useState({});
  const [loadingRecs, setLoadingRecs] = useState({});
  const [openedRecsVIN, setOpenedRecsVIN] = useState(null);

  const [savingCar, setSavingCar] = useState(false);
  const [vinError, setVinError] = useState("");

  const [insurancePolicies, setInsurancePolicies] = useState({});
  const [loadingInsurance, setLoadingInsurance] = useState({});
  const [openedInsuranceVIN, setOpenedInsuranceVIN] = useState(null);

  const [expandedRepairVIN, setExpandedRepairVIN] = useState(null);
  const [expandedRepairDetails, setExpandedRepairDetails] = useState({});
  const [repairs, setRepairs] = useState({});
  const [loadingRepairs, setLoadingRepairs] = useState({});
  const [repairDetails, setRepairDetails] = useState({});

  const [loading, setLoading] = useState(true);
  const [showCarForm, setShowCarForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [carForm, setCarForm] = useState({
    brand: "",
    model: "",
    vin: "",
    plate: "",
  });

  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [insuranceForm, setInsuranceForm] = useState({
    name: "",
    phone: "",
    model: "",
    vin: "",
    action: "", // "renew" | "new"
  });
  const [insuranceSending, setInsuranceSending] = useState(false);

  const navigate = useNavigate();

  const validateVIN = (vin) =>
    /^[A-HJ-NPR-Z0-9]{17}$/.test((vin || "").toUpperCase());

  const getRepairTypeLabel = (type) =>
    REPAIR_TYPE_LABELS[type] || type || "Обслуживание";

  /* ===== Загрузка бонусов ===== */
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${BASE_URL}?path=communication/contact/bonus&${idParam}=${userId}`
        );
        if (res.ok) {
          const data = await res.json();
          setBonus(data.card || null);
        }
      } catch (e) {
        console.error("Ошибка загрузки бонусов:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, idParam]);

  /* ===== Загрузка автомобилей ===== */
  useEffect(() => {
    if (!userId) return;

    fetch(`${BASE_URL}?path=api/profile/cars&telegramId=${userId}`)
      .then((res) => res.ok && res.json())
      .then((data) => setCars(data?.cars || []))
      .catch((err) => console.error("Ошибка загрузки автомобилей:", err));
  }, [userId]);

  /* ===== Загрузка Рекомендаций ===== */
  const loadRecommendations = async (vin) => {
    if (!userId) return;

    if (openedRecsVIN === vin) {
      setOpenedRecsVIN(null);
      return;
    }

    if (recommendations[vin]) {
      setOpenedRecsVIN(vin);
      return;
    }

    setLoadingRecs((prev) => ({ ...prev, [vin]: true }));

    try {
      const res = await fetch(
        `${BASE_URL}?path=communication/contact/recommendation_repair&${idParam}=${userId}&vin=${vin}`
      );
      const data = await res.json();
      setRecommendations((prev) => ({
        ...prev,
        [vin]: data?.data?.recommendations || [],
      }));
      setOpenedRecsVIN(vin);
    } catch (e) {
      console.error("Ошибка рекомендаций", e);
    } finally {
      setLoadingRecs((prev) => ({ ...prev, [vin]: false }));
    }
  };

  /* ===== Загрузка Страховок ===== */
  const loadInsurancePolicies = async (vin) => {
    if (!userId) return;

    if (openedInsuranceVIN === vin) {
      setOpenedInsuranceVIN(null);
      return;
    }

    if (insurancePolicies[vin]) {
      setOpenedInsuranceVIN(vin);
      return;
    }

    setLoadingInsurance((prev) => ({ ...prev, [vin]: true }));

    try {
      const res = await fetch(
        `${BASE_URL}?path=communication/contact/insurance_policy&${idParam}=${userId}&vin=${vin}`
      );

      let data = null;
      if (res.ok) {
        data = await res.json();
      }

      setInsurancePolicies((prev) => ({
        ...prev,
        [vin]: data?.data?.insurancePolicies || [],
      }));
    } catch (e) {
      console.error("Ошибка загрузки страховых полисов", e);
      setInsurancePolicies((prev) => ({ ...prev, [vin]: [] }));
    } finally {
      setOpenedInsuranceVIN(vin);
      setLoadingInsurance((prev) => ({ ...prev, [vin]: false }));
    }
  };

  const isRenewAllowed = (dateEnd) => {
    const end = new Date(dateEnd);
    const now = new Date();
    const diff = end - now;
    const days = diff / (1000 * 60 * 60 * 24);
    return days <= 45;
  };

  /* ===== Загрузка истории ТО ===== */
  const loadRepairs = async (vin) => {
    if (!userId) return;
    if (loadingRepairs[vin]) return;

    if (repairs[vin] !== undefined) {
      setExpandedRepairVIN((prev) => (prev === vin ? null : vin));
      return;
    }

    setLoadingRepairs((prev) => ({ ...prev, [vin]: true }));

    try {
      const res = await fetch(
        `${BASE_URL}?path=communication/contact/history_repair&${idParam}=${userId}&vin=${vin}`
      );
      if (res.ok) {
        const data = await res.json();
        setRepairs((prev) => ({ ...prev, [vin]: data.history || [] }));
        setExpandedRepairVIN(vin);
      }
    } finally {
      setLoadingRepairs((prev) => ({ ...prev, [vin]: false }));
    }
  };

  /* ===== Сохранение авто ===== */
  const saveCar = async () => {
    if (!carForm.brand || !carForm.model) {
      alert("Выберите марку и модель");
      return;
    }

    if (!validateVIN(carForm.vin)) {
      setVinError("VIN должен содержать ровно 17 символов");
      return;
    } else {
      setVinError("");
    }

    if (!userId) return alert("Не удалось получить идентификатор пользователя");

    const url =
      editIndex !== null
        ? `${BASE_URL}?path=api/profile/car/update`
        : `${BASE_URL}?path=api/profile/car/add`;

    const body =
      editIndex !== null
        ? { id: cars[editIndex].id, ...carForm }
        : { telegramId: userId, ...carForm };

    setSavingCar(true);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Ошибка сохранения:", {
          status: res.status,
          response: errorText,
        });
        alert(`Ошибка сохранения (${res.status})\n\n${errorText}`);
        return;
      }

      const data = await res.json();

      setCars((prev) =>
        editIndex !== null
          ? prev.map((c, i) => (i === editIndex ? data.car : c))
          : [...prev, data.car]
      );

      setShowCarForm(false);
      setEditIndex(null);
      setCarForm({ brand: "", model: "", vin: "", plate: "" });
    } finally {
      setSavingCar(false);
    }
  };

  const deleteCar = async (i) => {
    const car = cars[i];
    if (!car?.id) return;

    if (!confirm(`Удалить автомобиль ${car.brand} ${car.model} из гаража?`)) {
      return;
    }

    await fetch(`${BASE_URL}?path=api/profile/car/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: car.id }),
    });

    setCars((prev) => prev.filter((_, idx) => idx !== i));
  };

  const hasCustomName = Boolean(user?.firstName || user?.first_name || user?.username);
  const displayName =
    user?.firstName || user?.first_name || user?.username || "Личный кабинет";

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-28 text-slate-900">
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Кнопка Назад */}
        <div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-[13px] font-semibold text-[#5e8f23] hover:text-[#4b731c] transition-colors py-1"
          >
            <ArrowLeft size={16} className="mr-1.5" /> Главная
          </button>
        </div>

        {/* Заголовок */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Цифровой гараж
          </h1>
          <p className="text-[13px] text-slate-500 mt-1 leading-snug">
            Управление автомобилями, история ТО и страхование
          </p>
        </div>

        {/* 1. Карточка профиля и бонусов */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23]">
                    <User size={22} strokeWidth={2} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-slate-900 truncate leading-snug">
                  {displayName}
                </div>
                <div className="text-[12px] text-slate-500 font-medium truncate mt-0.5">
                  {hasCustomName ? "Клиент «Прагматика»" : "Настройки и гараж"}
                </div>
              </div>
            </div>

            {/* Бонусный баланс */}
            <button
              onClick={() => navigate("/BonusPage")}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#8cc63f]/15 hover:bg-[#8cc63f]/25 border border-[#8cc63f]/30 active:scale-95 transition-all text-[#5e8f23] min-h-[46px] whitespace-nowrap"
              aria-label="Бонусный баланс"
            >
              <div className="text-right whitespace-nowrap">
                <span className="text-sm font-black tabular-nums tracking-tight">
                  {bonus?.balance !== undefined
                    ? Number(bonus.balance).toLocaleString("ru-RU")
                    : "0"}
                </span>
                <span className="text-[12px] font-bold ml-1">
                  баллов
                </span>
              </div>
              <ChevronRight size={14} strokeWidth={2.5} className="flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* 2. Раздел: Мои автомобили */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Автомобили в гараже ({cars.length})
            </h2>
            <button
              onClick={() => {
                setEditIndex(null);
                setCarForm({ brand: "", model: "", vin: "", plate: "" });
                setVinError("");
                setShowCarForm(true);
              }}
              className="text-[13px] font-bold text-[#5e8f23] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8cc63f]/10 border border-[#8cc63f]/25 active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Добавить</span>
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Preloader />
            </div>
          ) : cars.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-dashed border-slate-300 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto mb-3 shadow-xs">
                <CarFront size={24} strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Гараж пока пуст
              </h3>
              <p className="text-[13px] text-slate-500 mb-5 max-w-[280px] mx-auto leading-relaxed">
                Добавьте свой автомобиль, чтобы отслеживать историю ТО, рекомендации и страховку.
              </p>
              <button
                onClick={() => {
                  setEditIndex(null);
                  setCarForm({ brand: "", model: "", vin: "", plate: "" });
                  setVinError("");
                  setShowCarForm(true);
                }}
                className="w-full max-w-xs mx-auto py-3 px-5 bg-[#8cc63f] hover:bg-[#7db934] text-white text-[14px] font-bold rounded-xl shadow-sm transition-all min-h-[50px] flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Добавить автомобиль</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cars.map((c, i) => (
                <div
                  key={c.id || i}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4"
                >
                  {/* Шапка карточки машины */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23] flex-shrink-0 mt-0.5">
                        <CarFront size={20} strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-bold text-slate-900 leading-snug truncate">
                          {c.brand} {c.model}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-500 flex-wrap">
                          {c.plate && (
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap">
                              {c.plate}
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            VIN: {c.vin}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditIndex(i);
                          setCarForm(c);
                          setVinError("");
                          setShowCarForm(true);
                        }}
                        className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 transition-colors"
                        title="Редактировать"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => deleteCar(i)}
                        className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200/80 flex items-center justify-center text-red-500 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Кнопки разделов автомобиля */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    {/* Кнопка: История ТО */}
                    <button
                      disabled={loadingRepairs[c.vin]}
                      onClick={() => loadRepairs(c.vin)}
                      className={`py-2.5 px-2 rounded-xl border text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all min-h-[44px] ${
                        expandedRepairVIN === c.vin
                          ? "bg-[#8cc63f] text-white border-[#8cc63f]"
                          : "bg-slate-50/90 border-slate-200/90 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Wrench size={14} />
                      <span className="whitespace-nowrap">{loadingRepairs[c.vin] ? "…" : "История ТО"}</span>
                    </button>

                    {/* Кнопка: Рекомендации 1С */}
                    <button
                      disabled={loadingRecs[c.vin]}
                      onClick={() => loadRecommendations(c.vin)}
                      className={`py-2.5 px-2 rounded-xl border text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all min-h-[44px] ${
                        openedRecsVIN === c.vin
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-purple-50/70 border-purple-200 text-purple-700 hover:bg-purple-100/70"
                      }`}
                    >
                      <Sparkles size={14} />
                      <span className="whitespace-nowrap">{loadingRecs[c.vin] ? "…" : "Советы 1С"}</span>
                    </button>

                    {/* Кнопка: Страховки */}
                    <button
                      disabled={loadingInsurance[c.vin]}
                      onClick={() => loadInsurancePolicies(c.vin)}
                      className={`py-2.5 px-2 rounded-xl border text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all min-h-[44px] ${
                        openedInsuranceVIN === c.vin
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-indigo-50/70 border-indigo-200 text-indigo-700 hover:bg-indigo-100/70"
                      }`}
                    >
                      <ShieldCheck size={14} />
                      <span className="whitespace-nowrap">{loadingInsurance[c.vin] ? "…" : "Полисы"}</span>
                    </button>
                  </div>

                  {/* 2.1 Раскрытый блок: История ТО */}
                  {repairs[c.vin] !== undefined && expandedRepairVIN === c.vin && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-bold text-slate-800">
                        История визитов на сервис:
                      </div>

                      {repairs[c.vin].length > 0 ? (
                        repairs[c.vin]
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((r) => {
                            const isDetailsOpen = expandedRepairDetails[r.guid];
                            const details = repairDetails[r.guid];

                            return (
                              <div
                                key={r.guid}
                                onClick={async () => {
                                  setExpandedRepairDetails((prev) => ({
                                    ...prev,
                                    [r.guid]: !prev[r.guid],
                                  }));

                                  if (!repairDetails[r.guid]) {
                                    try {
                                      const res = await fetch(
                                        `${BASE_URL}?path=communication/contact/event_repair&guid=${r.guid}`
                                      );
                                      const data = await res.json();
                                      setRepairDetails((p) => ({
                                        ...p,
                                        [r.guid]: data.data,
                                      }));
                                    } catch (err) {
                                      console.error("Ошибка деталей заказ-наряда", err);
                                    }
                                  }
                                }}
                                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 transition-colors cursor-pointer text-xs"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span>{new Date(r.date).toLocaleDateString("ru-RU")}</span>
                                  <span className="text-[#5e8f23]">{getRepairTypeLabel(r.type)}</span>
                                </div>
                                <div className="text-slate-500 text-[11px] mt-0.5">
                                  Пробег: {r.mileage ? `${r.mileage.toLocaleString("ru-RU")} км` : "не указан"}
                                </div>

                                {isDetailsOpen && details && (
                                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-2 text-[11px]">
                                    {details.works?.length > 0 && (
                                      <div>
                                        <div className="font-bold text-slate-700">Выполненные работы:</div>
                                        <ul className="list-disc ml-4 text-slate-600 mt-0.5 space-y-0.5">
                                          {details.works.map((w, idx) => (
                                            <li key={idx}>{w.name}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {details.parts?.length > 0 && (
                                      <div>
                                        <div className="font-bold text-slate-700">Использованные запчасти:</div>
                                        <ul className="list-disc ml-4 text-slate-600 mt-0.5 space-y-0.5">
                                          {details.parts.map((p, idx) => (
                                            <li key={idx}>{p.name}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-xs text-slate-500 italic py-1">
                          По вашему автомобилю пока нет записей о выполненных ТО.
                        </p>
                      )}
                    </div>
                  )}

                  {/* 2.2 Раскрытый блок: Рекомендации 1С */}
                  {openedRecsVIN === c.vin && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-bold text-slate-800">
                        Рекомендации мастера с последнего обслуживания:
                      </div>

                      {recommendations[c.vin]?.length > 0 ? (
                        recommendations[c.vin].map((rec, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border text-xs ${
                              rec.included
                                ? "bg-rose-50/70 border-rose-200 text-rose-900"
                                : "bg-amber-50/70 border-amber-200 text-amber-900"
                            }`}
                          >
                            <div className="font-bold mb-1 flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  rec.included ? "bg-rose-500" : "bg-amber-500"
                                }`}
                              />
                              <span>
                                {rec.included
                                  ? "Важная рекомендация"
                                  : "Рекомендуется к выполнению"}
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed">{rec.description}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic py-1">
                          Все узлы автомобиля в порядке, активных рекомендаций нет.
                        </p>
                      )}

                      <button
                        onClick={() => navigate("/ServiceBooking")}
                        className="w-full mt-2 py-2 bg-[#8cc63f] hover:bg-[#7db934] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                      >
                        Записаться на сервис
                      </button>
                    </div>
                  )}

                  {/* 2.3 Раскрытый блок: Полисы страхования */}
                  {openedInsuranceVIN === c.vin && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-bold text-slate-800">
                        Действующие полисы страхования:
                      </div>

                      {insurancePolicies[c.vin]?.length > 0 ? (
                        <>
                          {insurancePolicies[c.vin].map((policy, idx) => (
                            <div
                              key={idx}
                              className="p-3 border border-slate-200 bg-slate-50/50 rounded-lg text-xs"
                            >
                              <div className="font-bold text-slate-900">
                                {policy.view || "Полис страхования"}
                              </div>
                              <div className="text-slate-500 text-[11px] mt-0.5">
                                Период:{" "}
                                {new Date(policy.dateStart).toLocaleDateString("ru-RU")} —{" "}
                                {new Date(policy.dateEnd).toLocaleDateString("ru-RU")}
                              </div>
                            </div>
                          ))}

                          {insurancePolicies[c.vin].some((p) => isRenewAllowed(p.dateEnd)) ? (
                            <button
                              onClick={() => {
                                setInsuranceForm({
                                  name: "",
                                  phone: "",
                                  model: `${c.brand} ${c.model}`,
                                  vin: c.vin,
                                  action: "renew",
                                });
                                setInsuranceModalOpen(true);
                              }}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                            >
                              Продлить полис
                            </button>
                          ) : (
                            <p className="text-[11px] text-slate-500 italic text-center py-1">
                              Продление будет доступно за 45 дней до окончания полиса
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-slate-500 italic py-1">
                            Активные полисы в дилерской системе пока не найдены.
                          </p>
                          <button
                            onClick={() => {
                              setInsuranceForm({
                                name: "",
                                phone: "",
                                model: `${c.brand} ${c.model}`,
                                vin: c.vin,
                                action: "new",
                              });
                              setInsuranceModalOpen(true);
                            }}
                            className="w-full py-2 bg-[#8cc63f] hover:bg-[#7db934] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                          >
                            Оформить полис ОСАГО / КАСКО
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Горячая линия поддержки */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 min-h-[76px]">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Единый контакт-центр
            </div>
            <a
              href="tel:88003332130"
              className="text-lg font-black text-slate-900 hover:text-[#5e8f23] transition-colors mt-0.5 block tracking-tight whitespace-nowrap"
            >
              8 800 333 21 30
            </a>
            <div className="text-[12px] text-slate-500 whitespace-nowrap">
              Звонок по России бесплатный
            </div>
          </div>

          <a
            href="tel:88003332130"
            className="w-12 h-12 rounded-2xl bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23] hover:bg-[#8cc63f] hover:text-white transition-all shadow-xs flex-shrink-0"
            aria-label="Позвонить в контакт-центр"
          >
            <Phone size={19} strokeWidth={2} />
          </a>
        </div>
      </div>

      {/* ====================================================================
          МОДАЛКА: Добавление / Редактирование автомобиля
         ==================================================================== */}
      {showCarForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowCarForm(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              aria-label="Закрыть"
            >
              <X size={17} />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editIndex !== null ? "Редактировать автомобиль" : "Добавить автомобиль в гараж"}
            </h3>
            <p className="text-[12px] text-slate-500 mb-4 leading-normal">
              Укажите данные автомобиля для привязки к дилерской истории ТО.
            </p>

            <div className="space-y-3.5">
              {/* Марка */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Марка *
                </label>
                <select
                  className="w-full px-3.5 py-2.5 text-[14px] rounded-xl border border-slate-200 focus:outline-none focus:border-[#8cc63f] bg-slate-50/50 min-h-[44px]"
                  value={carForm.brand}
                  onChange={(e) =>
                    setCarForm({ ...carForm, brand: e.target.value, model: "" })
                  }
                >
                  <option value="">Выберите марку</option>
                  {Object.keys(BRANDS_MODELS).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Модель */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Модель *
                </label>
                <select
                  className="w-full px-3.5 py-2.5 text-[14px] rounded-xl border border-slate-200 focus:outline-none focus:border-[#8cc63f] bg-slate-50/50 min-h-[44px]"
                  disabled={!carForm.brand}
                  value={carForm.model}
                  onChange={(e) =>
                    setCarForm({ ...carForm, model: e.target.value })
                  }
                >
                  <option value="">Выберите модель</option>
                  {carForm.brand &&
                    BRANDS_MODELS[carForm.brand]?.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                </select>
              </div>

              {/* VIN */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  VIN-номер (17 знаков) *
                </label>
                <input
                  className={`w-full px-3.5 py-2.5 text-[14px] rounded-xl border focus:outline-none bg-slate-50/50 uppercase font-mono min-h-[44px] ${
                    vinError
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-[#8cc63f]"
                  }`}
                  placeholder="XTA21703080000000"
                  maxLength={17}
                  value={carForm.vin}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setCarForm({ ...carForm, vin: value });
                    if (vinError) setVinError("");
                  }}
                />
                {vinError && (
                  <p className="text-[12px] text-red-500 mt-1 font-medium">{vinError}</p>
                )}
              </div>

              {/* Госномер */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Госномер (по желанию)
                </label>
                <input
                  className="w-full px-3.5 py-2.5 text-[14px] rounded-xl border border-slate-200 focus:outline-none focus:border-[#8cc63f] bg-slate-50/50 uppercase min-h-[44px]"
                  placeholder="А 123 АА 198"
                  value={carForm.plate}
                  onChange={(e) =>
                    setCarForm({ ...carForm, plate: e.target.value.toUpperCase() })
                  }
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={saveCar}
                  disabled={savingCar || !validateVIN(carForm.vin)}
                  className="w-full py-3 rounded-xl bg-[#8cc63f] hover:bg-[#7db934] disabled:opacity-50 text-white text-[14px] font-bold transition-all shadow-sm active:scale-[0.98] min-h-[50px]"
                >
                  {savingCar ? "Сохранение в гараже…" : "Сохранить автомобиль"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          МОДАЛКА: Заявка на страховой полис
         ==================================================================== */}
      {insuranceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setInsuranceSending(true);

              try {
                const res = await fetch("/api/send-booking", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: insuranceForm.name,
                    phone: insuranceForm.phone,
                    model: insuranceForm.model,
                    vin: insuranceForm.vin,
                    requestType:
                      insuranceForm.action === "renew"
                        ? "Продление страхового полиса"
                        : "Оформление страхового полиса",
                  }),
                });

                if (res.ok) {
                  alert("Заявка успешно отправлена! Эксперт свяжется с вами.");
                  setInsuranceModalOpen(false);
                  setInsuranceForm({
                    name: "",
                    phone: "",
                    model: "",
                    vin: "",
                    action: "",
                  });
                } else {
                  alert("Ошибка при отправке заявки");
                }
              } catch (err) {
                alert("Ошибка сети");
              } finally {
                setInsuranceSending(false);
              }
            }}
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 relative"
          >
            <button
              type="button"
              onClick={() => setInsuranceModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              aria-label="Закрыть"
            >
              <X size={17} />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {insuranceForm.action === "renew"
                ? "Продление страхового полиса"
                : "Оформление страхового полиса"}
            </h3>
            <p className="text-[12px] text-slate-500 mb-4 leading-normal">
              Подберем выгодные тарифы ОСАГО и КАСКО в ведущих страховых компаниях.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Ваше имя *
                </label>
                <input
                  required
                  placeholder="Имя"
                  className="w-full px-3.5 py-2.5 text-[14px] rounded-xl border border-slate-200 focus:outline-none focus:border-[#8cc63f] bg-slate-50/50 min-h-[44px]"
                  value={insuranceForm.name}
                  onChange={(e) =>
                    setInsuranceForm({ ...insuranceForm, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Телефон *
                </label>
                <input
                  required
                  placeholder="+7 (___) ___-__-__"
                  className="w-full px-3.5 py-2.5 text-[14px] rounded-xl border border-slate-200 focus:outline-none focus:border-[#8cc63f] bg-slate-50/50 min-h-[44px]"
                  value={insuranceForm.phone}
                  onChange={(e) =>
                    setInsuranceForm({ ...insuranceForm, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Автомобиль
                </label>
                <input
                  disabled
                  className="w-full px-3.5 py-2.5 text-[14px] rounded-xl border border-slate-200 bg-slate-100 text-slate-600 min-h-[44px]"
                  value={insuranceForm.model}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={insuranceSending}
                  className="w-full py-3 rounded-xl bg-[#8cc63f] hover:bg-[#7db934] disabled:opacity-50 text-white text-[14px] font-bold transition-all shadow-sm active:scale-[0.98] min-h-[50px]"
                >
                  {insuranceSending ? "Отправка заявки…" : "Отправить заявку"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
