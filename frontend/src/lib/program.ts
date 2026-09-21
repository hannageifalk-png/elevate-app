export type SetTemplate = {
  reps_min: number | null;
  reps_max: number | null;
  duration_seconds: number | null;
};

export function lengthLabel(weekCount: number) {
  return weekCount <= 1 ? "Löpande" : `${weekCount} veckor`;
}

export function setsLabel(sets: SetTemplate[]) {
  if (sets.length === 0) return "";

  const labels = sets.map((set) => {
    if (set.duration_seconds !== null) return `${set.duration_seconds} s`;
    if (set.reps_min === set.reps_max) return `${set.reps_min}`;
    return `${set.reps_min}–${set.reps_max}`;
  });

  return labels.every((label) => label === labels[0])
    ? `${labels.length} × ${labels[0]}`
    : labels.join(" · ");
}
