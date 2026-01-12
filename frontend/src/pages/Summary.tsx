import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Trophy, ArrowRight, ShieldCheck, Zap, BarChart3, Home } from 'lucide-react';
import { UpdateLastLogSession } from "../../wailsjs/go/main/App";

interface SummaryProps {
    lastSession: {
        category: string | null;
        duration: number;
        data: any;
    };
    onComplete: () => void;
    onStartNew: () => void;
    todayMinutes: number;
}

const Summary = ({ lastSession, onComplete, onStartNew, todayMinutes }: SummaryProps) => {
    const [step, setStep] = useState(1);
    const [reflection, setReflection] = useState('');
    const [learnings, setLearnings] = useState('');
    const [score, setScore] = useState('');
    const [homework, setHomework] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        setIsSaving(true);
        await UpdateLastLogSession(reflection, parseFloat(score) || 0, homework, learnings);
        setIsSaving(false);
        onComplete();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header: Global Closure */}
            <div className="flex flex-col gap-4 sm:gap-6 text-center mb-8 sm:mb-12">
                <div className="flex items-center justify-center gap-3 px-4 sm:px-6 py-2 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 w-fit mx-auto shadow-lg shadow-indigo-500/10">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Session Terminated</span>
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white uppercase">MISSION COMPLETE</h1>
                    <p className="text-zinc-500 font-medium text-sm sm:text-lg">You logged <span className="text-white font-bold">{lastSession.duration}m</span> of focused <span className="text-indigo-400 font-bold uppercase">{lastSession.category}</span> training.</p>
                </div>
            </div>

            {/* Reflection Core */}
            <div className="glass rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-12 border-indigo-500/20 shadow-2xl relative overflow-hidden bg-white/[0.01]">
                {/* Visual Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col min-h-[350px] sm:min-h-[400px]">
                    <div className="flex items-center justify-between mb-8 sm:mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                            </div>
                            <span className="text-[10px] sm:text-sm font-black text-zinc-400 uppercase tracking-widest">Calibration</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${step > i ? 'w-6 sm:w-8 bg-indigo-500' : 'w-2 bg-zinc-800'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 sm:space-y-8 flex-1 flex flex-col"
                            >
                                <div className="space-y-2 sm:space-y-3">
                                    <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase">THE CONFRONTATION</h2>
                                    <p className="text-rose-500 text-[10px] sm:text-sm font-bold uppercase tracking-widest">Identify the primary friction point.</p>
                                </div>
                                <textarea
                                    value={reflection}
                                    autoFocus
                                    onChange={(e) => setReflection(e.target.value)}
                                    placeholder="e.g. Brain fog during reading..."
                                    className="flex-1 min-h-[150px] sm:min-h-[200px] bg-zinc-950 border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 text-zinc-200 outline-none focus:border-indigo-500/50 transition-all resize-none text-base sm:text-xl leading-relaxed placeholder:text-zinc-800 shadow-inner"
                                />
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-4 sm:py-6 bg-white text-black rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl active:scale-95"
                                >
                                    Proceed <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 sm:space-y-10 flex-1 flex flex-col"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase">Key Learning</h2>
                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Neural Gain</p>
                                        </div>
                                        <textarea
                                            value={learnings}
                                            onChange={(e) => setLearnings(e.target.value)}
                                            placeholder="Distill growth..."
                                            className="w-full h-32 sm:h-48 bg-zinc-950 border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 text-zinc-200 outline-none focus:border-indigo-500/50 transition-all resize-none text-sm sm:text-lg leading-relaxed shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase">Performance</h2>
                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Score Prediction</p>
                                        </div>
                                        <div className="relative group h-32 sm:h-48 flex items-center justify-center bg-zinc-950 border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-inner">
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={score}
                                                onChange={(e) => setScore(e.target.value)}
                                                placeholder="0.0"
                                                className="w-full bg-transparent text-6xl sm:text-8xl font-black italic text-center text-white outline-none placeholder:text-zinc-900"
                                            />
                                            <div className="absolute top-4 sm:top-6 right-6 sm:right-8">
                                                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-800 group-focus-within:text-amber-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full py-4 sm:py-6 bg-zinc-100 text-black rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl active:scale-95"
                                >
                                    Target <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 sm:space-y-10 flex-1 flex flex-col justify-center"
                            >
                                <div className="space-y-4 sm:space-y-6 text-center max-w-2xl mx-auto w-full">
                                    <div className="space-y-1 sm:space-y-2">
                                        <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white uppercase">NEXT TARGET</h2>
                                        <p className="text-zinc-500 text-sm sm:text-lg font-medium italic leading-relaxed">What will you master tomorrow?</p>
                                    </div>
                                    <input
                                        type="text"
                                        value={homework}
                                        onChange={(e) => setHomework(e.target.value)}
                                        placeholder="Fix one thing..."
                                        className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-xl sm:text-3xl font-black text-center text-indigo-300 outline-none focus:border-indigo-500 transition-all shadow-2xl"
                                    />
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="w-full py-6 sm:py-8 bg-indigo-600 text-white rounded-[2rem] sm:rounded-[3rem] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-[10px] sm:text-sm flex items-center justify-center gap-4 hover:bg-indigo-500 hover:scale-[1.02] transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? 'Syncing...' : 'Commit Growth'}
                                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Post-Closure Utilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-8 sm:mt-12">
                <button
                    onClick={onComplete}
                    className="glass bg-zinc-900/50 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] flex items-center justify-between group hover:bg-zinc-900 transition-all"
                >
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center">
                            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Base</p>
                            <h4 className="text-lg sm:text-xl font-bold text-white italic">Back to Lab</h4>
                        </div>
                    </div>
                </button>

                <button
                    onClick={onStartNew}
                    disabled={todayMinutes >= 120}
                    className={`glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] flex items-center justify-between group transition-all ${todayMinutes >= 120
                        ? 'bg-zinc-900/20 border-white/5 opacity-50 cursor-not-allowed'
                        : 'bg-indigo-600/10 border-indigo-500/30 hover:bg-indigo-600/20'}`}
                >
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg ${todayMinutes >= 120 ? 'bg-zinc-800' : 'bg-indigo-600 shadow-indigo-600/20'}`}>
                            <Zap className={`w-5 h-5 sm:w-6 sm:h-6 ${todayMinutes >= 120 ? 'text-zinc-600' : 'text-white'}`} />
                        </div>
                        <div className="text-left">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${todayMinutes >= 120 ? 'text-zinc-600' : 'text-indigo-400'}`}>
                                {todayMinutes >= 120 ? 'Target Met' : 'Execute'}
                            </p>
                            <h4 className={`text-lg sm:text-xl font-bold italic ${todayMinutes >= 120 ? 'text-zinc-500' : 'text-white'}`}>
                                {todayMinutes >= 120 ? 'Daily Done' : 'New Session'}
                            </h4>
                        </div>
                    </div>
                    {todayMinutes < 120 && <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 group-hover:translate-x-2 transition-transform" />}
                </button>
            </div>
        </div>
    );
};

export default Summary;
