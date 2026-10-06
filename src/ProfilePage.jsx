import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import BottomNav from "/src/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { BRANDS_MODELS } from "/src/data/brands";
import Preloader from "/src/components/Preloader";
import { platform } from "./platform";

const BASE_URL = "/api/render";

/* ===== Справочник типов заказ-нарядов ===== */
const REPAIR_TYPE_LABELS = {
  "ТО": "Техническое обслуживание",
  "МСР": "Ремонтные работы",
  "Эксперт МСР": "Ремонтные работы",
};

export default function ProfilePage() {
  const user = platform.getUser();
  const userId = platform.getId(); // ← универсальный ID
  const idParam = platform?.isMax?.() ? "maxId" : "telegramId";
  console.log("ID PARAM:", idParam, userId);
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
    plate: ""
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
    /^[A-HJ-NPR-Z0-9]{17}$/.test(vin.toUpperCase());

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
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  /* ===== Загрузка автомобилей ===== */
  useEffect(() => {
    if (!userId) return;

    fetch(`${BASE_URL}?path=api/profile/cars&telegramId=${userId}`)
      .then(res => res.ok && res.json())
      .then(data => setCars(data?.cars || []));
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

    setLoadingRecs(prev => ({ ...prev, [vin]: true }));

    try {
      console.log("FETCH RECOMMENDATIONS:", `${idParam}=${userId}`, vin);
      const res = await fetch(
        `${BASE_URL}?path=communication/contact/recommendation_repair&${idParam}=${userId}&vin=${vin}`
      );
      const data = await res.json();
      setRecommendations(prev => ({
        ...prev,
        [vin]: data?.data?.recommendations || []
      }));
      setOpenedRecsVIN(vin);
    } catch (e) {
      console.error("Ошибка рекомендаций", e);
    } finally {
      setLoadingRecs(prev => ({ ...prev, [vin]: false }));
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

  setLoadingInsurance(prev => ({ ...prev, [vin]: true }));

  try {
    console.log("FETCH INSURANCE:", `${idParam}=${userId}`, vin);
    const res = await fetch(
      `${BASE_URL}?path=communication/contact/insurance_policy&${idParam}=${userId}&vin=${vin}`
    );

    let data = null;

    if (res.ok) {
      data = await res.json();
    }

    setInsurancePolicies(prev => ({
      ...prev,
      [vin]: data?.data?.insurancePolicies || []
    }));
  } catch (e) {
    console.error("Ошибка загрузки страховых полисов", e);

    // ВАЖНО: сохраняем пустой массив, чтобы UI отобразил сообщение
    setInsurancePolicies(prev => ({
      ...prev,
      [vin]: []
    }));
  } finally {
    setOpenedInsuranceVIN(vin);   // ← КРИТИЧНО
    setLoadingInsurance(prev => ({ ...prev, [vin]: false }));
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
      setExpandedRepairVIN(prev => (prev === vin ? null : vin));
      return;
    }

    setLoadingRepairs(prev => ({ ...prev, [vin]: true }));

    try {
      console.log("FETCH REPAIRS:", `${idParam}=${userId}`, vin);
      const res = await fetch(
        `${BASE_URL}?path=communication/contact/history_repair&${idParam}=${userId}&vin=${vin}`
      );
      if (res.ok) {
        const data = await res.json();
        setRepairs(prev => ({ ...prev, [vin]: data.history || [] }));
        setExpandedRepairVIN(vin);
      }
    } finally {
      setLoadingRepairs(prev => ({ ...prev, [vin]: false }));
    }
  };

  /* ===== Сохранение авто ===== */
  const saveCar = async () => {
  if (!carForm.brand || !carForm.model) {
    alert("Выберите марку и модель");
    return;
  }

  if (!validateVIN(carForm.vin)) {
    setVinError("VIN введен некорректно");
    return;
  } else {
    setVinError("");
  }

  if (!userId) return alert("Не удалось получить идентификатор пользователя");

  const url = editIndex !== null
    ? `${BASE_URL}?path=api/profile/car/update`
    : `${BASE_URL}?path=api/profile/car/add`;

  const body = editIndex !== null
    ? { id: cars[editIndex].id, ...carForm }
    : { telegramId: userId, ...carForm };

  setSavingCar(true); // ✅ старт лоадера

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

   if (!res.ok) {
  const errorText = await res.text();

  console.error("Ошибка сохранения:", {
    status: res.status,
    response: errorText,
  });

  alert(
    `Ошибка сохранения (${res.status})\n\n${errorText}`
  );

  return;
}

    const data = await res.json();

    setCars(prev =>
      editIndex !== null
        ? prev.map((c, i) => (i === editIndex ? data.car : c))
        : [...prev, data.car]
    );

    setShowCarForm(false);
    setEditIndex(null);
    setCarForm({ brand: "", model: "", vin: "", plate: "" });

  } finally {
    setSavingCar(false); // ✅ стоп лоадера
  }
};



  const deleteCar = async (i) => {
    const car = cars[i];
    if (!car?.id) return;

    await fetch(`${BASE_URL}?path=api/profile/car/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: car.id })
    });

    setCars(prev => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="p-4 pb-[90px]">
      <a href="/" className="inline-flex items-center text-blue-600 mb-4">
        <ArrowLeft className="mr-1" /> Назад
      </a>

      {/* Профиль */}
      <div className="text-center mb-6">
        <img
          src={user?.photo || "https://via.placeholder.com/150"}
          className="w-24 h-24 rounded-full mx-auto mb-3 border object-cover"
        />
        <h2 className="text-2xl font-semibold">{user?.firstName || user?.first_name}</h2>
      </div>

      {/* Бонусы */}
      <div className="text-center mb-6">
        {loading && <Preloader />}
        {!loading && !userId && (
          <p className="text-red-600">Не удалось получить идентификатор пользователя</p>
        )}
        {!loading && bonus && (
          <>
            <p>Текущий баланс бонусов</p>
            <p className="text-3xl font-bold text-green-600">
              {bonus.balance} баллов
            </p>
          </>
        )}
      </div>

      {/* Автомобили */}
      <h3 className="text-xl font-semibold mb-3">Мои автомобили</h3>

      {cars.map((c, i) => (
        <div key={c.id} className="border rounded-lg p-3 mb-4">
          <p className="font-semibold">{c.brand} {c.model}</p>
          <p>VIN: {c.vin}</p>
          <p>Гос. номер: {c.plate}</p>

          <div className="mt-3 flex gap-2">
  <button
    className="flex-1 bg-sky-500 text-white py-2 rounded"
    onClick={() => {
      setEditIndex(i);
      setCarForm(c);
      setShowCarForm(true);
    }}
  >
    Изменить
  </button>

  <button
    className="flex-1 bg-red-500 text-white py-2 rounded"
    onClick={() => deleteCar(i)}
  >
    Удалить
  </button>

  <button
    disabled={loadingRepairs[c.vin]}
    onClick={() => loadRepairs(c.vin)}
    className={`flex-1 py-2 rounded text-white
      ${loadingRepairs[c.vin] ? "bg-gray-400" : "bg-[#86c53f]"}`}
  >
    {loadingRepairs[c.vin] ? "Загрузка..." : "История ТО"}
  </button>
</div>

{/* Кнопка Рекомендаций под блоком с тремя кнопками */}
<button
  disabled={loadingRecs[c.vin]}
  onClick={() => loadRecommendations(c.vin)}
  className={`w-full mt-2 py-2 rounded text-white text-sm
    ${loadingRecs[c.vin] ? "bg-gray-400" : "bg-purple-500"}`}
>
  {loadingRecs[c.vin] ? "Загрузка..." : "Рекомендации с последнего обслуживания"}
</button>

          {/* Кнопка страховок */}
          <button
  disabled={loadingInsurance[c.vin]}
  onClick={() => loadInsurancePolicies(c.vin)}
  className={`w-full mt-2 py-2 rounded text-white text-sm
    ${loadingInsurance[c.vin] ? "bg-gray-400" : "bg-indigo-500"}`}
>
  {loadingInsurance[c.vin]
    ? "Загрузка..."
    : "Действующие полисы страхования"}
</button>



{repairs[c.vin] !== undefined && expandedRepairVIN === c.vin && (
  repairs[c.vin].length > 0 ? (
    <div className="mt-3 space-y-2">
      {repairs[c.vin].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(r => (
        <div
          key={r.guid}
          className="border rounded p-3"
          onClick={async () => {
            // переключаем раскрытие деталей заказ-наряда
            setExpandedRepairDetails(prev => ({
              ...prev,
              [r.guid]: !prev[r.guid]
            }));

            // если деталей ещё нет — загружаем
            if (!repairDetails[r.guid]) {
              const res = await fetch(
                `${BASE_URL}?path=communication/contact/event_repair&guid=${r.guid}`
              );
              const data = await res.json();
              setRepairDetails(p => ({
                ...p,
                [r.guid]: data.data
              }));
            }
          }}
        >
          <p className="font-semibold">{new Date(r.date).toLocaleDateString("ru-RU")}</p>
          <p>{getRepairTypeLabel(r.type)}</p>
          <p className="text-sm text-gray-600">Пробег автомобиля: {r.mileage} км</p>

          {expandedRepairDetails[r.guid] && repairDetails[r.guid] && (
            <div className="mt-2 text-sm">
              {repairDetails[r.guid].works?.length > 0 && (
                <>
                  <p className="font-semibold">Работы:</p>
                  <ul className="list-disc ml-4">
                    {repairDetails[r.guid].works.map((w,i)=><li key={i}>{w.name}</li>)}
                  </ul>
                </>
              )}
              {repairDetails[r.guid].parts?.length > 0 && (
                <>
                  <p className="font-semibold mt-2">Запчасти:</p>
                  <ul className="list-disc ml-4">
                    {repairDetails[r.guid].parts.map((p,i)=><li key={i}>{p.name}</li>)}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <p className="mt-3 text-gray-500 italic">К сожалению, по вашему автомобилю не найдено истории обслуживания.</p>
  )
)}




{openedRecsVIN === c.vin && (
  <div className="mt-4 border rounded-lg p-3 bg-gray-50 space-y-3">
    <h4 className="font-semibold text-gray-800">
      Рекомендации по обслуживанию
    </h4>

    {recommendations[c.vin]?.length > 0 ? (
      recommendations[c.vin].map((rec, idx) => (
        <div
          key={idx}
          className={`p-3 rounded border text-sm whitespace-pre-line
            ${rec.included
              ? "bg-green-50 border-green-300"
              : "bg-yellow-50 border-yellow-300"}`}
        >
          <p className="font-semibold mb-1">
            {rec.included ? "🔴 Важные рекомендации" : "🟡 Рекомендуется к выполнению"}
          </p>

          <p>{rec.description}</p>
        </div>
      ))
    ) : (
      <p className="text-gray-500 italic">
        К сожалению, по вашему автомобилю не найдено рекомендаций по обслуживанию.
      </p>
    )}
  </div>
)}









{/* Кнопки оформления полисов */}
{openedInsuranceVIN === c.vin && (
  <div className="mt-4 border rounded-lg p-3 bg-indigo-50 space-y-3">
    <h4 className="font-semibold text-gray-800">
      Действующие страховые полисы
    </h4>

    {insurancePolicies[c.vin]?.length > 0 ? (
      <>
        {insurancePolicies[c.vin].map((policy, idx) => (
          <div key={idx} className="p-3 border rounded bg-white text-sm">
            <p className="font-semibold">{policy.view}</p>
            <p>
              Дата начала:{" "}
              {new Date(policy.dateStart).toLocaleDateString("ru-RU")}
            </p>
            <p>
              Дата окончания:{" "}
              {new Date(policy.dateEnd).toLocaleDateString("ru-RU")}
            </p>
          </div>
        ))}

        {insurancePolicies[c.vin].some(p => isRenewAllowed(p.dateEnd)) ? (
          <button
            onClick={() => {
              setInsuranceForm({
                name: "",
                phone: "",
                model: `${c.brand} ${c.model}`,
                vin: c.vin,
                action: "renew"
              });
              setInsuranceModalOpen(true);
            }}
            className="w-full bg-orange-500 text-white py-2 rounded"
          >
            Продлить полис
          </button>
        ) : (
          <p className="text-sm text-gray-500 italic text-center">
            Продление будет доступно за 45 дней до окончания полиса
          </p>
        )}
      </>
    ) : (
      <>
        <p className="text-sm text-gray-500 italic text-center">
          К сожалению, активные страховые полисы в нашей системе не найдены.
        </p>

        <button
          onClick={() => {
            setInsuranceForm({
              name: "",
              phone: "",
              model: `${c.brand} ${c.model}`,
              vin: c.vin,
              action: "new"
            });
            setInsuranceModalOpen(true);
          }}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Оформить полис
        </button>
      </>
    )}
  </div>
)}



          

          
         
  </div> // <-- обязательно закрываем карточку автомобиля
))}







      
      <button
        onClick={() => setShowCarForm(true)}
        className="w-full bg-[#86c53f] text-white py-3 rounded-lg mb-4"
      >
        + Добавить автомобиль
      </button>

      <div className="space-y-4 max-w-md mx-auto">
        <button onClick={() => navigate("/BonusPage")}
          className="w-full bg-[#86c53f] text-white py-3 rounded-lg"> 
          Мой бонусный счет </button> 
      </div>

       
      {/* Связь */} 
      <div className="mt-10"> 
        <h3 className="text-gray-800 text-lg font-semibold mb-2">Связаться с нами</h3> 
        <p className="text-gray-700 text-xl font-medium">8 800 333 21 30</p> </div>



      {/* Форма */}
      {showCarForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <select
              className="border p-2 mb-2 w-full"
              value={carForm.brand}
              onChange={e =>
                setCarForm({ ...carForm, brand: e.target.value, model: "" })
              }
            >
              <option value="">Марка</option>
              {Object.keys(BRANDS_MODELS).map(b => (
                <option key={b}>{b}</option>
              ))}
            </select>

            <select
              className="border p-2 mb-2 w-full"
              disabled={!carForm.brand}
              value={carForm.model}
              onChange={e =>
                setCarForm({ ...carForm, model: e.target.value })
              }
            >
              <option value="">Модель</option>
              {carForm.brand &&
                BRANDS_MODELS[carForm.brand].map(m => (
                  <option key={m}>{m}</option>
                ))}
            </select>

            <input
  className={`border p-2 mb-1 w-full ${vinError ? "border-red-500" : ""}`}
  placeholder="VIN"
  value={carForm.vin}
  onChange={e => {
    const value = e.target.value.toUpperCase();
    setCarForm({ ...carForm, vin: value });

    if (vinError) setVinError("");
  }}
/>

{vinError && (
  <p className="text-red-500 text-sm mb-2">{vinError}</p>
)}

            <input
              className="border p-2 mb-4 w-full"
              placeholder="Гос. номер"
              value={carForm.plate}
              onChange={e =>
                setCarForm({ ...carForm, plate: e.target.value.toUpperCase() })
              }
            />

            <button
  onClick={saveCar}
  disabled={savingCar || !validateVIN(carForm.vin)}
  className={`w-full text-white py-2 rounded
    ${savingCar || !validateVIN(carForm.vin)
      ? "bg-gray-400"
      : "bg-[#86c53f]"}`}
>
  {savingCar ? "Сохранение..." : "Сохранить"}
</button>
            <button
              onClick={() => setShowCarForm(false)}
              className="w-full mt-2 bg-gray-200 py-2 rounded"
            >
              Отмена
            </button>
          </div>
        </div>
      )}




{insuranceModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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
            alert("Заявка успешно отправлена!");
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
        } catch (e) {
          alert("Ошибка сети");
        } finally {
          setInsuranceSending(false);
        }
      }}
      className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-3">
        {insuranceForm.action === "renew"
          ? "Продление страхового полиса"
          : "Оформление страхового полиса"}
      </h3>

      <input
        required
        placeholder="Имя"
        className="w-full p-2 border rounded mb-2"
        value={insuranceForm.name}
        onChange={(e) =>
          setInsuranceForm({ ...insuranceForm, name: e.target.value })
        }
      />

      <input
        required
        placeholder="Телефон"
        className="w-full p-2 border rounded mb-2"
        value={insuranceForm.phone}
        onChange={(e) =>
          setInsuranceForm({ ...insuranceForm, phone: e.target.value })
        }
      />

      <input
        disabled
        className="w-full p-2 border rounded mb-2 bg-gray-100"
        value={insuranceForm.model}
      />

      <input
        disabled
        className="w-full p-2 border rounded mb-4 bg-gray-100"
        value={insuranceForm.vin}
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setInsuranceModalOpen(false)}
          className="px-4 py-2 border rounded"
        >
          Отмена
        </button>
        <button
          disabled={insuranceSending}
          className="px-4 py-2 bg-[#86c53f] text-white rounded"
        >
          {insuranceSending ? "Отправка..." : "Отправить"}
        </button>
      </div>
    </form>
  </div>
)}











      
            <BottomNav />
    </div>
  );
}


