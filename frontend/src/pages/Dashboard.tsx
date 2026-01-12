import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, TrendingUp, Trophy, ArrowRight, ExternalLink, Flame, Brain, Clock, ShieldCheck, Lightbulb, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { preparationTips } from '../data/prepTips';
import { GetAppState, GetEngressBriefing as GetSentinelBriefing, GetConsistencyPhase, SetSessionCategory } from "../../wailsjs/go/main/App";

const Dashboard = ({ onNavigate, activeSession }: {
    onNavigate: (page: string, params?: string, query?: string) => void,
    activeSession: { category: string | null; isActive: boolean; }
}) => {
    const [missionAccepted, setMissionAccepted] = useState(false);
    const [testDate, setTestDate] = useState<Date | null>(null);
    const [daysLeft, setDaysLeft] = useState(0);
    const [todayMinutes, setTodayMinutes] = useState(0);
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

    useEffect(() => {
        GetAppState().then(state => {
            if (state.user_profile.name) {
                setUserName(state.user_profile.name);
            }
            if (state.user_profile.test_date) {
                const date = new Date(state.user_profile.test_date);
                setTestDate(date);
                const diff = date.getTime() - new Date().getTime();
                setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 3600 * 24))));
            }

            setVocabCount(state.vocabulary?.length || 0);

            const today = new Date().toISOString().split('T')[0];
            const logs = state.daily_logs || [];

            // Calculate Current Streak
            let currentStreak = 0;
            const uniqueDates = Array.from(new Set(logs.map((l: any) => l.date))).sort().reverse();
            const todayStr = new Date().toISOString().split('T')[0];
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

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

            const total = logs
                .filter((log: any) => log.date === today)
                .reduce((acc: number, log: any) => acc + (log.duration || 0), 0);
            setTodayMinutes(total);

            if (logs.length > 0) {
                const lastLog = logs[logs.length - 1];
                setTomorrowFocus(lastLog.homework || 'Review session fundamentals');
                setLastScore(lastLog.score);

                // Calculate Weekly Pulse (Last 7 Days)
                const pulse = new Array(7).fill(0);
                const now = new Date();
                for (let i = 0; i < 7; i++) {
                    const targetDate = new Date();
                    targetDate.setDate(now.getDate() - (6 - i));
                    const dateStr = targetDate.toISOString().split('T')[0];
                    pulse[i] = logs
                        .filter((log: any) => log.date === dateStr)
                        .reduce((acc: number, log: any) => acc + (log.duration || 0), 0);
                }
                setWeeklyPulse(pulse);
            }
        });
        GetSentinelBriefing().then(setEngressBriefing);
        GetConsistencyPhase().then(setConsistencyPhase);
    }, []);

    const studyPlan = [
        { day: 'Mon', focus: 'Writing Task 1', category: 'writing', tip: preparationTips.writing[1] },
        { day: 'Tue', focus: 'Reading Scanning', category: 'reading', tip: preparationTips.reading[2] },
        { day: 'Wed', focus: 'Speaking Part 2', category: 'speaking', tip: preparationTips.speaking[2] },
        { day: 'Thu', focus: 'Listening Word Limits', category: 'listening', tip: preparationTips.listening[1] },
        { day: 'Fri', focus: 'Writing Task 2', category: 'writing', tip: preparationTips.writing[0] },
        { day: 'Sat', focus: 'Full Mock Test', category: 'mockup', tip: preparationTips.reading[0] },
        { day: 'Sun', focus: 'Vocabulary Review', category: 'vocabulary', tip: { title: 'Review Week', content: 'Go through all the notes you saved this week.' } },
    ];

    const currentDayPlan = studyPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

    const getMasteryStrategy = (daysOut: number) => {
        if (daysOut <= 0) return { phase: "Exam Day", goal: "Peak Performance", details: { title: "Exam Day", content: "Good luck! You are ready." } };
        if (daysOut > 60) return { phase: "Foundation", goal: "Grammar & Basic Lexicon", details: currentDayPlan.tip };
        if (daysOut > 30) return { phase: "Development", goal: "Speed & Structure", details: currentDayPlan.tip };
        if (daysOut > 14) return { phase: "Mastery", goal: "Nuance & Academic Tone", details: currentDayPlan.tip };
        return { phase: "Mock Phase", goal: "Exam Simulation", details: currentDayPlan.tip };
    };

    const strategy = getMasteryStrategy(daysLeft);

    return (
        <div className="space-y-6 sm:space-y-10 pb-10 max-w-6xl mx-auto animate-in fade-in duration-700">
            {/* Command Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] font-black text-indigo-400 uppercase tracking-widest">System Online</div>
                        <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-black text-zinc-500 uppercase tracking-widest">{daysLeft} Days to Deadline</div>
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase italic leading-none"
                    >
                        Engress <span className="text-zinc-700 not-italic font-medium">{userName || 'Command'}</span>
                    </motion.h1>
                </div>
                <div className="flex gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowStreakDetail(true)}
                        className="glass px-4 py-3 rounded-2xl flex items-center gap-3 shrink-0 border-indigo-500/10 cursor-pointer hover:border-orange-500/30 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Flame className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase">Streak</p>
                            <p className="text-sm font-black text-white">{streak} Days</p>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNavigate('notebook', 'vocabulary')}
                        className="glass px-4 py-3 rounded-2xl flex items-center gap-3 shrink-0 border-indigo-500/10 cursor-pointer hover:border-emerald-500/30 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase">Vocab</p>
                            <p className="text-sm font-black text-white">{vocabCount}</p>
                        </div>
                    </motion.div>
                    <div className="glass px-4 py-2 sm:px-3 sm:py-2 rounded-2xl flex items-center gap-3 shrink-0 border-indigo-500/10 h-full">
                        <span className={`px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${consistencyPhase === 'Stable' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                            consistencyPhase === 'Neglect' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            }`}>
                            {consistencyPhase}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto md:auto-rows-[200px]">

                {/* Main Mission - Large Bento */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`col-span-12 md:col-span-8 md:row-span-2 relative overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] border border-white/10 bg-gradient-to-br group transition-all duration-500 ${todayMinutes < DAILY_GOAL
                        ? 'from-red-900/40 to-black border-red-500/20 shadow-2xl shadow-red-500/10'
                        : 'from-indigo-600/30 to-zinc-950 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.1)]'}`}
                >
                    <div className="p-6 sm:p-10 relative z-10 flex flex-col h-full min-h-[350px] md:min-h-0">
                        <div className="flex items-center gap-3 font-black tracking-widest text-[10px] uppercase mb-4 sm:mb-6">
                            <div className={`p-2 rounded-xl ${todayMinutes < DAILY_GOAL ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span className={todayMinutes < DAILY_GOAL ? 'text-red-400' : 'text-indigo-400'}>
                                {todayMinutes < DAILY_GOAL ? 'ENGRESS ALERT: Action Required' : `High-Performance Level Locked`}
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-black mb-3 sm:mb-4 text-white group-hover:text-indigo-200 transition-colors leading-tight tracking-tighter uppercase italic">
                            {todayMinutes < DAILY_GOAL ? 'IDENTITY CONFRONTATION' : 'Protocol Sustained'} <br />
                            <span className={`${todayMinutes < DAILY_GOAL ? 'text-red-500/70' : 'text-emerald-400'} font-medium text-lg sm:text-2xl not-italic tracking-normal`}>
                                {todayMinutes < DAILY_GOAL ? 'This is not who you are.' : 'You have honored the standard today.'}
                            </span>
                        </h2>

                        <div className={`max-w-md leading-relaxed mb-6 sm:mb-8 flex-1 italic text-base sm:text-xl font-bold ${todayMinutes < DAILY_GOAL ? 'text-zinc-200' : 'text-zinc-400'}`}>
                            "{todayMinutes < DAILY_GOAL ? engressBriefing : "The discipline of today is the victory of tomorrow. Continue your evolution or rest, knowing you are on track."}"
                        </div>

                        <div className="flex items-center gap-6 mt-auto">
                            <button
                                onClick={() => {
                                    const cat = activeSession.category || currentDayPlan.category;
                                    SetSessionCategory(cat.toUpperCase());
                                    onNavigate('vault', cat);
                                }}
                                className={`px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all text-sm sm:text-base group/btn ${todayMinutes < DAILY_GOAL
                                    ? 'bg-red-600 text-white animate-pulse shadow-xl shadow-red-600/40'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/30'
                                    }`}
                            >
                                {activeSession.category
                                    ? `Continue ${activeSession.category} session`
                                    : todayMinutes < DAILY_GOAL
                                        ? `Start Today's training`
                                        : `Resume Mastery Flow`}
                                <ArrowRight className={`w-4 h-4 transition-transform group-hover/btn:translate-x-1`} />
                            </button>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-[500px] h-full overflow-hidden pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                        <div className={`absolute -top-40 -right-40 w-[400px] h-[400px] blur-[120px] rounded-full ${todayMinutes < DAILY_GOAL ? 'bg-red-500' : 'bg-indigo-500'}`} />
                    </div>
                </motion.div>

                {/* Tomorrow's Mission - Small Bento */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="col-span-12 md:col-span-4 glass rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 flex flex-col justify-between border-indigo-500/20 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10 min-h-[150px] md:min-h-0"
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

                {/* Study Time Check - Radial Progress Bento */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className={`col-span-12 md:col-span-4 glass rounded-[2.5rem] sm:rounded-[3rem] p-8 flex flex-col justify-between items-center relative overflow-hidden ${todayMinutes < DAILY_GOAL ? 'border-red-500/20 bg-red-500/5' : 'bg-emerald-500/5 border-emerald-500/10'} min-h-[300px] md:min-h-0`}
                >
                    <div className="w-full flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${todayMinutes < DAILY_GOAL ? 'text-indigo-400' : 'text-emerald-500'}`}>
                            {todayMinutes < DAILY_GOAL ? 'Mission Progress' : "Protocol Met"}
                        </span>
                        <Zap className={`w-4 h-4 ${todayMinutes < DAILY_GOAL ? 'text-indigo-500 animate-pulse' : 'text-emerald-400'}`} />
                    </div>

                    <div className="relative flex items-center justify-center">
                        <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90">
                            {/* Background Track */}
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                pathLength="100"
                                className="stroke-zinc-900"
                                strokeWidth="8"
                                fill="transparent"
                            />
                            {/* Progress Fill */}
                            <motion.circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                pathLength="100"
                                fill="transparent"
                                strokeWidth="8"
                                strokeDasharray="100 100"
                                initial={{ strokeDashoffset: 100 }}
                                animate={{ strokeDashoffset: 100 - Math.min((todayMinutes / DAILY_GOAL) * 100, 100) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round"
                                className={todayMinutes < DAILY_GOAL ? 'stroke-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'stroke-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}
                                stroke="currentColor"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                            <span className={`text-3xl sm:text-4xl font-black italic tabular-nums ${todayMinutes < DAILY_GOAL ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                {todayMinutes}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Minutes</span>
                        </div>
                    </div>

                    <div className="w-full pt-6 border-t border-white/5 mt-4 text-center">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            {todayMinutes < DAILY_GOAL
                                ? `${DAILY_GOAL - todayMinutes}m Remaining for goal`
                                : `Target smashed by ${todayMinutes - DAILY_GOAL}m`}
                        </p>
                    </div>
                </motion.div>

                {/* Daily Pulse Footers */}
                <div
                    onClick={() => setShowStreakDetail(true)}
                    className="col-span-12 glass rounded-[2rem] sm:rounded-[2.5rem] px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between border-dashed bg-transparent border-white/5 mt-4 py-6 sm:py-0 sm:h-24 gap-4 sm:gap-0 cursor-pointer hover:bg-white/5 transition-all group"
                >
                    <div className="flex items-center gap-6 sm:gap-10">
                        <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="hidden sm:inline">Execution Pulse</span>
                        </div>
                        <div className="flex items-end gap-1.5 h-8">
                            {weeklyPulse.map((val, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(10, Math.min((val / 120) * 100, 100))}%` }}
                                    className={`w-1.5 sm:w-2 rounded-full ${i === 6 ? 'bg-indigo-500' : 'bg-zinc-800'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('schedule')}
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-2 group whitespace-nowrap"
                    >
                        View Detailed Roadmap <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

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
        </div>
    );
};

export default Dashboard;
