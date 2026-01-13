import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, ChevronRight, Target, Brain, ShieldCheck, List, ChevronLeft, Flame, ArrowRight, X } from 'lucide-react';
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
            const todayObj = new Date();
            for (let i = 0; i < 7; i++) {
                const d = new Date(todayObj);
                d.setDate(d.getDate() - (6 - i));
                const ds = getLocalDateString(d);
                const dayLogs = logs.filter((l: any) => l.date === ds);
                pulse[i] = dayLogs.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0);
            }
            setWeeklyPulse(pulse);

            // Determine Consistency Phase
            const missedDays = uniqueDates.length > 0 && uniqueDates[0] !== todayStr ? 1 : 0;
            if (missedDays > 3) setConsistencyPhase('Neglect');
            else if (missedDays > 0) setConsistencyPhase('Slipping');
            else setConsistencyPhase('Stable');

            // Rough Retention Rate (Vocab progress estimate)
            const vocab = state.vocabulary || [];
            if (vocab.length > 0) {
                setRetentionRate(Math.min(100, 70 + (vocab.length * 0.5)));
            }
        });
    }, []);

    const getMasteryStrategy = (days: number) => {
        if (days > 60) return { phase: 'Foundational', goal: '+150 New Academic Terms', details: 'Focus on deep comprehension and structural grammar.' };
        if (days > 30) return { phase: 'Strategic Calibration', goal: 'Full Practice Mock Tests', details: 'Identify specific bottlenecks in timing and execution.' };
        if (days > 14) return { phase: 'Peak Simulation', goal: 'Daily Timed Modules', details: 'Simulate high-pressure environments for all categories.' };
        return { phase: 'Final Lockdown', goal: 'Error Analysis & Refinement', details: 'Focus exclusively on your 20% most common mistakes.' };
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
                                            {/* Progress Bar */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${actualHeight}%` }}
                                                className={`absolute bottom-0 inset-x-0 rounded-t-lg transition-colors border-t border-x border-white/10 ${i === 6 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-zinc-800'} `}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Consistency Factor</p>
                                    <h4 className="text-xl font-bold italic tracking-tight">{streak} Day Active Streak</h4>
                                </div>
                                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
                                    <Flame className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setShowScoreDetail(true)}
                            className="glass p-6 sm:p-8 rounded-[2rem] bg-indigo-600/5 border-indigo-500/20 relative overflow-hidden cursor-pointer hover:bg-white/5 transition-all group border border-transparent hover:border-indigo-500/30"
                        >
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-indigo-400 font-black tracking-widest text-[10px] uppercase">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span>Current Calibrated Average</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black italic tracking-tighter text-white uppercase tabular-nums">
                                            {roundToIELTS(moduleAverages.filter(m => m.avg > 0).reduce((acc, curr) => acc + curr.avg, 0) / (moduleAverages.filter(m => m.avg > 0).length || 1)).toFixed(1)}
                                        </span>
                                        <span className="text-zinc-600 font-bold text-sm uppercase">Global Band</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 group/link">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover/link:text-indigo-400 transition-colors text-left font-mono">Detailed scoring profile</span>
                                    <ChevronRight className="w-3 h-3 text-zinc-800" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div
                        onClick={() => setShowTrainingDetail(true)}
                        className="glass p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-emerald-500/[0.02] border-emerald-500/10 cursor-pointer hover:bg-white/5 transition-all"
                    >
                        <div className="flex items-center gap-3 text-emerald-500 font-black tracking-widest text-[10px] uppercase mb-8">
                            <ShieldCheck className="w-4 h-4 animate-pulse" />
                            <span>System Accountability</span>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Focused Work</span>
                                <span className="text-4xl font-black italic tracking-tighter text-white tabular-nums">
                                    {sessionLogs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0) < 60
                                        ? `${sessionLogs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0)}m`
                                        : `${(sessionLogs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0) / 60).toFixed(1)}h`
                                    }
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 pt-6 border-t border-white/5">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mastery Retention Rate</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${retentionRate}%` }}
                                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                        />
                                    </div>
                                    <span className="text-sm font-black text-emerald-400 italic tabular-nums">{retentionRate.toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-8 rounded-[2rem] sm:rounded-[2.5rem] space-y-8">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Module Breakdown</span>
                            <List className="w-4 h-4 text-zinc-500" />
                        </div>

                        <div className="space-y-6">
                            {moduleAverages.map((m, idx) => (
                                <div key={idx} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${m.avg > 0 ? getSessionColor(m.name) : 'bg-zinc-800'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-100">{m.name}</span>
                                        </div>
                                        <span className={`text-xs font-black italic ${m.avg > 0 ? 'text-white' : 'text-zinc-700 font-mono'}`}>
                                            {m.avg > 0 ? `Band ${roundToIELTS(m.avg).toFixed(1)}` : 'INC'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
                                        {m.avg > 0 && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(m.avg / 9) * 100}%` }}
                                                className={`h-full ${getSessionColor(m.name)} opacity-60`}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => ExportData()}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
                        >
                            Export Strategy Report <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals - Reverted to local rendering for troubleshooting */}
            <AnimatePresence>
                {showStreakDetail && (
                    <motion.div
                        key="streak-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowStreakDetail(false)}
                        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
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

                            <div className="relative z-10 space-y-8 text-left">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">Consistency Engine</span>
                                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tight text-left">Mission Streak: {streak} Days</h3>
                                    <p className="text-zinc-400 italic font-medium leading-relaxed text-left">
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
                        key="score-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowScoreDetail(false)}
                        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass max-w-xl w-full rounded-[3rem] p-10 border-indigo-500/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <TrendingUp className="w-12 h-12 text-indigo-500/20" />
                            </div>

                            <div className="relative z-10 space-y-8 text-left">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">Detailed Performance Analysis</span>
                                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter text-left">Module Calibrations</h3>
                                    <p className="text-zinc-400 italic font-medium leading-relaxed text-left">
                                        Your band scores are calculated based on your average performance across all logged sessions.
                                    </p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    {moduleAverages.map((m, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${m.avg > 0 ? getSessionColor(m.name) : 'bg-zinc-800'}`} />
                                                <span className="text-sm font-bold text-white uppercase tracking-tight">{m.name}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className={`text-2xl font-black italic ${m.avg > 0 ? 'text-white' : 'text-zinc-700'}`}>
                                                    {m.avg > 0 ? roundToIELTS(m.avg).toFixed(1) : '0.0'}
                                                </span>
                                                <span className="text-[10px] font-bold text-zinc-600 uppercase">Band</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-center pt-2">
                                    <button
                                        onClick={() => setShowScoreDetail(false)}
                                        className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/10"
                                    >
                                        Close Analysis
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Phase Detail Modal */}
            <AnimatePresence>
                {showPhaseDetail && (
                    <motion.div
                        key="phase-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPhaseDetail(false)}
                        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass max-w-lg w-full rounded-[3rem] p-10 border-indigo-500/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <Target className="w-12 h-12 text-indigo-500/20" />
                            </div>

                            <div className="relative z-10 space-y-8 text-left">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">Strategic Timeline</span>
                                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter text-left">Phase: {strategy.phase}</h3>
                                    <p className="text-zinc-400 italic font-medium leading-relaxed text-left">
                                        Engress dynamically adjusts your focus requirements based on the proximity of your test date.
                                    </p>
                                </div>

                                <div className="p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-100 italic font-bold text-lg text-left">
                                    "{strategy.details}"
                                </div>

                                <div className="flex justify-center pt-2">
                                    <button
                                        onClick={() => setShowPhaseDetail(false)}
                                        className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/10"
                                    >
                                        Close Roadmap
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Training Detail Modal */}
            <AnimatePresence>
                {showTrainingDetail && (
                    <motion.div
                        key="training-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTrainingDetail(false)}
                        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass max-w-lg w-full rounded-[3rem] p-10 border-indigo-500/20 relative overflow-hidden"
                        >
                            <div className="relative z-10 space-y-8 text-left">
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
                                        <p className="text-sm text-zinc-400 leading-relaxed text-left">
                                            The <span className="text-white font-bold">Engress Active</span> status confirms that your focus monitoring is live, recording study progress and managing application access.
                                        </p>
                                        <ul className="space-y-3">
                                            {[
                                                "Tracks deep-work sessions to calculate and unlock credits for external usage.",
                                                "Records every training minute to ensure accurate band score calibration.",
                                                "Maintains your study discipline by providing real-time session accountability."
                                            ].map((text, i) => (
                                                <li key={i} className="flex gap-3 text-xs text-zinc-500 items-start text-left">
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
