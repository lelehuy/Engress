import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, ChevronLeft, Save, Star, AlertCircle, BookOpen, Mic, PenTool, Headphones, Trophy } from 'lucide-react';
import SessionTimer from '../../components/SessionTimer';
import { SetSessionCategory, UpdateNotes, SetHUDScratchpadVisible } from '../../../wailsjs/go/main/App';
import { EventsOn } from '../../../wailsjs/runtime/runtime';

const Mockup = ({ onBack, onFinish, initialData, onUpdate }: {
    onBack: () => void;
    onFinish: (score: number, duration: number) => void;
    initialData?: any;
    onUpdate?: (data: any) => void;
}) => {
    const [step, setStep] = useState(initialData?.step || 0); // 0: Start, 1: Listening, 2: Reading, 3: Writing, 4: Speaking, 5: Finish
    const [duration, setSeconds] = useState(initialData?.duration || 0);
    const [scores, setScores] = useState(initialData?.scores || { listening: 0, reading: 0, writing: 0, speaking: 0 });
    const [notes, setNotes] = useState(initialData?.notes || '');

    useEffect(() => {
        if (onUpdate) onUpdate({ step, duration, scores, notes });
        UpdateNotes(notes);
    }, [step, duration, scores, notes, onUpdate]);

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

    useEffect(() => {
        // HUD Logic for Full Mockup
        // Listening: 0-30m (0-1800s)
        // Reading: 30-90m (1800-5400s)
        // Writing: 90-150m (5400-9000s)
        let phase = "";
        let isTransition = false;

        if (duration < 1800) {
            phase = "MOCKUP: LISTENING";
        } else if (duration < 1800 + 3600) {
            phase = "MOCKUP: READING";
            if (duration < 1800 + 60) isTransition = true; // Alert for first minute of Reading
        } else {
            phase = "MOCKUP: WRITING";
            if (duration < 5400 + 60) isTransition = true; // Alert for first minute of Writing
        }

        if (isTransition) {
            SetSessionCategory(">>> SWITCH PHASE <<<");
        } else {
            SetSessionCategory(phase);
        }
    }, [step, duration, scores, onUpdate]);

    const steps = [
        { id: 'start', name: 'Preparation', icon: Shield, time: '0m', desc: 'Ready for full simulation?' },
        { id: 'listening', name: 'Listening', icon: Headphones, time: '30m', desc: 'Focus on audio audio clarity' },
        { id: 'reading', name: 'Reading', icon: BookOpen, time: '60m', desc: 'Time management is key' },
        { id: 'writing', name: 'Writing', icon: PenTool, time: '60m', desc: 'Structure and Word count' },
        { id: 'speaking', name: 'Speaking', icon: Mic, time: '15m', desc: 'Fluency and Pronounced' }
    ];

    const currentStep = steps[step];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            const avg = (scores.listening + scores.reading + scores.writing + scores.speaking) / 4;
            onFinish(avg, Math.ceil(duration / 60));
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-zinc-950">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-bold text-white tracking-tight uppercase">Full Mock Simulation</h2>
                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Exam Conditions Active</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <SessionTimer initialSeconds={duration} onTimeUpdate={setSeconds} />
                    <div className="h-4 w-px bg-white/10" />
                    <button
                        onClick={handleNext}
                        className="bg-white text-black hover:bg-zinc-200 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
                    >
                        {step === steps.length - 1 ? 'Finalize Mock' : 'Next Category'}
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                {/* Left: Progress Sidebar */}
                <div className="col-span-3 border-r border-white/5 bg-zinc-950/30 p-8 space-y-6">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Mock Roadmap</span>
                        <div className="space-y-2">
                            {steps.map((s, i) => (
                                <div
                                    key={s.id}
                                    className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${step === i ? 'bg-white/5 border border-white/10 shadow-lg' : 'opacity-30'}`}
                                >
                                    <div className={`p-2 rounded-lg ${step === i ? 'bg-rose-500 text-white' : 'bg-zinc-800'}`}>
                                        <s.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white">{s.name}</span>
                                        <span className="text-[10px] text-zinc-500">{s.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto p-6 bg-rose-500/5 rounded-3xl border border-rose-500/10 space-y-2">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Full simulation results are filtered separately in Analytics to track your exam readiness.
                        </p>
                    </div>
                </div>

                {/* Right: Active Simulation View */}
                <div className="col-span-9 p-20 flex flex-col items-center justify-center relative overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full max-w-2xl bg-zinc-900 shadow-2xl rounded-[3rem] p-16 border border-white/5 text-center space-y-10"
                        >
                            <div className="w-24 h-24 bg-rose-500/20 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto">
                                <currentStep.icon className="w-10 h-10" />
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">{currentStep.name}</h1>
                                <p className="text-zinc-500 text-sm max-w-md mx-auto">{currentStep.desc}</p>
                            </div>

                            {step > 0 && (
                                <div className="space-y-4 pt-10 border-t border-white/5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Self-Reported Score</label>
                                    <div className="flex items-center justify-center gap-4">
                                        <input
                                            type="number"
                                            step="0.5"
                                            className="w-32 bg-zinc-800 border border-white/5 rounded-2xl p-4 text-center text-3xl font-black italic text-white"
                                            placeholder="0.0"
                                            value={(scores as any)[Object.keys(scores)[step - 1]] || ''}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                const key = Object.keys(scores)[step - 1];
                                                setScores((prev: any) => ({ ...prev, [key]: val }));
                                            }}
                                        />
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Target</p>
                                            <p className="text-2xl font-black italic text-white">7.5</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 0 && (
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform"
                                >
                                    Initiate Simulation
                                </button>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Background Visual Decoration */}
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
                </div>
            </div>
        </div>
    );
};

export default Mockup;
