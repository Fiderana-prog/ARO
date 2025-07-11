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
            toggleBtn.classList.add('bg-black');
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


    // main.js
    document.addEventListener('DOMContentLoaded', async () => {
        // Enregistrement du Service Worker
        if ('Notification' in window && Notification.permission !== 'granted') {
            try {
                const permission = await Notification.requestPermission();
                console.log('Permission notification :', permission);
            } catch (err) {
                console.error('Erreur lors de la demande de permission :', err);
            }
        }

        // Demande permission notification
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Permission :', permission);
        }

        const highRiskZones = [{
                name: "Andohalo",
                lat: -18.9184,
                lng: 47.5367
            },
            {
                name: "Analakely",
                lat: -18.9190,
                lng: 47.5225
            },
            {
                name: "Isoraka",
                lat: -18.9102,
                lng: 47.5298
            }
        ];

        function distanceMeters(lat1, lon1, lat2, lon2) {
            const toRad = d => d * Math.PI / 180;
            const R = 6371000;
            const φ1 = toRad(lat1),
                φ2 = toRad(lat2);
            const Δφ = toRad(lat2 - lat1),
                Δλ = toRad(lon2 - lon1);
            const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }

        const alerted = new Set();

        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(async pos => {
                const {
                    latitude,
                    longitude
                } = pos.coords;
                for (const zone of highRiskZones) {
                    const dist = distanceMeters(latitude, longitude, zone.lat, zone.lng);
                    if (dist < 200 && !alerted.has(zone.name)) {
                        alerted.add(zone.name);
                        const message = `⚠️ Zone à haut risque : ${zone.name} à ${Math.round(dist)} m`;

                        if (Notification.permission === 'granted') {
                            const reg = await navigator.serviceWorker.ready;
                            reg.showNotification('Aro Sécurité', {
                                body: message,
                                icon: '/icon-warning.png',
                                badge: '/icon-badge.png',
                                tag: 'high-risk-alert'
                            });
                        } else {
                            console.warn('Permission notification non accordée.');
                        }
                    }
                }
            }, console.error, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        }
    });