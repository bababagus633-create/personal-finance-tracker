import { useState, useEffect } from 'react';

export default function TransactionForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState({
    nama: '',
    jenis: 'pemasukan',
    nominal: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama,
        jenis: initialData.jenis,
        nominal: initialData.nominal
      });
    } else {
      setFormData({ nama: '', jenis: 'pemasukan', nominal: '' });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation (XSS prevention via strict types & limits)
    const nama = formData.nama.trim();
    if (!nama) return setValidationError('Nama transaksi tidak boleh kosong.');
    if (nama.length > 200) return setValidationError('Nama transaksi terlalu panjang.');
    
    const nominal = parseInt(formData.nominal);
    if (isNaN(nominal) || nominal <= 0) return setValidationError('Nominal harus angka lebih dari 0.');

    setValidationError('');
    setSubmitting(true);
    
    try {
      await onSubmit({ ...formData, nama, nominal });
      if (!initialData) {
        setFormData({ nama: '', jenis: 'pemasukan', nominal: '' });
      }
    } catch (err) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {validationError && (
        <div className="text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
          {validationError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Transaksi</label>
        <input
          type="text"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          className="input-field"
          placeholder="Cth: Gaji Bulanan, Makan Siang"
          required
          maxLength={200}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Jenis Transaksi</label>
        <div className="grid grid-cols-2 gap-3">
          <label className={`
            flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
            ${formData.jenis === 'pemasukan' 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}
          `}>
            <input
              type="radio"
              name="jenis"
              value="pemasukan"
              checked={formData.jenis === 'pemasukan'}
              onChange={handleChange}
              className="sr-only"
            />
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Pemasukan
          </label>
          <label className={`
            flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
            ${formData.jenis === 'pengeluaran' 
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}
          `}>
            <input
              type="radio"
              name="jenis"
              value="pengeluaran"
              checked={formData.jenis === 'pengeluaran'}
              onChange={handleChange}
              className="sr-only"
            />
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            Pengeluaran
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Nominal (Rp)</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-slate-500 font-medium">Rp</span>
          </div>
          <input
            type="number"
            name="nominal"
            value={formData.nominal}
            onChange={handleChange}
            className="input-field pl-12 font-mono"
            placeholder="0"
            required
            min="1"
            step="1"
          />
        </div>
      </div>

      <div className="pt-2 flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Batal
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary flex-1 flex justify-center items-center gap-2">
          {submitting ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : initialData ? 'Simpan' : 'Tambah'}
        </button>
      </div>
    </form>
  );
}
