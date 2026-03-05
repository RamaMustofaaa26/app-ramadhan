// --- Variabel Global Lokasi ---
let currentCity = "Pandeglang"; 
let currentCountry = "Indonesia";
let currentLat = -6.0174; 
let currentLng = 106.0232; 
let isUsingGPS = false; 

function showAlert(message) { alert(message); }

// --- LOGIKA MODAL LOKASI ---
function openLocationModal() {
    document.getElementById('location-modal').style.display = 'flex';
    document.getElementById('city-input').value = isUsingGPS ? "" : currentCity;
}
function closeLocationModal() { document.getElementById('location-modal').style.display = 'none'; }
function saveLocation() {
    const inputCity = document.getElementById('city-input').value.trim();
    if(inputCity !== "") {
        isUsingGPS = false; currentCity = inputCity; updateUI(currentCity); fetchJadwalByCity();
    }
}
function getLocationGPS() {
    document.getElementById('location-modal').style.display = 'none';
    document.getElementById('jadwal-container').innerHTML = '<div class="loader">Mencari sinyal GPS...</div>';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLat = position.coords.latitude; currentLng = position.coords.longitude;
                isUsingGPS = true; currentCity = "Titik GPS Anda"; 
                updateUI(currentCity); fetchJadwalByCoords(currentLat, currentLng);
                openGoogleMaps(); // Buka maps pembuktian
            },
            (error) => { alert("Gagal mendapatkan GPS. Izin ditolak."); fetchJadwalByCity(); }
        );
    } else { alert("GPS tidak didukung."); fetchJadwalByCity(); }
}
function updateUI(locationName) {
    document.getElementById('user-city').innerText = locationName;
    document.getElementById('jadwal-city-text').innerText = locationName;
    if(document.getElementById('qiblat-city-text')) document.getElementById('qiblat-city-text').innerText = locationName;
    closeLocationModal();
}
function openGoogleMaps() { window.open(`https://www.google.com/maps?q=$${currentLat},${currentLng}`, '_blank'); }
function switchScreen(screenId, navElement) {
    document.querySelectorAll('.screen').forEach(screen => { screen.classList.remove('active'); });
    document.getElementById(screenId).classList.add('active');
    if (navElement) {
        document.querySelectorAll('.nav-item').forEach(item => { item.classList.remove('active'); });
        navElement.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- LOGIKA JADWAL SHOLAT & ALARM INTERAKTIF ---
async function fetchJadwalByCity() {
    try {
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${currentCity}&country=${currentCountry}&method=11`);
        const data = await response.json();
        currentLat = data.data.meta.latitude; currentLng = data.data.meta.longitude;
        renderJadwal(data.data);
    } catch (error) { document.getElementById('jadwal-container').innerHTML = `<p style="color:red; text-align:center;">Kota tidak ditemukan.</p>`; }
}
async function fetchJadwalByCoords(lat, lng) {
    try {
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=11`);
        const data = await response.json();
        renderJadwal(data.data);
    } catch (error) { document.getElementById('jadwal-container').innerHTML = `<p style="color:red; text-align:center;">Gagal mengambil jadwal.</p>`; }
}
function renderJadwal(data) {
    const t = data.timings;
    const dateId = data.date.hijri.day + " " + data.date.hijri.month.en + " " + data.date.hijri.year + " H";
    document.getElementById('date-display').innerText = "📅 " + dateId;
    document.getElementById('maghrib-time').innerText = t.Maghrib; 
    document.getElementById('imsak-time').innerText = t.Imsak;
    document.getElementById('subuh-time').innerText = t.Fajr;

    document.getElementById('jadwal-container').innerHTML = `
        <div class="jadwal-card" onclick="toggleAlarm(this, 'Imsak', '${t.Imsak}')"><div class="jadwal-icon-alarm">🔕</div><div class="jadwal-card-content"><div class="jadwal-name">Imsak</div><div class="jadwal-time">${t.Imsak}</div></div></div>
        <div class="jadwal-card" onclick="toggleAlarm(this, 'Subuh', '${t.Fajr}')"><div class="jadwal-icon-alarm">🔕</div><div class="jadwal-card-content"><div class="jadwal-name">Subuh</div><div class="jadwal-time">${t.Fajr}</div></div></div>
        <div class="jadwal-card" onclick="toggleAlarm(this, 'Dzuhur', '${t.Dhuhr}')"><div class="jadwal-icon-alarm">🔕</div><div class="jadwal-card-content"><div class="jadwal-name">Dzuhur</div><div class="jadwal-time">${t.Dhuhr}</div></div></div>
        <div class="jadwal-card" onclick="toggleAlarm(this, 'Ashar', '${t.Asr}')"><div class="jadwal-icon-alarm">🔕</div><div class="jadwal-card-content"><div class="jadwal-name">Ashar</div><div class="jadwal-time">${t.Asr}</div></div></div>
        <div class="jadwal-card maghrib" onclick="toggleAlarm(this, 'Maghrib', '${t.Maghrib}')"><div class="jadwal-icon-alarm">🔕</div><div class="jadwal-card-content"><div class="jadwal-name">Maghrib (Buka)</div><div class="jadwal-time">${t.Maghrib}</div></div></div>
        <div class="jadwal-card" onclick="toggleAlarm(this, 'Isya', '${t.Isha}')"><div class="jadwal-icon-alarm">🔕</div><div class="jadwal-card-content"><div class="jadwal-name">Isya</div><div class="jadwal-time">${t.Isha}</div></div></div>
    `;
}

function toggleAlarm(element, namaShalat, waktu) {
    if(element.classList.contains('alarm-on')) {
        element.classList.remove('alarm-on');
        element.querySelector('.jadwal-icon-alarm').innerText = "🔕";
        alert(`❌ Alarm Pengingat ${namaShalat} DIMATIKAN.`);
    } else {
        element.classList.add('alarm-on');
        element.querySelector('.jadwal-icon-alarm').innerText = "🔔";
        alert(`✅ Alarm Pengingat Dinyalakan!\n\nAnda akan diingatkan saat waktu ${namaShalat} tiba pada pukul ${waktu}.`);
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
}

// --- LOGIKA TASBIH ANIMASI FISIK ---
let tasbihCount = 0;
function pullBead() {
    tasbihCount++;
    document.getElementById('tasbih-count').innerText = tasbihCount;
    if (navigator.vibrate) navigator.vibrate(40);
    const bead = document.getElementById('main-bead');
    bead.classList.remove('pull-animate');
    void bead.offsetWidth;
    bead.classList.add('pull-animate');
}
function resetTasbih() {
    if(confirm("Apakah Anda ingin mereset hitungan tasbih ke 0?")) {
        tasbihCount = 0;
        document.getElementById('tasbih-count').innerText = tasbihCount;
        if (navigator.vibrate) navigator.vibrate(100);
    }
}

// --- LOGIKA KALENDER INTERAKTIF (TANPA ALERT) ---
let calDate = new Date(); let currentCalMonth = calDate.getMonth() + 1; let currentCalYear = calDate.getFullYear();
function changeMonth(offset) {
    currentCalMonth += offset;
    if (currentCalMonth > 12) { currentCalMonth = 1; currentCalYear++; }
    if (currentCalMonth < 1) { currentCalMonth = 12; currentCalYear--; }
    renderKalender();
}
async function renderKalender() {
    document.getElementById('kalender-grid').innerHTML = '<div class="loader" style="grid-column: 1/-1;">Menyiapkan Kalender...</div>';
    try {
        const res = await fetch(`https://api.aladhan.com/v1/gToHCalendar/${currentCalMonth}/${currentCalYear}`);
        const data = await res.json();
        const days = data.data;
        const firstDayStr = days[0].gregorian.weekday.en; 
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const startOffset = weekdays.indexOf(firstDayStr);
        const hijriMonth1 = days[0].hijri.month.en; const hijriMonth2 = days[days.length-1].hijri.month.en;
        const displayHijri = hijriMonth1 === hijriMonth2 ? hijriMonth1 : `${hijriMonth1}/${hijriMonth2}`;
        document.getElementById('kalender-title').innerText = `${days[0].gregorian.month.en} ${currentCalYear} \n (${displayHijri})`;
        let html = '';
        for(let i = 0; i < startOffset; i++) { html += `<div class="cal-cell empty"></div>`; }
        const todayDate = new Date().getDate(); const todayMonth = new Date().getMonth() + 1;
        
        days.forEach(day => {
            let isToday = (parseInt(day.gregorian.day) === todayDate && currentCalMonth === todayMonth) ? 'today' : '';
            
            // FUNGSI ONCLICK ALERT SUDAH DIHAPUS, TETAPI CLASS CSS TETAP ADA AGAR BISA DIKLIK MANTUL
            html += `<div class="cal-cell ${isToday}">
                        <span class="masehi-date">${parseInt(day.gregorian.day)}</span>
                        <span class="hijri-date">${day.hijri.day} ${day.hijri.month.en.substring(0,3)}</span>
                    </div>`;
        });
        document.getElementById('kalender-grid').innerHTML = html;
    } catch (error) { document.getElementById('kalender-grid').innerHTML = '<div style="grid-column: 1/-1; color:red;">Gagal memuat kalender.</div>'; }
}

// --- LOGIKA AL-QURAN ---
let surahData = [];
async function fetchQuran() {
    try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await res.json(); surahData = data.data; renderSurahList(surahData);
    } catch (error) {}
}
function renderSurahList(surahs) {
    let html = '';
    surahs.forEach(s => {
        html += `<div class="surah-card" onclick="openSurah(${s.number}, '${s.englishName}')">
                <div class="surah-number">${s.number}</div>
                <div class="surah-info"><div class="surah-name-id">${s.englishName}</div><div class="surah-meaning">${s.englishNameTranslation}</div></div>
                <div class="surah-name-ar">${s.name}</div></div>`;
    });
    document.getElementById('quran-container').innerHTML = html;
}
function filterSurah() {
    const search = document.getElementById('searchSurah').value.toLowerCase();
    renderSurahList(surahData.filter(s => s.englishName.toLowerCase().includes(search) || s.englishNameTranslation.toLowerCase().includes(search)));
}
async function openSurah(number, name) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('quran-list').style.display = 'none'; document.getElementById('quran-detail').style.display = 'block';
    document.getElementById('surah-title').innerText = `Surat ${name}`; document.getElementById('ayah-container').innerHTML = '<div class="loader">Memuat ayat...</div>';
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${number}/editions/quran-uthmani,id.indonesian`);
        const data = await res.json(); let html = '';
        for (let i = 0; i < data.data[0].ayahs.length; i++) {
            html += `<div class="ayah-card"><div class="ayah-number-badge">Ayat ${data.data[0].ayahs[i].numberInSurah}</div>
                    <div class="ayah-arabic">${data.data[0].ayahs[i].text}</div><div class="ayah-translation">${data.data[1].ayahs[i].text}</div></div>`;
        }
        document.getElementById('ayah-container').innerHTML = html;
    } catch (error) {}
}
function backToSurahList() { document.getElementById('quran-detail').style.display = 'none'; document.getElementById('quran-list').style.display = 'block'; }

// --- LOGIKA KIBLAT & ASMAUL HUSNA ---
let qiblaDirection = 0;
async function initQibla() {
    document.getElementById('qiblat-city-text').innerText = isUsingGPS ? "Titik GPS Anda" : currentCity;
    document.getElementById('compass-status').innerText = "Mengambil data derajat Kiblat...";
    try {
        const res = await fetch(`https://api.aladhan.com/v1/qibla/${currentLat}/${currentLng}`);
        const data = await res.json(); qiblaDirection = data.data.direction;
        document.getElementById('qibla-degree').innerText = qiblaDirection.toFixed(1);
        document.getElementById('qibla-arrow').style.transform = `translate(-50%, -50%) rotate(${qiblaDirection}deg)`;
        setupCompass();
    } catch(e) { document.getElementById('compass-status').innerText = "Gagal mengambil data arah."; }
}
function setupCompass() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        document.getElementById('btn-start-compass').style.display = 'inline-block';
        document.getElementById('compass-status').innerText = "Klik tombol untuk izin kompas (iPhone).";
    } else if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation);
        document.getElementById('compass-status').innerText = "Kompas aktif. Putar HP Anda.";
    } else { document.getElementById('compass-status').innerText = "Sensor tidak didukung."; }
}
function startCompass() { 
    DeviceOrientationEvent.requestPermission().then(res => {
        if (res == 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            document.getElementById('btn-start-compass').style.display = 'none';
            document.getElementById('compass-status').innerText = "Kompas aktif. Putar HP Anda.";
        }
    }).catch(console.error);
}
function handleOrientation(event) {
    let alpha = event.alpha; let webkitHeading = event.webkitCompassHeading; let heading = 0;
    if (webkitHeading) { heading = webkitHeading; } else if (alpha !== null) { heading = 360 - alpha; }
    document.getElementById('compass-dial').style.transform = `rotate(${-heading}deg)`;
}

