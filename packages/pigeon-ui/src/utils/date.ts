import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
} from "date-fns";

export function getDateAgo(date1: Date, date2: Date = new Date()) {
  const seconds = differenceInSeconds(date2, date1);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = differenceInMinutes(date2, date1);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = differenceInHours(date2, date1);
  if (hours < 24) return `${hours} hours ago`;
  const days = differenceInDays(date2, date1);
  if (days < 7) return `${days} days ago`;
  return format(date1, "MM/dd/yyyy");
}
