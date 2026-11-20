import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-main, #0B0F17)',
            color: 'var(--text-main, #F1F5F9)',
            padding: '2rem 1rem',
            fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'var(--card-bg, #111827)',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: '#FFFFFF' }}>
              Something went wrong
            </h2>

            <p style={{ color: 'var(--text-secondary, #94A3B8)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              An unexpected error occurred while rendering this view. Your session and data remain safe. Try reloading the page or returning to the dashboard.
            </p>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '0.8rem',
                  color: '#FCA5A5',
                  textAlign: 'left',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  marginBottom: '1.75rem',
                  fontFamily: 'monospace'
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--primary, #06B6D4)',
                  color: '#042F2E',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} /> Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main, #F1F5F9)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <Home size={16} /> Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
