import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import FragmentClone from './components/FragmentClone';
import './App.css';

const manifestUrl = "https://ton-connect.github.io/demo-dapp/tonconnect-manifest.json";

function App() {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <div className="min-h-screen bg-[#1a2026]">
        <FragmentClone />
      </div>
    </TonConnectUIProvider>
  );
}

export default App;