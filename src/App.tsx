import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import Routes from './Routes';

// Error Boundary for the entire app
class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Error Boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: '#fff',
          color: '#000',
          minHeight: '100vh',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1 style={{ color: 'red' }}>Application Error</h1>
          <p>Something went wrong loading the application.</p>
          <pre style={{
            textAlign: 'left',
            background: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
            maxWidth: '800px',
            margin: '20px auto'
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('App component rendering...');
  
  return (
    <AppErrorBoundary>
      <Suspense fallback={
        <div style={{
          padding: '50px',
          textAlign: 'center',
          background: '#fff',
          color: '#000',
          minHeight: '100vh',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2>Loading AidPod...</h2>
          <p>Please wait while we load the application.</p>
        </div>
      }>
        <Routes />
      </Suspense>
    </AppErrorBoundary>
  );
}

export default App;
