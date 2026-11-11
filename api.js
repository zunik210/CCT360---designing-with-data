
// Open-Meteo Air Quality API Integration
// City background images
const cityImages = {
    "toronto": "images/toronto.jpg",
    "los-angeles": "images/los-angeles.jpg",
    "new-delhi": "images/new-delhi.jpg"
};

function changeCityImage(cityKey) {
    cityView.style.backgroundImage =
        `url("${cityImages[cityKey]}")`;
}

// Store the coordinates of each city
const cities = {
    "toronto": {
        name: "Toronto",
        latitude: 43.6532,
        longitude: -79.3832
    },
    "los-angeles": {
        name: "Los Angeles",
        latitude: 34.0522,
        longitude: -118.2437
    },
    "new-delhi": {
        name: "New Delhi",
        latitude: 28.6139,
        longitude: 77.2090
    }
};

// Get HTML elements
const citySelect = document.getElementById("city");
const aqiValue = document.getElementById("aqi-value");
const pm25Value = document.getElementById("pm25-value");
const aqiCategory = document.getElementById("aqi-category");
const airMessage = document.getElementById("air-quality-message");
const dataTime = document.getElementById("data-time");

const haze = document.getElementById("haze");
const cityView = document.getElementById("city-view");

// Show loading message
function showLoading() {
    aqiValue.textContent = "Loading...";
    pm25Value.textContent = "--";
    aqiCategory.textContent = "Loading...";
    airMessage.textContent =
        "Checking the latest available air quality data.";

    document.getElementById("loading-message").hidden = false;
    document.getElementById("error-message").hidden = true;

    document.body.dataset.aqiLevel = "unknown";
}

// Show error message
function showError() {
    aqiValue.textContent = "--";
    pm25Value.textContent = "--";
    aqiCategory.textContent = "Unavailable";

    airMessage.textContent =
        "Air quality data is currently unavailable. Please try again.";

    dataTime.textContent = "";

    document.getElementById("loading-message").hidden = true;
    document.getElementById("error-message").hidden = false;

    document.body.dataset.aqiLevel = "unknown";

    haze.classList.remove(
        "low", "moderate", "high", "very-high", "wiped"
    );
}

// Determine the air quality category
function getAirQuality(aqi) {
    if (aqi <= 50) {
        return {
            category: "Good",
            message: "The air is relatively clean. The view outside is clear.",
            hazeClass: "low",
            level: "good"
        };
    } else if (aqi <= 100) {
        return {
            category: "Moderate",
            message: "The air quality is moderate. A slight haze begins to appear.",
            hazeClass: "moderate",
            level: "moderate"
        };
    } else if (aqi <= 150) {
        return {
            category: "Unhealthy for Sensitive Groups",
            message: "The air carries pollutants that may affect sensitive groups.",
            hazeClass: "high",
            level: "sensitive"
        };
    } else if (aqi <= 200) {
        return {
            category: "Unhealthy",
            message: "The air is unhealthy. The city outside begins to disappear.",
            hazeClass: "very-high",
            level: "unhealthy"
        };
    } else if (aqi <= 300) {
        return {
            category: "Very Unhealthy",
            message: "Pollution levels are very high. The view is becoming difficult to see.",
            hazeClass: "very-high",
            level: "very-unhealthy"
        };
    } else {
        return {
            category: "Hazardous",
            message: "The air quality is hazardous. The world outside is hidden behind pollution.",
            hazeClass: "very-high",
            level: "hazardous"
        };
    }
}

// Change the window appearance
function updateWindow(airQuality) {
    haze.classList.remove(
        "low", "moderate", "high", "very-high", "wiped"
    );

    haze.classList.add(airQuality.hazeClass);

    document.body.dataset.aqiLevel = airQuality.level;
}

// Display AQI information
function displayAirQuality(aqi, pm25, cityName, time, timezone) {
    const airQuality = getAirQuality(aqi);

    aqiValue.textContent = aqi;
    pm25Value.textContent =
        typeof pm25 === "number" ? pm25.toFixed(1) : "--";

    aqiCategory.textContent = airQuality.category;

    airMessage.textContent =
        cityName + ": " + airQuality.message;

    updateWindow(airQuality);

    dataTime.textContent =
        "Model estimate time: " + time.replace("T", " ") +
        " (" + timezone + ")";
}

// Fetch data from Open-Meteo
let latestRequest = 0;

async function updateAirQuality(cityKey) {
    const city = cities[cityKey];

    if (!city) {
        showError();
        return;
    }

    const requestID = ++latestRequest;

    if (window.resetWipe) {
    window.resetWipe();
    }

    changeCityImage(cityKey);

    showLoading();
   

    try {
        const url =
            "https://air-quality-api.open-meteo.com/v1/air-quality" +
            `?latitude=${city.latitude}` +
            `&longitude=${city.longitude}` +
            "&current=us_aqi,pm2_5" +
            "&timezone=auto";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Could not retrieve air quality data.");
        }

        const data = await response.json();

        if (requestID !== latestRequest) {
            return;
        }

        if (
            !data.current ||
            typeof data.current.us_aqi !== "number"
        ) {
            throw new Error("AQI data is missing.");
        }

        const aqi = Math.round(data.current.us_aqi);
        const pm25 = data.current.pm2_5;
        const time = data.current.time;

        displayAirQuality(
            aqi,
            pm25,
            city.name,
            time,
            data.timezone
        );

        console.log(city.name + " AQI:", aqi);

    } catch (error) {
        if (requestID !== latestRequest) {
            return;
        }

        console.error("Air Quality API Error:", error);
        showError();

    } finally {
        if (requestID === latestRequest) {
            document.getElementById("loading-message").hidden = true;
        }
    }
}

// Update data when the user selects a city
citySelect.addEventListener("change", function() {
    updateAirQuality(citySelect.value);
});

// Load the initially selected city
updateAirQuality(citySelect.value);

// Make the function available to other JavaScript files
window.updateAirQuality = updateAirQuality;