import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, ChevronRight, Target, Brain, ShieldCheck, List, ChevronLeft, Flame, ArrowRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { GetAppState, ExportData } from "../../wailsjs/go/main/App";
import { getLocalDateString } from '../utils/dateUtils';
import { getCategoryColorClass } from '../utils/categoryColors';

const Analytics = ({ onNavigate }: { onNavigate: (page: string, params?: string, query?: string) => void }) => {
    const [testDate, setTestDate] = useState<Date | null>(null);
    const [daysLeft, setDaysLeft] = useState(0);
    const [sessionLogs, setSessionLogs] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [weeklyPulse, setWeeklyPulse] = useState<number[]>(new Array(7).fill(0));
    const [showStreakDetail, setShowStreakDetail] = useState(false);
    const [showScoreDetail, setShowScoreDetail] = useState(false);
    const [showPhaseDetail, setShowPhaseDetail] = useState(false);
    const [showTrainingDetail, setShowTrainingDetail] = useState(false);
    const [streak, setStreak] = useState(0);
    const [consistencyPhase, setConsistencyPhase] = useState<'Stable' | 'Slipping' | 'Neglect'>('Stable');
    const [retentionRate, setRetentionRate] = useState(100);

    useEffect(() => {
        GetAppState().then(state => {
            if (state.user_profile.test_date) {
                const date = new Date(state.user_profile.test_date);
                setTestDate(date);
                const diff = date.getTime() - new Date().getTime();
                setDaysLeft(Math.ceil(diff / (1000 * 3600 * 24)));
            }
            const logs = state.daily_logs || [];
            setSessionLogs(logs);

            // Calculate Current Streak
            let currentStreak = 0;
            const uniqueDates = Array.from(new Set(logs.map((l: any) => l.date))).sort().reverse();
            const todayStr = getLocalDateString();
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = getLocalDateString(yesterdayDate);

            if (uniqueDates.length > 0) {
                if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
                    currentStreak = 1;
                    let lastDate = new Date(uniqueDates[0]);
                    for (let i = 1; i < uniqueDates.length; i++) {
                        const prevDate = new Date(uniqueDates[i]);
                        const gap = Math.floor((lastDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
                        if (gap === 1) {
                            currentStreak++;
                            lastDate = prevDate;
                        } else { break; }
                    }
                }
            }
            setStreak(currentStreak);

            // Calculate Weekly Pulse
            const pulse = new Array(7).fill(0);
            const now = new Date();
            for (let i = 0; i < 7; i++) {
                const targetDate = new Date();
                targetDate.setDate(now.getDate() - (6 - i));
                const dateStr = getLocalDateString(targetDate);
                pulse[i] = logs
                    .filter((log: any) => log.date === dateStr)
                    .reduce((acc: number, log: any) => acc + (log.duration || 0), 0);
            }
            setWeeklyPulse(pulse);

            // Calculate Consistency Phase and Retention
            if (uniqueDates.length > 0) {
                const lastDate = new Date(uniqueDates[0]);
                const diffDays = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

                if (diffDays > 3) setConsistencyPhase('Neglect');
                else if (diffDays > 1) setConsistencyPhase('Slipping');
                else setConsistencyPhase('Stable');

                setRetentionRate(Math.max(60, 100 - (diffDays * 1.5)));
            }
        });
    }, []);

    const handleExport = () => {
        ExportData();
    };

    const logsByDate = useMemo(() => {
        const map: { [key: string]: any[] } = {};
        sessionLogs.forEach((log: any) => {
            if (!map[log.date]) map[log.date] = [];
            map[log.date].push(log);
        });
        return map;
    }, [sessionLogs]);

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Fill empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Fill actual month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({ day: i, dateStr });
        }
        return days;
    }, [currentMonth]);

    // Daily Mastery Strategy Logic
    const getMasteryStrategy = (daysOut: number) => {
        if (daysOut <= 0) return {
            phase: "Exam Day",
            goal: "Peak Performance",
            details: "Trust your preparation. Stay calm and focused.",
            description: "A day of calm. Trust in the preparation you have done. Focus on mental clarity and physical readiness."
        };
        if (daysOut > 60) return {
            phase: "Foundation",
            goal: "Grammar & Basic Lexicon",
            details: "Focus on building range and accuracy in complex sentences.",
            description: "The stage of building strong linguistic roots. Focus on grammar accuracy and basic vocabulary before chasing speed."
        };
        if (daysOut > 30) return {
            phase: "Development",
            goal: "Speed & Structure",
            details: "Practice under strict time limits. Focus on Task 2 planning.",
            description: "The transition stage to execution. Focus on consistent answer structures and begin practicing under strict time pressure."
        };
        if (daysOut > 14) return {
            phase: "Mastery",
            goal: "Nuance & Academic Tone",
            details: "Eliminate repetitive words. Use rare idioms correctly in Speaking.",
            description: "The stage of perfecting details. Replacing common words with academic alternatives and mastering the correct formal tone."
        };
        return {
            phase: "Mock Phase",
            goal: "Exam Simulation",
            details: "Do 1 full mock daily. Review 100% of errors in Reading/Listening.",
            description: "The stage of true battle simulation. Perform full mock tests daily to build stamina and eliminate tactical errors."
        };
    };

    const strategy = getMasteryStrategy(daysLeft);

    const roundToIELTS = (score: number) => {
        const fraction = score - Math.floor(score);
        if (fraction < 0.25) return Math.floor(score);
        if (fraction < 0.75) return Math.floor(score) + 0.5;
        return Math.ceil(score);
    };

    const getSessionColor = (module: string = '') => {
        return getCategoryColorClass(module, 'bg');
    };

    const getModuleAverage = (moduleName: string) => {
        const moduleLogs = sessionLogs.filter(l => (l.module || '').toLowerCase().includes(moduleName.toLowerCase()) && l.score > 0);
        if (moduleLogs.length === 0) return 0;
        return moduleLogs.reduce((acc, curr) => acc + curr.score, 0) / moduleLogs.length;
    };

    const modules = ['Writing', 'Speaking', 'Reading', 'Listening'];
    const moduleAverages = modules.map(m => ({
        name: m,
        avg: getModuleAverage(m)
    }));

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white italic uppercase">ANALYTICS</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Strategic milestones calibrated to your {testDate?.toLocaleDateString()} exam.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Strategic Roadmap - Date Centric */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div
                        onClick={() => setShowPhaseDetail(true)}
                        className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-indigo-600/5 border-indigo-500/20 relative overflow-hidden cursor-pointer hover:bg-white/5 transition-all border border-transparent hover:border-indigo-500/30 group"
                    >
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 text-indigo-400 font-black tracking-widest text-[10px] uppercase mb-6 sm:mb-10">
                                <Target className="w-4 h-4" />
                                <span>Current Phase: {strategy.phase}</span>
                            </div>

                            <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white mb-4">
                                {daysLeft} <span className="text-zinc-700 not-italic text-2xl">Days to Mastery</span>
                            </h2>

                            <div className="space-y-6 pt-6 sm:pt-10 border-t border-white/5">
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/10 shrink-0">
                                        <Brain className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-bold">Daily Mastery Goal</h3>
                                        <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">{strategy.goal}</p>
                                        <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                                            {strategy.details}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Timeline Overlay */}
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                    </div>

                    {/* Historical Logs - Bento Style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div
                            onClick={() => setShowStreakDetail(true)}
                            className="glass p-6 sm:p-8 rounded-[2rem] space-y-6 border-dashed bg-transparent min-h-[180px] cursor-pointer hover:bg-white/5 transition-all"
                        >
                            <div className="flex items-end gap-2 lg:gap-3 h-24 relative">
                                {/* Ideal Consistency Background (Ghost Bars) */}
                                <div className="absolute inset-0 flex items-end gap-2 lg:gap-3 pointer-events-none">
                                    {new Array(7).fill(0).map((_, i) => (
                                        <div key={`ghost-${i}`} className="flex-1 h-full bg-white/[0.02] border border-white/[0.05] rounded-t-lg" />
                                    ))}
                                </div>

                                {weeklyPulse.map((h, i) => {
                                    const idealHeight = 100; // 120m is 100%
                                    const actualHeight = Math.min((h / 120) * 100, 100);
                                    const hasGap = h < 120;

                                    return (
                                        <div key={i} className="flex-1 h-full relative group">
                                            {/* Gap Shadow (Red Hatch) */}
                                            {hasGap && (
                                                <div
                                                    className="absolute inset-x-0 bg-red-500/10 rounded-t-lg"
                                                    style={{
                                                        height: `${idealHeight - actualHeight}%`,
                                                        bottom: `${actualHeight}%`
                                                    }}
                                                />
                                            )}

                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${actualHeight}%` }}
                                                className={`absolute bottom-0 inset-x-0 rounded-t-lg transition-all cursor-pointer ${i === 6 ? 'bg-indigo-500' : 'bg-zinc-800 hover:bg-indigo-500/50'}`}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                                    {h}m focus
                                                </div>
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">Execution Pulse</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white/10" />
                                    <span className="text-[8px] font-black text-zinc-700">GHOST PACE (120M/DAY)</span>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setShowTrainingDetail(true)}
                            className="glass p-6 sm:p-8 rounded-[2rem] flex flex-col justify-center items-center text-center space-y-4 min-h-[180px] cursor-pointer hover:bg-white/5 transition-all border border-transparent hover:border-emerald-500/30 group"
                        >
                            <ShieldCheck className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-500 group-hover:scale-110 transition-transform" />
                            <div>
                                <p className="text-xl sm:text-2xl font-black italic">Engress Active</p>
                                {sessionLogs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0) < 60
                                    ? `${sessionLogs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0)} minutes total training`
                                    : `${(sessionLogs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0) / 60).toFixed(1)} hours total training`
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Prediction Sidecard */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div
                        onClick={() => setShowScoreDetail(true)}
                        className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] h-full flex flex-col justify-between min-h-[300px] cursor-pointer hover:bg-white/5 transition-all border border-transparent hover:border-indigo-500/30 group"
                    >
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Progress to 7.5</span>
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>

                            <div className="flex justify-center py-4 sm:py-0">
                                <div className="relative">
                                    <svg className="w-32 sm:w-40 h-32 sm:h-40 transform -rotate-90">
                                        <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-zinc-900" />
                                        {sessionLogs.filter(l => l.score > 0).length > 0 ? (
                                            <circle
                                                cx="50%"
                                                cy="50%"
                                                r="40%"
                                                stroke="currentColor"
                                                strokeWidth="10"
                                                fill="transparent"
                                                strokeDasharray="251"
                                                strokeDashoffset={251 * (1 - (sessionLogs.filter(l => l.score > 0).reduce((acc, curr) => acc + curr.score, 0) / sessionLogs.filter(l => l.score > 0).length) / 9)}
                                                className="text-indigo-500 group-hover:text-indigo-400 transition-colors"
                                            />
                                        ) : null}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <motion.span
                                            animate={consistencyPhase !== 'Stable' ? {
                                                color: ['#ffffff', '#ef4444', '#ffffff'],
                                                opacity: [1, 0.7, 1],
                                            } : {}}
                                            transition={consistencyPhase !== 'Stable' ? {
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "linear"
                                            } : {}}
                                            className={`text-3xl sm:text-4xl xl:text-5xl font-black italic tracking-tighter ${consistencyPhase === 'Stable' ? 'text-white' : 'text-red-500/80 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}
                                        >
                                            {sessionLogs.filter(l => l.score > 0).length > 0
                                                ? roundToIELTS(sessionLogs.filter(l => l.score > 0).reduce((acc, curr) => acc + curr.score, 0) / sessionLogs.filter(l => l.score > 0).length).toFixed(1)
                                                : "—"
                                            }
                                        </motion.span>
                                        {consistencyPhase !== 'Stable' && (
                                            <span className="text-[8px] font-black text-red-500 animate-pulse mt-1">Numerical Erosion Active</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-center">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Predicted Band Score</p>
                                <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                                    {sessionLogs.filter(l => l.score > 0).length > 0
                                        ? "Click to view detailed component breakdown."
                                        : "Complete your first evaluated session to generate internal band prediction."
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 mt-6 sm:mt-0 space-y-4">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase">
                                <div className="text-zinc-600">Skill Retention</div>
                                <div className={`${retentionRate > 95 ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-1`}>
                                    <div className={`w-1 h-1 rounded-full ${retentionRate > 95 ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
                                    {retentionRate.toFixed(1)}%
                                </div>
                            </div>
                            <button
                                onClick={handleExport}
                                className="w-full py-4 bg-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                Export Progress Report <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Comprehensive Session Log
                    </h3>

                    <div className="flex p-1 bg-zinc-900 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            <List className="w-3 h-3" /> List
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            <Calendar className="w-3 h-3" /> Calendar
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {viewMode === 'list' ? (
                        <motion.div
                            key="list-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass rounded-[2.5rem] overflow-hidden border-white/5 bg-white/[0.01]"
                        >
                            <div className="grid grid-cols-12 px-6 sm:px-8 py-4 bg-zinc-900/50 border-b border-white/5">
                                <div className="col-span-4 sm:col-span-3 text-[9px] sm:text-[10px] font-black text-zinc-600 uppercase tracking-widest">Date</div>
                                <div className="col-span-5 sm:col-span-4 text-[9px] sm:text-[10px] font-black text-zinc-600 uppercase tracking-widest">Category</div>
                                <div className="hidden sm:block sm:col-span-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Intensity</div>
                                <div className="col-span-3 sm:col-span-2 text-right text-[9px] sm:text-[10px] font-black text-zinc-600 uppercase tracking-widest">Metric</div>
                            </div>

                            <div className="divide-y divide-white/[0.03]">
                                {sessionLogs.length === 0 ? (
                                    <div className="p-12 text-center text-zinc-600 italic text-sm">No training data detected yet. Start your first session in Focus Lab.</div>
                                ) : (
                                    sessionLogs.slice().reverse().map((log, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => onNavigate('notebook', 'sessions', log.id)}
                                            className="grid grid-cols-12 px-8 py-6 items-center hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                        >
                                            <div className="col-span-4 sm:col-span-3 text-xs sm:text-sm font-mono text-zinc-500">{log.date}</div>
                                            <div className="col-span-5 sm:col-span-4 flex items-center gap-2 sm:gap-3 min-w-0">
                                                <div className={`shrink-0 w-2 h-2 rounded-full ${getCategoryColorClass(log.module, 'bg')}`} />
                                                <span className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-tight group-hover:text-white transition-colors truncate">
                                                    {log.module || 'General Practice'}
                                                </span>
                                            </div>
                                            <div className="hidden sm:block sm:col-span-3">
                                                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                                                    {log.duration} min
                                                </span>
                                            </div>
                                            <div className="col-span-3 sm:col-span-2 text-right">
                                                <span className="text-sm sm:text-base font-black italic text-zinc-400 group-hover:text-indigo-400 transition-colors">
                                                    {log.score > 0 ? `B${log.score}` : '—'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="calendar-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass rounded-[2.5rem] p-10 border-white/5 bg-white/[0.01]"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <h4 className="text-2xl font-black italic text-white uppercase tabular-nums tracking-tighter">
                                        {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                                    </h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                            className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                            className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" /> Study Core
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-zinc-800" /> Rest Day
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest py-2">
                                        {d}
                                    </div>
                                ))}
                                {calendarDays.map((dateObj, i) => {
                                    if (!dateObj) return <div key={`empty-${i}`} className="aspect-square opacity-0" />;

                                    const dayLogs = logsByDate[dateObj.dateStr] || [];
                                    const hasLogs = dayLogs.length > 0;

                                    return (
                                        <div
                                            key={i}
                                            className={`aspect-square rounded-2xl border flex flex-col items-center justify-center relative group transition-all duration-500 ${hasLogs ? 'bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/10' : 'bg-zinc-900/10 border-white/5'}`}
                                        >
                                            <span className={`text-lg font-black italic tabular-nums ${hasLogs ? 'text-indigo-400' : 'text-zinc-800'}`}>
                                                {dateObj.day}
                                            </span>
                                            {hasLogs && (
                                                <div className="mt-1 flex flex-wrap justify-center gap-1 px-1">
                                                    {dayLogs.map((log, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`w-1.5 h-1.5 rounded-full ${getSessionColor(log.module)} shadow-sm shadow-black/20`}
                                                            title={log.module}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {hasLogs && (
                                                <div className="absolute inset-0 p-2 opacity-0 group-hover:opacity-100 bg-zinc-950/90 rounded-2xl transition-all flex flex-col justify-center items-center text-center z-10 scale-95 group-hover:scale-100">
                                                    <p className="text-[8px] font-black text-indigo-400 uppercase">{dayLogs.length} Sessions</p>
                                                    <p className="text-[10px] font-bold text-white leading-tight">
                                                        {dayLogs.reduce((acc: number, l: any) => acc + l.duration, 0)}m focus
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Streak Detail Modal */}
            <AnimatePresence>
                {showStreakDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowStreakDetail(false)}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass max-w-lg w-full rounded-[3rem] p-10 border-indigo-500/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <Flame className="w-12 h-12 text-orange-500/20" />
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">Consistency Engine</span>
                                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Mission Streak: {streak} Days</h3>
                                    <p className="text-zinc-400 italic font-medium leading-relaxed">
                                        Your discipline is your edge. You've held the standard for {streak} consecutive days.
                                    </p>
                                </div>

                                <div className="grid grid-cols-7 gap-3 py-6 border-y border-white/5">
                                    {weeklyPulse.map((val, i) => {
                                        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                                        const today = new Date().getDay();
                                        const isToday = i === 6;
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-3">
                                                <div className="relative w-full aspect-[1/4] bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${Math.min((val / 120) * 100, 100)}%` }}
                                                        className={`absolute bottom-0 left-0 right-0 rounded-full ${isToday ? 'bg-indigo-500' : 'bg-orange-500/60'}`}
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-black ${isToday ? 'text-indigo-400' : 'text-zinc-600'}`}>{days[(today - (6 - i) + 7) % 7]}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="flex justify-center pt-2">
                                    <button
                                        onClick={() => setShowStreakDetail(false)}
                                        className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/10"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Score Detail Modal */}
            <AnimatePresence>
                {showScoreDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowScoreDetail(false)}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass max-w-lg w-full rounded-[3rem] p-10 border-indigo-500/20 relative overflow-hidden"
                        >
                            <div className="relative z-10 space-y-8">
                                <div className="space-y-2 text-center">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">Band Breakdown</span>
                                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter pt-4">Internal Calibration</h3>
                                    <p className="text-zinc-500 text-xs italic font-medium">Breakdown per module based on your latest activities.</p>
                                </div>

                                <div className="space-y-4">
                                    {moduleAverages.map((m, i) => {
                                        const target = 7.5;
                                        const gap = Math.max(0, target - m.avg);
                                        // Simple formula: each 0.5 gap requires ~8 specialized units (essays/hours)
                                        const essaysNeeded = Math.ceil((gap / 0.5) * 6);
                                        const hoursNeeded = Math.ceil((gap / 0.5) * 4);

                                        return (
                                            <div key={i} className="space-y-2">
                                                <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5 relative overflow-hidden group">
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <div className={`w-2 h-2 rounded-full ${getCategoryColorClass(m.name, 'bg')}`} />
                                                        <span className="text-xs font-black uppercase tracking-widest text-zinc-300">{m.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 relative z-10">
                                                        <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden relative">
                                                            {/* Ghost Bar (Target 7.5) */}
                                                            <div
                                                                className="absolute top-0 bottom-0 border-r-2 border-white/20 z-0"
                                                                style={{ left: `${(target / 9) * 100}%` }}
                                                            />
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(m.avg / 9) * 100}%` }}
                                                                className={`h-full relative z-10 ${getCategoryColorClass(m.name, 'bg')}`}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-black text-white tabular-nums w-8 text-right">
                                                            {m.avg > 0 ? m.avg.toFixed(1) : "—"}
                                                        </span>
                                                    </div>

                                                    {/* Gap Masking */}
                                                </div>

                                                {gap > 0 && (
                                                    <div className="px-4 flex justify-between items-center bg-white/[0.02] py-2 rounded-xl border border-white/5">
                                                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Required to bridge gap:</span>
                                                        <div className="flex gap-4">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[10px] font-black text-indigo-400 italic">~{essaysNeeded} Targeted Sessions</span>
                                                            </div>
                                                            <div className="flex flex-col items-end border-l border-white/10 pl-4">
                                                                <span className="text-[10px] font-black text-emerald-400 italic">~{hoursNeeded}h Drill Focus</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Calculated Average</span>
                                        <span className="text-xl font-black text-white italic">
                                            {sessionLogs.filter(l => l.score > 0).length > 0
                                                ? (sessionLogs.filter(l => l.score > 0).reduce((acc, curr) => acc + curr.score, 0) / sessionLogs.filter(l => l.score > 0).length).toFixed(2)
                                                : "—"
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-indigo-400">
                                        <span className="text-[10px] font-black uppercase tracking-widest">IELTS Rounded Score</span>
                                        <span className="text-3xl font-black italic">
                                            {sessionLogs.filter(l => l.score > 0).length > 0
                                                ? roundToIELTS(sessionLogs.filter(l => l.score > 0).reduce((acc, curr) => acc + curr.score, 0) / sessionLogs.filter(l => l.score > 0).length).toFixed(1)
                                                : "—"
                                            }
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowScoreDetail(false)}
                                    className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/10"
                                >
                                    Dismiss Detailed View
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Phase Detail Modal */}
            <AnimatePresence>
                {showPhaseDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPhaseDetail(false)}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass max-w-2xl w-full rounded-[3rem] p-8 sm:p-10 border-indigo-500/20 relative overflow-hidden"
                        >
                            <div className="relative z-10 space-y-8">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">Strategic Roadmap Logic</span>
                                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter pt-4">Phase: {strategy.phase}</h3>
                                    <p className="text-zinc-500 text-sm font-medium">Primary Target: {strategy.goal}</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-zinc-950/50 rounded-3xl border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3 text-indigo-400">
                                            <Brain className="w-5 h-5" />
                                            <h4 className="text-xs font-black uppercase tracking-widest">Why this target?</h4>
                                        </div>
                                        <p className="text-zinc-300 leading-relaxed italic text-sm">
                                            "{strategy.description}"
                                        </p>
                                        <div className="pt-4 border-t border-white/5">
                                            <p className="text-xs text-zinc-400 leading-relaxed">
                                                Engress Sentinel detects <span className="text-white font-bold">{daysLeft} days remaining</span>. We are shifting your study load from <span className="italic">content absorption</span> to <span className="text-indigo-400 font-bold">performance acceleration</span>. Your focus now is polishing {strategy.details.toLowerCase()}.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-1">Preparation Path (90 Days Roadmap)</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                            {[
                                                { name: 'Foundation', range: '60+ Days', desc: 'Accuracy & Basics', active: daysLeft > 60 },
                                                { name: 'Development', range: '30-60 Days', desc: 'Score & Speed', active: daysLeft <= 60 && daysLeft > 30 },
                                                { name: 'Mastery', range: '14-30 Days', desc: 'Nuance & Tone', active: daysLeft <= 30 && daysLeft > 14 },
                                                { name: 'Mock Phase', range: '< 14 Days', desc: 'Battle Simulation', active: daysLeft <= 14 }
                                            ].map((p, i) => (
                                                <div key={i} className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all ${p.active ? 'bg-indigo-500/20 border-indigo-500/40 scale-105 shadow-xl shadow-indigo-500/5' : 'bg-transparent border-white/5 opacity-30 grayscale'}`}>
                                                    <span className={`text-[9px] font-black uppercase ${p.active ? 'text-indigo-400' : 'text-zinc-500'}`}>{p.name}</span>
                                                    <span className="text-[10px] font-bold text-white">{p.desc}</span>
                                                    <span className="text-[8px] font-medium text-zinc-600">{p.range}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowPhaseDetail(false)}
                                    className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                                >
                                    I Understand This Strategy <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Training Detail Modal */}
            <AnimatePresence>
                {showTrainingDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTrainingDetail(false)}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass max-w-lg w-full rounded-[3rem] p-10 border-emerald-500/20 relative overflow-hidden"
                        >
                            <div className="relative z-10 space-y-8">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Engress Active Status</h3>
                                        <p className="text-emerald-500 text-xs font-black uppercase tracking-widest">Total Training Accountability</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-zinc-950/50 rounded-3xl border border-white/5 space-y-4">
                                    <div className="flex justify-between items-baseline border-b border-white/5 pb-4">
                                        <span className="text-zinc-500 text-xs font-medium">Training Accumulation</span>
                                        <span className="text-2xl font-black text-white italic">
                                            {sessionLogs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0) < 60
                                                ? `${sessionLogs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0)} Minutes`
                                                : `${(sessionLogs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0) / 60).toFixed(1)} Hours`
                                            }
                                        </span>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            The <span className="text-white font-bold">Engress Active</span> status indicates that our protection and monitoring system is currently running.
                                        </p>
                                        <ul className="space-y-3">
                                            {[
                                                "Records total focus time spent in Focus Lab.",
                                                "Ensures every minute of study counts toward band prediction calibration.",
                                                "Maintains your accountability in meeting daily targets."
                                            ].map((text, i) => (
                                                <li key={i} className="flex gap-3 text-xs text-zinc-500 items-start">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                                                    {text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowTrainingDetail(false)}
                                    className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/10"
                                >
                                    Close Detail
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Analytics;
