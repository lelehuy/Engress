import { motion } from 'framer-motion';
import { Home, Zap, Calendar, Book, BarChart3, Settings, Shield, ArrowRight } from 'lucide-react';

const Briefing = ({ onComplete }: { onComplete: () => void }) => {
    const modules = [
        { icon: Home, label: 'Dashboard', desc: 'System overview, daily mission briefings, and execution pulse.' },
        { icon: Zap, label: 'Focus Lab', desc: 'Core training modules: Writing, Reading, Speaking, and Full Mockups.' },
        { icon: Calendar, label: 'Schedule', desc: 'Active roadmap and milestone tracking for your test date.' },
        { icon: Book, label: 'Notebook', desc: 'Encrypted storage for your vocabulary forged and study records.' },
        { icon: BarChart3, label: 'Analytics', desc: 'Statistical breakdown of your performance and consistency.' },
        { icon: Settings, label: 'Settings', desc: 'Protocol calibration and system updates.' },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6 sm:p-8 overflow-y-auto">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-600/5 blur-[150px] rounded-full" />
                <div className="absolute top-[30%] -right-[10%] w-[60vw] h-[60vw] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-4xl w-full space-y-8 sm:space-y-12 my-auto">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                            <Shield className="w-10 h-10 text-indigo-400" />
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-5xl font-black text-white italic uppercase tracking-tighter"
                    >
                        System <span className="text-zinc-600">Overview</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-500 font-medium uppercase tracking-[0.2em] text-xs"
                    >
                        Calibrating Interface Understanding
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map((m, i) => (
                        <motion.div
                            key={m.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (i + 1) }}
                            className="glass p-6 rounded-3xl border-white/5 space-y-3 hover:border-indigo-500/20 transition-colors group"
                        >
                            <div className="p-3 bg-zinc-900 rounded-xl w-fit group-hover:bg-indigo-600/10 transition-colors">
                                <m.icon className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-white uppercase italic">{m.label}</h3>
                            <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                                {m.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex justify-center pt-8"
                >
                    <button
                        onClick={onComplete}
                        className="px-12 py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-500 transition-all flex items-center gap-4 shadow-2xl shadow-indigo-600/30 group active:scale-95 text-sm"
                    >
                        Initialize Interface
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Briefing;
