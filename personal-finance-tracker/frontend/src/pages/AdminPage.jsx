import { useState, useEffect } from 'react';
import api from '../api/axios';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';

export default function AdminPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingData, setEditingData] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const cached = localStorage.getItem('finance_transactions');
      if (cached) {
        setTransactions(JSON.parse(cached));
      }

      const res = await api.get('/transactions');
      if (res.data.success) {
        setTransactions(res.data.data);
        localStorage.setItem('finance_transactions', JSON.stringify(res.data.data));
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      const cached = localStorage.getItem('finance_transactions');
      if (cached) {
        setTransactions(JSON.parse(cached));
        setError('Anda sedang offline. Menampilkan data yang tersimpan di perangkat.');
      } else {
        setError('Gagal memuat data transaksi dari server dan tidak ada data lokal.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSave = async (data) => {
    try {
      setError(null);
      if (editingData) {
        await api.put(`/transactions/${editingData.id}`, data);
      } else {
        await api.post('/transactions', data);
      }
      setEditingData(null);
      fetchTransactions();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan transaksi.';
      setError(msg);
      throw err; // Re-throw to let form handle loading state
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return;
    try {
      setError(null);
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      setError('Gagal menghapus transaksi.');
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Panel Admin</h1>
        <p className="text-slate-400">Kelola data pemasukan dan pengeluaran Anda.</p>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 glass-card p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {editingData ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <TransactionForm 
            onSubmit={handleSave} 
            initialData={editingData} 
            onCancel={editingData ? () => setEditingData(null) : null}
          />
        </div>
        
        <div className="lg:col-span-2 glass-card p-6 overflow-hidden flex flex-col min-h-[500px]">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Daftar Transaksi
          </h2>
          <div className="flex-grow overflow-auto pr-2">
            <TransactionTable 
              transactions={transactions} 
              loading={loading}
              onEdit={setEditingData}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
