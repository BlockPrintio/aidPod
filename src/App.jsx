import React from 'react';
import { WalletProvider } from './hooks/useWallet.jsx';
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
