import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, BookOpen, Clock, StickyNote, Target, Zap, Lightbulb, X, PenTool, Mic, Headphones, Trophy } from 'lucide-react';
import { preparationTips } from '../data/prepTips';
import { getCategoryColorClass } from '../utils/categoryColors';
import { GetAppState } from "../../wailsjs/go/main/App";
import EngressCalendar from '../components/EngressCalendar';

const categoryDetails: Record<string, any> = {
    "Reading": {
        "tips": [
            "Time management: Spend exactly 20 minutes on each of the three sections; timing is critical.",
            "Read the instructions carefully: Many candidates lose marks by not following word limit instructions.",
            "Don't panic: Some questions will be extremely difficult; move on if you are stuck to find easier marks.",
            "It is a vocabulary test: Focus on understanding synonyms and paraphrasing rather than matching exact words."
        ],
        "question_types": [
            "Short Answer Questions",
            "Multiple Choice",
            "Summary Completion",
            "Matching Sentence Endings",
            "True/False/Not Given",
            "Matching Headings",
            "Labelling a Diagram",
            "Matching Information to Paragraphs"
        ],
        "source": "https://www.ieltsadvantage.com/ielts-reading-2/"
    },
    "Vocabulary": {
        "tips": [
            "Read and listen to things that interest you: People learn more effectively when they enjoy the content.",
            "Keep a dedicated notebook: Consistently record new words, their meanings, and example sentences.",
            "Meaning from context: Try to guess the meaning of new words from the surrounding text before looking them up.",
            "Review periodically: Review new vocabulary after one week, two weeks, and one month to move it to long-term memory."
        ],
        "question_types": [
            "Education", "Crime", "Health", "Environment", "Technology", "Sport", "Work", "Advertising"
        ],
        "source": "https://www.ieltsadvantage.com/ielts-vocabulary-2/"
    },
    "Speaking": {
        "tips": [
            "Warm-up: Immerse yourself in English (reading, listening, speaking) for 24 hours before your test.",
            "Extend your answers: Avoid simple 'Yes' or 'No' responses; always provide reasons and examples.",
            "Correct your mistakes: If you notice a mistake, simply apologize and correct it to show the examiner your awareness.",
            "Ask for clarification: If you don't understand a word or question, it is perfectly acceptable to ask the examiner to explain."
        ],
        "question_types": [
            "Part 1: Informal Interview",
            "Part 2: Individual Long Turn (Cue Card)",
            "Part 3: Two-Way Discussion"
        ],
        "source": "https://www.ieltsadvantage.com/ielts-speaking/"
    },
    "Listening": {
        "tips": [
            "Expose yourself to accents: Practice listening to international accents, including Australian, American, and Canadian.",
            "Don't lose focus: If you miss an answer, move on immediately to avoid missing subsequent questions.",
            "Active Listening: Practice predicting what the speaker might say next based on the context provided.",
            "Transfer time: Use the 10 minutes at the end to double-check spelling and grammar."
        ],
        "question_types": [
            "Form Filling",
            "Multiple Choice",
            "Labelling a Map or Plan",
            "Sentence Completion",
            "Short Answer Questions",
            "Table/Flow-chart Completion"
        ],
        "source": "https://www.ieltsadvantage.com/ielts-listening-2/"
    },
    "Writing Task 1": {
        "tips": [
            "Paraphrase the question: Use synonyms to rewrite the prompt in your first paragraph.",
            "Write a clear overview: Identify 3-4 main features and describe them generally.",
            "Support features with data: Use specific numbers and figures from the chart.",
            "Proofread: Spend 2 minutes at the end checking for common spelling and grammar errors."
        ],
        "question_types": [
            "Line Graph",
            "Bar Chart",
            "Pie Chart",
            "Table",
            "Map",
            "Process (Diagram)"
        ],
        "source": "https://www.ieltsadvantage.com/writing-task-1/"
    },
    "Writing Task 2": {
        "tips": [
            "Understand the question: Carefully identify the question type and keywords.",
            "Plan your essay: Spend 10 minutes planning your structure and ideas.",
            "Clear Introduction: Write a two-sentence introduction that paraphrases the question and states your opinion.",
            "Use specific examples: Support your arguments with concrete examples."
        ],
        "question_types": [
            "Opinion (Agree or Disagree)",
            "Discussion (Discuss both views)",
            "Advantages and Disadvantages",
            "Problem and Solution",
            "Double Question (Direct Questions)"
        ],
        "source": "https://www.ieltsadvantage.com/writing-task-2/"
    },
    "Mock Test": {
        "tips": [
            "Simulate exam conditions: No phone, no breaks, strict timing.",
            "Practice endurance: Doing all four sessions together helps build focus stamina.",
            "Analyze mistakes: Spend as much time reviewing errors as you did on the test.",
            "Use official materials: Stick to Cambridge or official IELTS practice tests."
        ],
        "question_types": [
            "Listening (30m)",
            "Reading (60m)",
            "Writing (60m)",
            "Speaking (15m)"
        ],
        "source": "https://www.ieltsadvantage.com/"
    }
};

