import { useState, useEffect } from 'react';

export default function CurrencyTable() {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');

  // Target currencies to show
  const TARGET_CURRENCIES = ['USD', 'EUR', 'GBP', 'SGD', 'JPY', 'MYR', 'AUD', 'CNY'];

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        // Using open.er-api.com (free, no key required) base currency USD
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        // Calculate rates relative to IDR. 
        // ER-API gives: 1 USD = X Currency. So 1 USD = 15000 IDR.
        // To find 1 EUR in IDR: (1/rate_EUR) * rate_IDR
        const idrRate = data.rates['IDR'];
        const calculatedRates = {};
        
        TARGET_CURRENCIES.forEach(currency => {
          if (currency === 'USD') {
            calculatedRates[currency] = idrRate;
          } else if (data.rates[currency]) {
            const currencyToUsd = 1 / data.rates[currency];
            calculatedRates[currency] = currencyToUsd * idrRate;
          }
        });

        setRates(calculatedRates);
        setLastUpdate(new Date(data.time_last_update_unix * 1000).toLocaleString('id-ID'));
        setError(null);
      } catch (err) {
        console.error('Failed to fetch rates:', err);
        setError('Gagal memuat kurs. Menampilkan data terakhir jika tersedia (Offline Mode).');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(number);
  };

  const getFlagEmoji = (currencyCode) => {
    const flags = {
      'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'SGD': '🇸🇬', 
      'JPY': '🇯🇵', 'MYR': '🇲🇾', 'AUD': '🇦🇺', 'CNY': '🇨🇳'
    };
    return flags[currencyCode] || '🏳️';
  };

  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Memuat data kurs terkini...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {error && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-400 p-4 text-sm text-center">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
        {Object.entries(rates).map(([currency, rate]) => (
          <div key={currency} className="bg-[#0f0a1e]/90 p-5 hover:bg-white/5 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl filter drop-shadow-md">{getFlagEmoji(currency)}</span>
                <span className="font-bold text-slate-200 tracking-wide">{currency}</span>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-white/5 px-2 py-1 rounded-md">1 {currency}</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 group-hover:scale-105 transition-transform origin-left">
              {formatRupiah(rate)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-black/40 px-6 py-3 text-xs text-slate-500 flex justify-between items-center border-t border-white/5">
        <span>Sumber: open.er-api.com</span>
        <span>Terakhir diupdate: {lastUpdate || 'Tidak diketahui'}</span>
      </div>
    </div>
  );
}
