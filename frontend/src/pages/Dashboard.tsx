import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, TrendingUp, Trophy, ArrowRight, ExternalLink, Flame, Brain, Clock, ShieldCheck, Lightbulb, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { preparationTips } from '../data/prepTips';
import { GetAppState, GetEngressBriefing as GetSentinelBriefing, GetConsistencyPhase, SetSessionCategory } from "../../wailsjs/go/main/App";
import { getLocalDateString } from '../utils/dateUtils';

interface DashboardProps {
    onNavigate: (page: string, params?: string, query?: string) => void;
    activeSession: { category: string | null; isActive: boolean; };
    testDateProps: string | null;
    daysLeftProps: number;
    todayMinutesProps: number;
    onShowDeadlinePopup?: () => void;
}

const Dashboard = ({ onNavigate, activeSession, testDateProps, daysLeftProps, todayMinutesProps, onShowDeadlinePopup }: DashboardProps) => {
    const [missionAccepted, setMissionAccepted] = useState(false);
    const [testDate, setTestDate] = useState<Date | null>(testDateProps ? new Date(testDateProps) : null);
    const [daysLeft, setDaysLeft] = useState(daysLeftProps);
    // todayMinutes is now driven by props to ensure sync with header
    const todayMinutes = todayMinutesProps;
    const [tomorrowFocus, setTomorrowFocus] = useState('Determine during ritual');
    const [lastScore, setLastScore] = useState<number | null>(null);
    const [weeklyPulse, setWeeklyPulse] = useState<number[]>(new Array(7).fill(0));
    const [engressBriefing, setEngressBriefing] = useState("");
    const [consistencyPhase, setConsistencyPhase] = useState("Stable");
    const DAILY_GOAL = 120;

    const [streak, setStreak] = useState(0);
    const [vocabCount, setVocabCount] = useState(0);
    const [userName, setUserName] = useState('');
    const [showStreakDetail, setShowStreakDetail] = useState(false);
    const [showConsistencyDetail, setShowConsistencyDetail] = useState(false);

    useEffect(() => {
        if (testDateProps) {
            setTestDate(new Date(testDateProps));
            setDaysLeft(daysLeftProps);
        }

        GetAppState().then(state => {

            setVocabCount(state.vocabulary?.length || 0);
            if (state.user_profile?.name) {
                setUserName(state.user_profile.name);
            }

            const today = getLocalDateString();
            const logs = state.daily_logs || [];

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

            // Last Score
            if (logs.length > 0) {
                const scores = logs.filter((l: any) => l.score > 0);
                if (scores.length > 0) {
                    setLastScore(scores[scores.length - 1].score);
                }
            }
        });

        GetSentinelBriefing().then(setEngressBriefing);
        GetConsistencyPhase().then(setConsistencyPhase);
    }, [testDateProps, daysLeftProps, todayMinutesProps]);

    const currentDayPlan = [
        { day: 'Sunday', focus: 'Vocabulary' },
        { day: 'Monday', focus: 'Writing Task 1', category: 'writing' },
        { day: 'Tuesday', focus: 'Reading', category: 'reading' },
        { day: 'Wednesday', focus: 'Speaking', category: 'speaking' },
        { day: 'Thursday', focus: 'Listening', category: 'listening' },
        { day: 'Friday', focus: 'Writing Task 2', category: 'writing' },
        { day: 'Saturday', focus: 'Mock Test', category: 'mockup' },
    ][new Date().getDay()];

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl sm:text-5xl font-black tracking-tighter text-white italic uppercase flex items-baseline gap-4"
                    >
                        PROTOCOL <span className="text-zinc-700 not-italic text-sm sm:text-lg">ACTIVE:</span>
                        <span className="text-zinc-400">{userName || 'SENTINEL'}</span>
                    </motion.h1>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:gap-4 w-full sm:w-auto gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { console.log("Streak clicked"); setShowStreakDetail(true); }}
                        className="glass px-4 py-3 rounded-2xl flex items-center gap-3 border-indigo-500/10 cursor-pointer hover:border-orange-500/30 transition-colors col-span-1"
                    >
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                            <Flame className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-zinc-500 uppercase truncate">Streak</p>
                            <p className="text-sm font-black text-white truncate">{streak} Days</p>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNavigate('notebook', 'vocabulary')}
                        className="glass px-4 py-3 rounded-2xl flex items-center gap-3 border-indigo-500/10 cursor-pointer hover:border-emerald-500/30 transition-colors col-span-1"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-zinc-500 uppercase truncate">Vocab</p>
                            <p className="text-sm font-black text-white truncate">{vocabCount}</p>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowConsistencyDetail(true)}
                        className="glass px-4 py-3 rounded-2xl flex items-center justify-center border-indigo-500/10 col-span-2 sm:col-span-1 sm:h-auto cursor-pointer hover:border-white/20 transition-all"
                    >
                        <span className={`px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${consistencyPhase === 'Stable' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                            consistencyPhase === 'Neglect' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            } `}>
                            {consistencyPhase}
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-2">

                {/* Main Mission-Large Bento */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`col-span-12 lg:col-span-8 lg:row-span-2 relative overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] border border-white/10 bg-gradient-to-br group transition-all duration-500 ${todayMinutes < DAILY_GOAL
                        ? 'from-red-900/40 to-black border-red-500/20 shadow-2xl shadow-red-500/10'
                        : 'from-indigo-600/30 to-zinc-950 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.1)]'
                        } `}
                >
                    <div className="p-6 relative z-10 flex flex-col h-full min-h-[250px] md:min-h-0">
                        <div className="flex items-center gap-3 font-black tracking-widest text-[10px] uppercase mb-4 sm:mb-6">
                            <div className={`p-2 rounded-xl ${todayMinutes < DAILY_GOAL ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'} `}>
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span className={todayMinutes < DAILY_GOAL ? 'text-red-400' : 'text-indigo-400'}>
                                {todayMinutes < DAILY_GOAL ? 'ENGRESS ALERT:Action Required' : `High-Performance Level Locked`}
                            </span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl font-black mb-2 sm:mb-3 text-white group-hover:text-indigo-200 transition-colors leading-none tracking-tighter uppercase italic">
                            {todayMinutes < DAILY_GOAL ? 'IDENTITY CONFRONTATION' : 'Focus Sustained'} <br />
                            <span className={`${todayMinutes < DAILY_GOAL ? 'text-red-500/70' : 'text-emerald-400'} font-medium text-base sm:text-xl not-italic tracking-normal`}>
                                {todayMinutes < DAILY_GOAL ? 'This is not who you are.' : 'You have reached your daily standard.'}
                            </span>
                        </h2>

                        <div className={`max-w-md leading-relaxed mb-4 sm:mb-6 flex-1 italic text-xs sm:text-lg font-bold ${todayMinutes < DAILY_GOAL ? 'text-zinc-200' : 'text-zinc-400'} `}>
                            "{todayMinutes < DAILY_GOAL ? engressBriefing : "The discipline of today is the victory of tomorrow. Continue your evolution or rest, knowing you are on track."}"
                        </div>

                        <div className="flex items-center gap-6 mt-auto mb-2">
                            <button
                                onClick={() => {
                                    const cat = activeSession.category || (currentDayPlan as any).category || 'vocabulary';
                                    SetSessionCategory(cat.toUpperCase());
                                    onNavigate('vault', cat);
                                }}
                                className={`px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all text-sm sm:text-base group/btn ${todayMinutes < DAILY_GOAL
                                    ? 'bg-red-600 text-white animate-pulse shadow-xl shadow-red-600/40'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/30'
                                    } `}
                            >
                                {activeSession.category
                                    ? `Continue ${activeSession.category} session`
                                    : todayMinutes < DAILY_GOAL
                                        ? `Start ${currentDayPlan.focus} `
                                        : `Resume ${activeSession.category || 'Mastery'} Flow`}
                                <ArrowRight className={`w-4 h-4 transition-transform group-hover/btn:translate-x-1`} />
                            </button>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                        <div className={`absolute top-0 right-0 w-[600px] h-full blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3 ${todayMinutes < DAILY_GOAL ? 'bg-red-500' : 'bg-indigo-500'} `} />
                    </div>
                </motion.div>

                {/* Tomorrow's Mission-Small Bento */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="col-span-12 lg:col-span-4 glass rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 flex flex-col justify-between border-indigo-500/20 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10 min-h-[150px] lg:min-h-0"
                >
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Calculated Mission</span>
                            <Brain className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-zinc-600 uppercase">Tomorrow's Focus:</p>
                            <h3 className="text-lg sm:text-xl font-bold text-white italic leading-tight">
                                {tomorrowFocus}
                            </h3>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 hidden sm:block">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Strategy updated locally</p>
                    </div>
                </motion.div>

                {/* Study Time Check-Radial Progress Bento */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className={`col-span-12 lg:col-span-4 glass rounded-[2.5rem] sm:rounded-[3rem] p-6 flex flex-col justify-between items-center relative overflow-hidden ${todayMinutes < DAILY_GOAL ? 'border-red-500/20 bg-red-500/5' : 'bg-emerald-500/5 border-emerald-500/10'} min-h-[250px] lg:min-h-0`}
                >
                    <div className="w-full flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${todayMinutes < DAILY_GOAL ? 'text-indigo-400' : 'text-emerald-500'} `}>
                            {todayMinutes < DAILY_GOAL ? 'Mission Progress' : "Daily Goal Met"}
                        </span>
                        <Zap className={`w-4 h-4 ${todayMinutes < DAILY_GOAL ? 'text-indigo-500 animate-pulse' : 'text-emerald-400'} `} />
                    </div>

                    <div className="relative group">
                        <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                            {/* Background Track */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                className="stroke-zinc-900"
                                strokeWidth="8"
                                fill="transparent"
                            />
                            {/* Progress Fill */}
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                strokeWidth="8"
                                strokeDasharray="251.2"
                                initial={{ strokeDashoffset: 251.2 }}
                                animate={{ strokeDashoffset: 251.2 - (Math.min((todayMinutes / DAILY_GOAL), 1) * 251.2) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round"
                                className={todayMinutes < DAILY_GOAL ? 'stroke-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'stroke-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}
                                stroke="currentColor"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            {todayMinutes === 0 ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-black text-red-500/70 uppercase tracking-[0.2em] animate-pulse">NO DATA</span>
                                    <span className="text-[8px] font-bold text-zinc-700 uppercase">System Idle</span>
                                </div>
                            ) : (
                                <>
                                    <span className={`text-3xl sm:text-4xl font-black italic tabular-nums ${todayMinutes < DAILY_GOAL ? 'text-indigo-400' : 'text-emerald-400'} `}>
                                        {Math.round((todayMinutes / DAILY_GOAL) * 100)}%
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{todayMinutes}m Recorded</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="w-full pt-6 border-t border-white/5 mt-4 text-center">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            {todayMinutes < DAILY_GOAL
                                ? `${DAILY_GOAL - todayMinutes}m Remaining for goal`
                                : `Target smashed by ${todayMinutes - DAILY_GOAL} m`}
                        </p>
                    </div>
                </motion.div>

                {/* Daily Pulse Footers */}
                {/* Execution Pulse-Redesigned */}
                <div
                    onClick={() => setShowStreakDetail(true)}
                    className="col-span-12 glass rounded-[2rem] sm:rounded-[2.5rem] px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between border border-indigo-500/10 bg-indigo-500/[0.02] mt-auto py-3 sm:py-0 sm:h-20 gap-3 sm:gap-10 cursor-pointer hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden shrink-0"
                >
                    {/* Background Accent */}
                    <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-80 h-40 bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full" />

                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 relative z-10 w-full sm:w-auto">
                        <div className="flex flex-col gap-1 items-center sm:items-start shrink-0">
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                <Zap className="w-3 h-3 animate-pulse" />
                                <span>Execution Pulse</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white italic">WEEKLY</span>
                                <span className="text-zinc-700 font-bold text-[10px] uppercase">Consistency Monitoring</span>
                            </div>
                        </div>

                        {/* Weekly Histogram Mini */}
                        <div className="flex gap-2 h-10 items-end flex-1 sm:flex-none">
                            {weeklyPulse.map((h, i) => (
                                <div key={i} className="flex flex-col items-center gap-1.5 group/bar">
                                    <div className="relative w-2.5 sm:w-3.5 h-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.min((h / 120) * 100, 100)}%` }}
                                            className={`absolute bottom-0 left-0 right-0 ${i === 6 ? 'bg-indigo-500' : 'bg-indigo-500/30'} group-hover/bar:bg-indigo-400 transition-colors`}
                                        />
                                    </div>
                                    <div className={`w-1 h-1 rounded-full ${i === 6 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); setShowStreakDetail(true); }}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all group/arrow relative z-10"
                    >
                        <TrendingUp className="w-5 h-5 group-hover/arrow:scale-110 transition-transform" />
                    </button>
                </div>

            </div>

            {/* Modals - Rendered without Portals but with huge z-index for testing */}
            <AnimatePresence>
                {showStreakDetail && (
                    <motion.div
                        key="streak-modal-fallback"
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

                            <div className="relative z-10 space-y-8">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">Consistency Engine</span>
                                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tight">Mission Streak: {streak} Days</h3>
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

            <AnimatePresence>
                {showConsistencyDetail && (
                    <motion.div
                        key="consistency-modal-fallback"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowConsistencyDetail(false)}
                        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass max-w-xl w-full rounded-[3rem] p-10 border-indigo-500/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <ShieldCheck className="w-12 h-12 text-indigo-500/20" />
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">Discipline Score</span>
                                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Consistency Phases</h3>
                                    <p className="text-zinc-400 italic font-medium leading-relaxed">
                                        Engress monitors your discipline through real-time activity tracking. Here is how your status is calculated:
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { phase: 'Stable', color: 'text-indigo-400', bg: 'bg-indigo-500/10', desc: 'Plan maintained. You are meeting the standard every day.' },
                                        { phase: 'Slipping', color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Missed target for today. Immediate correction needed to maintain momentum.' },
                                        { phase: 'Neglect', color: 'text-red-500', bg: 'bg-red-500/10', desc: 'Critical breach. Multiple sessions missed. Re-engage system immediately.' },
                                        { phase: 'Avoiding', color: 'text-rose-400', bg: 'bg-rose-500/10', desc: 'Unbalanced training. You are ignoring core categories. Confront your weaknesses.' }
                                    ].map((item, idx) => (
                                        <div key={idx} className={`p-4 rounded-2xl border border-white/5 ${item.bg}/5 transition-all hover:border-white/10 group/item`}>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-xs font-black uppercase tracking-widest ${item.color}`}>{item.phase}</span>
                                            </div>
                                            <p className="text-[11px] text-zinc-500 font-medium group-hover/item:text-zinc-300 transition-colors uppercase tracking-[0.05em]">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-center pt-2">
                                    <button
                                        onClick={() => setShowConsistencyDetail(false)}
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
        </div>
    );
};

export default Dashboard;
