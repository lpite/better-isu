export function getTimeToEndOfWeek() {
  const correctWeekDays = [7, 1, 2, 3, 4, 5, 6];
  const date = new Date();
  const correctDay = correctWeekDays[date.getDay()];
  const hours = (24 - (date.getHours() + 1)) * 60 * 60;
  const minutes = (60 - (date.getMinutes() + 1)) * 60;
  return (7 - correctDay) * 24 * 60 * 60 + hours + minutes;
}
