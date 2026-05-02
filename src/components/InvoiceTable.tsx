import { FileText, Download, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface Invoice {
  id: string;
  amount: number;
  date: string;
  status: string;
}

interface TableProps {
  invoices: Invoice[];
}

export default function InvoiceTable({ invoices }: TableProps) {
  const downloadInvoice = (inv: Invoice) => {
    const content = `INVOICE: ${inv.id}\nDATE: ${inv.date}\nAMOUNT: $${inv.amount.toFixed(2)}\nSTATUS: ${inv.status}\n\nSystem Cloud Infrastructure - Billing Receipt`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${inv.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    const csvHeader = "ID,Date,Amount,Status\n";
    const csvRows = invoices.map(inv => `${inv.id},${inv.date},${inv.amount},${inv.status}`).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-invoices.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400/60 font-mono italic">Invoice Ledger</h2>
          <p className="text-xs text-slate-400 font-medium">Automatic settlement history</p>
        </div>
        <button 
          onClick={downloadAll}
          className="text-[10px] font-black px-6 py-3 bg-white text-black rounded-xl hover:bg-emerald-400 transition-all uppercase tracking-[0.2em] shadow-2xl active:scale-95 flex items-center gap-2"
        >
          <Download className="w-3 h-3" />
          Export All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0a0a0f] text-slate-500 uppercase text-[9px] font-black tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">Protocol ID</th>
              <th className="px-8 py-5">Synch Date</th>
              <th className="px-8 py-5">Resource Value</th>
              <th className="px-8 py-5">State</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11px] text-slate-300 divide-y divide-white/5">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-black uppercase tracking-widest italic opacity-40">
                  No transaction records located in the current cycle
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-500 shadow-xl group-hover:border-violet-500/50 group-hover:text-emerald-400 transition-all">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-mono font-black text-slate-400 tracking-tighter">#{inv.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black tracking-tight">{inv.date}</td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-white tracking-tighter">${inv.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                       "inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.2em] border backdrop-blur-md",
                       inv.status === 'Paid' 
                         ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                         : "bg-violet-500/10 text-violet-400 border-violet-500/20"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]", inv.status === 'Paid' ? "bg-emerald-400" : "bg-violet-400")} />
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => downloadInvoice(inv)}
                      className="p-3 text-slate-500 hover:text-emerald-400 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
