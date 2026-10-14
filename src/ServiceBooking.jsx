import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CarFront,
  RefreshCcw,
  Check,
  Sparkles,
} from "lucide-react";
import BottomNav from "/src/components/BottomNav";
import { platform } from "./platform";

/* ---------- Выделенный IP ---------- */
const BASE_URL = "https://telegram-miniapp-orpin.vercel.app/api/render";

/* ---------- Б24 ---------- */
const BITRIX_WEBHOOK =
  "https://b24.pragmaticar.ru/rest/3560/53dry4y4xa5a4vjq/";

const BITRIX_DEAL_ADD = BITRIX_WEBHOOK + "crm.deal.add.json";
const BITRIX_CONTACT_ADD = BITRIX_WEBHOOK + "crm.contact.add.json";
const BITRIX_CONTACT_LIST = BITRIX_WEBHOOK + "crm.contact.list.json";

/* ---------- справочники брендов и моделей ---------- */
const BRANDS_MODELS = {
  LADA: [
    "Granta", "Vesta", "Niva Legend", "Niva Travel", "XRAY",
    "Largus", "Aura", "Iskra", "Priora", "Kalina", "Samara", "2101", "2105", "2106", "2107",
    "110", "111", "112", "Oka", "4x4", "Revolution", "C-Cross", "XCODE"
  ],
  Kia: [
    "Rio", "Rio X", "Ceed", "Cerato", "K3", "K5", "K8", "Stinger",
    "Soul", "Seltos", "Sonet", "Sportage", "Sorento", "Mohave", "EV6", "EV9",
    "Carens", "Carnival", "Picanto", "Telluride", "Stonic", "Optima", "Quoris", "Cadenza"
  ],
  Geely: [
    "Coolray", "Atlas", "Atlas Pro", "Monjaro", "Tugella",
    "Emgrand", "Okavango", "Geometry C", "Geometry E",
    "FY11", "GC6", "Vision", "Binrui", "Xingyue", "Xingyue L",
    "Panda Mini", "Icon"
  ],
  Changan: [
    "CS35 Plus", "CS55 Plus", "CS75 Plus", "CS85", "CS95",
    "UNI-K", "UNI-T", "UNI-V", "Alsvin", "Eado Plus", "Raeton Plus",
    "Hunter", "Lamore", "Oshan X7"
  ],
  Belgee: [
    "X50", "X70", "X70 FL", "X70 Pro", "X90", "Cool", "Atlas", "Atlas Pro"
  ],
  Evolute: [
    "i-Joy", "i-Space", "i-Sky", "i-Jet", "i-Pro", "i-Van"
  ],
  Knewstar: ["001"],
  Хcite: ["X-Cross 7", "X-Cross 8"],
  Kaiyi: ["E5", "X3"],
  Audi: [
    "A1", "A3", "A4", "A5", "A6", "A7", "A8",
    "Q2", "Q3", "Q4 e-tron", "Q5", "Q6 e-tron", "Q7", "Q8",
    "TT", "R8", "e-tron", "e-tron GT",
    "RS3", "RS4", "RS5", "RS6", "RS7", "RS Q3", "RS Q8",
    "S3", "S4", "S5", "S6", "S7", "S8", "SQ5", "SQ7", "SQ8"
  ],
  BMW: [
    "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "8 Series",
    "X1", "X2", "X3", "X4", "X5", "X6", "X7",
    "i3", "i4", "i5", "i7", "iX", "iX3", "Z4", "M2", "M3", "M4", "M5", "M8"
  ],
  BAIC: [
    "U5 Plus", "X35", "BJ40", "BJ60", "X7", "EU5", "U5", "Beijing X7", "Beijing U5"
  ],
  BYD: ["Tang", "Han", "Yuan Plus", "Dolphin", "Seal", "Song", "Atto 3"],
  Cadillac: [
    "CT4", "CT5", "CTS", "ATS", "XT4", "XT5", "XT6", "Escalade", "Lyriq"
  ],
  Chevrolet: [
    "Niva", "Lanos", "Aveo", "Cruze", "Cobalt", "Lacetti", "Captiva", "Tracker", "Tahoe", "Traverse", "Malibu", "Orlando", "Spark", "Bolt", "Trailblazer", "Equinox", "Camaro", "Silverado", "Express"
  ],
  Citroen: [
    "C1", "C3", "C4", "C5", "C5 Aircross", "C4 Cactus", "Berlingo", "Jumper", "Jumpy", "Spacetourer"
  ],
  Chery: [
    "Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 4 Pro", "Tiggo 7", "Tiggo 7 Pro", "Tiggo 8", "Tiggo 8 Pro", "Tiggo 8 Pro Max",
    "Arrizo 5", "Arrizo 6", "Arrizo 8", "Omoda C5", "Omoda S5"
  ],
  Chrysler: [
    "300C", "Sebring", "Pacifica", "Voyager", "Grand Voyager", "PT Cruiser", "Aspen", "Crossfire"
  ],
  Dongfeng: [
    "AX7", "580", "Forthing T5", "Forthing U-Tour", "Fengon 500", "Fengon 580", "Fengon ix5", "Rich 6", "Rich 7", "Aeolus Yixuan"
  ],
  Dacia: ["Logan", "Sandero", "Duster", "Lodgy", "Dokker"],
  Daewoo: ["Matiz", "Nexia", "Lanos", "Gentra", "Leganza", "Espero", "Rezzo"],
  Datsun: ["on-DO", "mi-DO"],
  Dodge: [
    "Caliber", "Journey", "Challenger", "Charger", "Durango", "Ram", "Nitro", "Avenger", "Caravan"
  ],
  JAC: ["J7", "JS4", "JS6", "T6", "T8", "Sunray", "iEV7S"],
  Exeed: ["TXL", "VX", "LX", "RX", "Sterra ET", "Sterra ES"],
  Fiat: [
    "Panda", "500", "Tipo", "Linea", "Doblo", "Fiorino", "Punto", "Bravo", "Croma", "Scudo", "Freemont", "Albea", "Ducato"
  ],
  GAC: [
    "GS3", "GS5", "GS8", "M8", "EMKOO", "AION Y", "AION S", "Trumpchi M6"
  ],
  Genesis: [
    "G70", "G80", "G90", "GV70", "GV80", "Electrified G80", "Electrified GV70"
  ],
  Jaguar: [
    "XE", "XF", "XJ", "F-Pace", "E-Pace", "I-Pace", "F-Type", "S-Type", "X-Type"
  ],
  Jeep: [
    "Renegade", "Compass", "Cherokee", "Grand Cherokee", "Commander", "Wrangler", "Gladiator", "Patriot", "Liberty"
  ],
  Lifan: [
    "Smily", "Solano", "X50", "X60", "X70", "Murman", "Cebrium", "Celliya", "Breez"
  ],
  Hyundai: [
    "Solaris", "Elantra", "Sonata", "Creta", "Tucson", "Santa Fe", "Palisade", "Staria", "H-1"
  ],
  Nissan: [
    "Almera", "Qashqai", "X-Trail", "Terrano", "Murano", "Pathfinder", "Patrol", "Juke", "Tiida", "Teana"
  ],
  Renault: [
    "Logan", "Sandero", "Duster", "Kaptur", "Arkana", "Megane", "Fluence", "Koleos"
  ],
  Skoda: [
    "Rapid", "Octavia", "Superb", "Kodiaq", "Karoq", "Yeti", "Fabia"
  ],
  Toyota: [
    "Camry", "Corolla", "RAV4", "Land Cruiser Prado", "Land Cruiser 300", "Highlander", "Hilux", "Fortuner"
  ],
  Volkswagen: [
    "Polo", "Jetta", "Passat", "Tiguan", "Touareg", "Taos", "Golf", "Caravelle", "Multivan"
  ]
};

