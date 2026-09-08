/* ==================================================
   MUĞLA HABER MERKEZİ
   CANLI VERİ
================================================== */

const MUGLA = {
    latitude: 37.2153,
    longitude: 28.3636
};

let pharmaciesLoaded = false;


/* ==================================================
   YARDIMCI
================================================== */

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/* ==================================================
   HAVA DURUMU
================================================== */

async function getWeather() {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${MUGLA.latitude}` +
        `&longitude=${MUGLA.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&temperature_unit=celsius` +
        `&wind_speed_unit=kmh` +
        `&timezone=Europe%2FIstanbul`;

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Hava verisi alınamadı");
        }

        const data = await response.json();
        const current = data.current;

        if (!current) {
            throw new Error("Güncel hava verisi bulunamadı");
        }

        const temperature =
            Math.round(current.temperature_2m);

        const humidity =
            Math.round(current.relative_humidity_2m);

        const wind =
            Math.round(current.wind_speed_10m);

        const description =
            getWeatherDescription(
                current.weather_code
            );

        setText(
            "header-temperature",
            `${temperature}°`
        );

        setText(
            "mugla-temperature",
            `${temperature}°`
        );

        setText(
            "header-humidity",
            `${humidity}%`
        );

        setText(
            "mugla-humidity",
            `${humidity}%`
        );

        setText(
            "header-wind",
            `${wind} km/s`
        );

        setText(
            "mugla-wind",
            `${wind} km/s`
        );

        setText(
            "header-weather-text",
            description
        );

        setText(
            "weather-description",
            description
        );

        updateWeatherIcon(
            current.weather_code
        );

    }

    catch (error) {

        console.error(
            "Hava durumu hatası:",
            error
        );

        setText(
            "header-weather-text",
            "Veri alınamadı"
        );

        setText(
            "weather-description",
            "Veri alınamadı"
        );

    }

}


/* ==================================================
   HAVA AÇIKLAMALARI
================================================== */

function getWeatherDescription(code) {

    const codes = {

        0: "Açık",

        1: "Çoğunlukla açık",

        2: "Parçalı bulutlu",

        3: "Kapalı",

        45: "Sisli",

        48: "Yoğun sis",

        51: "Hafif çisenti",

        53: "Çisenti",

        55: "Yoğun çisenti",

        61: "Hafif yağmur",

        63: "Yağmurlu",

        65: "Kuvvetli yağmur",

        71: "Hafif kar",

        73: "Kar yağışlı",

        75: "Yoğun kar",

        80: "Hafif sağanak",

        81: "Sağanak yağışlı",

        82: "Kuvvetli sağanak",

        95: "Gök gürültülü",

        96: "Fırtınalı",

        99: "Kuvvetli fırtına"

    };

    return codes[code] || "Hava durumu";
}


/* ==================================================
   HAVA İKONU
================================================== */

function updateWeatherIcon(code) {

    const icon =
        document.getElementById(
            "header-weather-icon"
        );

    if (!icon) {
        return;
    }

    let iconClass =
        "fa-solid fa-cloud-sun";

    if (code === 0) {

        iconClass =
            "fa-solid fa-sun";

    }

    else if (
        code === 1 ||
        code === 2
    ) {

        iconClass =
            "fa-solid fa-cloud-sun";

    }

    else if (code === 3) {

        iconClass =
            "fa-solid fa-cloud";

    }

    else if (
        code === 45 ||
        code === 48
    ) {

        iconClass =
            "fa-solid fa-smog";

    }

    else if (
        code >= 51 &&
        code <= 65
    ) {

        iconClass =
            "fa-solid fa-cloud-rain";

    }

    else if (
        code >= 71 &&
        code <= 75
    ) {

        iconClass =
            "fa-solid fa-snowflake";

    }

    else if (
        code >= 80 &&
        code <= 82
    ) {

        iconClass =
            "fa-solid fa-cloud-showers-heavy";

    }

    else if (code >= 95) {

        iconClass =
            "fa-solid fa-cloud-bolt";

    }

    icon.className = iconClass;
}


/* ==================================================
   DOLAR / TL
================================================== */

async function getDollarRate() {

    const url =
        "https://api.frankfurter.dev/v2/rate/USD/TRY?providers=TCMB";

    try {

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Kur verisi alınamadı"
            );
        }

        const data =
            await response.json();

        if (
            data.rate === undefined ||
            data.rate === null
        ) {

            throw new Error(
                "Kur değeri bulunamadı"
            );
        }

        const rate =
            Number(data.rate);

        const formatted =
            rate.toLocaleString(
                "tr-TR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4
                }
            );

        setText(
            "usd-try",
            `${formatted} ₺`
        );

    }

    catch (error) {

        console.error(
            "Döviz hatası:",
            error
        );

        setText(
            "usd-try",
            "Veri alınamadı"
        );

    }

}


/* ==================================================
   NÖBETÇİ ECZANELER
================================================== */

async function getDutyPharmacies() {

    const list =
        document.getElementById(
            "pharmacy-list"
        );

    if (!list) {
        return;
    }

    list.innerHTML = `
        <div class="loading-card">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Nöbetçi eczaneler yükleniyor...
        </div>
    `;

    const url =
        "https://eczaneadresi.com/api/public/v1/duty-pharmacies?city=mugla&limit=200";

    try {

        const response =
            await fetch(
                url,
                {
                    headers: {
                        Accept: "application/json"
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                `Eczane API HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        const pharmacies =
            Array.isArray(
                data.pharmacies
            )
                ? data.pharmacies
                : [];

        pharmaciesLoaded =
            true;

        setText(
            "pharmacy-count",
            pharmacies.length
                ? `${pharmacies.length} →`
                : "0"
        );

        setText(
            "pharmacy-subtitle",
            pharmacies.length
                ? "Bugün Muğla genelinde"
                : "Bugün kayıt bulunamadı"
        );

        setText(
            "pharmacy-panel-description",
            pharmacies.length
                ? `Bugün Muğla genelinde ${pharmacies.length} nöbetçi eczane listeleniyor.`
                : "Bugün için eczane kaydı bulunamadı."
        );

        if (!pharmacies.length) {

            list.innerHTML = `
                <div class="loading-card">
                    Bugün için nöbetçi eczane kaydı bulunamadı.
                </div>
            `;

            return;
        }

        list.innerHTML = "";

        pharmacies.forEach(
            pharmacy => {

                list.appendChild(
                    createPharmacyCard(
                        pharmacy
                    )
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Nöbetçi eczane hatası:",
            error
        );

        pharmaciesLoaded =
            false;

        setText(
            "pharmacy-count",
            "!"
        );

        setText(
            "pharmacy-subtitle",
            "Veri alınamadı"
        );

        setText(
            "pharmacy-panel-description",
            "Nöbetçi eczane verisine şu anda ulaşılamıyor."
        );

        list.innerHTML = `
            <div class="loading-card">
                Nöbetçi eczane verisi alınamadı.
                Daha sonra tekrar deneyin.
            </div>
        `;

    }

}


/* ==================================================
   ECZANE KARTI
================================================== */

function createPharmacyCard(pharmacy) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "pharmacy-card";

    const top =
        document.createElement(
            "div"
        );

    top.className =
        "pharmacy-card-top";

    const icon =
        document.createElement(
            "div"
        );

    icon.className =
        "pharmacy-card-icon";

    icon.innerHTML =
        '<i class="fa-solid fa-prescription-bottle-medical"></i>';

    const info =
        document.createElement(
            "div"
        );

    const name =
        document.createElement(
            "h3"
        );

    name.textContent =
        pharmacy.name ||
        "Nöbetçi Eczane";

    const district =
        document.createElement(
            "span"
        );

    district.className =
        "pharmacy-district";

    district.textContent =
        pharmacy.district_name ||
        pharmacy.district ||
        pharmacy.ilce ||
        "Muğla";

    info.appendChild(name);
    info.appendChild(district);

    top.appendChild(icon);
    top.appendChild(info);

    card.appendChild(top);

    const address =
        document.createElement(
            "p"
        );

    address.className =
        "pharmacy-address";

    address.textContent =
        pharmacy.address ||
        "Adres bilgisi bulunamadı";

    card.appendChild(address);

    if (pharmacy.phone) {

        const phone =
            document.createElement(
                "a"
            );

        phone.className =
            "pharmacy-phone";

        phone.href =
            `tel:${cleanPhone(pharmacy.phone)}`;

        phone.innerHTML =
            '<i class="fa-solid fa-phone"></i>';

        const number =
            document.createElement(
                "span"
            );

        number.textContent =
            pharmacy.phone;

        phone.appendChild(number);
        card.appendChild(phone);
    }

    return card;
}


/* ==================================================
   TELEFON NUMARASI TEMİZLEME
================================================== */

function cleanPhone(value) {

    return String(value)
        .replace(/[^\d+]/g, "");

}


/* ==================================================
   ECZANE PANELİ
================================================== */

function setupPharmacyPanel() {

    const toggle =
        document.getElementById(
            "pharmacy-toggle"
        );

    const panel =
        document.getElementById(
            "pharmacy-panel"
        );

    const close =
        document.getElementById(
            "pharmacy-close"
        );

    if (
        !toggle ||
        !panel
    ) {
        return;
    }

    toggle.addEventListener(
        "click",
        async () => {

            const willOpen =
                panel.hidden;

            panel.hidden =
                !willOpen;

            toggle.classList.toggle(
                "open",
                willOpen
            );

            toggle.setAttribute(
                "aria-expanded",
                String(willOpen)
            );

            if (willOpen) {

                if (!pharmaciesLoaded) {
                    await getDutyPharmacies();
                }

                panel.scrollIntoView(
                    {
                        behavior: "smooth",
                        block: "nearest"
                    }
                );
            }
        }
    );

    if (close) {

        close.addEventListener(
            "click",
            () => {

                panel.hidden = true;

                toggle.classList.remove(
                    "open"
                );

                toggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        );
    }

}


/* ==================================================
   AFAD TARİH
================================================== */

function formatAFADDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const hour =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minute =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    const second =
        String(
            date.getSeconds()
        ).padStart(2, "0");

    return (
        `${year}-${month}-${day} ` +
        `${hour}:${minute}:${second}`
    );

}


/* ==================================================
   SON DEPREMLER
================================================== */

async function getEarthquakes() {

    const container =
        document.getElementById(
            "earthquake-list"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="quake">

            <strong>
                ...
            </strong>

            <div>

                <b>
                    Deprem verileri yükleniyor
                </b>

                <small>
                    AFAD
                </small>

            </div>

        </div>
    `;

    const endDate =
        new Date();

    const startDate =
        new Date();

    startDate.setDate(
        startDate.getDate() - 30
    );

    const start =
        encodeURIComponent(
            formatAFADDate(
                startDate
            )
        );

    const end =
        encodeURIComponent(
            formatAFADDate(
                endDate
            )
        );

    const url =
        `https://deprem.afad.gov.tr/apiv2/event/filter` +
        `?start=${start}` +
        `&end=${end}` +
        `&lat=${MUGLA.latitude}` +
        `&lon=${MUGLA.longitude}` +
        `&maxrad=3` +
        `&limit=3` +
        `&orderby=time` +
        `&format=json`;

    try {

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `AFAD HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            container.innerHTML = `
                <div class="quake">

                    <strong>
                        —
                    </strong>

                    <div>

                        <b>
                            Kayıt bulunamadı
                        </b>

                        <small>
                            Muğla ve çevresi
                        </small>

                    </div>

                </div>
            `;

            return;
        }

        container.innerHTML = "";

        data
            .slice(0, 3)
            .forEach(
                earthquake => {

                    createEarthquakeItem(
                        container,
                        earthquake
                    );

                }
            );

    }

    catch (error) {

        console.error(
            "AFAD hatası:",
            error
        );

        container.innerHTML = `
            <div class="quake">

                <strong>
                    !
                </strong>

                <div>

                    <b>
                        Deprem verisine ulaşılamadı
                    </b>

                    <small>
                        AFAD bağlantısı tekrar denenecek
                    </small>

                </div>

            </div>
        `;

    }

}


/* ==================================================
   DEPREM KARTI
================================================== */

function createEarthquakeItem(
    container,
    earthquake
) {

    const magnitude =
        earthquake.magnitude ??
        earthquake.mag ??
        "—";

    const location =
        earthquake.location ||
        earthquake.district ||
        earthquake.province ||
        "Muğla ve çevresi";

    const depth =
        earthquake.depth !== undefined &&
        earthquake.depth !== null
            ? `${earthquake.depth} km`
            : "";

    const date =
        formatEarthquakeDisplayDate(
            earthquake.date ||
            earthquake.time
        );

    const item =
        document.createElement(
            "div"
        );

    item.className =
        "quake";

    const magnitudeElement =
        document.createElement(
            "strong"
        );

    magnitudeElement.textContent =
        magnitude;

    const info =
        document.createElement(
            "div"
        );

    const title =
        document.createElement(
            "b"
        );

    title.textContent =
        location;

    const detail =
        document.createElement(
            "small"
        );

    detail.textContent =
        depth
            ? `${date} • ${depth}`
            : date;

    info.appendChild(title);
    info.appendChild(detail);

    item.appendChild(
        magnitudeElement
    );

    item.appendChild(info);

    container.appendChild(item);
}


/* ==================================================
   DEPREM TARİH GÖSTERİMİ
================================================== */

function formatEarthquakeDisplayDate(value) {

    if (!value) {
        return "Tarih bilgisi yok";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleString(
        "tr-TR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* ==================================================
   TÜM CANLI VERİLER
================================================== */

async function loadLiveData() {

    const refreshButton =
        document.getElementById(
            "refresh-all-data"
        );

    if (refreshButton) {

        refreshButton.disabled =
            true;

        refreshButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Güncelleniyor...';
    }

    await Promise.allSettled(
        [
            getWeather(),
            getDollarRate(),
            getEarthquakes(),
            getDutyPharmacies()
        ]
    );

    if (refreshButton) {

        refreshButton.disabled =
            false;

        refreshButton.innerHTML =
            '<i class="fa-solid fa-rotate"></i> Verileri Yenile';
    }
}


/* ==================================================
   BUTONLAR
================================================== */

function setupButtons() {

    const refreshButton =
        document.getElementById(
            "refresh-all-data"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadLiveData
        );
    }

    const earthquakeButton =
        document.getElementById(
            "refresh-earthquakes"
        );

    if (earthquakeButton) {

        earthquakeButton.addEventListener(
            "click",
            getEarthquakes
        );
    }
}


/* ==================================================
   SAYFA YÜKLENDİĞİNDE
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupButtons();

        setupPharmacyPanel();

        loadLiveData();

        setInterval(
            loadLiveData,
            10 * 60 * 1000
        );
    }
);
