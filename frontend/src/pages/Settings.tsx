import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Calendar, Save, Zap, Bell, Lock, Clock, Shield, User } from 'lucide-react';
import { GetAppState, UpdateTestDate, UpdateReminders, UpdateProfileName } from "../../wailsjs/go/main/App";

const Settings = () => {
    const [name, setName] = useState('');
    const [testDate, setTestDate] = useState('2026-03-01');
    const [isSaving, setIsSaving] = useState(false);
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [reminderTime, setReminderTime] = useState('10:00');

    useEffect(() => {
        GetAppState().then(state => {
            if (state.user_profile.name) {
                setName(state.user_profile.name);
            }
            if (state.user_profile.test_date) {
                setTestDate(state.user_profile.test_date);
            }
            if (state.user_profile.reminder_time) {
                setReminderTime(state.user_profile.reminder_time);
            }
            setReminderEnabled(state.user_profile.reminder_enabled !== false);
        });
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        await UpdateProfileName(name);
        await UpdateTestDate(testDate);
        await UpdateReminders(reminderEnabled, reminderTime);
        setTimeout(() => setIsSaving(false), 500);
    };

    const [testSent, setTestSent] = useState(false);

    const handleTestAlert = () => {
        setTestSent(true);
        import('../../wailsjs/go/main/App').then(({ Notify }) => {
            Notify("Engress Protocol", "Communication link active. Message received.");
        });
        setTimeout(() => setTestSent(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-bold tracking-tight text-white">Application Settings</h1>
                <p className="text-zinc-500 font-medium italic">Configure your Engress and mission parameters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Settings */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                    <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                <Shield className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">Mission Profile</h3>
                                <p className="text-[10px] sm:text-xs text-zinc-500">Initialize identity and timing calibration.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Commander Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name..."
                                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-indigo-500/50 transition-all text-sm uppercase tracking-widest placeholder:text-zinc-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Official Test Date</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="date"
                                        value={testDate}
                                        onChange={(e) => setTestDate(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-indigo-500/50 transition-all cursor-pointer text-sm uppercase tracking-widest"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`w-full py-3 sm:py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2 transition-all ${isSaving ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 active:scale-95'}`}
                        >
                            {isSaving ? 'Directives Updated' : 'Update Configuration'}
                            {!isSaving && <Save className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-indigo-600/5 border-indigo-500/10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">Active Reminders</h3>
                            </div>
                            <div className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full relative cursor-pointer transition-colors ${reminderEnabled ? 'bg-indigo-600' : 'bg-zinc-800'}`} onClick={() => setReminderEnabled(!reminderEnabled)}>
                                <motion.div
                                    animate={{ x: reminderEnabled ? (window.innerWidth < 640 ? 20 : 24) : 4 }}
                                    className="absolute top-0.5 sm:top-1 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-white shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] sm:text-xs text-zinc-500 leading-relaxed font-medium">
                                Engress will transmit a priority alert if your daily study goal is not yet achieved by the specified timestamp.
                            </p>

                            {reminderEnabled && (
                                <div className="flex items-center gap-3 sm:gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl">
                                    <Clock className="w-4 h-4 text-zinc-600 shrink-0" />
                                    <input
                                        type="time"
                                        value={reminderTime}
                                        onChange={(e) => setReminderTime(e.target.value)}
                                        className="bg-transparent text-white font-black outline-none uppercase text-xs sm:text-sm tracking-widest"
                                    />
                                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest ml-auto hidden sm:inline">Daily Checkpoint</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-indigo-600 text-white shadow-22xl shadow-indigo-600/20 border-none space-y-4">
                        <Lock className="w-6 sm:w-8 h-6 sm:h-8 opacity-50" />
                        <h3 className="text-lg sm:text-xl font-bold leading-tight italic uppercase italic">Privacy Mode</h3>
                        <p className="text-white/60 text-[10px] sm:text-xs leading-relaxed font-medium">
                            Mission analytics and history are stored exclusively on your local system. No data transmission occurs beyond your authorization.
                        </p>
                    </div>

                    <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-dashed border-white/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-zinc-500" />
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Protocol</span>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {['Daily Mission Alerts', 'Session Reminders', 'System Notifications'].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                                        <span className="text-[10px] sm:text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-tight">{item}</span>
                                        <div className="w-7 sm:w-8 h-3.5 sm:h-4 bg-zinc-800 rounded-full relative">
                                            <div className={`absolute top-0.5 left-0.5 w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-indigo-500 transition-all ${true ? 'left-auto right-0.5' : 'left-0.5'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleTestAlert}
                                className={`w-full py-3 border rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${testSent ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}
                            >
                                <Zap className={`w-3.5 h-3.5 ${testSent ? 'animate-pulse' : ''}`} />
                                {testSent ? 'Transmission Sent' : 'Force System Alert'}
                            </button>

                            <button
                                onClick={() => import('../../wailsjs/go/main/App').then(({ CheckForUpdates }) => CheckForUpdates())}
                                className="w-full py-3 border border-white/5 bg-zinc-900 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <SettingsIcon className="w-3.5 h-3.5" />
                                Check for Updates
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Settings;
