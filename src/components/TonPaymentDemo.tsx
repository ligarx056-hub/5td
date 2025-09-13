import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Zap, Shield, ArrowRight, RefreshCw } from 'lucide-react';

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

const TonPaymentDemo: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [tonRates, setTonRates] = useState<TonRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState(0.5);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const destinationAddress = "UQDbnrjL3Mw4ikGWXdl9OVq6MCS3-qNb6WTmn8VnTB-olI2a";

  // Fetch TON rates from the API
  const fetchTonRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://tonapi.io/v2/rates?tokens=ton&currencies=usd');
      const data = await response.json();
      setTonRates(data.rates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch TON rates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch rates on component mount and set up auto-refresh
  useEffect(() => {
    fetchTonRates();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTonRates, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle payment
  const handlePayment = async () => {
    if (!wallet) {
      alert('Iltimos, avval hamyoningizni ulang!');
      return;
    }

    setIsPaymentLoading(true);

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [
        {
          address: destinationAddress,
          amount: (paymentAmount * 1e9).toString(),
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
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(4);
  };

  const formatPercentage = (percentage: string) => {
    const isPositive = percentage.startsWith('+');
    const cleanPercentage = percentage.replace(/[+−-]/, '');
    return { isPositive, value: cleanPercentage };
  };

  const calculateUsdValue = () => {
    if (!tonRates) return '0.00';
    return (paymentAmount * tonRates.TON.prices.USD).toFixed(2);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50">
        {/* Header */}
        <div className="text-center p-8 pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">💎 TON To'lov Demo</h1>
          <p className="text-slate-400">Xavfsiz va tez to'lovlar</p>
        </div>

        {/* TON Price Display */}
        <div className="px-8 pb-6">
          <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                TON Narxi
              </h3>
              <button 
                onClick={fetchTonRates}
                disabled={loading}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              </div>
            ) : tonRates ? (
              <div>
                <div className="text-3xl font-bold text-white mb-3">
                  ${formatPrice(tonRates.TON.prices.USD)}
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {[
                    { label: '24s', value: tonRates.TON.diff_24h.USD },
                    { label: '7kun', value: tonRates.TON.diff_7d.USD },
                    { label: '30kun', value: tonRates.TON.diff_30d.USD }
                  ].map((item, index) => {
                    const { isPositive, value } = formatPercentage(item.value);
                    return (
                      <div key={index} className="flex items-center gap-1">
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                        <span className="text-slate-300">{item.label}:</span>
                        <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-xs text-slate-500 mt-3">
                  Oxirgi yangilanish: {lastUpdated.toLocaleTimeString('uz-UZ')}
                </div>
              </div>
            ) : (
              <div className="text-red-400">Ma'lumotlarni yuklashda xatolik</div>
            )}
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="px-8 pb-6">
          <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-700/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-400" />
              Hamyon Ulash
            </h3>
            
            <div className="ton-connect-wrapper">
              <TonConnectButton className="ton-connect-page__button" />
            </div>
            
            {wallet && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Shield className="w-4 h-4" />
                  Hamyon ulandi: {wallet.account.address.slice(0, 8)}...{wallet.account.address.slice(-8)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div className="px-8 pb-8">
          <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-700/20">
            <h3 className="text-lg font-semibold text-white mb-4">To'lov Miqdori</h3>
            
            <div className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  TON miqdori
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0.01"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.5"
                />
              </div>

              {/* USD Equivalent */}
              {tonRates && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">USD qiymati:</span>
                    <span className="text-xl font-semibold text-white">
                      ${calculateUsdValue()}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!wallet || isPaymentLoading || paymentAmount <= 0}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  !wallet || isPaymentLoading || paymentAmount <= 0
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02]'
                }`}
              >
                {isPaymentLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    💸 To'lov Qilish
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {!wallet && (
                <p className="text-sm text-slate-400 text-center">
                  To'lov qilish uchun hamyoningizni ulang
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <p className="text-xs text-slate-500">
            TON Connect orqali xavfsiz to'lovlar
          </p>
        </div>
      </div>
    </div>
  );
};

export default TonPaymentDemo;