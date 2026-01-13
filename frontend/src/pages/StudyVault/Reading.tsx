import { useState, useEffect } from 'react';
import { BookOpen, Clock, AlertCircle, ChevronLeft, Save, Layout, List, Info, Trophy, ArrowRight, TrendingUp, Calculator, Target, ExternalLink, Share2, X, Mic, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import SessionTimer from '../../components/SessionTimer';
import { GetAppState, UpdateNotes, SetHUDScratchpadVisible, SetSessionCategory } from "../../../wailsjs/go/main/App";
import { EventsOn } from '../../../wailsjs/runtime/runtime';

const Reading = ({ onBack, onFinish, initialData, onUpdate }: {
    onBack: () => void;
    onFinish: (duration: number) => void;
    initialData?: any;
    onUpdate?: (data: any) => void;
}) => {
    const categoryName = initialData?.category || 'Reading';
    const [duration, setSeconds] = useState(initialData?.duration || 0);
    const [rawScore, setRawScore] = useState(initialData?.rawScore || 0);
    const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl || '');
    const [screenshot, setScreenshot] = useState(initialData?.screenshot || '');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [stats, setStats] = useState({ totalRuns: 0, lastScores: [] as number[], streak: 0 });
    const [examMode, setExamMode] = useState<'academic' | 'general'>(initialData?.examMode || 'academic');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const state = await GetAppState();
                const currentModule = initialData?.category || 'reading';
                const logs = (state.daily_logs || []).filter((l: any) =>
                    l.module?.toLowerCase() === currentModule.toLowerCase()
                );
                setStats({
                    totalRuns: logs.length,
                    lastScores: logs.slice(-5).map((l: any) => l.score),
                    streak: logs.length > 0 ? 1 : 0
                });
            } catch (e) {
                console.error("Failed to fetch stats:", e);
            }
        };
        fetchStats();
        SetSessionCategory(categoryName.toUpperCase());
    }, [initialData?.category, categoryName]);

    useEffect(() => {
        if (onUpdate) onUpdate({ duration, rawScore, sourceUrl, screenshot, examMode, notes });
        UpdateNotes(notes);
    }, [duration, rawScore, sourceUrl, screenshot, examMode, notes, onUpdate]);

    useEffect(() => {
        const handleBlur = () => {
            SetHUDScratchpadVisible(true);
        };
        const handleFocus = () => {
            SetHUDScratchpadVisible(false);
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        const unlisten = EventsOn("hud-notes-update", (newNotes: string) => {
            setNotes(newNotes);
        });

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            unlisten();
            SetSessionCategory("HIDDEN");
            SetHUDScratchpadVisible(false);
        };
    }, []);

    const calculateBand = (raw: number) => {

        if (categoryName.toLowerCase() === 'listening') {
            if (raw >= 39) return '9.0';
            if (raw >= 37) return '8.5';
            if (raw >= 35) return '8.0';
            if (raw >= 32) return '7.5';
            if (raw >= 30) return '7.0';
            if (raw >= 26) return '6.5';
            if (raw >= 23) return '6.0';
            if (raw >= 18) return '5.5';
            if (raw >= 15) return '5.0';
            return '4.5 or lower';
        }

        // Reading Academic
        if (examMode === 'academic') {
            if (raw >= 39) return '9.0';
            if (raw >= 37) return '8.5';
            if (raw >= 35) return '8.0';
            if (raw >= 33) return '7.5';
            if (raw >= 30) return '7.0';
            if (raw >= 27) return '6.5';
            if (raw >= 23) return '6.0';
            if (raw >= 19) return '5.5';
            if (raw >= 15) return '5.0';
            return '4.5 or lower';
        }

        // Reading General
        if (raw >= 40) return '9.0';
        if (raw >= 39) return '8.5';
        if (raw >= 37) return '8.0';
        if (raw >= 36) return '7.5';
        if (raw >= 34) return '7.0';
        if (raw >= 32) return '6.5';
        if (raw >= 30) return '6.0';
        if (raw >= 27) return '5.5';
        if (raw >= 23) return '5.0';
        return '4.5 or lower';
    };

    const currentBand = calculateBand(rawScore);

    return (
        <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
            {/* Reading Zen Bar */}
            <div className="flex items-center justify-between px-8 py-4 bg-zinc-950/50 border-b border-white/5 shrink-0">
                <div className="flex items-center justify-between gap-6">
                    <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1">
                        <div className={`px-4 py-1.5 rounded-lg text-white shadow-lg text-[10px] font-black uppercase tracking-widest ${categoryName === 'Listening' ? 'bg-amber-600 shadow-amber-600/20' : 'bg-blue-600 shadow-blue-600/20'}`}>
                            {categoryName} Simulator
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <SessionTimer initialSeconds={duration} onTimeUpdate={setSeconds} />
                    <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900 rounded-xl border border-white/5">
                        <Calculator className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Band {currentBand}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                {/* Unified Sidebar */}
                <div className="col-span-4 border-r border-white/5 flex flex-col bg-zinc-950/50 overflow-hidden">
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                        <div className="space-y-3">
                            <div className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border w-fit ${categoryName === 'Listening' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                <Calculator className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Score Calibration</span>
                            </div>

                            {categoryName.toLowerCase() === 'reading' && (
                                <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1 w-full">
                                    <button
                                        onClick={() => setExamMode('academic')}
                                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${examMode === 'academic' ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                                    >
                                        Academic
                                    </button>
                                    <button
                                        onClick={() => setExamMode('general')}
                                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${examMode === 'general' ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                                    >
                                        General GT
                                    </button>
                                </div>
                            )}

                            <div className="p-5 bg-zinc-900/50 rounded-[1.5rem] border border-white/5 relative overflow-hidden group">
                                <p className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Engress Instruction</p>
                                <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                                    {categoryName.toLowerCase() === 'listening'
                                        ? "Simulate the listening test (40 questions). Input your raw score to calculate your band."
                                        : `Simulate the ${examMode} reading test. Each mode has its own band scoring table.`
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Raw Score Input</span>
                                <span className={`text-xl font-black italic tracking-widest ${categoryName === 'Listening' ? 'text-amber-500' : 'text-blue-500'}`}>{rawScore}/40</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="40"
                                value={rawScore}
                                onChange={(e) => setRawScore(Number(e.target.value))}
                                className={`w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer ${categoryName === 'Listening' ? 'accent-amber-500' : 'accent-blue-500'}`}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`p-4 rounded-2xl text-center space-y-1 border ${categoryName === 'Listening' ? 'bg-amber-500/5 border-amber-500/10' : 'bg-blue-500/5 border-blue-500/10'}`}>
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase">Est. Band</span>
                                    <p className={`text-xl font-black italic ${categoryName === 'Listening' ? 'text-amber-400' : 'text-blue-400'}`}>{currentBand}</p>
                                </div>
                                <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl text-center space-y-1">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase">Target</span>
                                    <p className="text-xl font-black text-white italic">7.5</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Material URL</span>
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-700" />
                            </div>
                            <div className="relative group">
                                <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    value={sourceUrl}
                                    onChange={(e) => setSourceUrl(e.target.value)}
                                    placeholder="Paste test link..."
                                    className="w-full bg-zinc-900/30 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs text-zinc-300 outline-none focus:border-blue-500/30 transition-all placeholder:text-zinc-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <PenTool className="w-3.5 h-3.5 text-zinc-600" />
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Scratchpad & Notes</span>
                                </div>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Jot down keywords, draft answers, or take notes during Listening..."
                                className="w-full h-48 bg-zinc-900/30 border border-white/5 rounded-2xl p-4 text-xs text-zinc-300 outline-none focus:border-indigo-500/30 transition-all placeholder:text-zinc-800 resize-none font-medium leading-relaxed custom-scrollbar"
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Attach Proof</span>
                                <Share2 className="w-3.5 h-3.5 text-zinc-700" />
                            </div>
                            {screenshot ? (
                                <div className="relative group overflow-hidden rounded-2xl border border-white/5">
                                    <img src={screenshot} className="w-full h-32 object-cover transition-transform duration-700 group-hover:scale-105" alt="Scoresheet" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => setScreenshot('')} className="p-2 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl shadow-rose-500/40">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-32 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-blue-500/30 transition-all hover:bg-blue-500/5 group">
                                    <Share2 className="w-5 h-5 text-zinc-700 group-hover:text-blue-400 mb-2 transition-transform group-hover:scale-110" />
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Attach Material</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setScreenshot(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Achievements & Analytics */}
                <div className="col-span-8 p-12 space-y-12 bg-white/[0.01] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass col-span-2 rounded-[3.5rem] p-12 relative overflow-hidden group shadow-2xl border border-white/5"
                        >
                            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-1 bg-blue-500 rounded-full" />
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Module Insights</span>
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tighter italic">
                                        {stats.totalRuns >= 5 ? 'Stable Engine State' : 'Initial Calibration Phase'}
                                    </h2>
                                    <p className="text-zinc-500 text-sm max-w-sm font-medium">
                                        {stats.totalRuns >= 5
                                            ? `You have maintained active simulation for ${stats.totalRuns} sessions. Your consistency is building elite patterns.`
                                            : `Complete at least 5 simulations to unlock advanced historical insights and trend analysis.`
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="p-5 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-600/30">
                                        <Trophy className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-black italic tracking-tighter">Level {Math.floor(stats.totalRuns / 5) + 1}</p>
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Progression Milestone</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-8">
                                <TrendingUp className="w-24 h-24 text-white/5 -rotate-12" />
                            </div>
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/5 blur-[120px] rounded-full group-hover:bg-blue-600/10 transition-all duration-700" />
                        </motion.div>

                        <div className="glass rounded-[3rem] p-8 border border-white/5 space-y-4 hover:bg-white/[0.02] transition-colors">
                            <TrendingUp className="w-10 h-10 text-emerald-500" />
                            <h5 className="font-bold uppercase text-[10px] text-zinc-500 tracking-widest">Avg Band Score</h5>
                            <p className="text-3xl font-black italic">
                                {stats.lastScores.length > 0
                                    ? (stats.lastScores.reduce((a: number, b: number) => a + b, 0) / stats.lastScores.length).toFixed(1)
                                    : '---'}
                                <span className="ml-2 text-xs text-emerald-500 font-black uppercase">Recent</span>
                            </p>
                        </div>

                        <div className="glass rounded-[3rem] p-8 border border-white/5 space-y-4 hover:bg-white/[0.02] transition-colors">
                            <BookOpen className="w-10 h-10 text-blue-400" />
                            <h5 className="font-bold uppercase text-[10px] text-zinc-500 tracking-widest">Recorded Simulator Runs</h5>
                            <p className="text-3xl font-black italic">{stats.totalRuns} <span className="text-xs text-blue-500 font-black uppercase">Tests</span></p>
                        </div>
                    </div>

                    <div className="space-y-6 pt-12 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-zinc-600" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Progression Roadmap</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Calibration Ready', status: stats.totalRuns > 0 ? 'Verified' : 'Pending', color: stats.totalRuns > 0 ? 'bg-indigo-500' : 'bg-zinc-800' },
                                { label: 'Pattern Detection', status: stats.totalRuns >= 3 ? 'Active' : 'Locked', color: stats.totalRuns >= 3 ? 'bg-emerald-500' : 'bg-zinc-800' },
                                { label: 'Elite Mastery', status: stats.totalRuns >= 10 ? 'Approaching' : 'Locked', color: stats.totalRuns >= 10 ? 'bg-amber-500' : 'bg-zinc-800' },
                            ].map((m, i) => (
                                <div key={i} className={`flex items-center justify-between p-6 bg-zinc-900/30 border border-white/5 rounded-3xl transition-all hover:bg-zinc-900/50 ${m.status === 'Locked' ? 'opacity-40' : 'opacity-100'}`}>
                                    <span className="text-sm font-bold text-zinc-300">{m.label}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{m.status}</span>
                                        <div className={`w-2.5 h-2.5 rounded-full ${m.color} shadow-lg`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reading;
