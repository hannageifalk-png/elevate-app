export function lengthLabel(weekCount: number) {
  return weekCount <= 1 ? "Löpande" : `${weekCount} veckor`;
}
