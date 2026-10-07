import React from 'react';
import { PragmatikaBottomTabBar } from './PragmatikaHomeUI';

/**
 * PragmatikaLayout - Базовый презентационный макет экрана для VK Mini App
 * Обеспечивает нативный фон, статус-бар, безопасные отступы и фиксированный TabBar.
 */
export default function PragmatikaLayout({
  title = 'Прагматика',
  subtitle,
  rightAction,
  activeTab = 'home',
  onTabChange = () => {},
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-pragmatika-black pb-24 font-sans antialiased">
      {/* Верхний Header (если задан заголовок) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-base font-bold text-pragmatika-dark leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-pragmatika-light">{subtitle}</p>
          )}
        </div>
        {rightAction && <div>{rightAction}</div>}
      </header>

      {/* Основной контент */}
      <main className="max-w-lg mx-auto p-4 space-y-4">{children}</main>

      {/* Нижняя панель навигации */}
      <PragmatikaBottomTabBar
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </div>
  );
}
