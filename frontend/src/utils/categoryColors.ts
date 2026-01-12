export const categoryColors: { [key: string]: string } = {
    writing: 'indigo',
    speaking: 'rose',
    reading: 'blue',
    listening: 'amber',
    vocabulary: 'emerald',
    mockup: 'violet',
    general: 'zinc'
};

export const getCategoryColorClass = (category: string = '', type: 'bg' | 'text' | 'border' | 'fill' = 'bg') => {
    const cat = category.toLowerCase();
    const color = categoryColors[cat] || categoryColors.general;

    const mapping: { [key: string]: { [key: string]: string } } = {
        bg: {
            indigo: 'bg-indigo-500',
            rose: 'bg-rose-500',
            blue: 'bg-blue-500',
            amber: 'bg-amber-500',
            emerald: 'bg-emerald-500',
            violet: 'bg-violet-600',
            zinc: 'bg-zinc-500'
        },
        text: {
            indigo: 'text-indigo-400',
            rose: 'text-rose-400',
            blue: 'text-blue-400',
            amber: 'text-amber-400',
            emerald: 'text-emerald-400',
            violet: 'text-violet-400',
            zinc: 'text-zinc-500'
        },
        border: {
            indigo: 'border-indigo-500/20',
            rose: 'border-rose-500/20',
            blue: 'border-blue-500/20',
            amber: 'border-amber-500/20',
            emerald: 'border-emerald-500/20',
            violet: 'border-violet-500/20',
            zinc: 'border-zinc-500/20'
        },
        fill: {
            indigo: 'bg-indigo-500/10',
            rose: 'bg-rose-500/10',
            blue: 'bg-blue-500/10',
            amber: 'bg-amber-500/10',
            emerald: 'bg-emerald-500/10',
            violet: 'bg-violet-500/10',
            zinc: 'bg-zinc-500/10'
        }
    };

    return mapping[type][color];
};
