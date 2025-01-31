export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}
export const parseTimestamp = (timestamp: string): number => {
  const [minutes, seconds] = timestamp.split(":").map(Number);
  return minutes * 60 + seconds;
};
