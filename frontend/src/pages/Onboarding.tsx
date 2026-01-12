import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Calendar } from 'lucide-react';
import { CompleteSetup } from "../../wailsjs/go/main/App";

interface OnboardingProps {
    onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [testDate, setTestDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFinish = async () => {
        setIsLoading(true);
        await CompleteSetup(name, testDate);
        setTimeout(() => {
            onComplete();
        }, 1000); // Dramatic pause
    };

    return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">

            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-600/10 blur-[150px] rounded-full" />
                <div className="absolute top-[30%] -right-[10%] w-[60vw] h-[60vw] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-lg w-full space-y-8 sm:space-y-12">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, type: "spring" }}
                    className="flex justify-center"
                >
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-zinc-900 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl shadow-indigo-500/20">
                        <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                    </div>
                </motion.div>

                <div className="space-y-4">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl sm:text-5xl font-black tracking-tighter text-white uppercase italic"
                    >
                        Engress <span className="text-zinc-600">Core</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-sm sm:text-lg text-zinc-400 font-medium px-4"
                    >
                        Protocol: Calibrate the Focus Engine for your examination deadline.
                    </motion.p>
                </div>

                <div className="h-[240px] flex items-center justify-center">
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full space-y-6"
                        >
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 text-center">
                                Identity Verification: Enter Your Name
                            </label>
                            <div className="relative group">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="YOUR NAME"
                                    className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 px-12 text-white font-black outline-none focus:border-indigo-500/50 transition-all text-center uppercase tracking-widest text-lg placeholder:text-zinc-800"
                                />
                            </div>
                            <button
                                disabled={!name}
                                onClick={() => setStep(2)}
                                className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                            >
                                Next Step <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full space-y-6"
                        >
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 text-center">
                                Mission Deadline: Select Test Date
                            </label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="date"
                                    onChange={(e) => setTestDate(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-indigo-500/50 transition-all text-center uppercase tracking-widest text-lg"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-1 border border-white/5 text-zinc-500 font-bold py-4 rounded-2xl hover:bg-white/5 transition-all text-xs uppercase">Back</button>
                                <button
                                    disabled={!testDate}
                                    onClick={() => setStep(3)}
                                    className="flex-[2] bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                >
                                    Confirm Mission <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full space-y-6"
                        >
                            <div className="p-8 bg-zinc-900/50 border border-emerald-500/20 rounded-[2.5rem] space-y-4">
                                <div className="space-y-1 text-center">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Setup Complete</p>
                                    <h1 className="text-3xl font-black text-white tracking-widest truncate uppercase italic">{name}</h1>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleFinish}
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 uppercase tracking-widest text-xs"
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Calibrating Engress...</span>
                                ) : (
                                    <>Initiate Interface <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