interface ScheduleProps {
    onNavigate?: (page: string, params?: string, query?: string) => void;
}

const Schedule = ({ onNavigate }: ScheduleProps) => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const [history, setHistory] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<any | null>(null);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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
        { day: 'Tue', focus: 'Reading', tip: preparationTips.reading[2] },
        { day: 'Wed', focus: 'Speaking', tip: preparationTips.speaking[2] },
        { day: 'Thu', focus: 'Listening', tip: preparationTips.listening[1] },
        { day: 'Fri', focus: 'Writing Task 2', tip: preparationTips.writing[0] },
        { day: 'Sat', focus: 'Mock Test', tip: preparationTips.reading[0] },
        { day: 'Sun', focus: 'Vocabulary', tip: { title: 'Review Week', content: 'Go through all the notes you saved this week.' } },
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

    const filteredHistory = history.filter(session => {
        if (dateRange.start && dateRange.end) {
            return session.date >= dateRange.start && session.date <= dateRange.end;
        } else if (dateRange.start) {
            return session.date >= dateRange.start;
        } else if (dateRange.end) {
            return session.date <= dateRange.end;
        }
        return true;
    });

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const paginatedHistory = filteredHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [dateRange]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white italic uppercase">SCHEDULE</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Strategic goals and historical insights.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Daily Suggestion */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                    <div className="glass p-6 rounded-[2rem] bg-indigo-600/5 border-indigo-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-indigo-400 font-black tracking-widest text-[10px] uppercase">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Today's Strategy • {today}</span>
                            </div>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white uppercase italic tracking-tighter text-left">
                            Focus: <span className="text-indigo-400">{studyPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].focus}</span>
                        </h2>

                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-start gap-4 mb-6">
                            <div className="p-1.5 bg-indigo-500/20 rounded-lg shrink-0">
                                <Lightbulb className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="space-y-0.5 min-w-0 text-left">
                                <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">{studyPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].tip.title}</p>
                                <p className="text-xs text-zinc-500 leading-tight italic line-clamp-2">
                                    "{studyPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].tip.content}"
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const todayPlan = studyPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
                                const catId = getCategoryId(todayPlan.focus);
                                if (onNavigate) onNavigate('vault', catId || undefined);
                            }}
                            className="w-full bg-white text-black font-black py-3.5 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                        >
                            Start Focus Session <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="glass p-5 rounded-[2rem] space-y-3">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Weekly Flow</span>
                        <div className="grid grid-cols-1 gap-1.5">
                            {studyPlan.map((plan, i) => {
                                const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                                const category = getCategoryId(plan.focus) || '';
                                const colorClass = getCategoryColorClass(category, 'text');
                                const bgColorClass = getCategoryColorClass(category, 'bg');
                                const borderColorClass = getCategoryColorClass(category, 'border');

                                return (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedCategory(plan.focus)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-100 ${isToday
                                            ? `${bgColorClass}/10 ${borderColorClass}/40 shadow-lg shadow-indigo-500/5`
                                            : 'bg-transparent border-white/5 opacity-40 hover:opacity-100 hover:bg-white/5 transition-all'
                                            }`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-1.5 h-1.5 rounded-full ${bgColorClass} ${isToday ? 'animate-pulse' : 'opacity-40'}`} />
                                            <span className={`text-[9px] font-black w-7 ${isToday ? 'text-white' : 'text-zinc-600'}`}>{plan.day}</span>
                                            <div className="flex flex-col text-left">
                                                <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-zinc-400'}`}>{plan.focus}</span>
                                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Tap for details</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isToday && <Target className={`w-3.5 h-3.5 ${colorClass} animate-pulse`} />}
                                            <ChevronRight className="w-3 h-3 text-zinc-800" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Historical Logs */}
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 gap-4">
                        <div className="flex items-center gap-2">
                            <StickyNote className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-bold text-white uppercase tracking-tight italic">Focus History</h3>
                        </div>

                        <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 overflow-visible">
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowStartCalendar(!showStartCalendar);
                                        setShowEndCalendar(false);
                                    }}
                                    className="bg-zinc-950/50 border border-white/5 rounded-xl py-2 px-4 text-[9px] uppercase font-black tracking-widest text-zinc-400 hover:bg-zinc-900 transition-all min-w-[100px] text-left"
                                >
                                    {dateRange.start || 'START DATE'}
                                </button>
                                <AnimatePresence>
                                    {showStartCalendar && (
                                        <div className="absolute top-full mt-2 left-0 z-50">
                                            <EngressCalendar
                                                selectedDate={dateRange.start}
                                                onDateSelect={(date) => {
                                                    setDateRange(prev => ({ ...prev, start: date }));
                                                    setShowStartCalendar(false);
                                                }}
                                                onClose={() => setShowStartCalendar(false)}
                                            />
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <span className="text-[9px] font-black text-zinc-700">TO</span>
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowEndCalendar(!showEndCalendar);
                                        setShowStartCalendar(false);
                                    }}
                                    className="bg-zinc-950/50 border border-white/5 rounded-xl py-2 px-4 text-[9px] uppercase font-black tracking-widest text-zinc-400 hover:bg-zinc-900 transition-all min-w-[100px] text-left"
                                >
                                    {dateRange.end || 'END DATE'}
                                </button>
                                <AnimatePresence>
                                    {showEndCalendar && (
                                        <div className="absolute top-full mt-2 right-0 lg:left-0 z-50">
                                            <EngressCalendar
                                                selectedDate={dateRange.end}
                                                onDateSelect={(date) => {
                                                    setDateRange(prev => ({ ...prev, end: date }));
                                                    setShowEndCalendar(false);
                                                }}
                                                onClose={() => setShowEndCalendar(false)}
                                            />
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {(dateRange.start || dateRange.end) && (
                                <button
                                    onClick={() => setDateRange({ start: '', end: '' })}
                                    className="p-2 text-zinc-600 hover:text-rose-500 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {paginatedHistory.length > 0 ? (
                            <>
                                {paginatedHistory.map((session, i) => {
                                    const Icon = getModuleIcon(session.module);
                                    return (
                                        <motion.div
                                            key={session.id || i}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            onClick={() => setSelectedSession(session)}
                                            className="glass p-5 rounded-[2rem] group hover:border-indigo-500/50 transition-all cursor-pointer active:scale-[0.98] border border-white/5 flex items-center justify-between gap-6"
                                        >
                                            <div className="flex gap-5 items-center min-w-0">
                                                <div className="shrink-0 w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/10 transition-colors">
                                                    <Icon className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400" />
                                                </div>
                                                <div className="min-w-0 text-left">
                                                    <h4 className="font-bold text-white text-sm sm:text-base uppercase tracking-tight truncate">{session.module || 'Study'} Session</h4>
                                                    <p className="text-[10px] sm:text-xs text-zinc-500 font-medium">{session.date} • {session.duration}m Intensity</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                                <div className={`px-4 py-2 rounded-xl font-black italic shadow-lg transition-all text-xs sm:text-sm ${session.score > 0 ? 'bg-indigo-600 text-white shadow-indigo-500/10' : 'bg-zinc-800 text-zinc-500'}`}>
                                                    {session.score > 0 ? `Band ${session.score.toFixed(1)}` : 'Logged'}
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-indigo-400 transition-colors" />
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 py-6">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Page</span>
                                            <span className="text-sm font-black text-white italic">{currentPage} <span className="text-zinc-700 not-italic">/</span> {totalPages}</span>
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-10 sm:p-20 border-2 border-dashed border-white/5 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                <Clock className="w-12 h-12 text-zinc-700" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white">No history matching criteria</p>
                                    <p className="text-xs text-zinc-500">Try adjusting your filters or finish a new session.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Quick View Modal - Reverted to local rendering */}
            <AnimatePresence>
                {selectedSession && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setSelectedSession(null)}>
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

                            <div className="space-y-4 text-left">
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

                            <div className="space-y-6 text-left">
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

            {/* Category Detail Modal - Reverted to local rendering */}
            <AnimatePresence>
                {selectedCategory && categoryDetails[selectedCategory] && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-md" onClick={() => setSelectedCategory(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="w-full max-w-2xl glass rounded-[3rem] overflow-hidden border-indigo-500/30 flex flex-col md:flex-row relative"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-white/10 rounded-full text-white z-10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Left: Section Info */}
                            <div className="md:w-2/5 p-8 sm:p-10 bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col text-left">
                                <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6 border border-white/20">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Detailed Protocol</h3>
                                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none">
                                    {selectedCategory}
                                </h1>
                                <p className="text-white/70 text-xs font-medium leading-relaxed italic mb-8 text-left">
                                    Strategic insights and common patterns extracted from expert analysis.
                                </p>

                                <a
                                    href={categoryDetails[selectedCategory].source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-auto flex items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 text-[9px] font-black uppercase tracking-widest text-left"
                                >
                                    Refine at Source <ChevronRight className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            {/* Right: Content */}
                            <div className="md:w-3/5 p-8 sm:p-10 space-y-8 bg-zinc-900 overflow-y-auto max-h-[80vh] md:max-h-[600px] custom-scrollbar text-left">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-amber-500" />
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-left">Strategic Tips</span>
                                    </div>
                                    <div className="space-y-3">
                                        {categoryDetails[selectedCategory].tips.map((tip: string, idx: number) => (
                                            <div key={idx} className="flex gap-3 text-left">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                                <p className="text-xs text-zinc-300 font-medium leading-relaxed">{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-left">Common patterns</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {categoryDetails[selectedCategory].question_types.map((type: string, idx: number) => (
                                            <div key={idx} className="px-3 py-2 bg-zinc-950 border border-white/5 rounded-xl text-[9px] font-bold text-zinc-400 uppercase tracking-tight text-center">
                                                {type}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Schedule;
