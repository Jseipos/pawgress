"use client";

interface MilestoneMeterProps {
  daysCompleted: number;
  totalDays: number;
  petName: string;
}

export default function MilestoneMeter({ daysCompleted, totalDays, petName }: MilestoneMeterProps) {
  const remaining = Math.max(0, totalDays - daysCompleted);
  const isComplete = daysCompleted >= totalDays;

  return (
    <div className="rounded-2xl border-4 border-purple-200 bg-white p-5 shadow-md">
      <h3 className="mb-3 text-center text-lg font-bold text-purple-600">
        {isComplete
          ? `🎉 ${petName} is ready! You did it!`
          : `${daysCompleted}/${totalDays} days until ${petName} arrives!`}
      </h3>

      {/* Paw print progress */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {Array.from({ length: totalDays }, (_, i) => {
          const dayNum = i + 1;
          const isDone = i < daysCompleted;
          const isNext = i === daysCompleted;
          return (
            <div
              key={i}
              className={[
                "flex h-10 w-10 items-center justify-center rounded-full text-xl transition-all",
                isDone
                  ? "bg-purple-500 shadow-sm scale-100"
                  : isNext
                    ? "bg-purple-100 ring-2 ring-purple-400 ring-offset-1 animate-pulse"
                    : "bg-slate-50",
              ].join(" ")}
              aria-label={`Day ${dayNum} ${isDone ? "complete" : "not complete"}`}
            >
              <span className={isDone ? "" : "grayscale opacity-30"} aria-hidden="true">
                🐾
              </span>
            </div>
          );
        })}
        {/* Graduation cap at end */}
        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-full text-xl transition-all",
            isComplete
              ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg scale-110"
              : "bg-slate-50",
          ].join(" ")}
          aria-label={`Graduation ${isComplete ? "complete" : "locked"}`}
        >
          <span className={isComplete ? "" : "grayscale opacity-30"} aria-hidden="true">
            🎓
          </span>
        </div>
      </div>

      {/* Encouragement text */}
      <p className="mt-4 text-center text-base text-purple-500">
        {isComplete
          ? "You are a Pet Guardian Champion! 🏆"
          : remaining === 1
            ? "Just 1 more day! You can do it! 💪"
            : `${remaining} more days to go! Keep it up! 🌟`}
      </p>
    </div>
  );
}