/* ---------- Дилеры ---------- */
const DEALERS = [
  { id: 2, name: "KIA Василеостровский" },
  { id: 21, name: "KAIYI Василеостровский" },
  { id: 23, name: "Geely Василеостровский" },
  { id: 36, name: "CHANGAN Купчино" },
  { id: 24, name: "KIA Купчино" },
  { id: 1, name: "Evolute Прагматика Василеостровский" },
  { id: 5, name: "LADA Парнас" },
  { id: 4, name: "LADA Василеостровский" },
  { id: 3, name: "LADA Купчино" },
  { id: 7, name: "LADA Новгород" },
  { id: 9, name: "LADA Псков" },
  { id: 8, name: "LADA Великие Луки" },
  { id: 10, name: "LADA Мурманск" },
  { id: 11, name: "LADA Петрозаводск" },
];

const RESPONSIBLES = {
  2: 111061,
  21: 111061,
  23: 111061,
  36: 111064,
  24: 111062,
  1: 111062,
  3: 111065,
  4: 111066,
  5: 111064,
  7: 111063,
  9: 111070,
  8: 111067,
  10: 111068,
  11: 111069,
};

const SERVICES = [
  { id: "to", name: "Техническое обслуживание" },
  { id: "diag", name: "Диагностика электрики" },
  { id: "diag", name: "Прочая диагностика" },
  { id: "diag", name: "Ремонт электрики" },
  { id: "msr", name: "Ремонт двигателя" },
  { id: "msr", name: "Ремонт тормозной системы" },
  { id: "msr", name: "Ремонт трансмиссии" },
  { id: "msr", name: "Ремонт ходовой части" },
  { id: "shm", name: "Шиномонтаж" },
  { id: "msr", name: "Мойка" },
  { id: "msr", name: "Установка ГБО" },
  { id: "guarant", name: "Гарантийный ремонт" },
];

