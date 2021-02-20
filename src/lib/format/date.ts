import dayjs from 'dayjs';
export function formatDate(d: Date) {
  return dayjs(d).format('yyyy-MM-dd hh:mm:ss');
}
