import React from 'react';
import {
  Car,
  Wrench,
  ShieldCheck,
  Calendar,
  ChevronRight,
  Sparkles,
  Phone,
  Clock,
  ArrowRight,
  Disc,
  AlertTriangle,
  FileText,
  Flame,
  X,
} from 'lucide-react';

/**
 * @typedef {Object} CarItem
 * @property {string|number} id
 * @property {string} brand
 * @property {string} model
 * @property {string} [plate]
 * @property {string} [vin]
 * @property {number} [mileage]
 * @property {string} [nextToDate]
 * @property {number} [nextToMileage]
 * @property {Array<{id: string|number, title: string, urgent?: boolean, cost?: string}>} [recommendations]
 * @property {Array<{type: string, number: string, expiresAt: string, isExpiringSoon?: boolean}>} [insurances]
 */

/**
 * @typedef {Object} PromoSlide
 * @property {string|number} id
 * @property {string} title
 * @property {string} [subtitle]
 * @property {string} [thumbnail]
 * @property {string} [badge]
 * @property {string} [link]
 */

/**
 * @typedef {Object} FilterChip
 * @property {string} id
 * @property {string} label
 * @property {boolean} [isActive]
 */

/**
 * PragmatikaHomeUI - Чистый презентационный Dumb-компонент
 * Отвечает исключительно за внешний вид и верстку интерфейса VK Mini App
 * согласно официальному брендбуку ГК «Прагматика».
 */