/* ---------- Сопутствующие работы (Корзина работ по концепции CLM) ---------- */
const RECOMMENDED_ADDONS = [
  {
    id: "seasonal_check",
    name: "Сезонная комплексная диагностика",
    price: 990,
    desc: "Ходовая, тормоза, уровни жидкостей и АКБ",
  },
  {
    id: "alignment",
    name: "Проверка сход-развала",
    price: 2500,
    desc: "3D-проверка углов установки колес",
  },
  {
    id: "brake_fluid",
    name: "Замена тормозной жидкости",
    price: 3900,
    desc: "С прокачкой системы и гарантией качества",
  },
  {
    id: "cabin_filter",
    name: "Антибактериальная очистка кондиционера",
    price: 1800,
    desc: "Очистка испарителя и свежий чистый воздух",
  },
];

const getLeadDirection = (brand) => {
  const serviceBrands = ["Kia", "Evolute", "LADA", "Geely", "Changan", "Kaiyi"];
  return serviceBrands.includes(brand) ? 42209 : 42210;
};

const getInterest = (serviceName) => {
  if (serviceName === "Техническое обслуживание") return "ТО";
  if (serviceName === "Мойка") return "Мойка, детейлинг";
  return "Текущий ремонт";
};

const isoNow = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

/* ---------- API ---------- */
const fetchDates = async (dealerId, serviceId) => {
  const today = isoNow();
  const end = new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0];

  const res = await fetch(
    `${BASE_URL}?path=communication/recording/day&filter[dateAt][gte]=${today}&filter[dateAt][lte]=${end}&filter[dealerId][eq]=${dealerId}&filter[typeRepair][eq]=${serviceId}`
  );

  const j = await res.json();
  return j.RecordingDateList || [];
};

const fetchTimes = async (dealerId, serviceId, dateStr) => {
  const res = await fetch(
    `${BASE_URL}?path=communication/recording&filter[dateAt][eq]=${dateStr}&filter[dealerId][eq]=${dealerId}&filter[typeRepair][eq]=${serviceId}`
  );

  const j = await res.json();
  const list = j.RecordingList || [];

  return list.map((x) => ({
    start: x.Recording?.dateStartAt,
    end: x.Recording?.dateEndAt,
    time: x.Recording?.dateStartAt?.split(" ")[1].slice(0, 5),
  }));
};

const fetchClientInfo = async () => {
  const id = platform.getId();
  if (!id) return null;

  const param = platform.isMax?.() ? "maxId" : "telegramId";
  const res = await fetch(
    `${BASE_URL}?path=communication/contact/client&${param}=${id}`
  );

  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
};

/* ---------- Битрикс24 хелперы ---------- */
async function findContact(phone) {
  const cleanPhone = phone.replace(/\D/g, "");
  const response = await fetch(BITRIX_CONTACT_LIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filter: { "%PHONE": cleanPhone.slice(-10) },
      select: ["ID"],
    }),
  });
  const data = await response.json();
  return data.result?.[0]?.ID || null;
}

async function createContact(name, phone) {
  const cleanPhone = phone.replace(/\D/g, "");
  const response = await fetch(BITRIX_CONTACT_ADD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        NAME: name,
        PHONE: [{ VALUE: cleanPhone, VALUE_TYPE: "WORK" }],
      },
    }),
  });
  const data = await response.json();
  return data.result;
}

