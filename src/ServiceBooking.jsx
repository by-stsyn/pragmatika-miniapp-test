import { useState, useEffect, useRef } from "react";
import { formatRussianPhone } from "/src/utils/phone";
import { ArrowLeft, CheckCircle } from "lucide-react";
import BottomNav from "/src/components/BottomNav";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { platform } from "./platform";
import { CarFront } from "lucide-react";
import { RefreshCcw } from "lucide-react";

/* ---------- Выделенный IP ---------- */
const BASE_URL = "/api/render";

/* ---------- Б24 ---------- */
const BITRIX_WEBHOOK =
  "https://b24.pragmaticar.ru/rest/3560/53dry4y4xa5a4vjq/";

const BITRIX_DEAL_ADD =
  BITRIX_WEBHOOK + "crm.deal.add.json";

const BITRIX_CONTACT_ADD =
  BITRIX_WEBHOOK + "crm.contact.add.json";

const BITRIX_CONTACT_LIST =
  BITRIX_WEBHOOK + "crm.contact.list.json";


/* ---------- справочники ---------- */
const BRANDS_MODELS = {
  LADA: [
  "Granta", "Vesta", "Niva Legend", "Niva Travel", "XRAY",
  "Largus", "Aura", "Iskra", 
  "Priora", "Kalina", "Samara", "2101", "2105", "2106", "2107",
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
  "UNI-K", "UNI-T", "UNI-V",
  "Alsvin", "Eado Plus", "Raeton Plus", 
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
  "TT", "R8", 
  "e-tron", "e-tron GT", 
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

  Dacia: [
  "Logan", "Sandero", "Duster", "Lodgy", "Dokker"
],

Daewoo: [
  "Matiz", "Nexia", "Lanos", "Gentra", "Leganza", "Espero", "Rezzo"
],

Datsun: [
  "on-DO", "mi-DO"
],

Dodge: [
  "Caliber", "Journey", "Challenger", "Charger", "Durango", "Ram", "Nitro", "Avenger", "Caravan"
],

  JAC: ["J7", "JS4", "JS6", "T6", "T8", "Sunray", "iEV7S"],

Exeed: [
  "TXL", "VX", "LX", "RX", "Sterra ET", "Sterra ES"
],

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

  Infiniti: [
  "Q30", "Q50", "Q60", "Q70", "QX30", "QX50", "QX55", "QX60", "QX70", "QX80"
],

Isuzu: [
  "D-Max", "MU-X", "NLR85", "NMR85", "NQR90", "Elf", "Forward", "Trooper"
],
  
  Ford: [
  "Focus", "Mondeo", "Fiesta", "Fusion", "Kuga", "Explorer", "Edge", "Escape", "Mustang", "Transit", "EcoSport", "Ranger", "F-150", "Bronco"
],

FAW: [
  "Bestune T33", "Bestune T55", "Bestune T77", "Bestune T99", "Bestune B70", "Junpai A50", "X40", "X80", "Hongqi H5", "Hongqi H9", "Hongqi E-HS9"
],

  Honda: [
  "Civic", "Accord", "CR-V", "HR-V", "Pilot", "Odyssey", "Fit", "Jazz", "Stepwgn", "Freed", "Elysion"
],

Haval: [
  "Jolion", "F7", "F7x", "H6", "Dargo", "M6", "H5", "H9", "Cool Dog", "Big Dog", "Raptor"
],

Hyundai: [
  "Accent", "Elantra", "Sonata", "i30", "i40", "Creta", "Tucson", "Santa Fe", "Palisade", "Staria", "Kona", "Bayon", "Venue", "IONIQ 5", "IONIQ 6"
],

Jetour: [
  "X70", "X70 Plus", "X70 Pro", "X90", "X95", "Dashing", "Traveller", "T2"
],

  Mercedes_Benz: [
  "A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", 
  "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", 
  "EQC", "EQA", "EQB", "EQE", "EQS", 
  "SL", "SLC", "AMG GT", "V-Class", "Vito", "Sprinter", "Maybach S-Class", "Maybach GLS"
],

Mazda: [
  "Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-50", "CX-60", "CX-8", "CX-9", "MX-5"
],

Mitsubishi: [
  "Lancer", "Outlander", "Pajero", "Pajero Sport", "ASX", "Eclipse Cross", "Xpander", "Attrage", "Mirage", "Delica"
],

  Moskvich: [
  "3", "3e", "6", "2140", "Aleko", "Svyatogor"
],

Nissan: [
  "Almera", "Micra", "Note", "Sentra", "Tiida", "Juke", "Qashqai", "X-Trail", "Murano", "Pathfinder", "Patrol", "Terrano", "Navara", "Leaf", "GT-R"
],

  Opel: [
  "Astra", "Corsa", "Insignia", "Mokka", "Crossland", "Grandland", "Zafira", "Vivaro", "Meriva", "Combo"
],

  Omoda: ["C5", "S5", "E5"],

Peugeot: [
  "208", "2008", "301", "308", "3008", "5008", "408", "4008", "Traveller", "Rifter", "Partner", "Expert", "Boxer"
],

Renault: [
  "Logan", "Sandero", "Duster", "Kaptur", "Arkana", "Koleos", "Talisman", "Megane", "Scenic", "Espace", "Symbol", "Master", "Trafic", "Kangoo"
],

  Land_Rover: [
  "Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar", "Freelander 2"
],

Lexus: [
  "ES", "IS", "LS", "GS", "UX", "NX", "RX", "GX", "LX", "RC", "LC"
],

Skoda: [
  "Fabia", "Rapid", "Octavia", "Superb", "Karoq", "Kodiaq", "Kamiq", "Enyaq", "Yeti"
],

  SEAT: [
  "Ibiza", "Leon", "Toledo", "Arona", "Ateca", "Tarraco", "Altea", "Cordoba", "Exeo", "Alhambra"
],

Smart: [
  "Fortwo", "Forfour", "EQ Fortwo", "EQ Forfour", "Crossblade", "Roadster"
],

SsangYong: [
  "Tivoli", "Actyon", "Actyon Sports", "Kyron", "Rexton", "Rodius", "Korando", "Musso", "Chairman"
],

  Porsche: [
  "911", "Cayenne", "Macan", "Panamera", "Taycan", "718 Boxster", "718 Cayman"
],

Toyota: [
  "Camry", "Corolla", "RAV4", "Land Cruiser 200", "Land Cruiser 300", "Land Cruiser Prado", "Hilux", "Fortuner", "Highlander", "C-HR", "Yaris", "Auris", "Avensis", "Crown", "Mark X", "Supra", "GR86", "Sienna", "Alphard"
],

  Tank: ["300", "500"],

Volkswagen: [
  "Polo", "Jetta", "Passat", "Golf", "Arteon", "Tiguan", "Touareg", "T-Roc", "Taos", "ID.4", "Multivan", "Caddy", "Transporter", "Amarok"
],
  Subaru: [
  "Impreza", "Legacy", "Outback", "Forester", "XV", "BRZ", "WRX", "Levorg", "Crosstrek"
],

Suzuki: [
  "Swift", "Baleno", "SX4", "Vitara", "Grand Vitara", "Jimny", "Ignis", "Celerio", "Ertiga"
],

  Skywell: ["ET5"],


Volvo: [
  "S60", "S80", "S90", "V40", "V60", "V90", "XC40", "XC60", "XC70", "XC90", "C30", "C70", "EX30", "EX90"
],

  Voyah: ["Free", "Dream", "Passion"],

  UAZ: [
  "Patriot", "Hunter", "Pickup", "Bukhanka", "Cargo", "3163", "452", "Simba", "Trekker"
],

  Zeekr: ["001", "X", "007"],

  ZAZ: [
  "Chance", "Vida", "Sens", "Slavuta", "Tavria", "Lanos", "1102", "1103", "1105"
],

  GAZ: [
  "Volga", "3110", "31105", "3102", "2217", "3302", "2705", "Next", "Valdai", "Sobol", "Gazelle"
],
    Другая_марка: ["Другая модель"],
  
};

const DEALERS = [
    { id: 2, name: "Kia Василеостровский" },
  { id: 21, name: "KAIYI Василеостровский" },
  { id: 23, name: "GEELY Василеостровский" },
 { id: 36, name: "Evolute Василеостровский" },
  { id: 24, name: "Чанган Центр Купчино" },
  { id: 1, name: "Kia Купчино" },
  { id: 4, name: "LADA Парнас" },
  { id: 5, name: "LADA Василеостровский" },
  { id: 3, name: "LADA Купчино" },
  { id: 7, name: "LADA Новгород" },
  { id: 9, name: "LADA Псков" },
  { id: 8, name: "LADA Великие Луки" },
  { id: 10, name: "LADA Мурманск" },
  { id: 11, name: "LADA Петрозаводск" },
];

const DEALER_MAPPING = {
  "KIA Василеостровский": "Kia Василеостровский",
  "KAIYI Василеостровский": "KAIYI Василеостровский",
  "Geely Василеостровский": "GEELY Василеостровский",
  "CHANGAN Купчино": "Чанган Центр Купчино",
  "KIA Купчино": "Kia Купчино",
  "Evolute Прагматика Василеостровский": "Evolute Василеостровский",
  "LADA Парнас": "LADA Парнас",
  "LADA Василеостровский": "LADA Василеостровский",
  "LADA Купчино": "LADA Купчино",
  "LADA Новгород": "LADA Новгород",
  "LADA Псков": "LADA Псков",
  "LADA Псков Великие Луки": "LADA Великие Луки",
  "LADA Мурманск": "LADA Мурманск",
  "LADA Петрозаводск": "LADA Петрозаводск"
};

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
  11: 111069
};

