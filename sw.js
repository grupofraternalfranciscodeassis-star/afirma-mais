const CACHE = 'afirma-v4';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

const MOTIVACIONAIS = [
  'Você é capaz de superar qualquer desafio! 💪',
  'Cada repetição te aproxima de quem você quer ser. ✨',
  'Sua mente é poderosa — alimente-a com afirmações! 🌟',
  'Hoje é um novo dia para crescer e evoluir. 🌱',
  'Acredite em você. A transformação já começou! 🦋',
  'Consistência é o segredo. Continue! 🔥',
  'Você merece tudo de bom que está afirmando. 💫',
  'Sua prática de hoje planta a colheita de amanhã. 🌻',
  'A paz começa dentro de você. Respire e afirme! ☮️',
  'Cada dia de prática é uma vitória. Parabéns! 🏆'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});

// Agendamento de notificações
let notifTimers = [];

function clearTimers(){
  notifTimers.forEach(t => clearTimeout(t));
  notifTimers = [];
}

function msUntil(hh, mm){
  const now = new Date();
  const target = new Date();
  target.setHours(hh, mm, 0, 0);
  if(target <= now) target.setDate(target.getDate() + 1);
  return target - now;
}

function scheduleNotif(label, hh, mm){
  const ms = msUntil(hh, mm);
  const t = setTimeout(() => {
    const msg = MOTIVACIONAIS[Math.floor(Math.random() * MOTIVACIONAIS.length)];
    self.registration.showNotification('Afirma+ ' + label, {
      body: msg,
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200]
    });
    // Reagendar para amanhã
    scheduleNotif(label, hh, mm);
  }, ms);
  notifTimers.push(t);
}

self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SCHEDULE_NOTIF'){
    clearTimers();
    const s = e.data.settings;
    if(!s.enabled) return;
    if(s.morning){
      const [hh, mm] = s.timeMorning.split(':').map(Number);
      scheduleNotif('🌅', hh, mm);
    }
    if(s.night){
      const [hh, mm] = s.timeNight.split(':').map(Number);
      scheduleNotif('🌙', hh, mm);
    }
  }
});
