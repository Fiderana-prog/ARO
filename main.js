  document.addEventListener("DOMContentLoaded", () => {
      // Références des onglets
      const navHome = document.getElementById('navHome');
      const navMap = document.getElementById('navMap');
      const navPackaging = document.getElementById('navPackaging');
      const navIndicator = document.getElementById('navIndicator');

      const sectionHome = document.getElementById('sectionHome');
      const sectionMap = document.getElementById('sectionMap');
      const sectionPackaging = document.getElementById('sectionPackaging');

      const header = document.getElementById('headerTitle');

      const buttons = [navHome, navMap, navPackaging];

      // --- Navigation par onglets ---
      function setActive(tab) {
          // Reset styles
          buttons.forEach(btn => btn.classList.replace('text-white', 'text-gray-500'));
          [sectionHome, sectionMap, sectionPackaging].forEach(sec => sec.classList.add('hidden'));

          // Détermine index + mise à jour
          let index = 0;
          if (tab === 'home') {
              navHome.classList.replace('text-gray-500', 'text-white');
              sectionHome.classList.remove('hidden');
              header.textContent = 'Accueil';
              index = 0;
          } else if (tab === 'map') {
              navMap.classList.replace('text-gray-500', 'text-white');
              sectionMap.classList.remove('hidden');
              header.textContent = 'Carte';
              index = 1;
          } else if (tab === 'packages') {
              navPackaging.classList.replace('text-gray-500', 'text-white');
              sectionPackaging.classList.remove('hidden');
              header.textContent = 'Packages';
              index = 2;
          }

          moveIndicator(index);
      }

      // Curseur animé (glissement doux)
      function moveIndicator(index) {
          const button = buttons[index];
          const rect = button.getBoundingClientRect();
          const parentRect = button.parentElement.getBoundingClientRect();
          const left = rect.left - parentRect.left + rect.width / 2 - navIndicator.offsetWidth / 2;
          navIndicator.style.left = `${left}px`;
      }

      // Listeners onglets
      navHome.addEventListener('click', () => setActive('home'));
      navMap.addEventListener('click', () => setActive('map'));
      navPackaging.addEventListener('click', () => setActive('packages'));

      // Par défaut : Accueil actif
      setTimeout(() => setActive('home'), 100);


      // --- Suivi Tracking / Localisation ---
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
              // Activer tracking
              toggleBtn.classList.remove('bg-gray-300');
              toggleBtn.classList.add('bg-[var(--safe-green)]');
              toggleText.classList.add('hidden');
              toggleSpinner.classList.remove('hidden');
              statusTxt.textContent = 'Tracking activé — surveillance en cours';

              if (navigator.geolocation) {
                  watchId = navigator.geolocation.watchPosition(pos => {
                      const {
                          latitude,
                          longitude
                      } = pos.coords;
                      const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
                      userLocation.innerHTML = `<a href="${link}" target="_blank" class="underline hover:text-blue-800">${link}</a>`;
                  }, () => {
                      userLocation.textContent = "Erreur de localisation.";
                  });
              } else {
                  userLocation.textContent = "La géolocalisation n'est pas supportée.";
              }

          } else {
              // Désactiver tracking
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

      // Localisation initiale au chargement
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
              const {
                  latitude,
                  longitude
              } = pos.coords;
              const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
              userLocation.innerHTML = `<a href="${link}" target="_blank" class="underline hover:text-blue-800">${link}</a>`;
          }, () => {
              userLocation.textContent = "Accès à la localisation refusé.";
          });
      } else {
          userLocation.textContent = "Géolocalisation non supportée.";
      }
  });