const SERVICES = [
  { id: "to",   name: "Техническое обслуживание" },
  { id: "diag", name: "Диагностика электрики" },
  { id: "diag", name: "Прочая диагностика" },
   { id: "diag",   name: "Ремонт электрики" },
  { id: "msr", name: "Ремонт двигателя" },
  { id: "msr", name: "Ремонт тормозной системы" },
   { id: "msr",   name: "Ремонт трансмиссии" },
  { id: "msr",   name: "Ремонт ходовой части" },
  { id: "shm", name: "Шиномонтаж" },
  { id: "msr", name: "Мойка" },
  { id: "msr", name: "Установка ГБО" },
   { id: "guarant",   name: "Гарантийный ремонт" }

];

const getLeadDirection = (brand) => {

  const serviceBrands = [
    "Kia",
    "Evolute",
    "LADA",
    "Geely",
    "Changan",
    "Kaiyi"
  ];

  return serviceBrands.includes(brand)
    ? 42209   // Сервис
    : 42210;  // Мультисервис

};

const getInterest = (serviceName) => {

  if (serviceName === "Техническое обслуживание")
    return "ТО";

  if (serviceName === "Мойка")
    return "Мойка, детейлинг";

  return "Текущий ремонт";

};

const isoNow = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
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

  return list.map(x => ({
    start: x.Recording?.dateStartAt,
    end: x.Recording?.dateEndAt,
    time: x.Recording?.dateStartAt?.split(" ")[1].slice(0, 5)
  }));
};

  const fetchClientInfo = async () => {

  const id = platform.getId();

  if (!id) return null;

  const param = platform.isMax?.()
    ? "maxId"
    : "telegramId";

  const res = await fetch(
    `${BASE_URL}?path=communication/contact/client&${param}=${id}`
  );

  if (!res.ok) return null;

  const json = await res.json();

  return json.data || null;
};

