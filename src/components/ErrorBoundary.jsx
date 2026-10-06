import React from "react";
import { RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-sm w-full text-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-[#f0f7e8] text-[#76aa34] mx-auto flex items-center justify-center mb-3">
              <RefreshCw size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Что-то пошло не так
            </h2>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Не удалось загрузить данные из-за временных ограничений сети. Нажмите кнопку для перезагрузки.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Home size={16} />
                <span>На главную</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
