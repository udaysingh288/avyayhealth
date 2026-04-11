import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-dvh bg-warm-oatmeal flex flex-col items-center justify-center p-6 text-center"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="w-20 h-20 rounded-full bg-triage-red-light flex items-center justify-center mb-6">
            <span
              className="material-symbols-outlined text-triage-red"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '40px' }}
            >
              error
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-forest-slate mb-3">
            Something went wrong
          </h1>
          <p className="text-sage-muted text-base mb-8 max-w-xs leading-relaxed">
            Please close the app and reopen it. If the problem continues, call your care team.
          </p>
          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="w-full h-14 bg-primary text-white rounded-full font-display font-bold text-lg shadow-soft flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">refresh</span>
              Reload App
            </button>
            <a
              href="tel:911"
              className="w-full h-14 bg-white border-2 border-triage-red text-triage-red rounded-full font-display font-bold text-base flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                call
              </span>
              Call Care Team
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