async function createDeal(data) {
  const response = await fetch(BITRIX_DEAL_ADD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: data }),
  });
  return await response.json();
}

/* ---------- календарь ---------- */
const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];
  const startDay = (firstDay.getDay() + 6) % 7;

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};

/* ==========================================================================
   Основной компонент ServiceBookingForm
   ========================================================================== */
export default function ServiceBookingForm() {
  const navigate = useNavigate();
  const userId = platform.getId();

  const [userCars, setUserCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [manualCar, setManualCar] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);
  const [showCarList, setShowCarList] = useState(false);
  const [clientLoading, setClientLoading] = useState(true);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    name: "",
    phone: "",
    dealerId: "",
    serviceId: "",
    serviceName: "",
    date: "",
    time: "",
    dateEnd: "",
    comment: "",
  });

  /* Выбранные сопутствующие работы */
  const [selectedAddons, setSelectedAddons] = useState([]);

  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState({ dates: false, times: false });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val) {
      setForm((prev) => ({ ...prev, phone: "" }));
      return;
    }
    if (val.startsWith("7") || val.startsWith("8")) {
      val = val.slice(1);
    }
    val = val.slice(0, 10);

    let formatted = "+7";
    if (val.length > 0) {
      formatted += `(${val.slice(0, 3)}`;
    }
    if (val.length >= 3) {
      formatted += `)${val.slice(3, 6)}`;
    }
    if (val.length >= 6) {
      formatted += `-${val.slice(6, 8)}`;
    }
    if (val.length >= 8) {
      formatted += `-${val.slice(8, 10)}`;
    }
    setForm((prev) => ({ ...prev, phone: formatted }));
  };

  /* Загрузка автомобилей пользователя */
  useEffect(() => {
    if (!userId) {
      setCarsLoading(false);
      return;
    }

    fetch(`${BASE_URL}?path=api/profile/cars&telegramId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const cars = data?.cars || [];
        setUserCars(cars);

        if (cars.length > 0) {
          const firstCar = cars[0];
          setSelectedCarId(firstCar.id);
          setForm((prev) => ({
            ...prev,
            brand: firstCar.brand,
            model: firstCar.model,
          }));
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки автомобилей", err);
      })
      .finally(() => {
        setCarsLoading(false);
      });
  }, [userId]);

  /* Загрузка данных клиента */
  useEffect(() => {
    const formatPhone = (phone) => {
      if (!phone) return "";
      const digits = phone.replace(/\D/g, "");
      if (digits.length !== 10) return phone;
      return `+7(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
    };

    fetchClientInfo()
      .then((client) => {
        setForm((prev) => {
          const updated = { ...prev };
          if (client?.client?.phone) {
            updated.phone = formatPhone(client.client.phone);
          }
          if (client?.client?.title) {
            updated.name = client.client.title;
          }
          return updated;
        });
      })
      .catch(console.error)
      .finally(() => {
        setClientLoading(false);
      });
  }, []);

  /* Загрузка доступных дат */
  useEffect(() => {
    if (!form.dealerId || !form.serviceId) return;

    setLoading((l) => ({ ...l, dates: true }));
    setDates([]);
    setTimes([]);
    setForm((f) => ({ ...f, date: "", time: "" }));

    fetchDates(form.dealerId, form.serviceId)
      .then(setDates)
      .finally(() => setLoading((l) => ({ ...l, dates: false })));
  }, [form.dealerId, form.serviceId]);

  /* Загрузка доступного времени */
  useEffect(() => {
    if (!form.dealerId || !form.serviceId || !form.date) return;

    setLoading((l) => ({ ...l, times: true }));
    setTimes([]);
    setForm((f) => ({ ...f, time: "", dateEnd: "" }));

    fetchTimes(form.dealerId, form.serviceId, form.date)
      .then(setTimes)
      .finally(() => setLoading((l) => ({ ...l, times: false })));
  }, [form.date, form.dealerId, form.serviceId]);

  const selectUserCar = (id) => {
    setSelectedCarId(id);
    setManualCar(false);
    const car = userCars.find((c) => String(c.id) === String(id));
    if (!car) return;

    setForm((prev) => ({
      ...prev,
      brand: car.brand,
      model: car.model,
    }));
  };

  /* Переключение дополнительной услуги */
  const toggleAddon = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const item = RECOMMENDED_ADDONS.find((a) => a.id === id);
    return sum + (item?.price || 0);
  }, 0);

  /* Отправка записи */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;

    if (!form.date || !form.time) {
      submitLock.current = false;
      alert("Пожалуйста, выберите дату и время визита");
      return;
    }

    const startISO = `${form.date}T${form.time}:00`;
    const endISO = form.dateEnd.replace(" ", "T");

    // Формируем текст выбранных доп. работ
    const addonsText = selectedAddons
      .map((id) => {
        const item = RECOMMENDED_ADDONS.find((a) => a.id === id);
        return item ? `${item.name} (${item.price} ₽)` : "";
      })
      .filter(Boolean)
      .join(", ");

    const finalComment = addonsText
      ? `${form.comment ? `${form.comment} | ` : ""}Дополнительные работы: ${addonsText}`
      : form.comment;

    const payload = {
      dealerId: Number(form.dealerId),
      dateStartAt: startISO,
      dateEndAt: endISO,
      typeRepair: form.serviceId,
      name: form.name,
      telephone: form.phone,
      brandName: form.brand,
      modelName: form.model,
      comment: finalComment,
      test: false,
    };

    setSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}?path=communication/recording/create`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Отправка письма
        await fetch("/api/send-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            brand: form.brand,
            model: form.model,
            dealer: DEALERS.find((d) => d.id === Number(form.dealerId))?.name || "",
            service: SERVICES.find((s) => s.id === form.serviceId)?.name || "",
            date: form.date,
            time: form.time,
            comment: finalComment,
          }),
        });

        const serviceName = form.serviceName;
        let contactId = await findContact(form.phone);
        if (!contactId) {
          contactId = await createContact(form.name, form.phone);
        }

        const dealFields = {
          TITLE: "Запись с MiniApp",
          CATEGORY_ID: 10,
          STAGE_ID: "C10:NEW",
          SOURCE_ID: "360",
          CONTACT_ID: contactId,
          ASSIGNED_BY_ID: RESPONSIBLES[form.dealerId],
          UF_CRM_1586859728: form.brand,
          UF_CRM_1586859783: form.model,
          UF_CRM_1650278487: serviceName,
          UF_CRM_1650278488: finalComment,
          UF_CRM_1680763694: `${form.date} ${form.time}:00`,
          UF_CRM_6358BF0244306: 42713,
          UF_CRM_1627284772: Number(form.dealerId),
          UF_CRM_616599413CA88: getInterest(serviceName),
          UF_CRM_63230547E784B: getLeadDirection(form.brand),
        };

        await createDeal(dealFields);

        setSummary({
          ...form,
          service: SERVICES.find((s) => s.id === form.serviceId)?.name || "",
          dealer: DEALERS.find((d) => d.id === Number(form.dealerId))?.name || "",
          addonsList: selectedAddons
            .map((id) => RECOMMENDED_ADDONS.find((a) => a.id === id))
            .filter(Boolean),
          addonsTotal,
        });

        setSubmitted(true);
      } else {
        alert("Не удалось забронировать время. Пожалуйста, выберите другой интервал.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Ошибка при создании записи. Попробуйте позже.");
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  const availableSet = new Set(dates);
  const days = getDaysInMonth(currentMonth);

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#8cc63f] focus:bg-white transition-all";

  const FieldLoader = () => (
    <div className="flex items-center gap-2 text-slate-400">
      <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-[#8cc63f] rounded-full animate-spin" />
      <span className="text-xs">Загрузка данных…</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-28 text-slate-900">
      <div className="max-w-md mx-auto p-4">
        {/* Кнопка Назад */}
        <div className="mb-3">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-xs font-semibold text-[#5e8f23] hover:text-[#4b731c] transition-colors"
          >
            <ArrowLeft size={15} className="mr-1" /> Главная
          </button>
        </div>

        {/* Заголовок */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Запись на сервис
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Официальное техническое обслуживание Прагматика
          </p>
        </div>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3.5"
          >
            {/* 1. Автомобиль клиента */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Автомобиль
              </label>

              {userCars.length > 0 && !manualCar ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23] flex-shrink-0">
                        <CarFront size={17} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {form.brand} {form.model}
                        </div>
                        {userCars.find((c) => String(c.id) === String(selectedCarId))?.plate && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {userCars.find((c) => String(c.id) === String(selectedCarId)).plate}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setManualCar(true);
                        setShowCarList(false);
                        setSelectedCarId("");
                        setForm((prev) => ({ ...prev, brand: "", model: "" }));
                      }}
                      className="text-[11px] font-semibold text-[#5e8f23] hover:underline flex-shrink-0 ml-2"
                    >
                      Изменить
                    </button>
                  </div>

                  {userCars.length > 1 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                      <select
                        value={selectedCarId}
                        onChange={(e) => selectUserCar(e.target.value)}
                        className={inputClass}
                      >
                        {userCars.map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.brand} {car.model} {car.plate ? `(${car.plate})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={form.brand}
                      onChange={(e) =>
                        setForm({ ...form, brand: e.target.value, model: "" })
                      }
                      className={inputClass}
                      required
                    >
                      <option value="">Марка *</option>
                      {Object.keys(BRANDS_MODELS).map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>

                    <select
                      value={form.model}
                      onChange={update("model")}
                      className={inputClass}
                      required
                      disabled={!form.brand}
                    >
                      <option value="">Модель *</option>
                      {form.brand &&
                        BRANDS_MODELS[form.brand]?.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                    </select>
                  </div>

                  {userCars.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setManualCar(false);
                        const first = userCars[0];
                        setSelectedCarId(first.id);
                        setForm((prev) => ({
                          ...prev,
                          brand: first.brand,
                          model: first.model,
                        }));
                      }}
                      className="text-[11px] text-[#5e8f23] font-semibold hover:underline"
                    >
                      ← Выбрать авто из гаража ({userCars[0].brand} {userCars[0].model})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. Контактные данные */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Имя *
                </label>
                {clientLoading ? (
                  <div className={`${inputClass} flex items-center`}>
                    <FieldLoader />
                  </div>
                ) : (
                  <input
                    placeholder="Ваше имя"
                    value={form.name}
                    onChange={update("name")}
                    className={inputClass}
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Телефон *
                </label>
                {clientLoading ? (
                  <div className={`${inputClass} flex items-center`}>
                    <FieldLoader />
                  </div>
                ) : (
                  <input
                    value={form.phone}
                    onChange={handlePhoneChange}
                    className={inputClass}
                    placeholder="+7(___)___-__-__"
                    type="tel"
                    required
                  />
                )}
              </div>
            </div>

            {/* 3. Дилерский центр */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Дилерский центр *
              </label>
              <select
                value={form.dealerId}
                onChange={update("dealerId")}
                className={inputClass}
                required
              >
                <option value="">Выберите дилерский центр</option>
                {DEALERS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Основная услуга */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Вид обслуживания *
              </label>
              <select
                value={form.serviceName}
                onChange={(e) => {
                  const service = SERVICES.find((s) => s.name === e.target.value);
                  setForm({
                    ...form,
                    serviceId: service ? service.id : "",
                    serviceName: service ? service.name : "",
                  });
                }}
                className={inputClass}
                required
              >
                <option value="">Выберите тип работ</option>
                {SERVICES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ============================================================
                5. РЕКОМЕНДУЕМ ДОБАВИТЬ К ЗАКАЗУ (Корзина доп. работ)
                Реализация концепции руководства (Экран 2)
               ============================================================ */}
            {form.serviceName && (
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 pt-2.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#5e8f23]" />
                    <span className="text-xs font-bold text-slate-800">
                      Рекомендуем добавить
                    </span>
                  </div>
                  {selectedAddons.length > 0 && (
                    <span className="text-[11px] font-extrabold text-[#5e8f23] tabular-nums">
                      +{addonsTotal.toLocaleString("ru-RU")} ₽
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {RECOMMENDED_ADDONS.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);

                    return (
                      <label
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`flex items-start justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-[#8cc63f]/10 border-[#8cc63f]"
                            : "bg-white border-slate-200/80 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0 pr-2">
                          <div
                            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 border transition-colors ${
                              isChecked
                                ? "bg-[#8cc63f] border-[#8cc63f] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 leading-snug">
                              {addon.name}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                              {addon.desc}
                            </div>
                          </div>
                        </div>

                        <span className="font-bold text-slate-800 tabular-nums flex-shrink-0 text-[11px] pt-0.5">
                          +{addon.price.toLocaleString("ru-RU")} ₽
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Календарь выбора даты */}
            {form.dealerId && form.serviceId && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Выберите дату визита
                </label>

                {loading.dates ? (
                  <div className="py-4 text-center">
                    <FieldLoader />
                  </div>
                ) : (
                  <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-3">
                    <div className="flex justify-between items-center mb-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentMonth(
                            new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
                          )
                        }
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-bold text-slate-800 capitalize">
                        {currentMonth.toLocaleDateString("ru-RU", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentMonth(
                            new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
                          )
                        }
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((dayName) => (
                        <div
                          key={dayName}
                          className="text-[10px] font-bold text-slate-400 py-1"
                        >
                          {dayName}
                        </div>
                      ))}

                      {days.map((d, i) => {
                        if (!d) return <div key={i} />;

                        const iso = [
                          d.getFullYear(),
                          String(d.getMonth() + 1).padStart(2, "0"),
                          String(d.getDate()).padStart(2, "0"),
                        ].join("-");
                        const disabled = !availableSet.has(iso);
                        const active = form.date === iso;

                        return (
                          <button
                            type="button"
                            key={iso}
                            disabled={disabled}
                            onClick={() => setForm({ ...form, date: iso })}
                            className={`h-8 rounded-lg text-xs font-medium transition-all ${
                              disabled
                                ? "text-slate-300 opacity-40 cursor-not-allowed"
                                : active
                                ? "bg-[#8cc63f] text-white font-bold shadow-sm"
                                : "bg-white text-slate-700 border border-slate-200/80 hover:border-[#8cc63f]"
                            }`}
                          >
                            {d.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. Выбор времени */}
            {form.date && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Доступное время
                </label>

                {loading.times && (
                  <div className="py-3 text-center">
                    <FieldLoader />
                  </div>
                )}

                {!loading.times && times.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {times.map((t) => {
                      const active = form.time === t.time;

                      return (
                        <button
                          key={t.start}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              time: t.time,
                              dateEnd: t.end,
                            })
                          }
                          className={`py-2 px-1 text-xs rounded-lg font-medium border transition-all ${
                            active
                              ? "bg-[#8cc63f] text-white border-[#8cc63f] font-bold shadow-sm"
                              : "bg-white border-slate-200 text-slate-700 hover:border-[#8cc63f]"
                          }`}
                        >
                          {t.time}
                        </button>
                      );
                    })}
                  </div>
                ) : !loading.times && (
                  <p className="text-xs text-slate-400">
                    На выбранную дату нет свободных слотов. Пожалуйста, выберите другой день.
                  </p>
                )}
              </div>
            )}

            {/* 8. Комментарий */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Комментарий (по желанию)
              </label>
              <textarea
                value={form.comment}
                onChange={update("comment")}
                placeholder="Опишите симптомы или пожелания к ремонту"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Кнопка отправки */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#8cc63f] hover:bg-[#7db934] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm active:scale-[0.99]"
              >
                {submitting ? "Создаем запись на сервис…" : "Записаться на сервис"}
              </button>
            </div>
          </form>
        ) : (
          /* Экран успешной записи */
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-[#8cc63f]/20 text-[#5e8f23] flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} />
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Запись подтверждена!
            </h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Ждём вас в сервисном центре «{summary?.dealer}».
            </p>

            <div className="bg-slate-50 rounded-xl p-3 text-left space-y-2 mb-5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Автомобиль:</span>
                <span className="font-semibold text-slate-800">
                  {summary?.brand} {summary?.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Услуга:</span>
                <span className="font-semibold text-slate-800">
                  {summary?.service}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Дата и время:</span>
                <span className="font-semibold text-[#5e8f23]">
                  {summary?.date} в {summary?.time}
                </span>
              </div>

              {summary?.addonsList && summary.addonsList.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-600 mb-1">
                    Дополнительно заказано:
                  </div>
                  {summary.addonsList.map((a) => (
                    <div key={a.id} className="flex justify-between text-[11px] text-slate-500">
                      <span>• {a.name}</span>
                      <span className="font-semibold">{a.price} ₽</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full py-2.5 rounded-xl bg-[#8cc63f] hover:bg-[#7db934] text-white text-xs font-bold transition-all shadow-sm"
            >
              Вернуться на главную
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