/* ---------- календарь ---------- */
const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay() || 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];

  for (let i = 1; i < firstDay; i++) {
    days.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  return days;
};

/* ---------- ищем контакт в Б24 ---------- */

async function findContact(phone) {

    // +7(911)111-11-11 -> 79111111111
    const normalizedPhone = phone.replace(/\D/g, "");

    console.log("Ищем телефон:", normalizedPhone);

    const response = await fetch(BITRIX_CONTACT_LIST, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            filter: {
                PHONE: normalizedPhone
            },
            select: ["ID"]
        })
    });

    const json = await response.json();

    console.log("Ответ Б24:", json);

    if (json.result && json.result.length) {
        return json.result[0].ID;
    }

    return null;
}

/* ---------- создаем контакт в Б24 ---------- */

async function createContact(name, phone) {

    const response = await fetch(BITRIX_CONTACT_ADD, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            fields: {

                NAME: name,

                PHONE: [
                    {
                        VALUE: phone,
                        VALUE_TYPE: "WORK"
                    }
                ]

            }

        })

    });

    const json = await response.json();

    return json.result;

}

/* ---------- создаем сделку в Б24 ---------- */

async function createDeal(data) {

    const response = await fetch(BITRIX_DEAL_ADD, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            fields: data

        })

    });

    return await response.json();

}


