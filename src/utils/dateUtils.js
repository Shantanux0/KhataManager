export function getTodayIST() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
