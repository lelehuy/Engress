import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Plus, Send, ChevronLeft, Type, Quote, Clock } from 'lucide-react';
import { AddVocabulary } from '../../../wailsjs/go/main/App';
import SessionTimer from '../../components/SessionTimer';

const Vocabulary = ({ onBack, onFinish, initialData, onUpdate }: {
    onBack: () => void;
    onFinish: (duration: number) => void;
    initialData?: any;
    onUpdate?: (data: any) => void;
}) => {
    const [duration, setSeconds] = useState(initialData?.duration || 0);
    const [word, setWord] = useState(initialData?.word || '');
    const [definition, setDefinition] = useState(initialData?.definition || '');
    const [sentences, setSentences] = useState(initialData?.sentences || '');

    useEffect(() => {
        if (onUpdate) onUpdate({ word, definition, sentences, duration });
    }, [word, definition, sentences, duration, onUpdate]);
    const [saved, setSaved] = useState(false);
    const [recentForges, setRecentForges] = useState<any[]>([]);

    const handleSave = async () => {
        if (!word) return;
        const entry = { word, id: Date.now() };
        await AddVocabulary(word, definition, sentences);

        setRecentForges(prev => [entry, ...prev].slice(0, 3));
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            setWord('');
            setDefinition('');
            setSentences('');
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
            <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-zinc-950">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-bold text-white tracking-tight">Active Vocabulary Builder</h2>
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Contextual Learning</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <SessionTimer initialSeconds={duration} onTimeUpdate={setSeconds} />
                    <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900 rounded-xl border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Builder Mode</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-[400px] border-r border-white/5 flex flex-col bg-zinc-950/30">
                    <div className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4 text-center pb-6 border-b border-white/5">
                            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 w-fit mx-auto">
                                <Book className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Lexicon Forge</span>
                            </div>
                            <p className="text-sm font-medium text-zinc-500 leading-relaxed italic">
                                "A word is only yours when you can use it in 3 different contexts."
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">New Term</label>
                            <input
                                value={word}
                                onChange={(e) => setWord(e.target.value)}
                                placeholder="e.g., Obsequious"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xl font-bold text-white outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
                            />
                            <input
                                value={definition}
                                onChange={(e) => setDefinition(e.target.value)}
                                placeholder="Brief definition..."
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 outline-none focus:border-amber-500/30 transition-all placeholder:text-zinc-700"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Quote className="w-3 h-3" /> Contextual Usage (3 Sentences)
                            </label>
                            <textarea
                                value={sentences}
                                onChange={(e) => setSentences(e.target.value)}
                                placeholder="1. He was obsequious to his superiors...&#10;2. The waiter's obsequious manner...&#10;3. I detest obsequious flattery..."
                                className="w-full h-40 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm leading-relaxed text-zinc-300 outline-none focus:border-amber-500/30 transition-all placeholder:text-zinc-700 resize-none"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${saved ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xl shadow-amber-900/10'
                                }`}
                        >
                            {saved ? 'Victory! Entry Forged' : 'Forge Entry'}
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {recentForges.length > 0 && (
                        <div className="p-6 bg-white/[0.02] border-t border-white/5 space-y-4">
                            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Just Forged</h4>
                            <div className="space-y-2">
                                {recentForges.map((item) => (
                                    <div key={item.id} className="p-3 bg-zinc-900/50 rounded-xl border border-white/5 flex items-center justify-between group">
                                        <span className="text-xs font-bold text-zinc-400 group-hover:text-amber-400 transition-colors uppercase italic">{item.word}</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 bg-white/[0.01] flex flex-col p-8 sm:p-12 overflow-y-auto custom-scrollbar">
                    <div className="max-w-2xl mx-auto w-full space-y-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Type className="w-5 h-5 text-zinc-700" />
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Live Usage Preview</h3>
                        </div>

                        {word || definition || sentences ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    borderColor: saved ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.05)',
                                    backgroundColor: saved ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                                }}
                                className="glass rounded-[3rem] p-10 sm:p-16 relative overflow-hidden group shadow-2xl border bg-gradient-to-br from-white/[0.02] to-transparent transition-colors duration-500"
                            >
                                <div className="relative z-10 space-y-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-1 bg-amber-500 rounded-full" />
                                            <span className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest">Lexicon Entry</span>
                                        </div>
                                        <h2 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-white uppercase break-words leading-none">
                                            {word || <span className="text-zinc-800">Term</span>}
                                        </h2>
                                        <p className="text-xl font-bold text-zinc-400 italic">
                                            {definition || <span className="text-zinc-800">Definition will appear here...</span>}
                                        </p>
                                    </div>

                                    <div className="h-px w-full bg-white/5" />

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Quote className="w-4 h-4 text-amber-500/30" />
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Contextual Validation</span>
                                        </div>
                                        <div className="space-y-4">
                                            {sentences ? (
                                                sentences.split('\n').map((line: string, i: number) => (
                                                    <p key={i} className="text-lg text-zinc-300 leading-relaxed font-serif italic">
                                                        {line}
                                                    </p>
                                                ))
                                            ) : (
                                                <p className="text-zinc-800 italic text-sm">Draft your sentences at the left to see how they flow...</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Abstract Background Elements */}
                                <div className="absolute top-0 right-0 p-12">
                                    <Book className="w-32 h-32 text-white/[0.02] -rotate-12" />
                                </div>
                                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/5 blur-[120px] rounded-full group-hover:bg-amber-500/10 transition-all duration-700" />
                            </motion.div>
                        ) : (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-900 flex items-center justify-center">
                                    <Type className="w-10 h-10 text-zinc-700" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-tight">System Ready</h3>
                                    <p className="max-w-xs text-xs text-zinc-600 font-medium leading-relaxed">
                                        As you input data into the forge, this analyzer will render a live preview of your lexicon entry.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Vocabulary;
