import {
  differenceInCalendarWeeks as _differenceInCalendarWeeks,
  eachWeekOfInterval as _eachWeekOfInterval,
  endOfWeek as _endOfWeek,
  format as _format,
  formatDistance as _formatDistance,
  formatDistanceStrict as _formatDistanceStrict,
  formatDistanceToNow as _formatDistanceToNow,
  formatDistanceToNowStrict as _formatDistanceToNowStrict,
  formatDuration as _formatDuration,
  formatRelative as _formatRelative,
  getWeek as _getWeek,
  getWeekOfMonth as _getWeekOfMonth,
  getWeeksInMonth as _getWeeksInMonth,
  getWeekYear as _getWeekYear,
  isMatch as _isMatch,
  isSameWeek as _isSameWeek,
  isThisWeek as _isThisWeek,
  lastDayOfWeek as _lastDayOfWeek,
  parse as _parse,
  setDay as _setDay,
  setWeek as _setWeek,
  setWeekYear as _setWeekYear,
  startOfWeek as _startOfWeek,
  startOfWeekYear as _startOfWeekYear,
  parseISO as _parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toDate, utcToZonedTime } from "date-fns-tz";

export * from "date-fns";

let defaultLocale = { current: ptBR };

export function setDefaultLocale(next) {
  defaultLocale.current = next;
}

export function resetDefaultLocale(next) {
  setDefaultLocale(ptBR);
}

export const differenceInCalendarWeeks = wrap(_differenceInCalendarWeeks);
export const eachWeekOfInterval = wrap(_eachWeekOfInterval);
export const endOfWeek = wrap(_endOfWeek);
export const format = wrap(_format);
export const formatDistance = wrap(_formatDistance);
export const formatDistanceStrict = wrap(_formatDistanceStrict);
export const formatDistanceToNow = wrap(_formatDistanceToNow);
export const formatDistanceToNowStrict = wrap(_formatDistanceToNowStrict);
export const formatDuration = wrap(_formatDuration);
export const formatRelative = wrap(_formatRelative);
export const getWeek = wrap(_getWeek);
export const getWeekOfMonth = wrap(_getWeekOfMonth);
export const getWeeksInMonth = wrap(_getWeeksInMonth);
export const getWeekYear = wrap(_getWeekYear);
export const isMatch = wrap(_isMatch);
export const isSameWeek = wrap(_isSameWeek);
export const isThisWeek = wrap(_isThisWeek);
export const lastDayOfWeek = wrap(_lastDayOfWeek);
export const parse = wrap(_parse);
export const setDay = wrap(_setDay);
export const setWeek = wrap(_setWeek);
export const setWeekYear = wrap(_setWeekYear);
export const startOfWeek = wrap(_startOfWeek);
export const startOfWeekYear = wrap(_startOfWeekYear);
export const parseISO = wrap(_parseISO);

function wrap(fn) {
  let wrapped = (...args) => {
    let length = fn.length;
    let newArgs = new Array(length);
    for (let i = 0; i < length; i++) {
      if (i === length - 1) {
        newArgs[i] = {
          locale: defaultLocale.current,
          timeZone: "America/Sao_Paulo",
          ...args[i],
        };
      } else {
        newArgs[i] = args[i];
      }
    }

    return fn(...newArgs);
  };

  return wrapped;
}

export const getDateLocalized = (date, format) => {
  if (date instanceof Date && !isNaN(date)) {
    const utcDate = toDate(date, { timeZone: "UTC" });
    const zonedDate = utcToZonedTime(utcDate, "America/Sao_Paulo");
    return _format(zonedDate, format, {
      timeZone: "America/Sao_Paulo",
      locale: ptBR,
    });
  } else {
    return null;
  }
};
