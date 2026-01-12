import { PenTool, Mic, BookOpen, Headphones, ArrowRight, Trophy, Zap, Book } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GetAppState } from "../../wailsjs/go/main/App";
import Writing from './StudyVault/Writing';
import Speaking from './StudyVault/Speaking';
import Reading from './StudyVault/Reading';
import Vocabulary from './StudyVault/Vocabulary';
import Mockup from './StudyVault/Mockup';

interface StudyVaultProps {
    initialCategory?: string | null;
    sessionState: { category: string | null; data: any; isActive: boolean; };
    onUpdateSession: (data: any) => void;
    onTriggerReflection: (duration?: number) => void;
    onBack: () => void;
}

const StudyVault = ({ initialCategory, sessionState, onUpdateSession, onTriggerReflection, onBack }: StudyVaultProps) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory || null);
    const [streak, setStreak] = useState(0);
    const [totalHours, setTotalHours] = useState(0);

    useEffect(() => {
        GetAppState().then(state => {
            const logs = state.daily_logs || [];
            const totalMin = logs.reduce((acc: number, l: any) => acc + (l.duration || 0), 0);
            setTotalHours(Math.ceil(totalMin / 60));

            let currentStreak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const uniqueDates = Array.from(new Set(logs.map((l: any) => l.date))).sort().reverse();

            if (uniqueDates.length > 0) {
                let lastDate = new Date(uniqueDates[0]);
                const diffToday = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

                if (diffToday <= 1) {
                    currentStreak = 1;
                    for (let i = 1; i < uniqueDates.length; i++) {
                        const prevDate = new Date(uniqueDates[i]);
                        const gap = Math.floor((lastDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
                        if (gap === 1) {
                            currentStreak++;
                            lastDate = prevDate;
                        } else {
                            break;
                        }
                    }
                }
            }
            setStreak(currentStreak);
        });
    }, []);

    const categories = [
        { id: 'vocabulary', name: 'Vocabulary', icon: Book, count: 'Sentence Builder', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { id: 'writing', name: 'Writing', icon: PenTool, count: 'Workspace', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { id: 'speaking', name: 'Speaking', icon: Mic, count: 'Recorder', color: 'text-rose-400', bg: 'bg-rose-400/10' },
        { id: 'reading', name: 'Reading', icon: BookOpen, count: 'Calculator', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 'listening', name: 'Listening', icon: Headphones, count: 'Calculator', color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { id: 'mockup', name: 'Full Mockup', icon: Trophy, count: 'Simulation', color: 'text-white', bg: 'bg-indigo-600 shadow-xl shadow-indigo-500/20' },
    ];

    const handleCategorySelect = (id: string) => {
        setActiveCategory(id);
        onUpdateSession({ category: id, isActive: true }); // Starts the session explicitly
    };

    const handleBack = () => {
        if (activeCategory) {
            setActiveCategory(null);
            // "Pause" the session by setting isActive to false, but keep the category 
            // so the dashboard/grid can show highlights for unfinished work.
            onUpdateSession({ isActive: false });
        } else {
            onBack();
        }
    };

    if (activeCategory === 'vocabulary') {
        return <Vocabulary
            onBack={handleBack}
            onFinish={(dur) => onTriggerReflection(dur)}
            initialData={sessionState.category === 'vocabulary' ? sessionState.data : null}
            onUpdate={(data: any) => onUpdateSession({ ...data, category: 'vocabulary' })}
        />;
    }

    if (activeCategory === 'writing') {
        return <Writing
            onBack={handleBack}
            onFinish={(dur) => onTriggerReflection(dur)}
            initialData={sessionState.category === 'writing' ? sessionState.data : null}
            onUpdate={(data: any) => onUpdateSession({ ...data, category: 'writing' })}
        />;
    }
    if (activeCategory === 'speaking') {
        return <Speaking
            onBack={handleBack}
            onFinish={(dur) => onTriggerReflection(dur)}
            initialData={sessionState.category === 'speaking' ? sessionState.data : null}
            onUpdate={(data: any) => onUpdateSession({ ...data, category: 'speaking' })}
        />;
    }
    if (activeCategory === 'reading' || activeCategory === 'listening') {
        return <Reading
            onBack={handleBack}
            onFinish={(dur) => onTriggerReflection(dur)}
            initialData={sessionState.category === activeCategory ? sessionState.data : null}
            onUpdate={(data: any) => onUpdateSession({ ...data, category: activeCategory })}
        />;
    }

    if (activeCategory === 'mockup') {
        return <Mockup
            onBack={handleBack}
            onFinish={(_, dur) => onTriggerReflection(dur)}
            initialData={sessionState.category === 'mockup' ? sessionState.data : null}
            onUpdate={(data: any) => onUpdateSession({ ...data, category: 'mockup' })}
        />;
    }

    return (
        <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto p-4 sm:p-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white uppercase italic">Focus Lab</h1>
                <p className="text-zinc-500 text-sm sm:text-base font-medium italic">High-performance tools for your self-study preparation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`glass p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] text-left group transition-all flex justify-between items-center relative overflow-hidden ${sessionState.category === cat.id
                            ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.15)]'
                            : 'hover:border-indigo-500/30'
                            }`}
                    >
                        {sessionState.category === cat.id && (
                            <div className="absolute top-4 right-6 lg:top-6 lg:right-10 flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 ${sessionState.isActive ? 'animate-pulse' : ''}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${sessionState.isActive ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-amber-500'}`}></span>
                                    <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${sessionState.isActive ? 'text-rose-500' : 'text-amber-500'}`}>
                                        {sessionState.isActive ? 'Active Now' : 'Unfinished'}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-4 lg:gap-8 items-center relative z-10 min-w-0 flex-1 mr-4">
                            <div className={`shrink-0 w-14 h-14 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl ${cat.bg} flex items-center justify-center shadow-lg ${sessionState.category === cat.id ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-zinc-950' : ''
                                }`}>
                                <cat.icon className={`w-6 h-6 lg:w-10 lg:h-10 ${cat.color}`} />
                            </div>
                            <div className="space-y-0.5 lg:space-y-1 min-w-0 flex-1">
                                <h3 className="text-lg lg:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight italic truncate">{cat.name}</h3>
                                <p className="text-[10px] lg:text-sm font-bold text-zinc-500 uppercase tracking-widest truncate">{cat.count}</p>
                            </div>
                        </div>
                        <div className={`shrink-0 w-10 h-10 lg:w-14 lg:h-14 rounded-full border-2 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all shadow-xl relative z-10 active:scale-90 ${sessionState.category === cat.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-800 text-zinc-600'
                            }`}>
                            <ArrowRight className="w-4 h-4 lg:w-6 lg:h-6 group-hover:text-black" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Analytics Integration - Bento Style */}
            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 glass rounded-[3rem] p-10 flex flex-col justify-between min-h-[220px]">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Overall Preparation</p>
                        <h4 className="text-2xl font-bold text-white italic">Your velocity is {totalHours > 5 ? 'Stable' : 'Building'}.</h4>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex-1 h-3 bg-zinc-900 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((totalHours / 100) * 100, 100)}%` }}
                                className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            />
                        </div>
                        <span className="text-sm font-bold text-zinc-400 tabular-nums">{totalHours} Hours Trained</span>
                    </div>
                </div>

                <div className="col-span-4 glass rounded-[3rem] p-10 bg-indigo-600 shadow-2xl shadow-indigo-600/20 flex flex-col justify-center items-center text-center space-y-4 border-none group cursor-pointer active:scale-95 transition-transform">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Mastery Level</p>
                    <p className="text-5xl font-black italic text-white tracking-tighter">
                        {totalHours > 50 ? 'Elite' : totalHours > 20 ? 'Silver' : 'Bronze'}
                    </p>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Active Streak: {streak} Sessions</p>
                </div>
            </div>
        </div>
    );
};

export default StudyVault;
