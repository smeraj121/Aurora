interface BookedBlockProps {
  topOffset: number;
  height: number;
  colIdx?: number;
  totalCols?: number;
}

export function BookedBlock({
  topOffset,
  height,
  colIdx = 0,
  totalCols = 1,
}: BookedBlockProps) {
  const columnLeftPct = (colIdx / totalCols) * 100;
  const columnWidthPct = 100 / totalCols;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        top: `${topOffset}px`,
        height: `${Math.max(height, 48)}px`,
        left: `calc(${columnLeftPct}% + 3px)`,
        width: `calc(${columnWidthPct}% - 6px)`,
        right: 'auto',
      }}
      className="
        absolute
        rounded-xl
        bg-slate-100
        border border-slate-200
        overflow-hidden
        z-10
        cursor-default
      "
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-400 rounded-l-xl" />

      <div className="h-full pl-3.5 flex items-center">
        <span className="text-xs font-semibold text-slate-500">
          Booked
        </span>
      </div>
    </div>
  );
}