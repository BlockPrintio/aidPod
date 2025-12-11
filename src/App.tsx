import { WalletProvider } from './hooks/useWallet';
import Routes from './Routes';
import './styles/index.css';

function App() {
  return (
    <WalletProvider>
      <div className="App">
        <Routes />
      </div>
    </WalletProvider>
  );
}

export default App;

