import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CarFront,
  Check,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Wrench,
  ChevronDown,
  AlertCircle,
  Search,
  X,
  Camera,
  Trash2,
  HelpCircle,
  Layers,
  FileText,
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

/* ---------- Приоритетные бренды-партнеры Прагматика ---------- */
const PARTNER_BRANDS = [
  "LADA",
  "Geely",
  "Belgee",
  "Kia",
  "Changan",
  "UNI",
  "Evolute",
  "XCITE",
  "Knewstar",
];

/* Популярные другие марки на рынке РФ */
const POPULAR_OTHER_BRANDS = [
  "Chery",
  "Haval",
  "Tank",
  "Exeed",
  "Omoda",
  "Jaecoo",
  "Jetour",
  "Kaiyi",
  "Hyundai",
  "Toyota",
  "Volkswagen",
  "Renault",
  "Nissan",
  "Skoda",
  "Audi",
  "BMW",
];

/* ---------- Справочники брендов и моделей ---------- */
const BRANDS_MODELS = {
  /* Официальные бренды Прагматика */
  LADA: [
    "Granta",
    "Vesta",
    "Niva Legend",
    "Niva Travel",
    "Largus",
    "XRAY",
    "Aura",
    "Iskra",
    "Priora",
    "Kalina",
    "4x4",
    "2107",
    "2114",
    "2110",
  ],
  Geely: [
    "Monjaro",
    "Coolray",
    "Atlas",
    "Atlas Pro",
    "Tugella",
    "Emgrand",
    "Okavango",
    "Preface",
    "Cityray",
    "Geometry C",
    "Icon",
  ],
  Belgee: ["X50", "X70"],
  Kia: [
    "Rio",
    "Rio X",
    "Ceed",
    "Cerato",
    "K5",
    "Sportage",
    "Seltos",
    "Sorento",
    "Soul",
    "Carnival",
    "Mohave",
    "Optima",
    "Picanto",
    "Stinger",
  ],
  Changan: [
    "CS35 Plus",
    "CS55 Plus",
    "CS75 Plus",
    "CS85 Coupe",
    "CS95",
    "Alsvin",
    "Eado Plus",
    "Lamore",
    "Hunter Plus",
  ],
  UNI: ["UNI-V", "UNI-K", "UNI-T", "UNI-S", "UNI-Z"],
  Evolute: ["i-Joy", "i-Space", "i-Sky", "i-Jet", "i-Pro", "i-Van"],
  XCITE: ["X-Cross 7", "X-Cross 8"],
  Knewstar: ["001"],

  /* Другие популярные марки */
  Chery: [
    "Tiggo 4 Pro",
    "Tiggo 7 Pro Max",
    "Tiggo 8 Pro Max",
    "Arrizo 8",
    "Tiggo 4",
    "Tiggo 7",
    "Tiggo 8",
  ],
  Haval: ["Jolion", "F7", "F7x", "Dargo", "H9", "H3", "M6"],
  Tank: ["300", "500", "700"],
  Exeed: ["LX", "TXL", "RX", "VX"],
  Omoda: ["C5", "S5", "S5 GT"],
  Jaecoo: ["J7", "J8"],
  Jetour: ["Dashing", "X70 Plus", "X90 Plus", "T2"],
  Kaiyi: ["E5", "X3", "X3 Pro", "X7 Kunlun"],
  BAIC: ["U5 Plus", "X35", "X55", "X7", "BJ40"],
  Hyundai: [
    "Solaris",
    "Creta",
    "Tucson",
    "Santa Fe",
    "Elantra",
    "Sonata",
    "Palisade",
  ],
  Toyota: [
    "Camry",
    "RAV4",
    "Corolla",
    "Land Cruiser Prado",
    "Land Cruiser 300",
    "Highlander",
    "Hilux",
  ],
  Volkswagen: ["Polo", "Tiguan", "Passat", "Touareg", "Taos", "Golf", "Jetta"],
  Renault: ["Logan", "Sandero", "Duster", "Kaptur", "Arkana", "Megane"],
  Nissan: ["Qashqai", "X-Trail", "Almera", "Terrano", "Murano", "Juke"],
  Skoda: ["Rapid", "Octavia", "Kodiaq", "Karoq", "Superb", "Yeti"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7", "Q8"],
  BMW: ["3 Series", "5 Series", "X3", "X5", "X6", "X7", "1 Series"],
  "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS"],
  Mazda: ["3", "6", "CX-5", "CX-9", "CX-30"],
  Mitsubishi: ["Outlander", "ASX", "Pajero Sport", "L200", "Lancer"],
  Subaru: ["Forester", "Outback", "XV", "Impreza"],
  Honda: ["CR-V", "Civic", "Accord", "HR-V"],
  Lexus: ["RX", "NX", "LX", "ES", "GX"],
  JAC: ["JS3", "JS4", "JS6", "T6", "T8 Pro", "J7"],
  Dongfeng: ["Shine Max", "580", "Captain-T", "DF6"],
  GAC: ["GS3", "GS8", "M8"],
  Voyah: ["Free", "Dream", "Passion"],
  Zeekr: ["001", "007", "009", "X"],
  LiXiang: ["L6", "L7", "L8", "L9"],
  Chevrolet: ["Cruze", "Lacetti", "Aveo", "Tahoe", "Niva", "Cobalt"],
  Ford: ["Focus", "Mondeo", "Kuga", "Explorer", "Transit"],
  Datsun: ["on-DO", "mi-DO"],
};

/* Все марки в алфавитном порядке */
const ALL_BRANDS_LIST = Array.from(
  new Set([...PARTNER_BRANDS, ...Object.keys(BRANDS_MODELS)])
);

