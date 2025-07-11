// ===========================
//  CONSTANTES / UTILITAIRES
// ===========================
const highRiskZones = [
  { name: 'Andohalo',   lat: -18.9184, lng: 47.5367 },
  { name: 'Analakely',  lat: -18.9190, lng: 47.5225 },
  { name: 'Isoraka',    lat: -18.9102, lng: 47.5298 }
];
const RISK_RADIUS = 200;        
const UPDATE_INTERVAL = 5000;   

const toRad = d => d * Math.PI / 180;
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1), Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// =====================
//  RÉFÉRENCES DOM
// =====================
const navHome       = document.getElementById('navHome');
const navMap        = document.getElementById('navMap');
const navPackaging  = document.getElementById('navPackaging');

const sectionHome       = document.getElementById('sectionHome');
const sectionMap        = document.getElementById('sectionMap');
const sectionPackaging  = document.getElementById('sectionPackaging');
const headerTitle       = document.getElementById('headerTitle');

const toggleBtn      = document.getElementById('toggleTracking');
const toggleText     = document.getElementById('toggleText');
const toggleSpinner  = document.getElementById('toggleSpinner');
const statusTxt      = document.getElementById('trackingStatus');
const userLocation   = document.getElementById('userLocation');
const nearestList    = document.getElementById('nearestZonesList');

// =====================
//  NAVIGATION SIMPLE
// =====================
function setActive(tab) {
  [navHome, navMap, navPackaging].forEach(el => {
    el.classList.remove('text-primary-blue', 'bg-blue-50',
      'font-bold', 'shadow-inner');
    el.classList.add('text-gray-500');
  });
  [sectionHome, sectionMap, sectionPackaging]
    .forEach(s => s.classList.add('hidden'));

  switch (tab) {
    case 'home':
      navHome.classList.add('text-primary-blue', 'bg-blue-50',
        'font-bold', 'shadow-inner');
      sectionHome.classList.remove('hidden');
      headerTitle.textContent = 'Accueil';
      break;
    case 'map':
      navMap.classList.add('text-primary-blue', 'bg-blue-50',
        'font-bold', 'shadow-inner');
      sectionMap.classList.remove('hidden');
      headerTitle.textContent = 'Carte';
      break;
    case 'packages':
      navPackaging.classList.add('text-primary-blue', 'bg-blue-50',
        'font-bold', 'shadow-inner');
      sectionPackaging.classList.remove('hidden');
      headerTitle.textContent = 'Packages';
      break;
  }
}
navHome.addEventListener('click', ()      => setActive('home'));
navMap.addEventListener('click', ()       => setActive('map'));
navPackaging.addEventListener('click', () => setActive('packages'));
setActive('home');   // par défaut

// ===========================================
//  TRACKING : DÉMARRER / ARRÊTER + MàJ 5 s
// ===========================================
let tracking = false;
let timerId  = null;

toggleBtn.addEventListener('click', () => {
  tracking = !tracking;
  if (tracking) startTracking();
  else stopTracking();
});

function startTracking() {
  // UI
  toggleBtn.classList.replace('bg-black', 'bg-[var(--safe-green)]');
  toggleText.classList.add('hidden');
  toggleSpinner.classList.remove('hidden');
  statusTxt.textContent = 'Tracking activé — surveillance en cours';

  // Demande / mise à jour immédiate
  updatePosition();
  // Puis toutes les 5 secondes
  timerId = setInterval(updatePosition, UPDATE_INTERVAL);
}

function stopTracking() {
  // UI
  toggleBtn.classList.replace('bg-[var(--safe-green)]', 'bg-black');
  toggleText.classList.remove('hidden');
  toggleSpinner.classList.add('hidden');
  statusTxt.textContent = 'Tracking désactivé';
  // Arrêt timer
  clearInterval(timerId);
  timerId = null;
}

// ==================================
//  MISE À JOUR DE LA POSITION
// ==================================
async function updatePosition() {
  if (!('geolocation' in navigator)) {
    statusTxt.textContent = "Géolocalisation non supportée.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      // Affiche le lien Google Maps
      const link = `https://www.google.com/maps?q=${lat},${lng}`;
      userLocation.innerHTML =
        `<a href="${link}" target="_blank"
            class="underline hover:text-blue-800">${link}</a>`;

      checkHighRisk(lat, lng);
    },
    err => {
      console.error(err);
      statusTxt.textContent = "Erreur de localisation.";
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
  );
}

// ==================================
//  CALCUL & AFFICHAGE DES ZONES
// ==================================
const notified = new Set();

function checkHighRisk(lat, lng) {
  const nearby = [];
  highRiskZones.forEach(zone => {
    const dist = distanceMeters(lat, lng, zone.lat, zone.lng);
    if (dist < RISK_RADIUS) {
      nearby.push({ ...zone, dist: Math.round(dist) });
      notifyOnce(zone.name, dist);
    }
  });
  renderNearbyZones(nearby);
}

function renderNearbyZones(list) {
  if (list.length === 0) {
    nearestList.innerHTML =
      `<li class="text-green-600">Aucune zone risquée proche 👍</li>`;
    return;
  }
  nearestList.innerHTML = list
    .sort((a, b) => a.dist - b.dist)
    .map(z =>
      `<li>${z.name} — <span class="font-semibold">${z.dist} m</span></li>`
    )
    .join('');
}

// ==========================
//  NOTIFICATIONS (facultatif)
// ==========================
async function notifyOnce(name, dist) {
  if (notified.has(name)) return;   // déjà envoyé
  if (!('Notification' in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  // Service-worker non indispensable : on peut créer directement
  new Notification('Aro Sécurité', {
    body: `⚠️ Zone à haut risque : ${name} à ${dist} m`,
    icon: '/icon-warning.png',
    badge: '/icon-badge.png',
    tag: `risk-${name}`
  });
  notified.add(name);
}
