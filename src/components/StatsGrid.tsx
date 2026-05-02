import { cn } from '../lib/utils';

export default function StatsGrid() {
  const stats = [
    { label: 'Cloud Reach', value: 'Global', change: '8 Regions Active', color: 'text-emerald-400' },
    { label: 'Throughput', value: '1.2 GB/s', change: '+14% Overflow', color: 'text-violet-400' },
    { label: 'Security Score', value: '99.8', change: 'Hardened State', color: 'text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl transition-all hover:border-violet-500/30 group"
        >
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
          <h3 className="text-3xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors">{stat.value}</h3>
          <p className={cn("text-[10px] mt-3 font-black uppercase tracking-widest italic", stat.color)}>
            ⚡︎ {stat.change}
          </p>
        </div>
      ))}
    </div>
  );
}