export default function PragmatikaHomeUI({
  // Данные пользователя и лояльности
  userName = 'Уважаемый клиент',
  bonusPoints = 0,
  cashbackPercent = 5,
  onOpenBonusModal = () => {},

  // Автомобили пользователя и блок "Что нужно моей машине"
  cars = [],
  selectedCarIndex = 0,
  onSelectCarIndex = () => {},
  onAddCar = () => {},
  onOpenServiceBooking = () => {},
  onOpenCarDetails = () => {},

  // Сезонный блок шин / переобувки
  tiresSeason = {
    season: 'winter', // 'winter' | 'summer'
    title: 'Сезонный шиномонтаж',
    description: 'Пора готовить авто к сезону: онлайн-запись без очередей и хранение колес',
    isReminderActive: true,
  },
  onOpenTiresPage = () => {},

  // Акции и бесконечный слайдер
  promos = [],
  activePromoIndex = 0,
  onPromoClick = () => {},
  onViewAllPromos = () => {},
  onNextPromo = () => {},
  onPrevPromo = () => {},

  // Фильтры (Чипсы)
  filterChips = [],
  onSelectChip = () => {},

  // Быстрые сервисы / меню
  onNavigate = () => {},
}) {
  const currentCar = cars.length > 0 ? cars[selectedCarIndex] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-pragmatika-black pb-28 font-sans antialiased selection:bg-pragmatika-green/20">
      
      {/* 1. Верхняя фирменная плашка / Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pragmatika-green/15 flex items-center justify-center text-pragmatika-green font-bold text-lg">
            П
          </div>
          <div>
            <h1 className="text-base font-bold text-pragmatika-dark leading-tight">
              Прагматика
            </h1>
            <p className="text-xs text-pragmatika-light">
              Официальный дилерский центр
            </p>
          </div>
        </div>

        {/* Кнопка бонусных баллов */}
        <button
          type="button"
          onClick={onOpenBonusModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 active:scale-95 transition-all text-xs font-semibold text-pragmatika-dark"
        >
          <Sparkles className="w-3.5 h-3.5 text-pragmatika-green" />
          <span>{bonusPoints.toLocaleString('ru-RU')} Б</span>
        </button>
      </header>

      <main className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        
        {/* 2. Приветствие и карта лояльности */}
        <section className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-pragmatika-light">
                Добро пожаловать
              </p>
              <h2 className="text-lg font-bold text-pragmatika-dark mt-0.5">
                {userName}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-pragmatika-green/15 text-pragmatika-dark">
              Кэшбэк {cashbackPercent}%
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pragmatika-green animate-pulse" />
              <span className="text-xs text-pragmatika-light">
                Программа привилегий активна
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenBonusModal}
              className="text-xs font-semibold text-pragmatika-dark hover:text-pragmatika-green transition-colors flex items-center gap-0.5"
            >
              Подробнее <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* 3. Блок "Что нужно моему автомобилю" & Умный гараж */}
        <section className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-pragmatika-green" />
              <h3 className="font-bold text-pragmatika-dark text-base">
                Что нужно авто
              </h3>
            </div>

            {/* Селектор автомобилей (если авто несколько) */}
            {cars.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {cars.map((car, idx) => (
                  <button
                    key={car.id || idx}
                    type="button"
                    onClick={() => onSelectCarIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedCarIndex === idx
                        ? 'bg-white text-pragmatika-dark shadow-xs'
                        : 'text-pragmatika-light hover:text-pragmatika-dark'
                    }`}
                  >
                    {car.brand || `Авто ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentCar ? (
            <div className="space-y-3">
              {/* Карточка выбранного авто */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-pragmatika-dark text-base">
                    {currentCar.brand} {currentCar.model}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-pragmatika-light">
                    {currentCar.plate && (
                      <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono font-medium text-pragmatika-dark">
                        {currentCar.plate}
                      </span>
                    )}
                    {currentCar.mileage && (
                      <span>{currentCar.mileage.toLocaleString('ru-RU')} км</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenCarDetails(currentCar)}
                  className="p-1.5 text-pragmatika-light hover:text-pragmatika-dark transition-colors"
                  title="Подробнее об автомобиле"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Расчет и статус следующего ТО */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-pragmatika-light mb-1">
                    <Calendar className="w-3.5 h-3.5 text-pragmatika-green" />
                    <span>Следующее ТО</span>
                  </div>
                  <p className="text-sm font-bold text-pragmatika-dark">
                    {currentCar.nextToDate || 'В срок по регламенту'}
                  </p>
                  {currentCar.nextToMileage && (
                    <p className="text-[11px] text-pragmatika-light mt-0.5">
                      до {currentCar.nextToMileage.toLocaleString('ru-RU')} км
                    </p>
                  )}
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-pragmatika-light mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-pragmatika-green" />
                    <span>Страховка (ОСАГО)</span>
                  </div>
                  {currentCar.insurances && currentCar.insurances.length > 0 ? (
                    <div>
                      <p className="text-sm font-bold text-pragmatika-dark">
                        {currentCar.insurances[0].isExpiringSoon ? (
                          <span className="text-amber-600 font-bold">Истекает скоро</span>
                        ) : (
                          'Действует'
                        )}
                      </p>
                      <p className="text-[11px] text-pragmatika-light mt-0.5">
                        до {currentCar.insurances[0].expiresAt}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-pragmatika-light mt-1">
                      Данные не указаны
                    </p>
                  )}
                </div>
              </div>

              {/* Рекомендации с последнего обслуживания */}
              {currentCar.recommendations && currentCar.recommendations.length > 0 && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Рекомендации мастера ({currentCar.recommendations.length})</span>
                  </div>
                  <ul className="space-y-1 text-xs text-pragmatika-dark pl-5 list-disc">
                    {currentCar.recommendations.slice(0, 2).map((rec, i) => (
                      <li key={rec.id || i}>{rec.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Если авто еще не добавлено */
            <div className="text-center py-5 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Car className="w-10 h-10 text-pragmatika-light mx-auto mb-2 opacity-60" />
              <h4 className="text-sm font-bold text-pragmatika-dark">
                Добавьте свой автомобиль
              </h4>
              <p className="text-xs text-pragmatika-light mt-1 max-w-xs mx-auto">
                Получайте персональный план ТО, рекомендации сервиса и напоминания по страховке
              </p>
              <button
                type="button"
                onClick={onAddCar}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-pragmatika-light text-pragmatika-dark text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                + Добавить авто
              </button>
            </div>
          )}

          {/* Главная кнопка быстрой записи на сервис */}
          <button
            type="button"
            onClick={onOpenServiceBooking}
            className="w-full py-3.5 px-4 rounded-xl bg-pragmatika-green text-white font-bold text-sm tracking-wide shadow-md shadow-pragmatika-green/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            <span>Записаться на сервис онлайн</span>
          </button>
        </section>

        {/* 4. Сезонный блок: Шины и шиномонтаж */}
        <section className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-pragmatika-dark flex-shrink-0">
                <Disc className="w-5 h-5 text-pragmatika-green" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-pragmatika-dark text-sm">
                    {tiresSeason.title}
                  </h3>
                  {tiresSeason.isReminderActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Сезон
                    </span>
                  )}
                </div>
                <p className="text-xs text-pragmatika-light mt-0.5 leading-relaxed">
                  {tiresSeason.description}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTiresPage}
            className="mt-3.5 w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-pragmatika-dark text-xs font-bold transition-all flex items-center justify-between border border-slate-100"
          >
            <span>Подобрать шины и записаться</span>
            <ArrowRight className="w-4 h-4 text-pragmatika-green" />
          </button>
        </section>

        {/* 5. Фильтр-чипсы (Chips) */}
        {filterChips.length > 0 && (
          <section className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1 -mx-4 px-4">
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => onSelectChip(chip.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                  chip.isActive
                    ? 'bg-pragmatika-green text-white shadow-xs'
                    : 'bg-white border border-pragmatika-light text-pragmatika-dark hover:border-pragmatika-dark'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </section>
        )}

        {/* 6. Бесконечный слайдер спецпредложений и акций */}
        <section className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-pragmatika-green" />
              <h3 className="font-bold text-pragmatika-dark text-base">
                Спецпредложения
              </h3>
            </div>
            <button
              type="button"
              onClick={onViewAllPromos}
              className="text-xs font-bold text-pragmatika-green hover:underline flex items-center gap-0.5"
            >
              Все акции ({promos.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {promos.length > 0 ? (
            <div className="relative rounded-xl overflow-hidden bg-slate-100">
              {/* Активный слайд */}
              <div
                onClick={() => onPromoClick(promos[activePromoIndex])}
                className="cursor-pointer group relative aspect-[16/9] w-full overflow-hidden bg-slate-900"
              >
                {promos[activePromoIndex].thumbnail ? (
                  <img
                    src={promos[activePromoIndex].thumbnail}
                    alt={promos[activePromoIndex].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pragmatika-dark to-slate-800 text-white p-4 text-center">
                    <p className="font-bold text-sm">
                      {promos[activePromoIndex].title}
                    </p>
                  </div>
                )}

                {/* Градиентный оверлей для читаемости текста */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5">
                  {promos[activePromoIndex].badge && (
                    <span className="self-start mb-1 px-2 py-0.5 rounded text-[10px] font-bold bg-pragmatika-green text-white">
                      {promos[activePromoIndex].badge}
                    </span>
                  )}
                  <h4 className="text-white font-bold text-sm leading-snug line-clamp-2">
                    {promos[activePromoIndex].title}
                  </h4>
                </div>
              </div>

              {/* Индикатор текущего слайда и пагинация */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-mono font-medium text-white flex items-center gap-1">
                <span>{activePromoIndex + 1}</span>
                <span className="opacity-50">/</span>
                <span>{promos.length}</span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-pragmatika-light">
              Загрузка актуальных предложений...
            </div>
          )}
        </section>

      </main>

      {/* 7. Нижняя навигация (Bottom Tab Bar) */}
      <PragmatikaBottomTabBar activeTab="home" onTabChange={onNavigate} />
    </div>
  );
}

/**
 * PragmatikaBottomTabBar - Нижний таб-бар приложения
 * Полупрозрачный фон с размытием, монохромные иконки, нативный вид
 */
export function PragmatikaBottomTabBar({
  activeTab = 'home',
  onTabChange = () => {},
}) {
  const tabs = [
    { id: 'home', label: 'Главная', icon: Car },
    { id: 'offers', label: 'Акции', icon: Flame },
    { id: 'service', label: 'Сервис', icon: Wrench },
    { id: 'profile', label: 'Профиль', icon: FileText },
    { id: 'contacts', label: 'Контакты', icon: Phone },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 safe-bottom shadow-lg shadow-black/5">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center py-1 group focus:outline-hidden transition-all"
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 group-active:scale-90 ${
                  isActive ? 'text-pragmatika-green stroke-[2.2]' : 'text-pragmatika-light stroke-[1.8]'
                }`}
              />
              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${
                  isActive ? 'text-pragmatika-green font-bold' : 'text-pragmatika-light'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * PragmatikaBottomSheet - Презентационная шторка снизу (Bottom Sheet)
 * Заменяет стандартные всплывающие окна по центру на нативный мобильный паттерн
 */
export function PragmatikaBottomSheet({
  isOpen = false,
  onClose = () => {},
  title = '',
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Клик по затемненной подложке для закрытия */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Сама шторка */}
      <div className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Хэндл (ручка) для свайпа / визуальный маркер нативности */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-2" />

        {/* Шапка шторки */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-pragmatika-dark">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-pragmatika-dark transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Контент шторки со скроллом */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