// --- LOGIKA ASMAUL HUSNA FULL 99 NAMA ---
const asmaulHusnaData = [
    {"ar":"الرَّحْمَنُ","la":"Ar Rahman","id":"Yang Maha Pengasih"},
    {"ar":"الرَّحِيمُ","la":"Ar Rahiim","id":"Yang Maha Penyayang"},
    {"ar":"الْمَلِكُ","la":"Al Malik","id":"Yang Maha Merajai"},
    {"ar":"الْقُدُّوسُ","la":"Al Quddus","id":"Yang Maha Suci"},
    {"ar":"السَّلاَمُ","la":"As Salaam","id":"Yang Maha Memberi Kesejahteraan"},
    {"ar":"الْمُؤْمِنُ","la":"Al Mu'min","id":"Yang Maha Memberi Keamanan"},
    {"ar":"الْمُهَيْمِنُ","la":"Al Muhaimin","id":"Yang Maha Mengatur"},
    {"ar":"الْعَزِيزُ","la":"Al 'Aziiz","id":"Yang Maha Perkasa"},
    {"ar":"الْجَبَّارُ","la":"Al Jabbar","id":"Yang Memiliki (Mutlak) Kegagahan"},
    {"ar":"الْمُتَكَبِّرُ","la":"Al Mutakabbir","id":"Yang Maha Megah"},
    {"ar":"الْخَالِقُ","la":"Al Khaliq","id":"Yang Maha Pencipta"},
    {"ar":"الْبَارِئُ","la":"Al Baari'","id":"Yang Maha Melepaskan"},
    {"ar":"الْمُصَوِّرُ","la":"Al Mushawwir","id":"Yang Maha Membentuk Rupa"},
    {"ar":"الْغَفَّارُ","la":"Al Ghaffaar","id":"Yang Maha Pengampun"},
    {"ar":"الْقَهَّارُ","la":"Al Qahhaar","id":"Yang Maha Menundukkan"},
    {"ar":"الْوَهَّابُ","la":"Al Wahhaab","id":"Yang Maha Pemberi Karunia"},
    {"ar":"الرَّزَّاقُ","la":"Ar Razzaaq","id":"Yang Maha Pemberi Rezeki"},
    {"ar":"الْفَتَّاحُ","la":"Al Fattaah","id":"Yang Maha Pembuka Rahmat"},
    {"ar":"الْعَلِيمُ","la":"Al 'Aliim","id":"Yang Maha Mengetahui"},
    {"ar":"الْقَابِضُ","la":"Al Qaabidh","id":"Yang Maha Menyempitkan"},
    {"ar":"الْبَاسِطُ","la":"Al Baasith","id":"Yang Maha Melapangkan"},
    {"ar":"الْخَافِضُ","la":"Al Khaafidh","id":"Yang Maha Merendahkan"},
    {"ar":"الرَّافِعُ","la":"Ar Raafi'","id":"Yang Maha Meninggikan"},
    {"ar":"الْمُعِزُّ","la":"Al Mu'izz","id":"Yang Maha Memuliakan"},
    {"ar":"المُذِلُّ","la":"Al Mudzil","id":"Yang Maha Menghinakan"},
    {"ar":"السَّمِيعُ","la":"As Samii'","id":"Yang Maha Mendengar"},
    {"ar":"الْبَصِيرُ","la":"Al Bashiir","id":"Yang Maha Melihat"},
    {"ar":"الْحَكَمُ","la":"Al Hakam","id":"Yang Maha Menetapkan"},
    {"ar":"الْعَدْلُ","la":"Al 'Adl","id":"Yang Maha Adil"},
    {"ar":"اللَّطِيفُ","la":"Al Lathiif","id":"Yang Maha Lembut"},
    {"ar":"الْخَبِيرُ","la":"Al Khabiir","id":"Yang Maha Mengenal"},
    {"ar":"الْحَلِيمُ","la":"Al Haliim","id":"Yang Maha Penyantun"},
    {"ar":"الْعَظِيمُ","la":"Al 'Azhiim","id":"Yang Maha Agung"},
    {"ar":"الْغَفُورُ","la":"Al Ghafuur","id":"Yang Maha Memberi Pengampunan"},
    {"ar":"الشَّكُورُ","la":"As Syakuur","id":"Yang Maha Pembalas Budi"},
    {"ar":"الْعَلِيُّ","la":"Al 'Aliy","id":"Yang Maha Tinggi"},
    {"ar":"الْكَبِيرُ","la":"Al Kabiir","id":"Yang Maha Besar"},
    {"ar":"الْحَفِيظُ","la":"Al Hafizh","id":"Yang Maha Memelihara"},
    {"ar":"الْمُقِيتُ","la":"Al Muqiit","id":"Yang Maha Pemberi Kecukupan"},
    {"ar":"الْحَسِيبُ","la":"Al Hasiib","id":"Yang Maha Membuat Perhitungan"},
    {"ar":"الْجَلِيلُ","la":"Al Jaliil","id":"Yang Maha Luhur"},
    {"ar":"الْكَرِيمُ","la":"Al Kariim","id":"Yang Maha Pemurah"},
    {"ar":"الرَّقِيبُ","la":"Ar Raqiib","id":"Yang Maha Mengawasi"},
    {"ar":"الْمُجِيبُ","la":"Al Mujiib","id":"Yang Maha Mengabulkan"},
    {"ar":"الْوَاسِعُ","la":"Al Waasi'","id":"Yang Maha Luas"},
    {"ar":"الْحَكِيمُ","la":"Al Hakiim","id":"Yang Maha Bijaksana"},
    {"ar":"الْوَدُودُ","la":"Al Waduud","id":"Yang Maha Mengasihi"},
    {"ar":"الْمَجِيدُ","la":"Al Majiid","id":"Yang Maha Mulia"},
    {"ar":"الْبَاعِثُ","la":"Al Baa'its","id":"Yang Maha Membangkitkan"},
    {"ar":"الشَّهِيدُ","la":"As Syahiid","id":"Yang Maha Menyaksikan"},
    {"ar":"الْحَقُّ","la":"Al Haqq","id":"Yang Maha Benar"},
    {"ar":"الْوَكِيلُ","la":"Al Wakiil","id":"Yang Maha Memelihara"},
    {"ar":"الْقَوِيُّ","la":"Al Qawiyyu","id":"Yang Maha Kuat"},
    {"ar":"الْمَتِينُ","la":"Al Matiin","id":"Yang Maha Kokoh"},
    {"ar":"الْوَلِيُّ","la":"Al Waliyy","id":"Yang Maha Melindungi"},
    {"ar":"الْحَمِيدُ","la":"Al Hamiid","id":"Yang Maha Terpuji"},
    {"ar":"الْمُحْصِي","la":"Al Muhshii","id":"Yang Maha Menghitung"},
    {"ar":"الْمُبْدِئُ","la":"Al Mubdi'","id":"Yang Maha Memulai"},
    {"ar":"الْمُعِيدُ","la":"Al Mu'iid","id":"Yang Maha Mengembalikan Kehidupan"},
    {"ar":"الْمُحْيِي","la":"Al Muhyii","id":"Yang Maha Menghidupkan"},
    {"ar":"اَلْمُمِيتُ","la":"Al Mumiitu","id":"Yang Maha Mematikan"},
    {"ar":"الْحَيُّ","la":"Al Hayyu","id":"Yang Maha Hidup"},
    {"ar":"الْقَيُّومُ","la":"Al Qayyuum","id":"Yang Maha Mandiri"},
    {"ar":"الْوَاجِدُ","la":"Al Waajid","id":"Yang Maha Penemu"},
    {"ar":"الْمَاجِدُ","la":"Al Maajid","id":"Yang Maha Mulia"},
    {"ar":"الْوَاحِدُ","la":"Al Waahid","id":"Yang Maha Tunggal"},
    {"ar":"اَلاَحَدُ","la":"Al Ahad","id":"Yang Maha Esa"},
    {"ar":"الصَّمَدُ","la":"As Shamad","id":"Yang Maha Dibutuhkan"},
    {"ar":"الْقَادِرُ","la":"Al Qaadir","id":"Yang Maha Menentukan"},
    {"ar":"الْمُقْتَدِرُ","la":"Al Muqtadir","id":"Yang Maha Berkuasa"},
    {"ar":"الْمُقَدِّمُ","la":"Al Muqaddim","id":"Yang Maha Mendahulukan"},
    {"ar":"الْمُؤَخِّرُ","la":"Al Mu'akkhir","id":"Yang Maha Mengakhirkan"},
    {"ar":"الأوَّلُ","la":"Al Awwal","id":"Yang Maha Awal"},
    {"ar":"الآخِرُ","la":"Al Aakhir","id":"Yang Maha Akhir"},
    {"ar":"الظَّاهِرُ","la":"Az Zhaahir","id":"Yang Maha Nyata"},
    {"ar":"الْبَاطِنُ","la":"Al Baathin","id":"Yang Maha Ghaib"},
    {"ar":"الْوَالِي","la":"Al Waali","id":"Yang Maha Memerintah"},
    {"ar":"الْمُتَعَالِي","la":"Al Muta'aalii","id":"Yang Maha Tinggi"},
    {"ar":"الْبَرُّ","la":"Al Barru","id":"Yang Maha Penderma"},
    {"ar":"التَّوَّابُ","la":"At Tawwaab","id":"Yang Maha Penerima Taubat"},
    {"ar":"الْمُنْتَقِمُ","la":"Al Muntaqim","id":"Yang Maha Penyiksa"},
    {"ar":"العَفُوُّ","la":"Al Afuww","id":"Yang Maha Pemaaf"},
    {"ar":"الرَّؤُوفُ","la":"Ar Ra'uuf","id":"Yang Maha Pengasih"},
    {"ar":"مَالِكُ الْمُلْكِ","la":"Malikul Mulk","id":"Penguasa Kerajaan Semesta"},
    {"ar":"ذُوالْجَلاَلِ وَالإكْرَامِ","la":"Dzul Jalaali WalIkraam","id":"Pemilik Kebesaran dan Kemuliaan"},
    {"ar":"الْمُقْسِطُ","la":"Al Muqsith","id":"Yang Maha Adil"},
    {"ar":"الْجَامِعُ","la":"Al Jaami'","id":"Yang Maha Mengumpulkan"},
    {"ar":"الْغَنِيُّ","la":"Al Ghaniyy","id":"Yang Maha Berkecukupan"},
    {"ar":"الْمُغْنِي","la":"Al Mughnii","id":"Yang Maha Memberi Kekayaan"},
    {"ar":"الْمَانِعُ","la":"Al Maani'","id":"Yang Maha Mencegah"},
    {"ar":"الضَّارُ","la":"Ad Dhaar","id":"Yang Maha Memberi Derita"},
    {"ar":"النَّافِعُ","la":"An Naafi'","id":"Yang Maha Memberi Manfaat"},
    {"ar":"النُّورُ","la":"An Nuur","id":"Yang Maha Bercahaya"},
    {"ar":"الْهَادِي","la":"Al Haadii","id":"Yang Maha Pemberi Petunjuk"},
    {"ar":"الْبَدِيعُ","la":"Al Badii'","id":"Yang Maha Pencipta Tiada Bandingannya"},
    {"ar":"اَلْبَاقِي","la":"Al Baaqii","id":"Yang Maha Kekal"},
    {"ar":"الْوَارِثُ","la":"Al Waarits","id":"Yang Maha Pewaris"},
    {"ar":"الرَّشِيدُ","la":"Ar Rashiid","id":"Yang Maha Pandai"},
    {"ar":"الصَّبُورُ","la":"As Shabuur","id":"Yang Maha Sabar"}
];

function loadAsmaulHusna() {
    const container = document.getElementById('asmaul-container');
    if (container.innerHTML.trim() !== "") return; 
    let html = '';
    asmaulHusnaData.forEach(item => { 
        html += `<div class="asmaul-card">
                    <div class="asmaul-arab">${item.ar}</div>
                    <div class="asmaul-latin">${item.la}</div>
                    <div class="asmaul-arti">${item.id}</div>
                 </div>`; 
    });
    container.innerHTML = html;
}
function loadAsmaulHusna() {
    const container = document.getElementById('asmaul-container');
    if (container.innerHTML.trim() !== "") return; 
    let html = '';
    asmaulHusnaData.forEach(item => { html += `<div class="asmaul-card"><div class="asmaul-arab">${item.ar}</div><div class="asmaul-latin">${item.la}</div><div class="asmaul-arti">${item.id}</div></div>`; });
    container.innerHTML = html;
}

// Inisialisasi awal
window.onload = () => { fetchJadwalByCity(); fetchQuran(); };