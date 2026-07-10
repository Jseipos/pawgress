"use client";

interface PlaceholderProps {
  title: string;
  icon: string;
  description: string;
}

export default function Placeholder({ title, icon, description }: PlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-slate-100 px-6 py-16">
      <div className="mb-4 text-6xl" aria-hidden="true">
        {icon}
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="max-w-sm text-center text-slate-500">{description}</p>
      <div className="mt-6 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
        Coming soon
      </div>
    </div>
  );
}
