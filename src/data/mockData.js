// ─── Smart Digital Khata — Mock Data ───────────────────────────────────────
// All data is stored here. khataService.js is the ONLY consumer.
import { getTodayIST } from '../utils/dateUtils';
// Replace this file + service with real API calls when backend is ready.

export const CUSTOMERS = [
  {
    id: 'c01',
    name: 'Ramesh Gupta',
    mobile: '9823401234',
    address: 'House No. 12, Gandhi Nagar',
    notes: 'Pays every 1st of month. Long-term customer.',
    paymentCycle: 'monthly',
    createdAt: '2024-01-15',
  },
  {
    id: 'c02',
    name: 'Sunita Sharma',
    mobile: '9765432100',
    address: 'Flat 3B, Laxmi Apartments',
    notes: 'Often pays in parts. Reliable.',
    paymentCycle: 'biweekly',
    createdAt: '2024-02-01',
  },
  {
    id: 'c03',
    name: 'Vijay Patil',
    mobile: '9987654321',
    address: 'Near Bus Stand, Ward 7',
    notes: '',
    paymentCycle: 'monthly',
    createdAt: '2024-02-10',
  },
  {
    id: 'c04',
    name: 'Priya Desai',
    mobile: '9112233445',
    address: 'Sector 4, New Colony',
    notes: 'Buys in bulk on Sundays.',
    paymentCycle: 'weekly',
    createdAt: '2024-03-01',
  },
  {
    id: 'c05',
    name: 'Mohan Yadav',
    mobile: '9334455667',
    address: 'Shiv Temple Road',
    notes: 'Pays cash every fortnight.',
    paymentCycle: 'biweekly',
    createdAt: '2024-03-15',
  },
  {
    id: 'c06',
    name: 'Kavita Joshi',
    mobile: '9556677889',
    address: 'Plot 22, Railway Colony',
    notes: '',
    paymentCycle: 'monthly',
    createdAt: '2024-04-01',
  },
  {
    id: 'c07',
    name: 'Suresh Mehta',
    mobile: '9778899001',
    address: 'Main Market, Shop 5',
    notes: 'Business owner. Large orders.',
    paymentCycle: 'monthly',
    createdAt: '2024-04-20',
  },
  {
    id: 'c08',
    name: 'Anita Singh',
    mobile: '9001122334',
    address: 'Near Post Office',
    notes: 'Has two kids. Regular buyer.',
    paymentCycle: 'weekly',
    createdAt: '2024-05-01',
  },
  {
    id: 'c09',
    name: 'Deepak Verma',
    mobile: '9223344556',
    address: 'Hanuman Gali, Block B',
    notes: '',
    paymentCycle: 'monthly',
    createdAt: '2024-05-10',
  },
  {
    id: 'c10',
    name: 'Rekha Nair',
    mobile: '9445566778',
    address: 'Sai Baba Nagar',
    notes: 'Pays promptly. No issues.',
    paymentCycle: 'monthly',
    createdAt: '2024-06-01',
  },
  {
    id: 'c11',
    name: 'Ajay Thakur',
    mobile: '9667788990',
    address: 'Kailash Colony',
    notes: 'Sometimes delays payment by a week.',
    paymentCycle: 'monthly',
    createdAt: '2024-06-15',
  },
  {
    id: 'c12',
    name: 'Meena Pillai',
    mobile: '9889900112',
    address: 'Ambedkar Chowk',
    notes: '',
    paymentCycle: 'weekly',
    createdAt: '2024-07-01',
  },
  {
    id: 'c13',
    name: 'Rohit Bansal',
    mobile: '9012345678',
    address: 'Model Town, House 88',
    notes: 'Contractor. Irregular payments.',
    paymentCycle: 'monthly',
    createdAt: '2024-07-15',
  },
  {
    id: 'c14',
    name: 'Pooja Tiwari',
    mobile: '9234567890',
    address: 'Near School Road',
    notes: 'Teacher. Very punctual.',
    paymentCycle: 'monthly',
    createdAt: '2024-08-01',
  },
  {
    id: 'c15',
    name: 'Santosh Kumar',
    mobile: '9456789012',
    address: 'Workers Colony',
    notes: 'Daily wage worker. Pays weekly.',
    paymentCycle: 'weekly',
    createdAt: '2024-08-15',
  },
  {
    id: 'c16',
    name: 'Geeta Pandey',
    mobile: '9678901234',
    address: 'Old Bazar Street',
    notes: '',
    paymentCycle: 'monthly',
    createdAt: '2024-09-01',
  },
  {
    id: 'c17',
    name: 'Manoj Chauhan',
    mobile: '9890123456',
    address: 'Vikas Nagar',
    notes: 'Has a running tab for 2 years.',
    paymentCycle: 'monthly',
    createdAt: '2024-09-15',
  },
  {
    id: 'c18',
    name: 'Lalita Mishra',
    mobile: '9012567890',
    address: 'Durga Mandir ke Paas',
    notes: 'Joint family. High volume.',
    paymentCycle: 'biweekly',
    createdAt: '2024-10-01',
  },
];