export default function ServiceBookingForm() {

const userId = platform.getId();

const [userCars, setUserCars] = useState([]);
const [selectedCarId, setSelectedCarId] = useState("");
const [manualCar, setManualCar] = useState(false);  
const [carsLoading, setCarsLoading] = useState(true);
const [showCarList, setShowCarList] = useState(false);
const [clientLoading, setClientLoading] = useState(true);  
  
  const [form, setForm] = useState({
  brand:"", model:"", name:"", phone:"",
  dealerId:"",
  serviceId:"",
  serviceName:"",
  date:"",
  time:"",
  dateEnd:"",
  comment:""
});

  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState({ dates:false, times:false });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);

  const update = k => e => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {

  if (!userId) {
    setCarsLoading(false);
    return;
  }

  fetch(`${BASE_URL}?path=api/profile/cars&telegramId=${userId}`)
    .then(res => res.json())
    .then(data => {

      const cars = data?.cars || [];

      setUserCars(cars);


      // логика наличия автомобилей у пользователя
      if (cars.length > 0) {
  const firstCar = cars[0];

  setSelectedCarId(firstCar.id);

  setForm(prev => ({
    ...prev,
    brand: firstCar.brand,
    model: firstCar.model
  }));
}

    })
    .catch(err => {
      console.error("Ошибка загрузки автомобилей", err);
    })
    .finally(() => {
      setCarsLoading(false);
    });


}, [userId]);

 /* загрузка телефона и организации */

useEffect(() => {

const formatPhone = (phone) => {

  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  if (digits.length !== 10)
    return phone;

  return `+7(${digits.slice(0,3)})${digits.slice(3,6)}-${digits.slice(6,8)}-${digits.slice(8,10)}`;
};

 const user = platform.getUser();
 console.log("USER:", user);
fetchClientInfo()
    .then(client => {

        setForm(prev => {

            const updated = { ...prev };

            // Имя пользователя из Telegram/MAX/VK/1C
            if (user) {
              const fullName = [
                user.firstName || user.first_name,
                user.lastName || user.last_name
              ]
              .filter(Boolean)
              .join(" ");
              if (fullName) {
                updated.name = fullName;
              }
            }

            if (!updated.name && client?.name) {
              updated.name = client.name;
            }

            // Телефон
            if (client?.telephone) {
                updated.phone = formatPhone(client.telephone);
            }

            // Дилер
            if (client?.organization) {

                const dealerName =
                    DEALER_MAPPING[client.organization];

                const dealer =
                    DEALERS.find(d => d.name === dealerName);

                if (dealer) {
                    updated.dealerId = String(dealer.id);
                }
            }

            return updated;
        });

    })
    .catch(console.error)
    .finally(() => {
        setClientLoading(false);
    });

}, []);









  

  /* даты */
  useEffect(() => {
    if (!form.dealerId || !form.serviceId) return;

    setLoading(l => ({ ...l, dates:true }));
    setDates([]);
    setTimes([]);
    setForm(f => ({ ...f, date:"", time:"" }));

    fetchDates(form.dealerId, form.serviceId)
      .then(setDates)
      .finally(() => setLoading(l => ({ ...l, dates:false })));
  }, [form.dealerId, form.serviceId]);

  /* время */
  useEffect(() => {
    if (!form.dealerId || !form.serviceId || !form.date) return;

    setLoading(l => ({ ...l, times:true }));
    setTimes([]);
    setForm(f => ({ ...f, time:"", dateEnd:"" }));

    fetchTimes(form.dealerId, form.serviceId, form.date)
      .then(setTimes)
      .finally(() => setLoading(l => ({ ...l, times:false })));
  }, [form.date, form.dealerId, form.serviceId]);


  const selectUserCar = (id) => {

  setSelectedCarId(id);
  setManualCar(false);
  const car = userCars.find(
    c => String(c.id) === String(id)
  );

  if (!car) return;


  setForm(prev => ({
    ...prev,
    brand: car.brand,
    model: car.model
  }));

};


  

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Уже идет отправка
    if (submitLock.current) {
        return;
    }

    // Ставим блокировку МГНОВЕННО
    submitLock.current = true;

    if (!form.date || !form.time) {
        submitLock.current = false;
        return alert("Выберите дату и время");
    }

   const startISO = `${form.date}T${form.time}:00`;
