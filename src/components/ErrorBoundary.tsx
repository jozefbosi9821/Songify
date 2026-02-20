import { Component, type ErrorInfo, type ReactNode } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <LanguageContext.Consumer>
          {(context) => {
            // Fallback strings if context is missing (e.g. LanguageProvider crashed)
            const t = context?.t || {
              somethingWentWrong: 'Something went wrong',
              reloadApp: 'Reload App'
            };
            
            return (
            <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center p-10">
              <h1 className="text-3xl font-bold text-red-500 mb-4">{t.somethingWentWrong}</h1>
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 max-w-2xl w-full overflow-auto">
                <p className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </p>
              </div>
              <button 
                className="mt-8 px-8 py-3 bg-[#1ed760] text-black font-bold rounded-full hover:scale-105 transition shadow-lg"
                onClick={() => window.location.reload()}
              >
                {t.reloadApp}
              </button>
            </div>
            );
          }}
        </LanguageContext.Consumer>
      );
    }

    return this.props.children;
  }
}