const today = new Date(getTodayIST());

function dateStr(daysAgo) {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function ts(daysAgo, hour = 10, min = 0) {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

let eid = 1;
function entry(customerId, daysAgo, amounts, hour = 10) {
  return amounts.map((amount, i) => ({
    id: `e${String(eid++).padStart(4, '0')}`,
    customerId,
    date: dateStr(daysAgo),
    amount,
    timestamp: ts(daysAgo, hour + i, i * 15),
    type: 'credit',
    note: '',
  }));
}

export const ENTRIES = [
  // === Today (day 0) ===
  ...entry('c01', 0, [50, 120, 30], 8),
  ...entry('c03', 0, [200, 80], 9),
  ...entry('c07', 0, [500, 300, 150], 10),
  ...entry('c12', 0, [40, 60], 11),
  ...entry('c15', 0, [80], 9),

  // === Day 1 ===
  ...entry('c02', 1, [90, 45], 9),
  ...entry('c04', 1, [300, 200, 100], 10),
  ...entry('c06', 1, [75], 11),
  ...entry('c09', 1, [150, 50], 12),
  ...entry('c13', 1, [400, 200], 8),

  // === Day 2 ===
  ...entry('c01', 2, [60, 90], 10),
  ...entry('c05', 2, [200, 150, 80], 9),
  ...entry('c08', 2, [120], 11),
  ...entry('c11', 2, [350, 100], 10),
  ...entry('c17', 2, [500], 8),

  // === Day 3 ===
  ...entry('c02', 3, [80, 40, 30], 9),
  ...entry('c07', 3, [600, 250], 10),
  ...entry('c10', 3, [100], 11),
  ...entry('c14', 3, [200, 80], 12),
  ...entry('c18', 3, [300, 150, 50], 9),

  // === Day 4 ===
  ...entry('c03', 4, [150, 75], 10),
  ...entry('c06', 4, [200], 11),
  ...entry('c09', 4, [80, 40], 9),
  ...entry('c16', 4, [120, 60], 10),

  // === Day 5 ===
  ...entry('c01', 5, [100, 50, 20], 8),
  ...entry('c04', 5, [400], 10),
  ...entry('c12', 5, [90, 30], 11),
  ...entry('c13', 5, [300, 150], 9),

  // === Day 6 ===
  ...entry('c05', 6, [250, 100], 10),
  ...entry('c08', 6, [60, 90, 40], 9),
  ...entry('c11', 6, [200], 11),
  ...entry('c15', 6, [120], 8),
  ...entry('c17', 6, [400, 200], 10),

  // === Day 7 ===
  ...entry('c02', 7, [70, 50], 10),
  ...entry('c07', 7, [800, 400, 200], 9),
  ...entry('c10', 7, [150, 75], 11),
  ...entry('c18', 7, [200, 100, 50], 10),

  // === Day 8 ===
  ...entry('c01', 8, [80, 40], 9),
  ...entry('c03', 8, [300], 10),
  ...entry('c06', 8, [100, 50, 25], 11),
  ...entry('c14', 8, [180], 12),
  ...entry('c16', 8, [90, 60], 10),

  // === Day 9 ===
  ...entry('c04', 9, [500, 200], 10),
  ...entry('c09', 9, [150], 11),
  ...entry('c12', 9, [80, 40, 20], 9),
  ...entry('c13', 9, [600], 8),

  // === Day 10 ===
  ...entry('c05', 10, [300, 150], 10),
  ...entry('c07', 10, [700, 300], 9),
  ...entry('c11', 10, [250, 100, 50], 11),
  ...entry('c17', 10, [600], 10),

  // === Days 11–20 (less dense) ===
  ...entry('c01', 11, [60, 80], 10),
  ...entry('c02', 11, [100], 11),
  ...entry('c08', 11, [150, 75], 9),

  ...entry('c03', 12, [200, 100], 10),
  ...entry('c06', 12, [80], 11),
  ...entry('c15', 12, [120, 60], 9),

  ...entry('c04', 13, [350], 10),
  ...entry('c09', 13, [90, 40], 11),
  ...entry('c18', 13, [400, 150], 9),

  ...entry('c07', 14, [500, 250, 100], 10),
  ...entry('c10', 14, [200], 11),
  ...entry('c13', 14, [300], 8),

  ...entry('c01', 15, [100, 50], 10),
  ...entry('c05', 15, [200, 80], 11),
  ...entry('c11', 15, [300], 9),

  ...entry('c02', 16, [90, 60], 10),
  ...entry('c14', 16, [150, 70], 11),
  ...entry('c16', 16, [100], 9),

  ...entry('c06', 17, [80, 40], 10),
  ...entry('c08', 17, [200], 11),
  ...entry('c17', 17, [500, 200], 9),

  ...entry('c03', 18, [150], 10),
  ...entry('c12', 18, [100, 50, 30], 11),
  ...entry('c15', 18, [80], 9),

  ...entry('c04', 19, [400, 150], 10),
  ...entry('c07', 19, [600, 300], 9),
  ...entry('c18', 19, [200, 100], 11),

  ...entry('c01', 20, [70, 30], 10),
  ...entry('c09', 20, [120], 11),
  ...entry('c13', 20, [250, 100], 9),

  // === Days 21–35 ===
  ...entry('c05', 21, [300], 10),
  ...entry('c10', 21, [150, 80], 11),
  ...entry('c11', 21, [200], 9),

  ...entry('c02', 22, [80, 40, 20], 10),
  ...entry('c07', 22, [700], 9),
  ...entry('c16', 22, [100], 11),

  ...entry('c01', 23, [90, 50], 10),
  ...entry('c08', 23, [180], 11),
  ...entry('c14', 23, [200, 100], 9),

  ...entry('c03', 24, [250], 10),
  ...entry('c06', 24, [120, 60], 11),
  ...entry('c17', 24, [400], 9),

  ...entry('c04', 25, [300, 150], 10),
  ...entry('c12', 25, [90], 11),
  ...entry('c18', 25, [350, 100], 9),

  ...entry('c05', 26, [200, 80, 40], 10),
  ...entry('c09', 26, [150], 11),
  ...entry('c13', 26, [500], 8),

  ...entry('c01', 27, [100, 60], 10),
  ...entry('c07', 27, [800], 9),
  ...entry('c15', 27, [100, 50], 11),

  ...entry('c02', 28, [80], 10),
  ...entry('c10', 28, [200, 100], 11),
  ...entry('c11', 28, [300, 150], 9),

  ...entry('c03', 29, [200], 10),
  ...entry('c16', 29, [120, 80], 11),
  ...entry('c18', 29, [250], 9),

  ...entry('c04', 30, [400, 200, 100], 10),
  ...entry('c06', 30, [150], 11),
  ...entry('c14', 30, [180, 90], 9),

  ...entry('c07', 31, [600, 300], 9),
  ...entry('c13', 31, [400], 10),
  ...entry('c17', 31, [300, 150], 11),

  ...entry('c01', 32, [80, 40], 10),
  ...entry('c08', 32, [200, 100, 50], 11),
  ...entry('c12', 32, [120], 9),

  ...entry('c05', 33, [250, 100], 10),
  ...entry('c09', 33, [80], 11),
  ...entry('c15', 33, [150, 70], 9),

  ...entry('c02', 34, [90, 50, 20], 10),
  ...entry('c11', 34, [300], 9),
  ...entry('c16', 34, [100, 60], 11),

  ...entry('c06', 35, [200, 80], 10),
  ...entry('c10', 35, [150], 11),
  ...entry('c18', 35, [300, 100, 50], 9),
];

// ─── Payments ──────────────────────────────────────────────────────────────
let pid = 1;
function payment(customerId, daysAgo, amount) {
  return {
    id: `p${String(pid++).padStart(3, '0')}`,
    customerId,
    amount,
    date: dateStr(daysAgo),
    timestamp: ts(daysAgo, 13, 0),
    type: 'payment',
    note: 'Cash payment received',
  };
}

export const PAYMENTS = [
  payment('c01', 5, 500),
  payment('c02', 8, 300),
  payment('c03', 3, 400),
  payment('c04', 12, 1000),
  payment('c05', 6, 600),
  payment('c06', 10, 250),
  payment('c07', 7, 2000),
  payment('c08', 4, 350),
  payment('c09', 9, 200),
  payment('c10', 2, 500),
  payment('c11', 11, 800),
  payment('c12', 14, 300),
  payment('c13', 1, 1500),
  payment('c14', 15, 400),
  payment('c15', 7, 200),
  payment('c16', 13, 250),
  payment('c17', 3, 1000),
  payment('c18', 6, 600),
  // some customers had a second payment
  payment('c01', 20, 400),
  payment('c07', 21, 3000),
  payment('c13', 25, 1000),
  payment('c02', 30, 500),
  payment('c18', 28, 500),
];