const endISO = form.dateEnd.replace(" ", "T");

    const payload = {
      dealerId: Number(form.dealerId),
      dateStartAt: startISO,
      dateEndAt: endISO,
      typeRepair: form.serviceId,
      name: form.name,
      telephone: form.phone,
      brandName: form.brand,
      modelName: form.model,
      comment: form.comment,
      test: false
    };

    setSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}?path=communication/recording/create`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

     if (res.ok) {

  // 📩 отправка письма
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
      comment: form.comment,
    }),
  });


const serviceName = form.serviceName;

let contactId = await findContact(form.phone);

if (!contactId) {

    contactId = await createContact(
        form.name,
        form.phone
    );

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

    UF_CRM_1650278488: form.comment,

    UF_CRM_1680763694:
        `${form.date} ${form.time}:00`,

    UF_CRM_6358BF0244306: 42713,

    UF_CRM_1627284772:
        Number(form.dealerId),

    UF_CRM_616599413CA88:
        getInterest(serviceName),

    UF_CRM_63230547E784B:
        getLeadDirection(form.brand)

};

await createDeal(dealFields);

  setSummary({
  ...form,
  service: SERVICES.find((s) => s.id === form.serviceId)?.name || "",
  dealer: DEALERS.find((d) => d.id === Number(form.dealerId))?.name || ""
});
  setSubmitted(true);
}
    } catch (err) {
      alert("Ошибка");
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  const availableSet = new Set(dates);

  const accentClass = "border-[#8cc63f] text-[#8cc63f]";
  const activeClass = "bg-[#8cc63f] text-white border-[#8cc63f]";

  const days = getDaysInMonth(currentMonth);
  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3";

  const FieldLoader = () => (
  <div className="flex items-center gap-2 text-gray-400">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-[#8cc63f] rounded-full animate-spin"></div>
    <span className="text-sm">Загрузка данных</span>
  </div>
);

  
  return (
     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-[90px]">

      <div className="max-w-md mx-auto p-4">

        <div className="mb-4">
          <a href="/" className="inline-flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="mr-1" /> Назад
          </a>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Запись на сервис</h1>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow space-y-4">

            {/* Автомобиль клиента */}

{(userCars.length === 0 || manualCar) && (
  <>
    <select
      value={form.brand}
      onChange={(e) =>
        setForm({
          ...form,
          brand: e.target.value,
          model: ""
        })
      }
      className={inputClass}
    >
      <option value="">Марка</option>

      {Object.keys(BRANDS_MODELS).map((b) => (
        <option key={b}>{b}</option>
      ))}
    </select>

    <select
      value={form.model}
      onChange={update("model")}
      className={inputClass}
    >
      <option value="">Модель</option>

      {form.brand &&
        BRANDS_MODELS[form.brand].map((m) => (
          <option key={m}>{m}</option>
        ))}
    </select>
  </>
)}

     {userCars.length > 0 && !manualCar && (
  <>
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
  <div className="p-4">
    <div className="flex items-center gap-2 mb-3">
      <CarFront size={20} className="text-[#8cc63f]" />
      <span className="text-sm font-medium text-gray-500">
        Автомобиль
      </span>
    </div>

   <>
  <div className="text-lg font-semibold text-gray-800">
    {form.brand} {form.model}
  </div>

  {userCars.find(c => String(c.id) === String(selectedCarId))?.plate && (
    <div className="mt-1 text-sm text-gray-500">
      Гос. номер: {userCars.find(c => String(c.id) === String(selectedCarId)).plate}
    </div>
  )}

  {userCars.length > 1 && (
    <>
      <button
        type="button"
        onClick={() => setShowCarList(!showCarList)}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
      >
        {showCarList ? "Скрыть список автомобилей" : "Поменять автомобиль"}
      </button>

      {showCarList && (
        <select
          value={selectedCarId}
          onChange={(e) => {
            selectUserCar(e.target.value);
            setShowCarList(false);
          }}
          className="mt-3 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
        >
          {userCars.map((car) => (
            <option key={car.id} value={car.id}>
              {car.brand} {car.model}
              {car.plate ? ` (${car.plate})` : ""}
            </option>
          ))}
        </select>
      )}
    </>
  )}
</>
  </div>

  <button
    type="button"
    onClick={() => {
      setManualCar(true);
      setShowCarList(false);
      setSelectedCarId("");
      setForm((prev) => ({
        ...prev,
        brand: "",
        model: ""
      }));
    }}
    className="w-full flex items-center justify-center gap-2 border-t border-gray-200 bg-gray-50 py-3 text-sm font-medium text-[#8cc63f] hover:bg-[#f5faeb] transition-colors"
  >
   <RefreshCcw size={16} />
<span>Выбрать другой автомобиль</span>
  </button>
</div>
  </>
)}      

            <div className="relative">

  {clientLoading ? (
    <div className={`${inputClass} flex items-center`}>
      <FieldLoader />
    </div>
  ) : (
    <input
      placeholder="Имя"
      value={form.name}
      onChange={update("name")}
      className={inputClass}
    />
  )}

</div>

            {clientLoading ? (
  <div className={`${inputClass} flex items-center`}>
    <FieldLoader />
  </div>
) : (
  <input
    type="tel"
    className={inputClass}
    placeholder="+7 (___) ___-__-__"
    value={form.phone}
    onChange={(e) => {
      const formatted = formatRussianPhone(e.target.value);
      setForm((prev) => ({ ...prev, phone: formatted }));
    }}
  />
)}

            {clientLoading ? (
  <div className={`${inputClass} flex items-center`}>
    <FieldLoader />
  </div>
) : (
  <select
    value={form.dealerId}
    onChange={update("dealerId")}
    className={inputClass}
  >
    <option value="">Дилер</option>

    {DEALERS.map(d =>
      <option key={d.id} value={d.id}>
        {d.name}
      </option>
    )}

  </select>
)}

            <select
  value={form.serviceName}
  onChange={(e) => {
    const service = SERVICES.find(s => s.name === e.target.value);

    setForm({
      ...form,
      serviceId: service.id,
      serviceName: service.name
    });
  }}
  className={inputClass}
>
  <option value="">Услуга</option>
  {SERVICES.map(s => (
    <option key={s.name} value={s.name}>
      {s.name}
    </option>
  ))}
</select>

            {/* календарь */}
            {form.dealerId && form.serviceId && (
              <div>
                <p className="mb-2 font-medium">Выберите удобную дату</p>

                <div className="flex justify-between items-center mb-2">
                  <button type="button" onClick={()=>setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()-1)))}>
                    <ChevronLeft/>
                  </button>
                  <span>
                    {currentMonth.toLocaleDateString("ru-RU", { month:"long", year:"numeric" })}
                  </span>
                  <button type="button" onClick={()=>setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()+1)))}>
                    <ChevronRight/>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {days.map((d, i) => {
                    if (!d) return <div key={i}/>;

                    const iso = [
  d.getFullYear(),
  String(d.getMonth() + 1).padStart(2, "0"),
  String(d.getDate()).padStart(2, "0")
].join("-");
                    const disabled = !availableSet.has(iso);
                    const active = form.date === iso;

                    return (
                      <button
                        type="button"
                        key={iso}
                        disabled={disabled}
                        onClick={() => setForm({...form, date:iso})}
                        className={`p-2 rounded-lg border ${
                          disabled
                            ? "text-gray-300 border-transparent"
                            : active
                            ? activeClass
                            : accentClass
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* время */}
            {form.date && (
              <div>
                <p className="mb-2 font-medium">Выберите доступное время</p>

                {loading.times && <p>Загрузка...</p>}

                {!loading.times && times.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                   {times.map(t => {
  const active = form.time === t.time;

  return (
    <button
      key={t.start}
      type="button"
      onClick={() =>
        setForm({
          ...form,
          time: t.time,
          dateEnd: t.end
        })
      }
      className={`p-2 rounded-xl border ${
        active ? activeClass : accentClass
      }`}
    >
      {t.time}
    </button>
  );
})}
                  </div>
                )}
              </div>
            )}

            {/* Комментарий */}
            {form.time && (
              <textarea
                value={form.comment}
                onChange={update("comment")}
                placeholder="Комментарий"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            )}

            <button type="submit"
            disabled={submitting}
           className={`w-full py-3 rounded-xl text-white transition
           ${
           submitting
           ? "bg-gray-400 cursor-not-allowed"
           : "bg-[#8cc63f] hover:bg-[#79b62d]"
           }`}
          >
              {submitting ? "Создаем запись на сервис..." : "Записаться"}
            </button>

          </form>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48}/>
            <h2 className="text-xl font-bold">Спасибо, Вы записаны на {summary.service} 🎉</h2>
            <p>Автомобиль: {summary.brand} {summary.model}</p>
            <p>Дата: {summary.date} в {summary.time}</p>
          </div>
        )}

      </div>
      <BottomNav/>
    </div>
  );
}
