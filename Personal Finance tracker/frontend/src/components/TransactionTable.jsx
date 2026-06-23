export default function TransactionTable({ transactions, loading, onEdit, onDelete }) {
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; // fallback for SQLite default string
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-8 w-8 bg-brand-500/50 rounded-full animate-bounce"></div>
          <p className="text-slate-400 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-400 mb-1">Belum ada transaksi</p>
        <p className="text-sm text-slate-500">Mulai catat keuangan Anda sekarang.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
          <tr>
            <th className="px-5 py-4 w-12 text-center">#</th>
            <th className="px-5 py-4">Nama Transaksi</th>
            <th className="px-5 py-4">Waktu</th>
            <th className="px-5 py-4">Jenis</th>
            <th className="px-5 py-4 text-right">Nominal</th>
            <th className="px-5 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-slate-200">
          {transactions.map((t, index) => (
            <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
              <td className="px-5 py-4 text-center text-slate-500">{index + 1}</td>
              <td className="px-5 py-4 font-medium max-w-[200px] truncate" title={t.nama}>{t.nama}</td>
              <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(t.created_at)}</td>
              <td className="px-5 py-4">
                {t.jenis === 'pemasukan' ? (
                  <span className="badge-income">Pemasukan</span>
                ) : (
                  <span className="badge-expense">Pengeluaran</span>
                )}
              </td>
              <td className={`px-5 py-4 text-right font-mono font-medium ${t.jenis === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {t.jenis === 'pemasukan' ? '+' : '-'}{formatRupiah(t.nominal)}
              </td>
              <td className="px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(t)}
                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title="Hapus"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
