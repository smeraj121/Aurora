import { Star } from 'lucide-react';
import { useState } from 'react';

interface RatingStarsProps {
  value?: number;
  readOnly?: boolean;
  onSubmit?: (rating: number) => Promise<void> | void;
}

export function RatingStars({ value, readOnly, onSubmit }: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (readOnly && value) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className={`w-3.5 h-3.5 ${n <= value ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}`} />
          ))}
        </div>
        <span className="text-[11px] font-semibold text-slate-500">You rated {value}/5</span>
      </div>
    );
  }

  const handleClick = async (n: number) => {
    if (submitting || !onSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit(n);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-semibold text-slate-500">Rate your visit</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={submitting}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleClick(n)}
            className="p-0.5 disabled:opacity-50"
          >
            <Star className={`w-4 h-4 transition-colors ${(hovered ?? 0) >= n ? 'fill-amber-400 text-amber-500' : 'text-slate-300 hover:text-amber-300'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}