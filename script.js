document.addEventListener("DOMContentLoaded", function () {
    const fajrTimeElem = document.getElementById("fajr-time");
    const iftarTimeElem = document.getElementById("iftar-time");
    const countdownElem = document.getElementById("countdown");

    function fetchPrayerTimes() {
        const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=Marseille&country=France&method=2`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const fajrTime = data.data.timings.Fajr;
                const maghrebTime = data.data.timings.Maghrib;

                fajrTimeElem.textContent = `🕒 ${fajrTime}`;
                iftarTimeElem.textContent = `🕒 ${maghrebTime}`;

                startCountdown(fajrTime, maghrebTime);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des horaires :", error);
                fajrTimeElem.textContent = "Impossible de charger l'heure.";
                iftarTimeElem.textContent = "Impossible de charger l'heure.";
                countdownElem.textContent = "Erreur de connexion.";
            });
    }

    function startCountdown(fajrTime, iftarTime) {
        const now = new Date();
        const [fajrHours, fajrMinutes] = fajrTime.split(":").map(Number);
        const [iftarHours, iftarMinutes] = iftarTime.split(":").map(Number);

        const fajrDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), fajrHours, fajrMinutes);
        const iftarDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), iftarHours, iftarMinutes);

        let nextEvent, eventName;

        if (now < fajrDate) {
            nextEvent = fajrDate;
            eventName = "Début du jeûne (Fajr)";
        } else if (now < iftarDate) {
            nextEvent = iftarDate;
            eventName = "Rupture du jeûne (Iftar)";
        } else {
            // Si l'Iftar est déjà passé, le prochain événement est le Fajr du lendemain
            nextEvent = new Date(fajrDate);
            nextEvent.setDate(nextEvent.getDate() + 1);
            eventName = "Début du jeûne (Fajr)";
        }

        function updateCountdown() {
            const currentTime = new Date();
            const timeDiff = nextEvent - currentTime;

            if (timeDiff > 0) {
                const h = Math.floor(timeDiff / 1000 / 60 / 60);
                const m = Math.floor((timeDiff / 1000 / 60) % 60);
                const s = Math.floor((timeDiff / 1000) % 60);
                countdownElem.textContent = `${eventName} dans ${h}h ${m}m ${s}s`;
                requestAnimationFrame(updateCountdown);
            } else {
                countdownElem.textContent = "🕌 C'est l'heure !";
            }
        }

        updateCountdown();
    }

    function updateBackground() {
        const now = new Date();
        const hour = now.getHours();
        const body = document.body;

        if (hour >= 6 && hour < 12) {
            body.className = "morning"; // Matin
        } else if (hour >= 12 && hour < 18) {
            body.className = "afternoon"; // Après-midi
        } else {
            body.className = "evening"; // Soir
        }
    }

    function updatePage() {
        fetchPrayerTimes();
        updateBackground();
    }

    updatePage(); // Charger les infos au démarrage
});
