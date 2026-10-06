import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  Package,
} from "lucide-react";

const API_URL = "https://prog-av.ru/svr/svr-catalog.php";

const LOCATION_OPTIONS = [
  { value: "lada-vasileostrovsky", label: "LADA Василеостровский", city: "spb" },
  { value: "lada-kupchino", label: "LADA Купчино", city: "spb" },
  { value: "lada-parnas", label: "LADA Парнас", city: "spb" },
  { value: "geely-vasileostrovsky", label: "Geely Василеостровский", city: "spb" },
  { value: "changan-kupchino", label: "Changan Купчино", city: "spb" },
  { value: "lada-novgorod", label: "LADA Новгород", city: "novgorod" },
  { value: "lada-pskov", label: "LADA Псков", city: "pskov" },
  { value: "lada-velikie-luki", label: "LADA Великие Луки", city: "pskov" },
  { value: "lada-petrozavodsk", label: "LADA Петрозаводск", city: "petrozavodsk" },
  { value: "lada-murmansk", label: "LADA Мурманск", city: "murmansk" },
];

const uniq = (arr) =>
  [...new Set(
    arr.filter(
      (v) =>
        v !== undefined &&
        v !== null &&
        String(v).trim() !== "" &&
        String(v).trim() !== "_"
    )
  )];

function normalize(v) {
  return String(v ?? "").trim().toLowerCase();
}

