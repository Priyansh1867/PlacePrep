import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError) {
      if (prevProps.resetKey !== this.props.resetKey || prevProps.children !== this.props.children) {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] p-6 sm:p-8 bg-white rounded-3xl border border-rose-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4 my-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-black text-slate-900">
              Something went wrong loading this section
            </h3>
            <p className="text-xs text-slate-600 mt-1 font-mono bg-slate-50 p-2 rounded-xl border border-slate-200">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Component</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
