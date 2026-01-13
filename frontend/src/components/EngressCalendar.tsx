import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EngressCalendarProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    onClose: () => void;
}

const EngressCalendar = ({ selectedDate, onDateSelect, onClose }: EngressCalendarProps) => {
    const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const totalDays = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < offset; i++) {
        days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
        days.push(i);
    }

    const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        const d = new Date(selectedDate);
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="p-6 rounded-[2rem] border border-indigo-500/20 bg-zinc-950 shadow-2xl w-full max-w-[320px] select-none relative z-50"
        >
            <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-500 hover:text-white">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h4 className="text-sm font-black text-white uppercase italic tracking-widest">{monthNames[month]}</h4>
                    <p className="text-[10px] font-bold text-zinc-600 tracking-[0.3em]">{year}</p>
                </div>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-500 hover:text-white">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[9px] font-black text-zinc-700 pb-2 uppercase tracking-widest">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center">
                        {day ? (
                            <button
                                onClick={() => {
                                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    onDateSelect(dateStr);
                                    onClose();
                                }}
                                className={`w-full h-full rounded-xl text-[10px] font-bold transition-all flex items-center justify-center relative group
                                    ${isSelected(day)
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {day}
                                {isToday(day) && !isSelected(day) && (
                                    <div className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full" />
                                )}
                            </button>
                        ) : null}
                    </div>
                ))}
            </div>

            <button
                onClick={onClose}
                className="w-full mt-6 py-3 text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-colors border-t border-white/5"
            >
                Close Calibration
            </button>
        </motion.div>
    );
};

export default EngressCalendar;