/* ---------- Дилеры Прагматика ---------- */
const DEALERS = [
  { id: 2, name: "KIA Василеостровский", city: "Санкт-Петербург" },
  { id: 21, name: "KAIYI Василеостровский", city: "Санкт-Петербург" },
  { id: 23, name: "Geely Василеостровский", city: "Санкт-Петербург" },
  { id: 36, name: "CHANGAN Купчино", city: "Санкт-Петербург" },
  { id: 24, name: "KIA Купчино", city: "Санкт-Петербург" },
  { id: 1, name: "Evolute Прагматика Василеостровский", city: "Санкт-Петербург" },
  { id: 5, name: "LADA Парнас", city: "Санкт-Петербург" },
  { id: 4, name: "LADA Василеостровский", city: "Санкт-Петербург" },
  { id: 3, name: "LADA Купчино", city: "Санкт-Петербург" },
  { id: 7, name: "LADA Новгород", city: "Великий Новгород" },
  { id: 9, name: "LADA Псков", city: "Псков" },
  { id: 8, name: "LADA Великие Луки", city: "Великие Луки" },
  { id: 10, name: "LADA Мурманск", city: "Мурманск" },
  { id: 11, name: "LADA Петрозаводск", city: "Петрозаводск" },
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

/* ---------- Виды услуг (с опцией "Другая услуга") ---------- */
const SERVICES = [
  {
    id: "to",
    name: "Техническое обслуживание",
    desc: "Регламентное ТО по стандартам завода-изготовителя",
    badge: "Регулярно",
  },
  {
    id: "diag",
    name: "Компьютерная диагностика",
    desc: "Проверка систем, сканирование ошибок и датчиков",
    badge: "Диагностика",
  },
  {
    id: "msr",
    name: "Ремонт тормозной системы",
    desc: "Замена колодок, дисков, ревизия суппортов и жидкости",
    badge: "Безопасность",
  },
  {
    id: "msr",
    name: "Ремонт ходовой части",
    desc: "Подвеска, амортизаторы, рычаги и сайлентблоки",
    badge: "Ходовая",
  },
  {
    id: "shm",
    name: "Шиномонтаж и балансировка",
    desc: "Сезонная смена шин, правка дисков, точная балансировка",
    badge: "Сезон",
  },
  {
    id: "msr",
    name: "Ремонт двигателя и трансмиссии",
    desc: "Диагностика и ремонт узлов силового агрегата и КПП",
    badge: "Агрегаты",
  },
  {
    id: "diag",
    name: "Ремонт автоэлектрики",
    desc: "Устранение неисправностей проводки, датчиков и оптики",
    badge: "Электрика",
  },
  {
    id: "guarant",
    name: "Гарантийный ремонт",
    desc: "Устранение дефектов по заводской гарантии производителя",
    badge: "Гарантия",
  },
  {
    id: "msr",
    name: "Мойка и детейлинг",
    desc: "Комплексный уход за кузовом и салоном",
    badge: "Уход",
  },
  {
    id: "diag",
    name: "Другая услуга",
    desc: "Опишите ваш вопрос или поломку, можно прикрепить фото",
    badge: "Индивидуально",
    isOther: true,
  },
];

/* ---------- Сопутствующие работы (Концепция заботы об авто) ---------- */
const RECOMMENDED_ADDONS = [
  {
    id: "seasonal_check",
    name: "Сезонная комплексная диагностика",
    price: 990,
    desc: "Ходовая, тормоза, уровни жидкостей и тест АКБ",
  },
  {
    id: "alignment",
    name: "Проверка сход-развала 3D",
    price: 2500,
    desc: "Точная лазерная проверка углов установки колес",
  },
  {
    id: "brake_fluid",
    name: "Замена тормозной жидкости",
    price: 3900,
    desc: "С аппаратной прокачкой системы под давлением",
  },
  {
    id: "cabin_filter",
    name: "Антибактериальная обработка климата",
    price: 1800,
    desc: "Очистка испарителя от бактерий и свежий воздух",
  },
];

const getLeadDirection = (brand) => {
  const serviceBrands = ["Kia", "Evolute", "LADA", "Geely", "Changan", "Kaiyi", "Belgee", "UNI", "XCITE", "Knewstar"];
  return serviceBrands.includes(brand) ? 42209 : 42210;
};

const getInterest = (serviceName) => {
  if (serviceName.includes("Техническое обслуживание")) return "ТО";
  if (serviceName.includes("Мойка")) return "Мойка, детейлинг";
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

/* ---------- Календарь ---------- */
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

/* Тактильный отклик Telegram WebApp */
const triggerHaptic = (type = "light") => {
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (type === "selection") {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    }
  } catch (e) {
    // без ошибок в браузере
  }
};

/* ==========================================================================
   Основной компонент ServiceBookingForm
   ========================================================================== */
export default function ServiceBookingForm() {
  const navigate = useNavigate();
  const userId = platform.getId();

  /* Шаги визарда: 1 - Авто и дилер, 2 - Услуги, 3 - Дата и время */
  const [currentStep, setCurrentStep] = useState(1);

  const [userCars, setUserCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [manualCar, setManualCar] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);
  const [clientLoading, setClientLoading] = useState(true);

  /* Форма записи */
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

  /* Состояние выбора бренда через Bottom Sheet */
  const [isBrandSheetOpen, setIsBrandSheetOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandCategory, setBrandCategory] = useState("all"); // 'all' | 'partners' | 'popular'
  const [isCustomBrandMode, setIsCustomBrandMode] = useState(false);
  const [customBrandInput, setCustomBrandInput] = useState("");

  /* Состояние выбора модели */
  const [isCustomModelMode, setIsCustomModelMode] = useState(false);
  const [customModelInput, setCustomModelInput] = useState("");

  /* Опция "Другая услуга": описание проблемы и фото */
  const [customServiceDescription, setCustomServiceDescription] = useState("");
  const [attachedPhotos, setAttachedPhotos] = useState([]); // массив base64 строк / превью
  const fileInputRef = useRef(null);

  /* Выбранные сопутствующие работы */
  const [selectedAddons, setSelectedAddons] = useState([]);

  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState({ dates: false, times: false });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState("");
  const submitLock = useRef(false);

  const update = (k) => (e) => {
    setStepError("");
    setForm({ ...form, [k]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    setStepError("");
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
    triggerHaptic("selection");
    setSelectedCarId(id);
    setManualCar(false);
    setIsCustomBrandMode(false);
    setIsCustomModelMode(false);
    const car = userCars.find((c) => String(c.id) === String(id));
    if (!car) return;

    setForm((prev) => ({
      ...prev,
      brand: car.brand,
      model: car.model,
    }));
  };

  /* Выбор бренда из Bottom Sheet */
  const handleSelectBrand = (brandName) => {
    triggerHaptic("selection");
    setForm((prev) => ({
      ...prev,
      brand: brandName,
      model: "",
    }));
    setIsCustomBrandMode(false);
    setIsCustomModelMode(false);
    setCustomBrandInput("");
    setCustomModelInput("");
    setIsBrandSheetOpen(false);
    setBrandSearch("");
  };

  /* Подтверждение кастомной марки */
  const handleConfirmCustomBrand = () => {
    if (!customBrandInput.trim()) return;
    triggerHaptic("selection");
    setForm((prev) => ({
      ...prev,
      brand: customBrandInput.trim(),
      model: customModelInput.trim() || "",
    }));
    setIsCustomBrandMode(true);
    setIsBrandSheetOpen(false);
  };

  /* Обработка фото для "Другая услуга" */
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedPhotos((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random().toString(36).substr(2, 4),
            dataUrl: event.target.result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    triggerHaptic("medium");
    e.target.value = "";
  };

  const removePhoto = (id) => {
    triggerHaptic("light");
    setAttachedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  /* Переключение дополнительной услуги */
  const toggleAddon = (id) => {
    triggerHaptic("selection");
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const item = RECOMMENDED_ADDONS.find((a) => a.id === id);
    return sum + (item?.price || 0);
  }, 0);

  /* Валидация перехода между шагами */
  const validateStep1 = () => {
    const brand = isCustomBrandMode ? customBrandInput.trim() : form.brand;
    const model = isCustomModelMode ? customModelInput.trim() : form.model;

    if (!brand) {
      setStepError("Пожалуйста, укажите марку вашего автомобиля");
      return false;
    }
    if (!model) {
      setStepError("Пожалуйста, укажите модель автомобиля");
      return false;
    }
    if (!form.dealerId) {
      setStepError("Пожалуйста, выберите сервисный центр Прагматика");
      return false;
    }
    if (!form.name.trim()) {
      setStepError("Пожалуйста, укажите ваше имя");
      return false;
    }
    const cleanDigits = form.phone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setStepError("Пожалуйста, введите корректный номер телефона");
      return false;
    }
    setStepError("");
    return true;
  };

  const validateStep2 = () => {
    if (!form.serviceId || !form.serviceName) {
      setStepError("Пожалуйста, выберите необходимый вид обслуживания");
      return false;
    }
    const selectedServiceObj = SERVICES.find((s) => s.name === form.serviceName);
    if (selectedServiceObj?.isOther && !customServiceDescription.trim()) {
      setStepError("Пожалуйста, кратко опишите проблему или необходимые работы");
      return false;
    }
    setStepError("");
    return true;
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        triggerHaptic("medium");
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        triggerHaptic("medium");
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const goToPrevStep = () => {
    triggerHaptic("light");
    setStepError("");
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* Отправка записи */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;

    if (!form.date || !form.time) {
      submitLock.current = false;
      setStepError("Пожалуйста, выберите удобную дату и время визита");
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

    const finalBrand = isCustomBrandMode ? customBrandInput.trim() : form.brand;
    const finalModel = isCustomModelMode ? customModelInput.trim() : form.model;

    const parts = [];
    if (customServiceDescription.trim()) {
      parts.push(`Проблема: ${customServiceDescription.trim()}`);
    }
    if (attachedPhotos.length > 0) {
      parts.push(`[Прикреплено фото: ${attachedPhotos.length} шт.]`);
    }
    if (form.comment) {
      parts.push(`Комментарий: ${form.comment}`);
    }
    if (addonsText) {
      parts.push(`Доп. работы: ${addonsText}`);
    }
    const finalComment = parts.join(" | ");

    const payload = {
      dealerId: Number(form.dealerId),
      dateStartAt: startISO,
      dateEndAt: endISO,
      typeRepair: form.serviceId,
      name: form.name,
      telephone: form.phone,
      brandName: finalBrand,
      modelName: finalModel,
      comment: finalComment,
      test: false,
    };

    setSubmitting(true);
    triggerHaptic("heavy");

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
            brand: finalBrand,
            model: finalModel,
            dealer: DEALERS.find((d) => d.id === Number(form.dealerId))?.name || "",
            service: form.serviceName,
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
          UF_CRM_1586859728: finalBrand,
          UF_CRM_1586859783: finalModel,
          UF_CRM_1650278487: serviceName,
          UF_CRM_1650278488: finalComment,
          UF_CRM_1680763694: `${form.date} ${form.time}:00`,
          UF_CRM_6358BF0244306: 42713,
          UF_CRM_1627284772: Number(form.dealerId),
          UF_CRM_616599413CA88: getInterest(serviceName),
          UF_CRM_63230547E784B: getLeadDirection(finalBrand),
        };

        await createDeal(dealFields);

        setSummary({
          ...form,
          brand: finalBrand,
          model: finalModel,
          service: form.serviceName,
          customDescription: customServiceDescription,
          photosCount: attachedPhotos.length,
          dealer: DEALERS.find((d) => d.id === Number(form.dealerId))?.name || "",
          dealerCity: DEALERS.find((d) => d.id === Number(form.dealerId))?.city || "",
          addonsList: selectedAddons
            .map((id) => RECOMMENDED_ADDONS.find((a) => a.id === id))
            .filter(Boolean),
          addonsTotal,
        });

        setSubmitted(true);
      } else {
        alert("Не удалось забронировать выбранное время. Пожалуйста, выберите другой интервал или станцию.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Ошибка при создании записи. Попробуйте снова чуть позже.");
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  const availableSet = new Set(dates);
  const days = getDaysInMonth(currentMonth);

  /* Фильтрация марок для Bottom Sheet */
  const filteredBrands = ALL_BRANDS_LIST.filter((brand) => {
    const matchesSearch = brand.toLowerCase().includes(brandSearch.toLowerCase().trim());
    if (!matchesSearch) return false;
    if (brandCategory === "partners") return PARTNER_BRANDS.includes(brand);
    if (brandCategory === "popular") return POPULAR_OTHER_BRANDS.includes(brand) || PARTNER_BRANDS.includes(brand);
    return true;
  });

  /* Общие стили для полей ввода (крупные, с мобильными отступами) */
  const inputContainerClass =
    "w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-slate-800 outline-none focus:border-[#8cc63f] focus:bg-white focus:ring-4 focus:ring-[#8cc63f]/10 transition-all";

  const FieldLoader = () => (
    <div className="flex items-center gap-2.5 text-slate-400 py-1">
      <div className="w-4 h-4 border-2 border-slate-300 border-t-[#8cc63f] rounded-full animate-spin" />
      <span className="text-sm font-medium">Загрузка данных…</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 text-slate-900 font-sans">
      <div className="max-w-lg mx-auto px-4 pt-3">
        {/* Кнопка Назад */}
        <div className="mb-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-sm font-bold text-[#5e8f23] hover:text-[#4b731c] transition-colors py-1.5 px-1 -ml-1 active:opacity-70"
          >
            <ArrowLeft size={18} className="mr-1.5" /> Главное меню
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8cc63f] animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Онлайн запись
            </span>
          </div>
        </div>

        {/* Заголовок страницы с бейджем */}
        <div className="mb-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Запись на сервис
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Официальные сервисные центры дилерской сети «Прагматика»
          </p>
        </div>

        {!submitted ? (
          <div>
            {/* ============================================================
                ИНДИКАТОР ШАГОВ (STEPPER) — КРУПНЫЙ, МОБИЛЬНЫЙ
               ============================================================ */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="grid grid-cols-3 gap-2 text-center relative">
                {/* Шаг 1 */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setCurrentStep(1);
                  }}
                  className="flex flex-col items-center group transition-all"
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                      currentStep === 1
                        ? "bg-[#8cc63f] text-white shadow-md ring-4 ring-[#8cc63f]/25"
                        : currentStep > 1
                        ? "bg-[#5e8f23] text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {currentStep > 1 ? <Check size={18} strokeWidth={3} /> : "1"}
                  </div>
                  <span
                    className={`text-xs mt-2 transition-colors ${
                      currentStep === 1
                        ? "text-slate-900 font-extrabold"
                        : "text-slate-500 font-semibold"
                    }`}
                  >
                    Авто и салон
                  </span>
                </button>

                {/* Шаг 2 */}
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) {
                      triggerHaptic("selection");
                      setCurrentStep(2);
                    }
                  }}
                  className="flex flex-col items-center group transition-all"
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                      currentStep === 2
                        ? "bg-[#8cc63f] text-white shadow-md ring-4 ring-[#8cc63f]/25"
                        : currentStep > 2
                        ? "bg-[#5e8f23] text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {currentStep > 2 ? <Check size={18} strokeWidth={3} /> : "2"}
                  </div>
                  <span
                    className={`text-xs mt-2 transition-colors ${
                      currentStep === 2
                        ? "text-slate-900 font-extrabold"
                        : "text-slate-500 font-semibold"
                    }`}
                  >
                    Услуги и ТО
                  </span>
                </button>

                {/* Шаг 3 */}
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1() && validateStep2()) {
                      triggerHaptic("selection");
                      setCurrentStep(3);
                    }
                  }}
                  className="flex flex-col items-center group transition-all"
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                      currentStep === 3
                        ? "bg-[#8cc63f] text-white shadow-md ring-4 ring-[#8cc63f]/25"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={`text-xs mt-2 transition-colors ${
                      currentStep === 3
                        ? "text-slate-900 font-extrabold"
                        : "text-slate-500 font-semibold"
                    }`}
                  >
                    Дата и время
                  </span>
                </button>
              </div>

              {/* Прогресс-бар шагов */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3.5 overflow-hidden">
                <div
                  className="bg-[#8cc63f] h-full transition-all duration-300 rounded-full"
                  style={{
                    width:
                      currentStep === 1
                        ? "33.3%"
                        : currentStep === 2
                        ? "66.6%"
                        : "100%",
                  }}
                />
              </div>
            </div>

            {/* Сообщение об ошибке валидации шага */}
            {stepError && (
              <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center gap-3 animate-shake">
                <AlertCircle size={18} className="flex-shrink-0 text-amber-600" />
                <span className="font-semibold">{stepError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* ============================================================
                  ШАГ 1: ВЫБОР АВТОМОБИЛЯ (BOTTOM SHEET), ДИЛЕР И КОНТАКТЫ
                 ============================================================ */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Карточка выбора автомобиля */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#8cc63f]/15 text-[#5e8f23] flex items-center justify-center">
                          <CarFront size={20} />
                        </div>
                        <div>
                          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Автомобиль для записи *
                          </h2>
                          <p className="text-[11px] text-slate-400">
                            Гараж или свободный выбор марки
                          </p>
                        </div>
                      </div>

                      {userCars.length > 0 && !manualCar && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("selection");
                            setManualCar(true);
                            setSelectedCarId("");
                            setForm((prev) => ({ ...prev, brand: "", model: "" }));
                          }}
                          className="text-xs font-bold text-[#5e8f23] hover:underline py-1 px-2 rounded-lg bg-[#8cc63f]/10"
                        >
                          Другой авто
                        </button>
                      )}
                    </div>

                    {carsLoading ? (
                      <div className="py-4">
                        <FieldLoader />
                      </div>
                    ) : userCars.length > 0 && !manualCar ? (
                      <div>
                        {/* Карточка текущего авто из гаража */}
                        <div className="p-4 rounded-2xl border-2 border-[#8cc63f]/40 bg-[#8cc63f]/5 relative overflow-hidden">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 pr-2">
                              <span className="text-[11px] font-black text-[#5e8f23] uppercase tracking-wider">
                                Из вашего гаража
                              </span>
                              <div className="text-lg font-black text-slate-900 truncate mt-0.5">
                                {form.brand} {form.model}
                              </div>
                              {userCars.find((c) => String(c.id) === String(selectedCarId))?.plate && (
                                <div className="inline-flex items-center mt-2 px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-mono text-xs font-extrabold text-slate-800 tracking-wider shadow-2xs">
                                  {userCars.find((c) => String(c.id) === String(selectedCarId)).plate}
                                </div>
                              )}
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#5e8f23] shadow-xs flex-shrink-0">
                              <Check size={20} strokeWidth={3} />
                            </div>
                          </div>

                          {/* Если автомобилей несколько */}
                          {userCars.length > 1 && (
                            <div className="mt-3.5 pt-3 border-t border-[#8cc63f]/20">
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Выбрать другой авто из гаража:
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {userCars.map((c) => {
                                  const isActive = String(c.id) === String(selectedCarId);
                                  return (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => selectUserCar(c.id)}
                                      className={`p-2.5 rounded-xl text-left text-xs transition-all border ${
                                        isActive
                                          ? "bg-white border-[#8cc63f] font-bold text-slate-900 shadow-2xs"
                                          : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                                      }`}
                                    >
                                      <div className="truncate font-bold text-slate-900">
                                        {c.brand} {c.model}
                                      </div>
                                      {c.plate && (
                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                          {c.plate}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {/* Кнопка открытия Bottom Sheet для выбора марки */}
                        <div>
                          <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                            Марка автомобиля *
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("selection");
                              setIsBrandSheetOpen(true);
                            }}
                            className="w-full bg-slate-50 hover:bg-white active:bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-left flex items-center justify-between transition-all focus:border-[#8cc63f] focus:ring-4 focus:ring-[#8cc63f]/10"
                          >
                            <div className="flex items-center gap-2.5">
                              <CarFront size={18} className="text-[#5e8f23]" />
                              <span
                                className={`text-sm sm:text-base ${
                                  form.brand
                                    ? "font-extrabold text-slate-900"
                                    : "font-medium text-slate-400"
                                }`}
                              >
                                {form.brand || "Нажмите, чтобы выбрать марку"}
                              </span>
                            </div>
                            <ChevronDown size={18} className="text-slate-400" />
                          </button>
                        </div>

                        {/* Выбор модели: если выбрана марка */}
                        {form.brand && (
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                                Модель *
                              </label>
                              {!isCustomModelMode && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic("selection");
                                    setIsCustomModelMode(true);
                                    setForm((prev) => ({ ...prev, model: "" }));
                                  }}
                                  className="text-xs font-semibold text-[#5e8f23] hover:underline"
                                >
                                  Вписать вручную
                                </button>
                              )}
                            </div>

                            {!isCustomModelMode &&
                            BRANDS_MODELS[form.brand] &&
                            BRANDS_MODELS[form.brand].length > 0 ? (
                              <div className="space-y-2">
                                <select
                                  value={form.model}
                                  onChange={(e) => {
                                    triggerHaptic("selection");
                                    if (e.target.value === "__OTHER_MODEL__") {
                                      setIsCustomModelMode(true);
                                      setForm((prev) => ({ ...prev, model: "" }));
                                    } else {
                                      setForm({ ...form, model: e.target.value });
                                    }
                                  }}
                                  className={inputContainerClass}
                                  required
                                >
                                  <option value="">Выберите модель из списка</option>
                                  {BRANDS_MODELS[form.brand].map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                  <option value="__OTHER_MODEL__">
                                    + Другая модель (вписать вручную)
                                  </option>
                                </select>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  placeholder="Например: Vesta SW Cross, Rio X, Monjaro..."
                                  value={isCustomModelMode ? customModelInput : form.model}
                                  onChange={(e) => {
                                    setStepError("");
                                    setCustomModelInput(e.target.value);
                                    setForm((prev) => ({ ...prev, model: e.target.value }));
                                  }}
                                  className={inputContainerClass}
                                  required
                                />
                                {isCustomModelMode && BRANDS_MODELS[form.brand] && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      triggerHaptic("selection");
                                      setIsCustomModelMode(false);
                                      setCustomModelInput("");
                                    }}
                                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                                  >
                                    ← Вернуться к списку моделей {form.brand}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {userCars.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("selection");
                              setManualCar(false);
                              const first = userCars[0];
                              setSelectedCarId(first.id);
                              setForm((prev) => ({
                                ...prev,
                                brand: first.brand,
                                model: first.model,
                              }));
                            }}
                            className="text-xs text-[#5e8f23] font-bold hover:underline flex items-center gap-1.5 pt-1"
                          >
                            ← Вернуть авто из гаража ({userCars[0].brand} {userCars[0].model})
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Карточка выбора дилерского центра Прагматика */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#8cc63f]/15 text-[#5e8f23] flex items-center justify-center">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Сервисный центр Прагматика *
                        </h2>
                        <p className="text-[11px] text-slate-400">
                          Выберите удобную станцию для визита
                        </p>
                      </div>
                    </div>

                    <select
                      value={form.dealerId}
                      onChange={update("dealerId")}
                      className={inputContainerClass}
                      required
                    >
                      <option value="">Выберите сервисный центр</option>
                      {DEALERS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.city} — {d.name}
                        </option>
                      ))}
                    </select>

                    {form.dealerId && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm flex items-center gap-2.5 text-slate-700">
                        <MapPin size={16} className="text-[#5e8f23] flex-shrink-0" />
                        <span className="font-semibold">
                          {DEALERS.find((d) => d.id === Number(form.dealerId))?.city} • Официальная станция «{DEALERS.find((d) => d.id === Number(form.dealerId))?.name}»
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Карточка контактных данных клиента */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#8cc63f]/15 text-[#5e8f23] flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <div>
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Контакты владельца *
                        </h2>
                        <p className="text-[11px] text-slate-400">
                          Для связи мастера и подтверждения
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                          Ваше имя *
                        </label>
                        {clientLoading ? (
                          <div className={inputContainerClass}>
                            <FieldLoader />
                          </div>
                        ) : (
                          <input
                            placeholder="Имя и фамилия"
                            value={form.name}
                            onChange={update("name")}
                            className={inputContainerClass}
                            required
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                          Номер телефона *
                        </label>
                        {clientLoading ? (
                          <div className={inputContainerClass}>
                            <FieldLoader />
                          </div>
                        ) : (
                          <input
                            value={form.phone}
                            onChange={handlePhoneChange}
                            className={inputContainerClass}
                            placeholder="+7(___)___-__-__"
                            type="tel"
                            required
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Кнопка перехода к следующему шагу */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="w-full h-14 rounded-2xl bg-[#8cc63f] hover:bg-[#7db934] active:scale-[0.99] text-white text-sm sm:text-base font-extrabold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Выбрать услуги сервиса</span>
                      <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================
                  ШАГ 2: УСЛУГИ, СВОЯ ПРОБЛЕМА (ДРУГАЯ УСЛУГА С ФОТО) И ДОПЫ
                 ============================================================ */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {/* Сводка выбранного авто и дилера */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 flex items-center justify-between text-xs sm:text-sm shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <CarFront size={18} className="text-[#5e8f23] flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-900 truncate block">
                          {isCustomBrandMode ? customBrandInput : form.brand}{" "}
                          {isCustomModelMode ? customModelInput : form.model}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {DEALERS.find((d) => d.id === Number(form.dealerId))?.name}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-[#5e8f23] font-bold hover:underline flex-shrink-0"
                    >
                      Изменить
                    </button>
                  </div>

                  {/* Основная услуга */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#8cc63f]/15 text-[#5e8f23] flex items-center justify-center">
                          <Wrench size={20} />
                        </div>
                        <div>
                          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Вид обслуживания *
                          </h2>
                          <p className="text-[11px] text-slate-400">
                            Выберите из каталога или опишите свою проблему
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Выпадающий список для быстрого переключения */}
                    <div>
                      <select
                        value={form.serviceName}
                        onChange={(e) => {
                          triggerHaptic("selection");
                          const service = SERVICES.find((s) => s.name === e.target.value);
                          setForm({
                            ...form,
                            serviceId: service ? service.id : "",
                            serviceName: service ? service.name : "",
                          });
                        }}
                        className={inputContainerClass}
                        required
                      >
                        <option value="">Выберите услугу из списка</option>
                        {SERVICES.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name} {s.isOther ? "★ (Свой запрос)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Сетка основных услуг для удобного мобильного тапа */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {SERVICES.map((service) => {
                        const isSelected = form.serviceName === service.name;
                        return (
                          <div
                            key={service.name}
                            onClick={() => {
                              triggerHaptic("selection");
                              setForm({
                                ...form,
                                serviceId: service.id,
                                serviceName: service.name,
                              });
                            }}
                            className={`p-3.5 rounded-2xl border text-xs sm:text-sm cursor-pointer transition-all flex items-start justify-between ${
                              isSelected
                                ? "bg-[#8cc63f]/10 border-[#8cc63f] shadow-2xs ring-2 ring-[#8cc63f]/20"
                                : "bg-slate-50/70 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-extrabold text-slate-900 leading-snug">
                                {service.name}
                              </div>
                              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {service.desc}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex-shrink-0 ${
                                isSelected
                                  ? "bg-[#8cc63f] text-white"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {service.badge}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Опция "Другая услуга": поле описания проблемы и фото */}
                  {form.serviceName === "Другая услуга" && (
                    <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-3xl border-2 border-[#8cc63f]/50 shadow-sm space-y-3.5 animate-fadeIn">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#8cc63f] text-white flex items-center justify-center">
                          <HelpCircle size={20} />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Опишите неисправность или вопрос *
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Мастер предварительно изучит вашу проблему до заезда
                          </p>
                        </div>
                      </div>

                      {/* Текстовое описание */}
                      <div>
                        <textarea
                          rows={3}
                          value={customServiceDescription}
                          onChange={(e) => {
                            setStepError("");
                            setCustomServiceDescription(e.target.value);
                          }}
                          placeholder="Например: гул в подвеске при повороте руля вправо, вибрация на скорости 90 км/ч, скрип в районе колодок..."
                          className="w-full bg-white border border-slate-300 rounded-2xl p-3.5 text-sm text-slate-800 outline-none focus:border-[#8cc63f] focus:ring-4 focus:ring-[#8cc63f]/10 resize-none transition-all"
                        />
                      </div>

                      {/* Прикрепление фотографий */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Camera size={15} className="text-[#5e8f23]" />
                            Прикрепить фото (по желанию)
                          </label>
                          <span className="text-[11px] text-slate-400">
                            {attachedPhotos.length}/5 фото
                          </span>
                        </div>

                        {/* Кнопка добавления фото */}
                        <div className="flex flex-wrap gap-2.5">
                          {attachedPhotos.map((photo) => (
                            <div
                              key={photo.id}
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 shadow-2xs group"
                            >
                              <img
                                src={photo.dataUrl}
                                alt="Прикрепленное фото"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(photo.id)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}

                          {attachedPhotos.length < 5 && (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-[#8cc63f]/60 hover:border-[#8cc63f] bg-white flex flex-col items-center justify-center text-slate-500 hover:text-[#5e8f23] transition-colors"
                            >
                              <Camera size={20} className="text-[#5e8f23] mb-0.5" />
                              <span className="text-[10px] font-bold">Фото</span>
                            </button>
                          )}

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            multiple
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Рекомендуемые сопутствующие работы */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#8cc63f]/15 text-[#5e8f23] flex items-center justify-center">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Рекомендуем к визиту
                          </h2>
                          <p className="text-[11px] text-slate-500">
                            Комплексная защита и забота об авто
                          </p>
                        </div>
                      </div>

                      {selectedAddons.length > 0 && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">
                            Добавлено
                          </span>
                          <span className="text-sm font-black text-[#5e8f23] tabular-nums">
                            +{addonsTotal.toLocaleString("ru-RU")} ₽
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {RECOMMENDED_ADDONS.map((addon) => {
                        const isChecked = selectedAddons.includes(addon.id);

                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id)}
                            className={`flex items-start justify-between p-3.5 rounded-2xl border text-xs sm:text-sm cursor-pointer transition-all ${
                              isChecked
                                ? "bg-[#8cc63f]/10 border-[#8cc63f] shadow-2xs"
                                : "bg-slate-50/60 border-slate-200/80 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0 pr-2">
                              <div
                                className={`w-5 h-5 rounded-lg mt-0.5 flex items-center justify-center flex-shrink-0 border transition-colors ${
                                  isChecked
                                    ? "bg-[#8cc63f] border-[#8cc63f] text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isChecked && <Check size={13} strokeWidth={3} />}
                              </div>
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-800 leading-snug">
                                  {addon.name}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                  {addon.desc}
                                </div>
                              </div>
                            </div>

                            <span className="font-black text-slate-900 tabular-nums flex-shrink-0 text-xs sm:text-sm pt-0.5">
                              +{addon.price.toLocaleString("ru-RU")} ₽
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Кнопки навигации */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={goToPrevStep}
                      className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-extrabold transition-all flex items-center justify-center gap-1.5"
                    >
                      <ChevronLeft size={18} />
                      <span>Назад</span>
                    </button>
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="h-14 rounded-2xl bg-[#8cc63f] hover:bg-[#7db934] active:scale-[0.99] text-white text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Выбрать дату</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================
                  ШАГ 3: ДАТА, СЛОТ ВРЕМЕНИ, КОММЕНТАРИЙ И ПОДТВЕРЖДЕНИЕ
                  (ВЫБОР МАСТЕРА УБРАН ПО ТРЕБОВАНИЮ ПОЛЬЗОВАТЕЛЯ)
                 ============================================================ */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {/* Календарь выбора даты */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#8cc63f]/15 text-[#5e8f23] flex items-center justify-center">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Дата визита *
                          </h2>
                          <p className="text-[11px] text-slate-400">
                            Выберите свободный день в расписании сервиса
                          </p>
                        </div>
                      </div>
                      {form.date && (
                        <span className="text-xs font-extrabold text-[#5e8f23] bg-[#8cc63f]/10 px-2.5 py-1 rounded-lg">
                          {form.date}
                        </span>
                      )}
                    </div>

                    {loading.dates ? (
                      <div className="py-8 text-center">
                        <FieldLoader />
                      </div>
                    ) : (
                      <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-3.5">
                        <div className="flex justify-between items-center mb-3">
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("selection");
                              setCurrentMonth(
                                new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
                              );
                            }}
                            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <span className="text-sm font-extrabold text-slate-800 capitalize">
                            {currentMonth.toLocaleDateString("ru-RU", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("selection");
                              setCurrentMonth(
                                new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
                              );
                            }}
                            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((dayName) => (
                            <div
                              key={dayName}
                              className="text-xs font-bold text-slate-400 py-1"
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
                                onClick={() => {
                                  triggerHaptic("selection");
                                  setForm({ ...form, date: iso });
                                }}
                                className={`h-11 rounded-xl text-sm font-bold transition-all ${
                                  disabled
                                    ? "text-slate-300 opacity-40 cursor-not-allowed"
                                    : active
                                    ? "bg-[#8cc63f] text-white shadow-md ring-4 ring-[#8cc63f]/30 scale-[1.03]"
                                    : "bg-white text-slate-800 border border-slate-200 hover:border-[#8cc63f]"
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

                  {/* Выбор слота времени */}
                  {form.date && (
                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#8cc63f]/15 text-[#5e8f23] flex items-center justify-center">
                            <Clock size={20} />
                          </div>
                          <div>
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                              Свободное время визита *
                            </h2>
                            <p className="text-[11px] text-slate-400">
                              Бронирование слота на сервисе
                            </p>
                          </div>
                        </div>
                        {form.time && (
                          <span className="text-xs font-extrabold text-[#5e8f23] bg-[#8cc63f]/10 px-2.5 py-1 rounded-lg">
                            {form.time}
                          </span>
                        )}
                      </div>

                      {loading.times && (
                        <div className="py-6 text-center">
                          <FieldLoader />
                        </div>
                      )}

                      {!loading.times && times.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2.5">
                          {times.map((t) => {
                            const active = form.time === t.time;

                            return (
                              <button
                                key={t.start}
                                type="button"
                                onClick={() => {
                                  triggerHaptic("selection");
                                  setForm({
                                    ...form,
                                    time: t.time,
                                    dateEnd: t.end,
                                  });
                                }}
                                className={`py-3.5 px-2 text-sm rounded-2xl font-black border transition-all ${
                                  active
                                    ? "bg-[#8cc63f] text-white border-[#8cc63f] shadow-md ring-4 ring-[#8cc63f]/25 scale-[1.02]"
                                    : "bg-slate-50 border-slate-200 text-slate-800 hover:border-[#8cc63f] hover:bg-white active:scale-95"
                                }`}
                              >
                                {t.time}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        !loading.times && (
                          <div className="p-4 rounded-2xl bg-slate-50 text-slate-600 text-xs sm:text-sm">
                            На выбранную дату нет свободных окон. Пожалуйста, выберите другой активный день на календаре.
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Поле комментария к визиту */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2.5">
                    <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                      Дополнительные пожелания к сервису
                    </label>
                    <textarea
                      value={form.comment}
                      onChange={update("comment")}
                      placeholder="Особые пожелания или уточнения по вашему заезду..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#8cc63f] focus:bg-white focus:ring-4 focus:ring-[#8cc63f]/10 resize-none transition-all"
                    />
                  </div>

                  {/* Итоговая сводка перед бронированием */}
                  <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                      <span className="text-slate-400">Автомобиль</span>
                      <span className="font-extrabold text-white text-right">
                        {isCustomBrandMode ? customBrandInput : form.brand}{" "}
                        {isCustomModelMode ? customModelInput : form.model}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                      <span className="text-slate-400">Станция</span>
                      <span className="font-semibold text-white truncate max-w-[220px] text-right">
                        {DEALERS.find((d) => d.id === Number(form.dealerId))?.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                      <span className="text-slate-400">Услуга</span>
                      <span className="font-semibold text-white text-right">
                        {form.serviceName}
                      </span>
                    </div>

                    {selectedAddons.length > 0 && (
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                        <span className="text-slate-400">Доп. работы ({selectedAddons.length})</span>
                        <span className="font-extrabold text-[#8cc63f]">
                          +{addonsTotal.toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-slate-400">Дата и время</span>
                      <span className="font-black text-[#8cc63f] text-sm sm:text-base">
                        {form.date ? `${form.date} в ${form.time || "--:--"}` : "Не выбрано"}
                      </span>
                    </div>
                  </div>

                  {/* Кнопки навигации и подтверждения */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={goToPrevStep}
                      className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-extrabold transition-all flex items-center justify-center gap-1"
                    >
                      <ChevronLeft size={18} />
                      <span>Назад</span>
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !form.date || !form.time}
                      className="col-span-2 h-14 rounded-2xl bg-[#8cc63f] hover:bg-[#7db934] disabled:opacity-50 text-white text-sm sm:text-base font-black transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Бронируем время…</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          <span>Подтвердить запись</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        ) : (
          /* ============================================================
              ЭКРАН УСПЕШНОЙ ЗАПИСИ
             ============================================================ */
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md text-center">
            <div className="w-20 h-20 rounded-full bg-[#8cc63f]/20 text-[#5e8f23] flex items-center justify-center mx-auto mb-4 shadow-inner">
              <CheckCircle size={44} strokeWidth={2.5} />
            </div>

            <span className="inline-block text-xs font-black uppercase tracking-widest text-[#5e8f23] bg-[#8cc63f]/15 px-3.5 py-1 rounded-full mb-2">
              Запись подтверждена
            </span>

            <h2 className="text-2xl font-black text-slate-900 mb-1.5">
              Ждём вас на сервисе!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Заказ-наряд зарезервирован в сервисном центре «{summary?.dealer}». Мастер свяжется с вами для подтверждения.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 text-left space-y-3 mb-6 text-xs sm:text-sm border border-slate-200/80">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Автомобиль:</span>
                <span className="font-extrabold text-slate-900">
                  {summary?.brand} {summary?.model}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Сервисный центр:</span>
                <span className="font-bold text-slate-800 text-right">
                  {summary?.dealer}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Вид обслуживания:</span>
                <span className="font-bold text-slate-800">
                  {summary?.service}
                </span>
              </div>

              {summary?.customDescription && (
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-slate-500 block mb-0.5">Описание проблемы:</span>
                  <span className="font-medium text-slate-800 italic">
                    "{summary.customDescription}"
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
                <span className="text-slate-500">Дата и время:</span>
                <span className="font-black text-[#5e8f23] text-base">
                  {summary?.date} в {summary?.time}
                </span>
              </div>

              {summary?.addonsList && summary.addonsList.length > 0 && (
                <div className="pt-2.5 border-t border-slate-200">
                  <div className="text-xs font-black text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Дополнительно:</span>
                    <span className="text-[#5e8f23]">+{summary.addonsTotal} ₽</span>
                  </div>
                  {summary.addonsList.map((a) => (
                    <div key={a.id} className="flex justify-between text-xs text-slate-500 py-0.5">
                      <span>• {a.name}</span>
                      <span className="font-bold">{a.price} ₽</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => navigate("/")}
                className="w-full h-14 rounded-2xl bg-[#8cc63f] hover:bg-[#7db934] text-white text-sm font-extrabold transition-all shadow-md active:scale-[0.99]"
              >
                Вернуться на главную
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all"
              >
                Перейти в гараж профиля
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          BOTTOM SHEET: ВЫБОР МАРКИ АВТОМОБИЛЯ СО СТРОКОЙ ПОИСКА
         ============================================================ */}
      {isBrandSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Фон затемнения */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsBrandSheetOpen(false)}
          />

          {/* Панель шторки */}
          <div className="relative bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl z-10 animate-slideUp">
            {/* Полоска перетаскивания (drag handle) */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3" />

            {/* Заголовок шторки */}
            <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Выберите марку автомобиля
                </h3>
                <p className="text-xs text-slate-400">
                  Официальные дилерские бренды в начале списка
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBrandSheetOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Строка поиска марки */}
            <div className="p-4 pb-2">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Поиск по марке: LADA, Geely, Kia..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full bg-slate-100 rounded-2xl pl-10 pr-9 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#8cc63f] transition-all"
                />
                {brandSearch && (
                  <button
                    type="button"
                    onClick={() => setBrandSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Табы категорий */}
              <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setBrandCategory("all");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    brandCategory === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Все марки
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setBrandCategory("partners");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    brandCategory === "partners"
                      ? "bg-[#8cc63f] text-white shadow-2xs"
                      : "bg-[#8cc63f]/15 text-[#5e8f23] hover:bg-[#8cc63f]/25"
                  }`}
                >
                  ★ Дилерские бренды
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setBrandCategory("popular");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    brandCategory === "popular"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Популярные
                </button>
              </div>
            </div>

            {/* Скроллируемый список марок */}
            <div className="flex-1 overflow-y-auto px-4 divide-y divide-slate-100">
              {/* Если категория ALL или PARTNERS и нет поиска, показываем блок наших марок */}
              {!brandSearch && brandCategory !== "popular" && (
                <div className="py-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#5e8f23] mb-2 px-2">
                    Дилерские марки «Прагматика»
                  </div>
                  <div className="space-y-1">
                    {PARTNER_BRANDS.map((brand) => {
                      const isSelected = form.brand === brand;
                      return (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => handleSelectBrand(brand)}
                          className={`w-full px-3 py-3 rounded-2xl flex items-center justify-between text-left transition-all ${
                            isSelected
                              ? "bg-[#8cc63f]/15 text-[#5e8f23] font-black"
                              : "hover:bg-slate-50 text-slate-900 font-extrabold"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-[#8cc63f]" />
                            <span className="text-sm sm:text-base">{brand}</span>
                          </div>
                          {isSelected && <Check size={18} strokeWidth={3} className="text-[#5e8f23]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Основной список отфильтрованных брендов */}
              <div className="py-2">
                {!brandSearch && (
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 px-2">
                    {brandCategory === "partners"
                      ? "Марки Прагматика"
                      : brandCategory === "popular"
                      ? "Популярные марки"
                      : "Остальные марки"}
                  </div>
                )}

                {filteredBrands.length > 0 ? (
                  <div className="space-y-1">
                    {filteredBrands.map((brand) => {
                      const isPartner = PARTNER_BRANDS.includes(brand);
                      // Не дублируем бренды-партнеры если они уже выведены блоком выше без поиска
                      if (!brandSearch && brandCategory === "all" && isPartner) return null;

                      const isSelected = form.brand === brand;
                      return (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => handleSelectBrand(brand)}
                          className={`w-full px-3 py-3 rounded-2xl flex items-center justify-between text-left transition-all ${
                            isSelected
                              ? "bg-[#8cc63f]/15 text-[#5e8f23] font-black"
                              : "hover:bg-slate-50 text-slate-900 font-bold"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base">{brand}</span>
                            {isPartner && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#8cc63f]/20 text-[#5e8f23]">
                                Дилер
                              </span>
                            )}
                          </div>
                          {isSelected && <Check size={18} strokeWidth={3} className="text-[#5e8f23]" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs sm:text-sm">
                    Марка «{brandSearch}» не найдена в справочнике.
                  </div>
                )}
              </div>

              {/* Блок ручного ввода марки */}
              <div className="py-3 px-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="text-xs font-extrabold text-slate-700 block">
                    Не нашли марку в списке? Впишите свою:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Название марки (например: Москвич, Oting, Omoda...)"
                      value={customBrandInput}
                      onChange={(e) => setCustomBrandInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold outline-none focus:border-[#8cc63f]"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmCustomBrand}
                      disabled={!customBrandInput.trim()}
                      className="px-4 py-2 rounded-xl bg-[#8cc63f] hover:bg-[#7db934] disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Применить
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Нижняя кнопка закрытия */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => setIsBrandSheetOpen(false)}
                className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-extrabold transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
