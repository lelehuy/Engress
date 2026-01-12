import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronRight, BookOpen, Clock, StickyNote, Target, Zap, Lightbulb, X, PenTool, Mic, Headphones, Trophy } from 'lucide-react';
import { preparationTips } from '../data/prepTips';
import { GetAppState } from "../../wailsjs/go/main/App";

interface ScheduleProps {
    onNavigate?: (page: string, params?: string, query?: string) => void;
}

const Schedule = ({ onNavigate }: ScheduleProps) => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const [history, setHistory] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<any | null>(null);

    useEffect(() => {
        GetAppState().then(state => {
            if (state.daily_logs) {
                setHistory([...state.daily_logs].reverse());
            }
        });
    }, []);

    const getModuleIcon = (module: string) => {
        switch (module?.toLowerCase()) {
            case 'writing': return PenTool;
            case 'speaking': return Mic;
            case 'reading': return BookOpen;
            case 'listening': return Headphones;
            case 'mockup': return Trophy;
            default: return BookOpen;
        }
    };

    const studyPlan = [
        { day: 'Mon', focus: 'Writing Task 1', tip: preparationTips.writing[1] },
        { day: 'Tue', focus: 'Reading Scanning', tip: preparationTips.reading[2] },
        { day: 'Wed', focus: 'Speaking Part 2', tip: preparationTips.speaking[2] },
        { day: 'Thu', focus: 'Listening Word Limits', tip: preparationTips.listening[1] },
        { day: 'Fri', focus: 'Writing Task 2', tip: preparationTips.writing[0] },
        { day: 'Sat', focus: 'Full Mock Test', tip: preparationTips.reading[0] },
        { day: 'Sun', focus: 'Vocabulary Review', tip: { title: 'Review Week', content: 'Go through all the notes you saved this week.' } },
    ];

    const getCategoryId = (focus: string) => {
        const f = focus.toLowerCase();
        if (f.includes('writing')) return 'writing';
        if (f.includes('reading')) return 'reading';
        if (f.includes('speaking')) return 'speaking';
        if (f.includes('listening')) return 'listening';
        if (f.includes('mock')) return 'mockup';
        if (f.includes('vocabulary')) return 'vocabulary';
        return null;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-bold tracking-tight text-white">Smart Scheduler</h1>
                <p className="text-zinc-500 font-medium italic">Strategic goals and historical insights.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Daily Suggestion */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-indigo-600/5 border-indigo-500/20">
                        <div className="flex items-center gap-3 text-indigo-400 font-black tracking-widest text-[10px] uppercase mb-6">
                            <Zap className="w-4 h-4" />
                            <span>Today's Strategy • {today}</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white leading-tight">
                            Focus on <br />
                            <span className="text-indigo-400 italic">{studyPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].focus}</span>
                        </h2>

                        <div className="p-4 sm:p-6 bg-indigo-500/10 rounded-2xl sm:rounded-3xl border border-indigo-500/20 space-y-4 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-indigo-500/20 rounded-xl shrink-0">
                                    <Lightbulb className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wide">{studyPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].tip.title}</p>
                                    <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed italic">
                                        "{studyPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].tip.content}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const todayPlan = studyPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
                                const catId = getCategoryId(todayPlan.focus);
                                if (onNavigate) onNavigate('vault', catId || undefined);
                            }}
                            className="w-full bg-white text-black font-black py-3 sm:py-4 rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs"
                        >
                            Start Focus Session <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] space-y-6">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Weekly Flow</span>
                        <div className="space-y-3">
                            {studyPlan.map((plan, i) => {
                                const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                                return (
                                    <div key={i} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${isToday ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-transparent border-white/5 opacity-50'}`}>
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <span className="text-[10px] sm:text-xs font-black text-zinc-400 w-8">{plan.day}</span>
                                            <span className="text-xs sm:text-sm font-bold text-white">{plan.focus}</span>
                                        </div>
                                        {isToday && <Target className="w-4 h-4 text-indigo-400 shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Historical Logs */}
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <StickyNote className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-bold text-white">Focus History & Notes</h3>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:inline">Historical View</span>
                    </div>

                    <div className="space-y-4">
                        {history.length > 0 ? history.map((session, i) => {
                            const Icon = getModuleIcon(session.module);
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setSelectedSession(session)}
                                    className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] group hover:border-indigo-500/50 transition-all cursor-pointer active:scale-[0.98]"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6">
                                        <div className="flex gap-4 items-center">
                                            <div className="shrink-0 w-12 h-12 rounded-xl sm:rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/10 transition-colors">
                                                <Icon className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-white text-base sm:text-lg uppercase tracking-tight truncate">{session.module || 'Study'} Session</h4>
                                                <p className="text-[10px] sm:text-xs text-zinc-500 font-medium">{session.date} • {session.duration}m Intensity</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl font-black italic shadow-lg transition-all text-sm sm:text-base ${session.score > 0 ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                                            {session.score > 0 ? `Band ${session.score.toFixed(1)}` : 'Logged'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Obstacles</span>
                                            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed italic line-clamp-2">
                                                "{session.reflection || 'No obstacles recorded.'}"
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-indigo-400/50 uppercase tracking-widest">Tomorrow's Focus</span>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                <p className="text-[11px] sm:text-xs text-zinc-300 font-medium truncate">{session.homework || 'General review scheduled.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <span className="text-[10px] font-black text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 uppercase tracking-widest">
                                            Click to view learnings <ChevronRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="p-10 sm:p-20 border-2 border-dashed border-white/5 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                <Clock className="w-12 h-12 text-zinc-700" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white">No history recorded yet</p>
                                    <p className="text-xs text-zinc-500">Finish your first study session to see your notes here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Quick View Modal */}
            <AnimatePresence>
                {selectedSession && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setSelectedSession(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg glass rounded-[3rem] p-10 space-y-8 border-indigo-500/30 relative"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="absolute top-8 right-8 p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                        Session Insight
                                    </span>
                                    <span className="text-zinc-500 text-xs font-mono">{selectedSession.date}</span>
                                </div>
                                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase tabular-nums">
                                    {selectedSession.module || 'Study'} CALIBRATION
                                </h1>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-amber-500" /> Key Learning Point
                                    </h3>
                                    <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl">
                                        <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                            {selectedSession.learnings || "No specific learning points were noted for this session."}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                        <X className="w-4 h-4" /> The Obstacle
                                    </h3>
                                    <p className="text-xs text-zinc-500 italic px-2">
                                        "{selectedSession.reflection || "Consistent focus maintained."}"
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedSession(null)}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20"
                            >
                                Close Debriefing
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Schedule;
