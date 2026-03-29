import { DAYS_HE, MONTHS_HE } from './constants';

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

export const formatDateHe = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ב${MONTHS_HE[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatMonthYear = (date) =>
  `${MONTHS_HE[date.getMonth()]} ${date.getFullYear()}`;

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export const toDateStr = (date) =>
  `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr + 'T00:00:00');
};

export const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  return dateStr < today();
};

export const isDueToday = (dateStr) => dateStr === today();

export const daysDiff = (dateStr) => {
  if (!dateStr) return null;
  const t = new Date(today() + 'T00:00:00');
  const d = new Date(dateStr + 'T00:00:00');
  return Math.round((d - t) / 86400000);
};

export const getRelativeLabel = (dateStr) => {
  if (!dateStr) return null;
  const diff = daysDiff(dateStr);
  if (diff === null) return null;
  if (diff < 0)  return { text: `${Math.abs(diff)} ימים באיחור`, type: 'overdue' };
  if (diff === 0) return { text: 'היום',  type: 'today'  };
  if (diff === 1) return { text: 'מחר',   type: 'soon'   };
  if (diff <= 7)  return { text: `עוד ${diff} ימים`, type: 'soon' };
  return { text: formatDate(dateStr), type: 'normal' };
};

export const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  return d;
};

export const getDaysInMonth = (year, month) => {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const days  = [];
  // pad start
  for (let i = 0; i < first.getDay(); i++) {
    days.push(null);
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
};

export const getWeekDays = (startDate) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};
