import React, { Suspense } from 'react';
import Routes from './Routes';

function App() {
  console.log('App component rendering...');
  
  try {
    return (
      <Suspense fallback={
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      }>
        <Routes />
      </Suspense>
    );
  } catch (error) {
    console.error("App render error:", error);
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red", background: "#fff" }}>
        <h1>App Error</h1>
        <p>{error?.message || 'Unknown error'}</p>
        <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '10px' }}>{error?.stack}</pre>
      </div>
    );
  }
}

export default App;
