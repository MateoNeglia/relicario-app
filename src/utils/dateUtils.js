
export function formatDateToSpanishShort(datetimeString) {
  const date = new Date(datetimeString);
  const now = new Date();
  const diffInMs = now - date;
  const msInMonth = 30 * 24 * 60 * 60 * 1000; // Approximate month

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const isPM = hours >= 12;
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const period = isPM ? 'p. m.' : 'a. m.';
  const timeString = `${hours}:${minutes} ${period}`;

  if (diffInMs < msInMonth) {
    return timeString;
  }

  const day = date.getDate();
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  const month = monthNames[date.getMonth()];
  return `${day} de ${month} ${timeString}`;
} 