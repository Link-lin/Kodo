"use client";

import type { ContributionDay } from "./types";

const SQUARE_SIZE = 10;
const SQUARE_GAP = 3;
const EMPTY_COLOR = "#ebedf0";
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type ActivityGraphProps = {
  weeks: { contributionDays: ContributionDay[] }[];
};

function getDayForRow(
  week: { contributionDays: ContributionDay[] },
  dayOfWeek: number
): ContributionDay | null {
  return (
    (week.contributionDays ?? []).find(
      (d) => new Date(d.date).getDay() === dayOfWeek
    ) ?? null
  );
}

function getFirstDayOfWeek(
  week: { contributionDays: ContributionDay[] }
): Date | null {
  const days = week.contributionDays ?? [];
  if (days.length === 0) return null;
  const dates = days.map((d) => new Date(d.date).getTime());
  return new Date(Math.min(...dates));
}

function buildMonthSpans(
  weeks: { contributionDays: ContributionDay[] }[]
): { month: number; startCol: number; numCols: number }[] {
  const spans: { month: number; startCol: number; numCols: number }[] = [];
  let lastMonth = -1;
  let spanStart = 0;

  for (let col = 0; col < weeks.length; col++) {
    const first = getFirstDayOfWeek(weeks[col]);
    const month = first ? first.getMonth() : lastMonth;
    if (lastMonth >= 0 && month !== lastMonth) {
      spans.push({
        month: lastMonth,
        startCol: spanStart,
        numCols: col - spanStart,
      });
      spanStart = col;
    }
    lastMonth = month;
  }
  if (lastMonth >= 0) {
    spans.push({
      month: lastMonth,
      startCol: spanStart,
      numCols: weeks.length - spanStart,
    });
  }
  return spans;
}

const MINI_SIZE = 6;
const MINI_LEVELS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

type MiniActivityStripProps = { weeks: { contributionDays: ContributionDay[] }[] };

export function MiniActivityStrip({ weeks }: MiniActivityStripProps) {
  const displayWeeks = weeks.slice(-12);
  const weekTotals = displayWeeks.map((w) =>
    (w.contributionDays ?? []).reduce((s, d) => s + d.contributionCount, 0)
  );
  const max = Math.max(1, ...weekTotals);

  return (
    <div className="flex items-center gap-0.5" title="Last 12 weeks">
      {weekTotals.map((total, i) => {
        const level = max ? Math.min(4, Math.ceil((total / max) * 4)) : 0;
        return (
          <div
            key={i}
            className="rounded-[2px] shrink-0"
            style={{
              width: MINI_SIZE,
              height: MINI_SIZE,
              backgroundColor: MINI_LEVELS[level],
            }}
            title={`${total} contributions`}
          />
        );
      })}
    </div>
  );
}

export function ActivityGraph({ weeks }: ActivityGraphProps) {
  const displayWeeks = weeks.slice(-26);
  const cells: { day: ContributionDay | null; key: string }[] = [];
  const monthSpans = buildMonthSpans(displayWeeks);

  for (let col = 0; col < displayWeeks.length; col++) {
    for (let row = 0; row < 7; row++) {
      const day = getDayForRow(displayWeeks[col], row);
      cells.push({ day, key: `${col}-${row}` });
    }
  }

  return (
    <div
      className="grid w-fit gap-x-[3px] gap-y-1"
      style={{
        gridTemplateColumns: `repeat(${displayWeeks.length}, ${SQUARE_SIZE}px)`,
        gridTemplateRows: `20px repeat(7, ${SQUARE_SIZE}px)`,
      }}
    >
      {monthSpans.map(({ month, startCol, numCols }) => (
        <div
          key={`${month}-${startCol}`}
          className="text-muted-foreground text-xs"
          style={{
            gridColumn: `${startCol + 1} / span ${numCols}`,
            gridRow: 1,
          }}
        >
          {MONTH_LABELS[month]}
        </div>
      ))}
      {cells.map(({ day, key }) => {
        const color = day?.contributionCount
          ? day.color ?? "#40c463"
          : EMPTY_COLOR;
        const [col, row] = key.split("-").map(Number);
        return (
          <div
            key={key}
            className="rounded-[2px]"
            style={{
              gridColumn: col + 1,
              gridRow: row + 2,
              width: SQUARE_SIZE,
              height: SQUARE_SIZE,
              backgroundColor: color,
            }}
            title={
              day
                ? `${day.date}: ${day.contributionCount} contributions`
                : "No contributions"
            }
          />
        );
      })}
    </div>
  );
}