function money(v) {
  const value = Number(v);

  if (!Number.isFinite(value) || value <= 0) {
    return "—";
  }

  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function numberValue(v) {
  const value = Number(v);
  return Number.isFinite(value) ? value : 0;
}

function studdedMatches(value, selected) {
  const v = normalize(value);

  if (selected === "Шипованная") {
    return (
      v.includes("ш") ||
      v.includes("stud") ||
      v === "s"
    );
  }

  if (selected === "Нешипованная") {
    return (
      v === "" ||
      v === "_" ||
      v.includes("н") ||
      v.includes("non") ||
      v.includes("нет")
    );
  }

  return true;
}

/*
 * Один и тот же товар может приходить из SVR
 * несколькими строками — например, по разным территориям.
 *
 * Объединяем такие строки в одну карточку:
 * - остаток суммируем;
 * - остатки по территориям сохраняем отдельно;
 * - картинку и РРЦ берём из первой подходящей записи.
 */
function aggregate(products) {
  const map = new Map();

  for (const p of products) {
    const key =
      p.id ||
      [
        p.categoryId,
        p.brand,
        p.model,
        p.width,
        p.profile,
        p.diameter,
        p.mnfCode,
      ]
        .map(normalize)
        .join("|");

    if (!map.has(key)) {
      map.set(key, {
        ...p,
        stock: 0,
        territories: [],
      });
    }

    const item = map.get(key);
    const stock = numberValue(p.stock);

    item.stock += stock;

    if (p.territory && stock > 0) {
      const territoryName = String(p.territory).trim();

      const existing = item.territories.find(
        (x) => normalize(x.name) === normalize(territoryName)
      );

      if (existing) {
        existing.stock += stock;
      } else {
        item.territories.push({
          name: territoryName,
          stock,
        });
      }
    }

    if (!item.picture && p.picture) {
      item.picture = p.picture;
    }

    if (!item.rrp && p.rrp) {
      item.rrp = p.rrp;
    }

    if (!item.name && p.name) {
      item.name = p.name;
    }

    if (!item.model && p.model) {
      item.model = p.model;
    }
  }

  for (const item of map.values()) {
    item.territories.sort(
      (a, b) => numberValue(b.stock) - numberValue(a.stock)
    );
  }

  return [...map.values()];
}

export default function TiresWheelsPage() {
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loadedAt, setLoadedAt] = useState("");
  const [catalogCount, setCatalogCount] = useState(0);

  const [tab, setTab] = useState("tires");
  const [location, setLocation] = useState("lada-vasileostrovsky");

  const [width, setWidth] = useState("");
  const [profile, setProfile] = useState("");
  const [diameter, setDiameter] = useState("");
  const [season, setSeason] = useState("");
  const [studded, setStudded] = useState("");
  const [brand, setBrand] = useState("");

  const [showResults, setShowResults] = useState(false);

  const [orderProduct, setOrderProduct] = useState(null);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", quantity: 1, tireService: false, wheelStorage: false });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");

  const selectedLocation =
    LOCATION_OPTIONS.find((option) => option.value === location) ||
    LOCATION_OPTIONS[0];

  const city = selectedLocation.city;
  const cityLabel =
    city === "spb"
      ? "Санкт-Петербург"
      : city === "novgorod"
        ? "Великий Новгород"
        : city === "pskov"
          ? "Псков"
          : city === "petrozavodsk"
            ? "Петрозаводск"
            : city === "murmansk"
              ? "Мурманск"
              : city;

  async function loadCatalog() {
    setLoading(true);
    setError("");

    try {
      const url = `${API_URL}?city=${encodeURIComponent(city)}`;

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.details ||
            data.error ||
            `Ошибка загрузки каталога: HTTP ${response.status}`
        );
      }

      if (!data.ok) {
        throw new Error(
          data.error || "Сервер не подтвердил загрузку каталога"
        );
      }

      if (!Array.isArray(data.products)) {
        throw new Error(
          "API вернул ответ без массива products"
        );
      }

      setCatalog(data.products);
      setCatalogCount(data.products.length);

      if (data.updatedAt) {
        setLoadedAt(
          new Date(data.updatedAt).toLocaleString("ru-RU")
        );
      } else {
        setLoadedAt(
          new Date().toLocaleString("ru-RU")
        );
      }

      setShowResults(false);
    } catch (e) {
      console.error("Tires/Wheels catalog error:", e);

      setError(
        e?.message ||
          "Не удалось загрузить каталог"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog();
  }, [city]);

  const tires = useMemo(
    () =>
      catalog.filter(
        (p) => String(p.categoryId) === "1"
      ),
    [catalog]
  );

  const disks = useMemo(
    () =>
      catalog.filter(
        (p) => String(p.categoryId) === "2"
      ),
    [catalog]
  );

  const source = tab === "tires" ? tires : disks;

  /*
   * Для шин подбор идёт по схеме:
   * ширина → профиль → диаметр.
   * Для дисков:
   * диаметр → ширина.
   */
  const widths = useMemo(() => {
    const filteredSource =
      tab === "disks"
        ? source.filter(
            (p) =>
              !diameter ||
              normalize(p.diameter) === normalize(diameter)
          )
        : source;

    return uniq(filteredSource.map((p) => p.width)).sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [source, tab, diameter]);

  const profiles = useMemo(
    () =>
      uniq(
        source
          .filter(
            (p) =>
              tab === "tires" &&
              (!width || normalize(p.width) === normalize(width))
          )
          .map((p) => p.profile)
      ).sort((a, b) => Number(a) - Number(b)),
    [source, tab, width]
  );

  const diameters = useMemo(() => {
    if (tab === "disks") {
      return uniq(source.map((p) => p.diameter)).sort(
        (a, b) => Number(a) - Number(b)
      );
    }

    return uniq(
      source
        .filter(
          (p) =>
            (!width || normalize(p.width) === normalize(width)) &&
            (!profile || normalize(p.profile) === normalize(profile))
        )
        .map((p) => p.diameter)
    ).sort((a, b) => Number(a) - Number(b));
  }, [source, tab, width, profile]);

  /*
   * Бренды.
   */
  const brands = useMemo(
    () =>
      uniq(
        source.map((p) => p.brand)
      ).sort((a, b) =>
        String(a).localeCompare(String(b), "ru")
      ),
    [source]
  );

  /*
   * Сезоны только для шин.
   */
  const seasons = useMemo(
    () =>
      uniq(
        tires.map((p) => p.season)
      ),
    [tires]
  );

  /*
   * Шипованность показываем только для зимних шин.
   * В SVR встречаются обозначения вроде "Ш." / "Н.".
   * На интерфейсе приводим их к понятным названиям.
   */
  const studdedOptions = useMemo(() => {
    const winterTires = tires.filter(
      (p) => normalize(p.season).includes("зим")
    );

    const values = winterTires.map((p) => normalize(p.studded));
    const options = [];

    if (
      values.some(
        (v) =>
          v.includes("ш") ||
          v.includes("stud") ||
          v === "s"
      )
    ) {
      options.push("Шипованная");
    }

    if (
      values.some(
        (v) =>
          v === "" ||
          v === "_" ||
          v.includes("н") ||
          v.includes("non") ||
          v.includes("нет")
      )
    ) {
      options.push("Нешипованная");
    }

    // Если SVR использует нестандартное обозначение,
    // всё равно показываем оба варианта для зимних шин.
    return options.length ? options : ["Шипованная", "Нешипованная"];
  }, [tires]);

  /*
   * Результаты поиска.
   */
  const results = useMemo(() => {
    if (!showResults) {
      return [];
    }

    const filtered = source.filter(
      (p) =>
        (!width ||
          normalize(p.width) === normalize(width)) &&

        (!profile ||
          normalize(p.profile) === normalize(profile)) &&

        (!diameter ||
          normalize(p.diameter) === normalize(diameter)) &&

        (!brand ||
          normalize(p.brand) === normalize(brand)) &&

        (tab !== "tires" ||
          !season ||
          normalize(p.season) === normalize(season)) &&

        (tab !== "tires" ||
          !studded ||
          studdedMatches(p.studded, studded))
    );

    /*
     * Сначала товары с наличием,
     * внутри — по количеству остатка.
     */
    return aggregate(filtered).sort((a, b) => {
      const stockDiff =
        numberValue(b.stock) - numberValue(a.stock);

      if (stockDiff !== 0) {
        return stockDiff;
      }

      return String(a.brand || "").localeCompare(
        String(b.brand || ""),
        "ru"
      );
    });
  }, [
    source,
    width,
    profile,
    diameter,
    brand,
    season,
    studded,
    tab,
    showResults,
  ]);

  function getProductTitle(product, type) {
    const title = product.model || product.name || "Товар";
    const size =
      type === "disks"
        ? [
            product.diameter ? `R${product.diameter}` : "",
            product.width ? `${product.width}J` : "",
          ]
            .filter(Boolean)
            .join(" · ")
        : [
            product.width,
            product.profile,
            product.diameter ? `R${product.diameter}` : "",
          ]
            .filter(Boolean)
            .join("/");

    return [product.brand, title, size].filter(Boolean).join(" · ");
  }

  function openOrder(product, type) {
    const stock = Math.max(0, Math.floor(numberValue(product.stock)));

    if (stock < 2) {
      alert("Минимальный заказ — 2 шт.");
      return;
    }

    setOrderProduct({ product, type });
    setOrderSuccess("");
    setOrderForm({ name: "", phone: "", quantity: 2, tireService: false, wheelStorage: true });
  }

  async function handleOrderSubmit(e) {
    e.preventDefault();

    if (orderSubmitting || !orderProduct) return;

    const product = orderProduct.product;
    const type = orderProduct.type;
    const stock = Math.max(0, Math.floor(numberValue(product.stock)));
    const quantity = Math.floor(Number(orderForm.quantity) || 0);
    if (![2, 4, 6, 8].includes(quantity)) {
      alert("Количество можно заказать только 2, 4, 6 или 8 шт.");
      return;
    }
    if (stock < quantity) {
      alert(`Доступно только ${stock} шт.`);
      return;
    }

    setOrderSubmitting(true);

    try {
      const productTitle = getProductTitle(product, type);
      const unitPrice = numberValue(product.rrp);
      const totalPrice = unitPrice * quantity;

      const res = await fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orderForm.name,
          phone: orderForm.phone,
          requestType: "Заявка на покупку Шин / Дисков",
          orderType: type === "tires" ? "Шины" : "Диски",
          city: cityLabel,
          location: selectedLocation.label,
          article: product.mnfCode || "",
          product: productTitle,
          quantity,
          unitPrice,
          totalPrice,
          stock,
          tireService: orderForm.tireService,
          wheelStorage: orderForm.wheelStorage,
        }),
      });

      if (!res.ok) {
        throw new Error("Ошибка при отправке заявки");
      }

      setOrderSuccess(
        `Спасибо за заказ ${type === "tires" ? "шин" : "дисков"} «${productTitle}». В ближайшее время с вами свяжется менеджер для подтверждения заказа.`
      );
      setOrderProduct(null);
      setOrderForm({ name: "", phone: "", quantity: 2, tireService: false, wheelStorage: true });
    } catch (err) {
      console.error("Order submit error:", err);
      alert("Ошибка при отправке. Попробуйте позже.");
    } finally {
      setOrderSubmitting(false);
    }
  }

  function reset() {
    setWidth("");
    setProfile("");
    setDiameter("");
    setBrand("");
    setSeason("");
    setStudded("");
    setShowResults(false);
  }

  function changeTab(nextTab) {
    setTab(nextTab);
    setWidth("");
    setProfile("");
    setDiameter("");
    setBrand("");
    setSeason("");
    setStudded("");
    setShowResults(false);
  }

  const selectedSize =
    tab === "disks"
      ? diameter || width
        ? [diameter ? `R${diameter}` : "", width ? `${width}J` : ""]
            .filter(Boolean)
            .join(" · ")
        : ""
      : width || profile || diameter
        ? [
            width,
            profile,
            diameter ? `R${diameter}` : "",
          ]
            .filter(Boolean)
            .join("/")
        : "";

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24 text-gray-900">

      {/* HEADER */}
      <button
        onClick={() => navigate("/")}
        className="text-blue-600 flex items-center mb-4"
      >
        <ArrowLeft className="mr-2" /> Назад
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Шины и диски
      </h1>

      <p className="text-xs text-gray-500 text-center mb-4">
        Актуальное наличие
      </p>

      {/* TABS */}
      <div className="grid grid-cols-2 bg-white rounded-xl overflow-hidden border border-gray-100 mb-4">

          {[
            ["tires", "Шины"],
            ["disks", "Диски"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => changeTab(key)}
              className={`py-3 font-semibold border-b-2 ${
                tab === key
                  ? "border-black"
                  : "border-transparent text-gray-400"
              }`}
            >
              {label}
            </button>
          ))}

        </div>

      <main>

        {/* LOCATION */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Локация
          </label>
          <div className="relative">
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setWidth("");
                setProfile("");
                setDiameter("");
                setSeason("");
                setStudded("");
                setBrand("");
                setShowResults(false);
              }}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-gray-400"
            >
              {LOCATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Наличие загружается из кабинета поставщика: {cityLabel}
          </div>
        </div>

        {/* CATALOG NOT LOADED */}
        {!catalog.length &&
          !loading &&
          !error && (

            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">

              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package size={26} />
                </div>
              </div>

              <div className="text-lg font-bold">
                Подбор шин и дисков
              </div>

              <div className="text-sm text-gray-500 mt-2">
                Выберите размер и другие параметры,
                чтобы найти подходящие товары.
              </div>

              <button
                onClick={loadCatalog}
                className="mt-5 w-full rounded-xl bg-black text-white py-3.5 font-semibold flex items-center justify-center gap-2 active:opacity-80"
              >
                <RefreshCw size={18} />
                Загрузить каталог
              </button>

            </div>
          )}

        {/* LOADING */}
        {loading && (

          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">

            <div className="flex justify-center mb-4">
              <RefreshCw
                size={28}
                className="animate-spin"
              />
            </div>

            <div className="font-semibold">
              Загрузка каталога…
            </div>

            <div className="text-sm text-gray-500 mt-2">
              Получаем актуальные остатки
            </div>

          </div>
        )}

        {/* ERROR */}
        {error && !loading && (

          <div className="bg-white rounded-2xl p-5 shadow-sm">

            <div className="font-semibold text-red-600">
              Не удалось загрузить каталог
            </div>

            <div className="text-sm text-gray-600 mt-2 break-words">
              {error}
            </div>

            <button
              onClick={loadCatalog}
              className="mt-4 w-full rounded-xl bg-black text-white py-3 font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw size={17} />
              Повторить
            </button>

          </div>
        )}

        {/* CATALOG LOADED */}
        {!loading &&
          !error &&
          catalog.length > 0 && (

            <>

              {/* CATALOG STATUS */}
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">

                <div className="flex justify-between gap-3">

                  <div>

                    <div className="font-semibold">
                      {tab === "tires"
                        ? "Шины"
                        : "Диски"}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      В каталоге:{" "}
                      {tab === "tires"
                        ? tires.length
                        : disks.length}
                    </div>

                    {loadedAt && (
                      <div className="text-xs text-gray-400 mt-1">
                        Обновлено: {loadedAt}
                      </div>
                    )}

                  </div>

                  <button
                    onClick={loadCatalog}
                    disabled={loading}
                    className="p-2 rounded-xl border border-gray-200 self-start"
                    title="Обновить данные"
                    aria-label="Обновить данные"
                  >
                    <RefreshCw size={18} />
                  </button>

                </div>

              </div>

              {/* FILTERS */}
              <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">

                <div className="flex items-center gap-2 font-semibold">
                  <SlidersHorizontal size={18} />

                  Подбор{" "}
                  {tab === "tires"
                    ? "шин"
                    : "дисков"}
                </div>

                {tab === "tires" ? (
                  <>
                    {/* WIDTH */}
                    <Select
                      label="Ширина"
                      value={width}
                      setValue={(v) => {
                        setWidth(v);
                        setProfile("");
                        setDiameter("");
                        setShowResults(false);
                      }}
                      options={widths}
                    />

                    {/* PROFILE + DIAMETER */}
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        label="Профиль"
                        value={profile}
                        setValue={(v) => {
                          setProfile(v);
                          setDiameter("");
                          setShowResults(false);
                        }}
                        options={profiles}
                        disabled={!width}
                      />

                      <Select
                        label="Диаметр"
                        value={diameter}
                        setValue={(v) => {
                          setDiameter(v);
                          setShowResults(false);
                        }}
                        options={diameters}
                        disabled={!width}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* DIAMETER FIRST FOR WHEELS */}
                    <Select
                      label="Диаметр"
                      value={diameter}
                      setValue={(v) => {
                        setDiameter(v);
                        setWidth("");
                        setShowResults(false);
                      }}
                      options={diameters}
                    />

                    {/* WIDTH DEPENDS ON DIAMETER */}
                    <Select
                      label="Ширина"
                      value={width}
                      setValue={(v) => {
                        setWidth(v);
                        setShowResults(false);
                      }}
                      options={widths}
                      disabled={!diameter}
                    />
                  </>
                )}

                {/* SEASON */}
                {tab === "tires" && (
                  <Select
                    label="Сезон"
                    value={season}
                    setValue={(v) => {
                      setSeason(v);
                      setStudded("");
                      setShowResults(false);
                    }}
                    options={seasons}
                  />
                )}

                {/* STUDDED */}
                {tab === "tires" && normalize(season).includes("зим") && (
                  <Select
                    label="Шипованность"
                    value={studded}
                    setValue={(v) => {
                      setStudded(v);
                      setShowResults(false);
                    }}
                    options={studdedOptions}
                  />
                )}

                {/* BRAND */}
                <Select
                  label="Бренд"
                  value={brand}
                  setValue={(v) => {
                    setBrand(v);
                    setShowResults(false);
                  }}
                  options={brands}
                />

                {/* SELECTED SIZE */}
                {selectedSize && (
                  <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm">
                    <span className="text-gray-500">
                      Размер:{" "}
                    </span>

                    <span className="font-semibold">
                      {selectedSize}
                    </span>
                  </div>
                )}

                {/* SEARCH */}
                <button
                  onClick={() => setShowResults(true)}
                  className="w-full rounded-xl bg-black text-white py-3.5 font-semibold flex items-center justify-center gap-2 active:opacity-80"
                >
                  <Search size={18} />
                  Найти
                </button>

                {showResults && (
                  <button
                    onClick={reset}
                    className="w-full text-sm text-gray-500 py-1"
                  >
                    Сбросить подбор
                  </button>
                )}

              </div>

              {/* RESULTS */}
              {showResults && (

                <div className="mt-5">

                  <div className="flex justify-between items-center mb-3">

                    <h2 className="font-bold">
                      Найдено: {results.length}
                    </h2>

                    <span className="text-xs text-gray-500">
                      {tab === "tires"
                        ? "шин"
                        : "дисков"}
                    </span>

                  </div>

                  {/* NO RESULTS */}
                  {results.length === 0 && (

                    <div className="bg-white rounded-2xl p-6 text-center">

                      <div className="font-semibold">
                        Ничего не найдено
                      </div>

                      <div className="text-sm text-gray-500 mt-2">
                        Попробуйте изменить параметры
                        подбора.
                      </div>

                    </div>
                  )}

                  {/* RESULTS */}
                  {results.length > 0 && (

                    <div className="space-y-3">

                      {results.map((p) => (
                        <ProductCard
                          key={`${p.id}-${p.mnfCode || ""}`}
                          product={p}
                          type={tab}
                          onOrder={() => openOrder(p, tab)}
                        />
                      ))}

                    </div>
                  )}

                </div>
              )}

            </>
          )}

      </main>

      {orderProduct && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-[100] px-4 py-4 sm:py-6 overflow-y-auto overscroll-contain"
          onClick={() => !orderSubmitting && setOrderProduct(null)}
        >
          <form
            onSubmit={handleOrderSubmit}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white p-6 rounded-2xl w-full max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto shadow-xl my-auto overscroll-contain"
          >
            <button
              type="button"
              onClick={() => !orderSubmitting && setOrderProduct(null)}
              disabled={orderSubmitting}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
              aria-label="Закрыть"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4">Заказать {orderProduct.type === "tires" ? "шины" : "диски"}</h3>

            <div className="mb-4 overflow-hidden rounded-xl">
              <img
                src="/tire-storage-banner.png"
                alt="Бесплатное хранение резины — в подарок"
                className="w-full h-auto block"
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <div className="text-xs text-gray-500">Локация</div>
              <div className="font-medium">{selectedLocation.label}</div>
              <div className="text-xs text-gray-500 mt-2">Город поставщика</div>
              <div className="font-medium">{cityLabel}</div>
              <div className="text-xs text-gray-500 mt-2">Товар</div>
              <div className="font-medium">
                {getProductTitle(orderProduct.product, orderProduct.type)}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <div className="text-xs text-gray-500">Цена за 1 шт.</div>
                  <div className="font-semibold">{money(orderProduct.product.rrp)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Наличие</div>
                  <div className="font-semibold">{numberValue(orderProduct.product.stock)} шт.</div>
                </div>
              </div>
            </div>

            <label className="block mb-3">
              <span className="text-xs text-gray-500">Количество</span>
              <select
                required
                className="w-full mt-1 px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-gray-400 bg-white"
                value={orderForm.quantity}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, quantity: Number(e.target.value) })
                }
              >
                {[2, 4, 6, 8].filter((quantity) => quantity <= Math.floor(numberValue(orderProduct.product.stock))).map((quantity) => (
                  <option key={quantity} value={quantity}>
                    {quantity} шт.
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500 mt-1 block">
                Минимальный заказ — 2 шт.
              </span>
            </label>

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Итого</span>
                <span className="text-lg font-bold">
                  {money(numberValue(orderProduct.product.rrp) * Number(orderForm.quantity || 0))}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-semibold mb-2">Дополнительные услуги</div>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-[#8cc63f]"
                  checked={orderForm.tireService}
                  onChange={(e) => setOrderForm({ ...orderForm, tireService: e.target.checked })}
                />
                <span className="text-sm">Шиномонтаж</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#8cc63f]/40 bg-[#8cc63f]/5 cursor-default">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-[#8cc63f]"
                  checked={true}
                  disabled
                  readOnly
                />
                <span className="text-sm font-medium">Хранение резины <span className="text-[#6fa52c]">— бесплатно</span></span>
              </label>
            </div>

            <input
              required
              type="text"
              placeholder="Ваше имя"
              autoComplete="name"
              className="w-full mb-3 px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-gray-400"
              value={orderForm.name}
              onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
            />

            <input
              required
              type="tel"
              placeholder="Телефон"
              autoComplete="tel"
              className="w-full mb-4 px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-gray-400"
              value={orderForm.phone}
              onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={orderSubmitting}
                onClick={() => setOrderProduct(null)}
                className="text-gray-600 px-3 py-2 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={orderSubmitting}
                className="bg-[#8cc63f] text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-60"
              >
                {orderSubmitting ? "Отправка…" : "Отправить"}
              </button>
            </div>

          </form>
        </div>
      )}

      {orderSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] px-4">
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-center">
            <button
              type="button"
              onClick={() => setOrderSuccess("")}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Закрыть"
            >
              ✕
            </button>

            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[#8cc63f]/15 flex items-center justify-center text-[#6fa52c] text-3xl">
              ✓
            </div>
            <h3 className="text-lg font-semibold mb-3">Заказ принят</h3>
            <p className="text-sm leading-6 text-gray-600">{orderSuccess}</p>

            <button
              type="button"
              onClick={() => setOrderSuccess("")}
              className="mt-5 bg-[#8cc63f] text-white px-5 py-2.5 rounded-xl font-medium"
            >
              Хорошо
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function Select({
  label,
  value,
  setValue,
  options,
  disabled = false,
}) {
  return (
    <label
      className={`block ${
        disabled ? "opacity-50" : ""
      }`}
    >

      <span className="text-xs text-gray-500">
        {label}
      </span>

      <div className="relative mt-1">

        <select
          disabled={disabled}
          value={value}
          onChange={(e) =>
            setValue(e.target.value)
          }
          className="appearance-none w-full rounded-xl border border-gray-200 bg-white px-3 py-3 pr-9 outline-none focus:border-black disabled:bg-gray-50"
        >

          <option value="">
            Любой
          </option>

          {options.map((x) => (
            <option
              key={String(x)}
              value={x}
            >
              {x}
            </option>
          ))}

        </select>

        <ChevronDown
          size={16}
          className="absolute right-3 top-3.5 pointer-events-none text-gray-400"
        />

      </div>

    </label>
  );
}

function ProductCard({ product, type, onOrder }) {
  const hasStock = numberValue(product.stock) > 0;

  const size =
    type === "disks"
      ? [
          product.diameter ? `R${product.diameter}` : "",
          product.width ? `${product.width}J` : "",
        ]
          .filter(Boolean)
          .join(" · ")
      : [
          product.width,
          product.profile,
          product.diameter ? `R${product.diameter}` : "",
        ]
          .filter(Boolean)
          .join("/");

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">

      {/* IMAGE */}
      {product.picture ? (
        <div className="relative h-44 bg-white flex items-center justify-center">
          <img
            src={product.picture}
            alt={
              product.name ||
              product.model ||
              "Товар"
            }
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-44 object-contain bg-white"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.querySelector(".image-fallback")?.classList.remove("hidden");
            }}
          />
          <div className="image-fallback hidden absolute inset-0 flex items-center justify-center bg-gray-50">
            <Package size={30} className="text-gray-300" />
          </div>
        </div>
      ) : (
        <div className="h-44 flex items-center justify-center bg-gray-50">
          <Package size={30} className="text-gray-300" />
        </div>
      )}

      <div className="p-4">

        {/* BRAND */}
        {product.brand && (
          <div className="text-xs text-gray-500">
            {product.brand}
          </div>
        )}

        {/* MODEL */}
        <div className="font-bold mt-1">
          {product.model ||
            product.name ||
            "Товар"}
        </div>

        {/* SIZE */}
        {size && (
          <div className="text-sm font-semibold mt-2">
            {size}
          </div>
        )}

        {/* TIRES DETAILS */}
        {type === "tires" && (
          <>
            {product.mnfCode && (
              <div className="text-xs text-gray-500 mt-1">
                Артикул: {product.mnfCode}
              </div>
            )}

            {product.season && (
              <div className="text-xs text-gray-500 mt-1">
                Сезон: {product.season}

                {product.studded &&
                  product.studded !== "_" &&
                  ` · ${product.studded}`}
              </div>
            )}

            {(product.speed ||
              product.load) && (

              <div className="text-xs text-gray-500 mt-1">

                {product.load &&
                  `Индекс нагрузки: ${product.load}`}

                {product.load &&
                  product.speed &&
                  " · "}

                {product.speed &&
                  `Скорость: ${product.speed}`}

              </div>
            )}

            {product.runFlat && (
              <div className="text-xs text-gray-500 mt-1">
                RunFlat
              </div>
            )}
          </>
        )}

        {/* WHEEL DETAILS */}
        {type === "disks" && (
          <>
            {product.mnfCode && (
              <div className="text-xs text-gray-500 mt-1">
                Артикул: {product.mnfCode}
              </div>
            )}

            {product.origin && (
              <div className="text-xs text-gray-500 mt-1">
                Происхождение: {product.origin}
              </div>
            )}
          </>
        )}

        {/* PRICE + STOCK */}
        <div className="flex justify-between items-end mt-4">

          <div>

            <div className="text-xs text-gray-500">
              Стоимость
            </div>

            <div className="text-lg font-bold">
              {money(product.rrp)}
            </div>

          </div>

          <div
            className={`text-right ${
              hasStock
                ? ""
                : "text-red-500"
            }`}
          >

            <div className="text-xs text-gray-500">
              Наличие
            </div>

            <div className="font-semibold">
              {hasStock
                ? `${product.stock} шт.`
                : "нет"}
            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={onOrder}
          disabled={numberValue(product.stock) < 2}
          className="w-full mt-4 rounded-xl bg-[#8cc63f] text-white py-3 font-semibold active:opacity-80 hover:bg-[#7ab82c] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {numberValue(product.stock) < 2 ? "Мин. заказ — 2 шт." : "Заказать"}
        </button>

        {/* TERRITORIES */}
        {product.territories?.length > 0 && (

          <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-1">

            {product.territories.map(
              (territory) => (

                <div
                  key={territory.name}
                  className="flex justify-between gap-3"
                >

                  <span>
                    {territory.name}
                  </span>

                  <span className="font-medium">
                    {territory.stock} шт.
                  </span>

                </div>

              )
            )}

          </div>
        )}

        {/* MANUFACTURER ARTICLE */}
        {product.mnfCode && (
          <div className="mt-3 text-xs text-gray-500 break-all">
            Артикул производителя: {product.mnfCode}
          </div>
        )}

      </div>
    </div>
  );
}
