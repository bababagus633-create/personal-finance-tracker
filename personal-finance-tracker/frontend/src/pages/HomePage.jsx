import { useState, useEffect } from 'react';
import axios from 'axios';
import CurrencyTable from '../components/CurrencyTable';

export default function HomePage() {
  const [summary, setSummary] = useState({ pemasukan: 0, pengeluaran: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      // Load from local storage first to show immediately
      const cached = localStorage.getItem('finance_summary');
      if (cached) {
        setSummary(JSON.parse(cached));
      }

      const res = await axios.get('/api/transactions/summary');
      if (res.data.success) {
        setSummary(res.data.data);
        localStorage.setItem('finance_summary', JSON.stringify(res.data.data));
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
      const cached = localStorage.getItem('finance_summary');
      if (cached) {
        setSummary(JSON.parse(cached));
        setError('Anda sedang offline. Menampilkan data terakhir yang tersimpan di HP Anda.');
      } else {
        setError('Gagal memuat ringkasan. Anda offline dan tidak ada data tersimpan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0);
  };

  return (
    <div className="space-y-8 fade-in">
      <header className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Dashboard <span className="text-gradient">Keuangan</span>
        </h1>
        <p className="text-slate-400">Ringkasan kondisi finansial Anda saat ini.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo Total */}
        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Saldo</h3>
            <div className={`text-3xl font-bold ${summary.saldo >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {loading ? '...' : formatRupiah(summary.saldo)}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span>Net Worth</span>
            </div>
          </div>
        </div>

        {/* Pemasukan */}
        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Pemasukan</h3>
            <div className="text-2xl font-bold text-emerald-400">
              {loading ? '...' : formatRupiah(summary.pemasukan)}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Semua waktu</span>
            </div>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Pengeluaran</h3>
            <div className="text-2xl font-bold text-rose-400">
              {loading ? '...' : formatRupiah(summary.pengeluaran)}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              <span>Semua waktu</span>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Currency Exchange Rates API Section */}
      <div className="mt-12">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Kurs Mata Uang ke IDR
            </h2>
            <p className="text-slate-400 text-sm mt-1">Data live dari ExchangeRate-API</p>
          </div>
          <div className="badge-income bg-brand-500/20 text-brand-300 border-brand-500/30">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            Live Updates
          </div>
        </header>
        <CurrencyTable />
      </div>
    </div>
  );
}
