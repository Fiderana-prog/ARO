 // Références des onglets
  const navHome = document.getElementById('navHome');
  const navMap = document.getElementById('navMap');
  const navPackaging = document.getElementById('navPackaging');

  const sectionHome = document.getElementById('sectionHome');
  const sectionMap = document.getElementById('sectionMap');
  const sectionPackaging = document.getElementById('sectionPackaging');

  const header = document.getElementById('headerTitle');

  // Fonction de navigation
  function setActive(tab) {
    // Réinitialise les onglets
    [navHome, navMap, navPackaging].forEach(el => {
      el.classList.remove('text-primary-blue', 'bg-blue-50', 'font-bold', 'shadow-inner');
      el.classList.add('text-gray-500');
    });

    // Cache les sections
    [sectionHome, sectionMap, sectionPackaging].forEach(sec => sec.classList.add('hidden'));

    // Active la section sélectionnée
    if (tab === 'home') {
      navHome.classList.add('text-primary-blue', 'bg-blue-50', 'font-bold', 'shadow-inner');
      sectionHome.classList.remove('hidden');
      header.textContent = 'Accueil';
    } else if (tab === 'map') {
      navMap.classList.add('text-primary-blue', 'bg-blue-50', 'font-bold', 'shadow-inner');
      sectionMap.classList.remove('hidden');
      header.textContent = 'Carte';
    } else if (tab === 'packages') {
      navPackaging.classList.add('text-primary-blue', 'bg-blue-50', 'font-bold', 'shadow-inner');
      sectionPackaging.classList.remove('hidden');
      header.textContent = 'Packages';
    }
  }

  // Navigation listeners
  navHome.addEventListener('click', () => setActive('home'));
  navMap.addEventListener('click', () => setActive('map'));
  navPackaging.addEventListener('click', () => setActive('packages'));

  // Par défaut → page Accueil
  setActive('home');

  // Elements pour tracking
  const toggleBtn = document.getElementById('toggleTracking');
  const toggleText = document.getElementById('toggleText');
  const toggleSpinner = document.getElementById('toggleSpinner');
  const statusTxt = document.getElementById('trackingStatus');
  const userLocation = document.getElementById('userLocation');

  let trackingOn = false;
  let watchId = null;

  toggleBtn.addEventListener('click', () => {
    trackingOn = !trackingOn;

    if (trackingOn) {
      toggleBtn.classList.remove('bg-gray-300');
      toggleBtn.classList.add('bg-[var(--safe-green)]');
      toggleText.classList.add('hidden');
      toggleSpinner.classList.remove('hidden');
      statusTxt.textContent = 'Tracking activé — surveillance en cours';

      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(pos => {
          const { latitude, longitude } = pos.coords;
          const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
          userLocation.innerHTML = `<a href="${link}" target="_blank" class="underline hover:text-blue-800">${link}</a>`;
        }, () => {
          userLocation.textContent = "Erreur de localisation.";
        });
      } else {
        userLocation.textContent = "La géolocalisation n'est pas supportée.";
      }

    } else {
      toggleBtn.classList.add('bg-gray-300');
      toggleBtn.classList.remove('bg-[var(--safe-green)]');
      toggleText.classList.remove('hidden');
      toggleSpinner.classList.add('hidden');
      statusTxt.textContent = 'Tracking désactivé';

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    }
  });

  // Localisation initiale
  window.addEventListener('load', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
        userLocation.innerHTML = `<a href="${link}" target="_blank" class="underline hover:text-blue-800">${link}</a>`;
      }, () => {
        userLocation.textContent = "Accès à la localisation refusé.";
      });
    } else {
      userLocation.textContent = "Géolocalisation non supportée.";
    }
  });


