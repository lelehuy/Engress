import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Mic, BookOpen, Clock, AlertCircle, ChevronLeft, Type, Layout, Sidebar, Search, Lightbulb, Star, Info, Share2, MoreHorizontal, Save, ExternalLink, X } from 'lucide-react';
import SessionTimer from '../../components/SessionTimer';
import { preparationTips } from '../../data/prepTips';

const Writing = ({ onBack, onFinish, initialData, onUpdate }: {
    onBack: () => void;
    onFinish: (duration: number) => void;
    initialData?: any;
    onUpdate?: (data: any) => void;
}) => {
    const [duration, setSeconds] = useState(initialData?.duration || 0);
    const [taskType, setTaskType] = useState<'task1' | 'task2'>(initialData?.taskType || 'task1');
    const [submittedEssays, setSubmittedEssays] = useState<{ title: string, content: string, type: string }[]>(initialData?.submittedEssays || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    // Separate data for Task 1 and Task 2
    const [task1Data, setTask1Data] = useState(initialData?.task1Data || {
        text: initialData?.taskType === 'task1' ? initialData.text || '' : '',
        premise: initialData?.taskType === 'task1' ? initialData.premise || '' : '',
        screenshot: initialData?.taskType === 'task1' ? initialData.screenshot || '' : '',
        sourceUrl: initialData?.taskType === 'task1' ? initialData.sourceUrl || '' : ''
    });

    const [task2Data, setTask2Data] = useState(initialData?.task2Data || {
        text: initialData?.taskType === 'task2' || !initialData?.taskType ? initialData?.text || '' : '',
        premise: initialData?.taskType === 'task2' || !initialData?.taskType ? initialData?.premise || '' : '',
        screenshot: initialData?.taskType === 'task2' || !initialData?.taskType ? initialData?.screenshot || '' : '',
        sourceUrl: initialData?.taskType === 'task2' || !initialData?.taskType ? initialData?.sourceUrl || '' : ''
    });

    const activeData = taskType === 'task1' ? task1Data : task2Data;

    const updateActiveData = (updates: Partial<typeof task1Data>) => {
        if (taskType === 'task1') {
            setTask1Data((prev: typeof task1Data) => ({ ...prev, ...updates }));
        } else {
            setTask2Data((prev: typeof task2Data) => ({ ...prev, ...updates }));
        }
    };

    const targetWords = taskType === 'task1' ? 150 : 250;
    const recommendedTime = taskType === 'task1' ? 20 : 40;

    useEffect(() => {
        if (onUpdate) {
            onUpdate({
                taskType,
                duration,
                submittedEssays,
                task1Data,
                task2Data,
                // Flatten current for compatibility
                text: activeData.text,
                premise: activeData.premise,
                sourceUrl: activeData.sourceUrl,
                screenshot: activeData.screenshot
            });
        }
    }, [taskType, duration, submittedEssays, task1Data, task2Data, onUpdate]);

    useEffect(() => {
        const words = activeData.text.trim() ? activeData.text.trim().split(/\s+/).length : 0;
        setWordCount(words);
    }, [activeData.text]);

    const getIntensityColor = () => {
        if (wordCount === 0) return 'bg-zinc-800';
        if (wordCount < targetWords * 0.6) return 'bg-rose-500';
        if (wordCount < targetWords) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
            {/* Zen Control Bar - Compact */}
            <div className="flex items-center justify-between px-8 py-4 bg-zinc-950/50 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1">
                        <button
                            onClick={() => setTaskType('task1')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${taskType === 'task1' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-600 hover:text-zinc-300'}`}
                        >
                            Task 1
                        </button>
                        <button
                            onClick={() => setTaskType('task2')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${taskType === 'task2' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-600 hover:text-zinc-300'}`}
                        >
                            Task 2
                        </button>
                    </div>
                    <div className="h-6 w-px bg-white/5" />
                    <div className="flex items-center gap-3">
                        <Type className="w-4 h-4 text-zinc-500" />
                        <span className={`text-sm font-black tabular-nums transition-colors ${wordCount >= targetWords ? 'text-emerald-500' : 'text-zinc-400'}`}>
                            {wordCount} <span className="text-zinc-600">/ {targetWords}</span>
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getIntensityColor()} shadow-glow`} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <SessionTimer initialSeconds={duration} onTimeUpdate={setSeconds} />
                    <button
                        onClick={() => {
                            setIsSubmitting(true);
                            setTimeout(() => {
                                setSubmittedEssays(prev => [...prev, {
                                    title: activeData.premise || 'Untitled Essay',
                                    content: activeData.text,
                                    type: taskType.toUpperCase()
                                }]);
                                // Reset current task data
                                updateActiveData({ text: '', premise: '', screenshot: '', sourceUrl: '' });
                                setIsSubmitting(false);
                            }, 800);
                        }}
                        disabled={!activeData.text.trim() || isSubmitting}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-20"
                    >
                        {isSubmitting ? 'Archiving...' : 'Submit Draft'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Advice & Tools (Refocused on Control) */}
                <div className="w-[380px] border-r border-white/5 flex flex-col bg-zinc-950/50">
                    <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar flex-1">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 w-fit">
                                <PenTool className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Writing Protocol</span>
                            </div>
                            <div className="p-6 bg-zinc-900/50 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                                <p className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Engress Guidance</p>
                                <p className="text-xs text-zinc-500 leading-relaxed italic">
                                    {taskType === 'task1'
                                        ? "Focus on objective data analysis. No personal opinions allowed. Ensure an overview is present."
                                        : "State your opinion clearly. Use 2-3 body paragraphs with personal experiences. Conclusion is mandatory."
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Contextual Reference</span>
                                <Share2 className="w-4 h-4 text-zinc-700" />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-600 uppercase ml-2">Source URL</label>
                                    <div className="relative group">
                                        <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            value={activeData.sourceUrl}
                                            onChange={(e) => updateActiveData({ sourceUrl: e.target.value })}
                                            placeholder="Paste question link..."
                                            className="w-full bg-zinc-900/30 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-zinc-300 outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-800"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-2">
                                        <label className="text-[10px] font-bold text-zinc-600 uppercase">Visual Material</label>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const items = await navigator.clipboard.read();
                                                    for (const item of items) {
                                                        for (const type of item.types) {
                                                            if (type.startsWith('image/')) {
                                                                const blob = await item.getType(type);
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => updateActiveData({ screenshot: reader.result as string });
                                                                reader.readAsDataURL(blob);
                                                                return;
                                                            }
                                                        }
                                                    }
                                                } catch (err) {
                                                    console.error('Failed to read clipboard', err);
                                                }
                                            }}
                                            className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                            Paste Clip
                                        </button>
                                    </div>
                                    {activeData.screenshot ? (
                                        <div className="relative group overflow-hidden rounded-[2.5rem]">
                                            <img src={activeData.screenshot} className="w-full h-40 object-cover border border-white/10 group-hover:scale-105 transition-transform duration-700" alt="Ref" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button onClick={() => updateActiveData({ screenshot: '' })} className="p-3 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl shadow-rose-500/40">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <label className="flex flex-col items-center justify-center h-40 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2.5rem] cursor-pointer hover:border-indigo-500/30 transition-all hover:bg-indigo-500/5 group">
                                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <Share2 className="w-5 h-5 text-zinc-700 group-hover:text-indigo-400" />
                                                </div>
                                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center px-4 leading-relaxed">Drop or click to upload <br /><span className="text-zinc-800">png, jpg, webp</span></span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => updateActiveData({ screenshot: reader.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Session Drafts</span>
                                <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">{submittedEssays.length}</span>
                            </div>
                            <div className="space-y-3">
                                {submittedEssays.map((essay, i) => (
                                    <div key={i} className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl flex items-center justify-between gap-4 group hover:bg-zinc-900/50 transition-colors">
                                        <p className="text-xs font-medium text-zinc-400 truncate">{essay.title || "Untitled Draft"}</p>
                                        <span className="text-[8px] font-black text-zinc-600 bg-zinc-800 px-2 py-1 rounded-lg uppercase shrink-0">{essay.type}</span>
                                    </div>
                                ))}
                                {submittedEssays.length === 0 && (
                                    <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-20">
                                        <PenTool className="w-8 h-8 text-zinc-500" />
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No drafts archived</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: The Editor (Extreme Focus) */}
                <div className="flex-1 bg-white/[0.01] flex flex-col relative overflow-hidden">
                    {/* Sticky Visual Material for Task 1 */}
                    <AnimatePresence>
                        {activeData.screenshot && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="sticky top-0 z-30 px-12 pt-6 pb-2 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5"
                            >
                                <div className="relative group/img rounded-2xl overflow-hidden border border-white/10 max-h-[300px] shadow-2xl">
                                    <img
                                        src={activeData.screenshot}
                                        className="w-full object-contain bg-zinc-900"
                                        alt="Diagram"
                                        style={{ maxHeight: '280px' }}
                                    />
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => updateActiveData({ screenshot: '' })}
                                            className="p-2 bg-rose-500/80 hover:bg-rose-500 text-white rounded-lg backdrop-blur-md transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/10">Reference Diagram</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="px-12 pt-12 pb-4">
                            <input
                                value={activeData.premise}
                                onChange={(e) => updateActiveData({ premise: e.target.value })}
                                placeholder="ESSAY PREMISE / TITLE..."
                                className="w-full bg-transparent text-2xl font-black text-white italic placeholder:text-zinc-800 outline-none uppercase tracking-tighter"
                            />
                            <div className="h-px w-full bg-white/5 mt-4" />
                        </div>
                        <textarea
                            value={activeData.text}
                            onChange={(e) => updateActiveData({ text: e.target.value })}
                            onPaste={(e) => {
                                const item = e.clipboardData.items[0];
                                if (item?.type.startsWith('image/')) {
                                    const blob = item.getAsFile();
                                    if (blob) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => updateActiveData({ screenshot: reader.result as string });
                                        reader.readAsDataURL(blob);
                                    }
                                }
                            }}
                            placeholder="Draft your essay here. Focus on structure and vocabulary..."
                            className="flex-1 bg-transparent px-12 pb-12 pt-4 outline-none resize-none font-medium text-lg leading-[1.8] text-zinc-200 placeholder:text-zinc-800 selection:bg-indigo-500/30 min-h-[500px]"
                        />
                    </div>

                    {/* Subtle overlay for focus - top and bottom fade */}
                    <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-zinc-950/20 pointer-events-none z-20" />
                    <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-zinc-950/20 pointer-events-none z-20" />
                </div>
            </div>
        </div>
    );
};

export default Writing;
