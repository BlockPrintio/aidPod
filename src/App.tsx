import Routes from './Routes';

function App() {
  try {
    return <Routes />;
  } catch (error) {
    console.error("App render error:", error);
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p>Please refresh the page or check the console for errors.</p>
      </div>
    );
  }
}

export default App;

