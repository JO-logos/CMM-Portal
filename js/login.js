(function () {
  "use strict";

  const BACKGROUND_STORAGE_KEY = "cmm-login-background";
  const WEATHER_STORAGE_KEY = "cmm-local-weather";
  const WEATHER_CACHE_MINUTES = 10;

  function readSessionValue(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function writeSessionValue(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (_error) {
      // The page remains usable when browser storage is unavailable.
    }
  }

  function initializeBackground() {
    const background = document.querySelector("[data-cmm-login-background]");
    const choices = Array.isArray(window.CMM_LOGIN_BACKGROUNDS)
      ? window.CMM_LOGIN_BACKGROUNDS
      : [];

    if (!background || !choices.length) return;

    let selected = readSessionValue(BACKGROUND_STORAGE_KEY);
    if (!choices.includes(selected)) {
      selected = choices[Math.floor(Math.random() * choices.length)];
      writeSessionValue(BACKGROUND_STORAGE_KEY, selected);
    }

    background.classList.add(selected);
  }

  function initializeClock() {
    const timeElement = document.querySelector("[data-cmm-device-time]");
    const weekdayElement = document.querySelector("[data-cmm-device-weekday]");
    const dateElement = document.querySelector("[data-cmm-device-date]");
    if (!timeElement || !weekdayElement || !dateElement) return;

    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    function updateClock() {
      const now = new Date();
      timeElement.dateTime = now.toISOString();
      timeElement.textContent = timeFormatter.format(now);
      weekdayElement.textContent = weekdayFormatter.format(now);
      dateElement.textContent = `, ${dateFormatter.format(now)}`;
    }

    updateClock();
    window.setInterval(updateClock, 1000);
  }

  function initializePasswordControls() {
    const controls = document.querySelectorAll("[data-cmm-password-control]");
    const capsLockNote = document.querySelector("[data-cmm-caps-lock]");
    if (!controls.length) return;

    function updateCapsLock(event) {
      const capsLockOn = event.getModifierState?.("CapsLock") ?? false;
      if (capsLockNote) capsLockNote.hidden = !capsLockOn;
    }

    controls.forEach((control) => {
      const password = control.querySelector("input");
      const toggle = control.querySelector("[data-cmm-password-toggle]");
      if (!password || !toggle) return;

      toggle.addEventListener("click", () => {
        const willShow = password.type === "password";
        password.type = willShow ? "text" : "password";
        toggle.textContent = willShow ? "Hide" : "Show";
        toggle.setAttribute("aria-pressed", String(willShow));
        password.focus();
      });

      password.addEventListener("keydown", updateCapsLock);
      password.addEventListener("keyup", updateCapsLock);
      password.addEventListener("blur", () => {
        if (capsLockNote) capsLockNote.hidden = true;
      });
    });
  }

  function initializeLoginForm() {
    const form = document.querySelector("[data-cmm-login-form]");
    const submit = document.querySelector("[data-cmm-login-submit]");
    const status = document.querySelector("[data-cmm-login-status]");
    if (!form || !submit || !status) return;

    function showStatus(message, state) {
      status.textContent = message;
      status.dataset.cmmLoginState = state;
      status.hidden = false;
    }

    form.addEventListener("invalid", () => {
      showStatus("Enter a valid email address and password.", "error");
    }, true);

    form.addEventListener("input", () => {
      status.hidden = true;
      delete status.dataset.cmmLoginState;
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) return;

      submit.disabled = true;
      submit.textContent = "Logging in…";
      showStatus("Checking your account…", "loading");

      window.setTimeout(() => {
        submit.disabled = false;
        submit.textContent = "Log In";
        showStatus("Login is not connected in this design prototype.", "warning");
      }, 700);
    });
  }

  function initializeMemberVerificationForm() {
    const form = document.querySelector("[data-cmm-member-verification-form]");
    const submit = form?.querySelector("[data-cmm-member-verification-submit]");
    const status = form?.querySelector("[data-cmm-member-verification-status]");
    if (!form || !submit || !status) return;

    function showStatus(message, state) {
      status.textContent = message;
      status.dataset.cmmMemberVerificationState = state;
      status.setAttribute("role", state === "error" ? "alert" : "status");
      status.hidden = false;
    }

    form.addEventListener("invalid", () => {
      showStatus("Please enter your Email address, or First Name, Last Name, Date of Birth, and ZIP Code.", "error");
    }, true);

    form.addEventListener("input", () => {
      status.hidden = true;
      delete status.dataset.cmmMemberVerificationState;
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) return;

      submit.disabled = true;
      submit.textContent = "Checking membership…";
      showStatus("Checking for an existing member record…", "loading");

      window.setTimeout(() => {
        submit.disabled = false;
        submit.textContent = "Check Membership Status";
        showStatus("Membership verification is not connected in this design prototype.", "warning");
      }, 700);
    });
  }

  function initializeQualificationForm() {
    const form = document.querySelector("[data-cmm-qualification-form]");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      window.location.assign(form.action);
    });
  }

  function initializeAccountForm() {
    const form = document.querySelector("[data-cmm-account-form]");
    const password = form?.querySelector("[name='password']");
    const confirmation = form?.querySelector("[name='password_confirmation']");
    const submit = form?.querySelector("[data-cmm-account-submit]");
    const status = form?.querySelector("[data-cmm-account-status]");
    if (!form || !password || !confirmation || !submit || !status) return;

    function showStatus(message, state) {
      status.textContent = message;
      status.dataset.cmmAccountState = state;
      status.setAttribute("role", state === "error" ? "alert" : "status");
      status.hidden = false;
    }

    function updatePasswordMatch() {
      const passwordsMatch = !confirmation.value || password.value === confirmation.value;
      confirmation.setCustomValidity(passwordsMatch ? "" : "Passwords do not match.");
    }

    form.addEventListener("invalid", () => {
      showStatus(
        confirmation.validity.customError
          ? "The passwords do not match. Please enter the same password twice."
          : "Complete every field with valid account information.",
        "error",
      );
    }, true);

    form.addEventListener("input", () => {
      updatePasswordMatch();
      status.hidden = true;
      delete status.dataset.cmmAccountState;
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      updatePasswordMatch();
      if (!form.checkValidity()) return;

      submit.disabled = true;
      submit.textContent = "Creating account…";
      window.setTimeout(() => {
        submit.disabled = false;
        submit.textContent = "Create Account";
        showStatus("Account creation is not connected in this design prototype.", "warning");
      }, 700);
    });
  }

  function weatherPresentation(code, isDay) {
    if (code === 0) return [isDay ? "clear-day" : "clear-night", "Clear"];
    if (code === 1 || code === 2) return [isDay ? "partly-cloudy-day" : "partly-cloudy-night", "Partly cloudy"];
    if (code === 3) return ["overcast", "Overcast"];
    if (code === 45 || code === 48) return ["fog", "Fog"];
    if ([51, 53, 55, 56, 57].includes(code)) return ["drizzle", code >= 56 ? "Freezing drizzle" : "Drizzle"];
    if ([61, 63, 80, 81].includes(code)) return ["rain", "Rain"];
    if (code === 65 || code === 82) return ["heavy-rain", "Heavy rain"];
    if (code === 66 || code === 67) return ["hail", "Freezing rain"];
    if ([71, 73, 77, 85].includes(code)) return ["snow", "Snow"];
    if (code === 75 || code === 86) return ["heavy-snow", "Heavy snow"];
    if (code === 96 || code === 99) return ["hail", "Thunderstorm with hail"];
    if (code === 95) return ["thunderstorm", "Thunderstorm"];
    return ["cloudy", "Current weather"];
  }

  function locationLabel(location) {
    const city = location.city || location.locality || "Current location";
    const countryCode = String(location.countryCode || "").toUpperCase();

    if (countryCode === "US") {
      const subdivisionCode = String(location.principalSubdivisionCode || "");
      const state = subdivisionCode.includes("-")
        ? subdivisionCode.split("-").at(-1)
        : location.principalSubdivision;
      return state ? `${city}, ${state}` : city;
    }

    return location.countryName ? `${city}, ${location.countryName}` : city;
  }

  function updateWeatherDisplay(weather) {
    const temperature = document.querySelector("[data-cmm-weather-temperature]");
    const location = document.querySelector("[data-cmm-weather-location]");
    const icon = document.querySelector("[data-cmm-weather-icon]");
    if (!temperature || !location || !icon) return;

    const [iconName, condition] = weatherPresentation(weather.code, weather.isDay);
    const unitName = weather.unit === "F" ? "Fahrenheit" : "Celsius";
    temperature.textContent = `${Math.round(weather.temperature)}°${weather.unit}`;
    temperature.setAttribute("aria-label", `${Math.round(weather.temperature)} degrees ${unitName}, ${condition}`);
    location.textContent = weather.location;
    icon.setAttribute("href", `../assets/icons/cmm-weather-icons.svg#cmm-weather-${iconName}`);
  }

  function showWeatherUnavailable(message) {
    const temperature = document.querySelector("[data-cmm-weather-temperature]");
    const location = document.querySelector("[data-cmm-weather-location]");
    if (temperature) {
      temperature.textContent = "--°";
      temperature.setAttribute("aria-label", "Local temperature unavailable");
    }
    if (location) location.textContent = message;
  }

  function readCachedWeather() {
    const cached = readSessionValue(WEATHER_STORAGE_KEY);
    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached);
      const maxAge = WEATHER_CACHE_MINUTES * 60 * 1000;
      return Date.now() - parsed.cachedAt <= maxAge ? parsed : null;
    } catch (_error) {
      return null;
    }
  }

  async function fetchLocalWeather(latitude, longitude) {
    const coordinates = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
    });
    const reverseGeocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?${coordinates}&localityLanguage=en`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?${coordinates}&current=temperature_2m,weather_code,is_day`;

    const [locationResponse, weatherResponse] = await Promise.all([
      window.fetch(reverseGeocodeUrl),
      window.fetch(weatherUrl),
    ]);

    if (!locationResponse.ok || !weatherResponse.ok) {
      throw new Error("Local weather services did not respond.");
    }

    const [locationData, weatherData] = await Promise.all([
      locationResponse.json(),
      weatherResponse.json(),
    ]);
    if (!weatherData.current) throw new Error("Current weather is unavailable.");

    const countryCode = String(locationData.countryCode || "").toUpperCase();
    const useFahrenheit = countryCode
      ? countryCode === "US"
      : navigator.language.toLowerCase().startsWith("en-us");
    const temperatureCelsius = Number(weatherData.current.temperature_2m);
    const weather = {
      cachedAt: Date.now(),
      location: locationLabel(locationData),
      temperature: useFahrenheit ? (temperatureCelsius * 9) / 5 + 32 : temperatureCelsius,
      unit: useFahrenheit ? "F" : "C",
      code: Number(weatherData.current.weather_code),
      isDay: Number(weatherData.current.is_day) === 1,
    };

    writeSessionValue(WEATHER_STORAGE_KEY, JSON.stringify(weather));
    updateWeatherDisplay(weather);
  }

  function initializeWeather() {
    const weatherRegion = document.querySelector("[data-cmm-weather]");
    if (!weatherRegion) return;

    const cached = readCachedWeather();
    if (cached) {
      updateWeatherDisplay(cached);
      return;
    }

    if (!navigator.geolocation) {
      showWeatherUnavailable("Local weather unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchLocalWeather(position.coords.latitude, position.coords.longitude)
          .catch(() => showWeatherUnavailable("Local weather unavailable"));
      },
      () => showWeatherUnavailable("Location permission required"),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 10 * 60 * 1000,
      },
    );
  }

  function initializeLoginPage() {
    initializeBackground();
    initializeClock();
    initializePasswordControls();
    initializeLoginForm();
    initializeMemberVerificationForm();
    initializeQualificationForm();
    initializeAccountForm();

    initializeWeather();
  }

  document.addEventListener("DOMContentLoaded", initializeLoginPage);
})();
