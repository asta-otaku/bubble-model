export const convertUnixNanoToReadable = (ticks: number) => {
  // Convert .NET ticks (100-nanosecond intervals) to milliseconds
  // 1 tick = 100 nanoseconds = 0.0001 milliseconds
  const milliseconds = Math.floor(ticks * 0.0001);
  const date = new Date(milliseconds);
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};