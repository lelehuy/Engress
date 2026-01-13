import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, ArrowLeft, Zap, Home, Book, BarChart3, Target, X } from 'lucide-react';
import welcomeImg from '../assets/images/tutorial_welcome.png';
import missionImg from '../assets/images/tutorial_mission.png';
import focusImg from '../assets/images/tutorial_focus.png';
import vaultImg from '../assets/images/tutorial_vault.png';

const Briefing = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Engress",
            subtitle: "Let's Start Your Learning Journey",
            desc: "Engress helps you monitor your study progress and ensures you stay consistent in reaching your IELTS/TOEFL score targets.",
            image: welcomeImg,
            color: "from-indigo-600 to-blue-600",
            icon: Shield
        },
        {
            title: "Main Dashboard",
            subtitle: "Your Progress Command Center",
            desc: "The dashboard is where you view your daily progress. Monitor your study streak and ensure your study time targets are met every day.",
            image: missionImg,
            color: "from-purple-600 to-indigo-600",
            icon: Home
        },
        {
            title: "Focus & Practice",
            subtitle: "Measured Study Sessions",
            desc: "Start your study sessions in the Focus Lab. Your study time will be recorded automatically to help you reach your 120-minute daily goal.",
            image: focusImg,
            color: "from-orange-600 to-rose-600",
            icon: Zap
        },
        {
            title: "Study Archive",
            subtitle: "History & Vocabulary",
            desc: "All your new words and study history are stored safely. Track your progress and never miss an achievement.",
            image: vaultImg,
            color: "from-emerald-600 to-teal-600",
            icon: Book
        }
    ];

    const nextStep = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    const current = steps[step];

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6">

            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className={`absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-600/20 blur-[150px] rounded-full transition-colors duration-1000`}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-4xl bg-zinc-900/50 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[600px]"
            >
                {/* Visual Side */}
                <div className="w-full md:w-1/2 relative bg-black overflow-hidden group">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20, scale: 1.1 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 1.1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute inset-0"
                        >
                            <img
                                src={current.image}
                                alt={current.title}
                                className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent`} />
                        </motion.div>
                    </AnimatePresence>

                    {/* Floating Icon */}
                    <div className="absolute top-8 left-8">
                        <motion.div
                            key={step}
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className={`p-4 rounded-2xl bg-gradient-to-br ${current.color} shadow-lg shadow-black/50`}
                        >
                            <current.icon className="w-8 h-8 text-white" />
                        </motion.div>
                    </div>
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-zinc-900/80 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-1 mb-8">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Step {step + 1} / {steps.length}</span>
                        <div className="flex gap-1.5 mt-1">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-500 ${step >= i ? 'w-4 bg-indigo-500' : 'w-1.5 bg-zinc-800'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-4"
                            >
                                <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">{current.subtitle}</p>
                                <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                                    {current.title.split(' ')[0]} <br />
                                    <span className="text-zinc-600">{current.title.split(' ').slice(1).join(' ')}</span>
                                </h1>
                                <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium pt-2">
                                    {current.desc}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-4 pt-8">
                        {step > 0 && (
                            <button
                                onClick={prevStep}
                                className="p-4 rounded-2xl border border-white/5 text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={nextStep}
                            className="flex-1 bg-white text-black py-4 px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                        >
                            {step === steps.length - 1 ? "Start Learning" : "Next"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Close Button - Hidden but good to have for UI exit if needed */}
                <button
                    onClick={onComplete}
                    className="absolute top-6 right-6 p-2 text-zinc-700 hover:text-zinc-400 transition-colors md:block hidden"
                >
                    <X className="w-5 h-5" />
                </button>
            </motion.div>
        </div>
    );
};

export default Briefing;
