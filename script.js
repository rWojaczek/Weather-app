const city = document.querySelector(".city");
const acuTemp = document.querySelector(".acuTemp");
const weatherDescription = document.querySelector(".description");
const dayTemp = document.querySelector(".dayMaxTemp");
const nighTemp = document.querySelector(".nightMaxTemp");
const pmTwo = document.querySelector(".pmTwo");
const pmTen = document.querySelector(".pmTen");
const alergiesDescription = document.querySelector(".alergiesDescription");
const sunRise = document.querySelector(".sunRise");
const sunDown = document.querySelector(".sunDown");
const maxMinTemp = document.querySelector(".maxMinTemp");
const humidityValue = document.querySelector(".humidityValue");
const pressureValue = document.querySelector(".pressureValue");
const windValue = document.querySelector(".windValue");
const dewValue = document.querySelector(".dewValue");
const uvValue = document.querySelector(".uvValue");
const moonDescription = document.querySelector(".phaseDescription");
const monnImg = document.querySelector(".moonImg");
const weatherByDayDiv = document.querySelector(".wheaterByDay");
const weatherByHour = document.querySelector(".wheaterByHour");
const moonValue = document.querySelector(".moonValue");
const visibleValue = document.querySelector(".visibleValue");
const airQualityValue = document.querySelector(".airQualityValue");
const search = document.querySelector(".searchCity");
const searchBtn = document.querySelector(".searchBtn");
const loader = document.querySelector(".loading");

const getPosition = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        loader.classList.add("display");
        const { latitude, longitude } = position.coords;

        fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&lang=pl&type=postcode&apiKey=47a4c424d784475da8487ec4a1ef2485`
        )
          .then((res) => {
            if (!res.ok) throw new Error("Something went wrong, try again");
            return res.json();
          })
          .then((data) => {
            setActualCity(data);

            return fetch(
              `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?&unitGroup=metric&lang=pl&key=JVQP5GT7AUS2RDJXXKF75T9V5&elements=%2Bpm2p5,%2Bpm10,%2Baqieur`
            );
          })
          .then((response) => {
            if (!response.ok)
              throw new Error("Something went wrong, try again");
            return response.json();
          })
          .then((data) => {
            loader.classList.remove("display");
            loadData(data);
          });
      },
      function () {
        alert("could not get your position");
      }
    );
  }
};
getPosition();

const setActualCity = function (data) {
  const date = new Date();
  const fullDate = new Intl.DateTimeFormat("pl").format(date);
  const ActualCity = data.features[0].properties.city;
  const state = data.features[0].properties.state;
  const fullName = `${ActualCity}, ${state}, ${fullDate}`;
  city.innerHTML = fullName;
};

const settodayValues = function (data, today) {
  airQualityValue.innerHTML = `Jakość powietrza: ${
    airQuality(data) || "brak danych"
  }`;
  dayTemp.innerHTML = `Dzień ${data.days[0].tempmax.toFixed(0)} ℃`;
  nighTemp.innerHTML = `Noc ${data.days[0].tempmin.toFixed(0)} ℃`;
  maxMinTemp.innerHTML = `${today.feelslike.toFixed(0)} ℃`;
  acuTemp.innerHTML = `Aktualnie: ${today.temp.toFixed(0)} ℃`;
  weatherDescription.innerHTML = `${today.conditions}   <img src="icon/${today.icon}.png">`;
  sunRise.innerHTML = today.sunrise.slice(0, -3);
  sunDown.innerHTML = today.sunset.slice(0, -3);
  humidityValue.innerHTML = today.humidity.toFixed(0);
  pressureValue.innerHTML = today.pressure;
  windValue.innerHTML = today.windspeed.toFixed(0);
  dewValue.innerHTML = today.dew.toFixed(0);
  uvValue.innerHTML = `${today.uvindex} z 10`;
  visibleValue.innerHTML = today.visibility.toFixed(0);
  pmTwo.innerHTML = `PM2.5: ${data.days[0].pm2p5 || "brak danych"} ppm`;
  pmTen.innerHTML = `PM10: ${data.days[0].pm10 || "brak danych"} ppm`;
};

const loadData = function (data) {
  const offset = data.tzoffset;
  const today = data.currentConditions;
  settodayValues(data, today);
  moonPhase(today);
  renderDayCards(data, today);
  renderHourCards(data, offset);
};

const moonPhase = function (today) {
  if (today.moonphase === 0) moonValue.innerHTML = "Nów";
  if (today.moonphase > 0 && today.moonphase < 0.25)
    moonValue.innerHTML = "Sierp przybywający";
  if (today.moonphase === 0.25) moonValue.innerHTML = "Pierwsza kwadra";
  if (today.moonphase > 0.25 && today.moonphase < 0.5)
    moonValue.innerHTML = "garbaty przybywajacy";
  if (today.moonphase === 0.5) moonValue.innerHTML = "Pełnia";
  if (today.moonphase > 0.5 && today.moonphase < 0.75)
    moonValue.innerHTML = "garbaty ubywający";
  if (today.moonphase === 0.75) moonValue.innerHTML = "Ostatnia kwadra";
  if (today.moonphase > 0.75 && today.moonphase < 1)
    moonValue.innerHTML = "Sierp ubywajacy";
};

const renderDayCards = function (data) {
  const weekdays = [
    "poniedziałek",
    "wtorek",
    "środa",
    "czwartek",
    "piątek",
    "sobota",
    "niedziela",
  ];
  let weekday = new Date().getDay() - 1;
  let day;

  for (let i = 0; i < 4; i++) {
    if (weekday + i > 6) {
      day = weekdays[0];
      weekday = -i;
    } else day = weekdays[weekday + i];

    const html = `
    <div class="dayActuall">
      <ul>
       <li class="first">${i === 0 ? "Dziś" : day}</li>
       <li class="temp">${data.days[i].tempmax.toFixed(0)} ℃</li>
       <li>${data.days[i].tempmin.toFixed(0)} ℃</li>
       <li><img src="icon/${data.days[i].icon}.png"></li>
       <li>${data.days[i].precipprob.toFixed(0)} % </li>
     </ul>
  </div>`;

    weatherByDayDiv.insertAdjacentHTML("beforeend", html);
  }
};

const renderHourCards = function (data) {
  const utcTime = new Date().getHours() - 2;
  const currentCityTime = utcTime + data.tzoffset;
  let timeToDsipaly = currentCityTime + 1;
  let initial = 0;

  for (let i = 0; i < 4; i++) {
    if (timeToDsipaly < 24) {
      firstHour = data.days[0].hours[timeToDsipaly];
    } else {
      firstHour =
        data.days[1].hours[timeToDsipaly === 24 ? initial : (initial += 1)];
    }

    const html = `<div class="hourActuall">
    <ul>
      <li class="first">${timeToDsipaly > 23 ? initial : timeToDsipaly}:00</li>
      <li class="temp">${firstHour.temp.toFixed(0)} ℃</li>
      <li><img src="icon/${firstHour.icon}.png"></li>
      <li>${firstHour.precipprob.toFixed(0)}%</li>
    </ul>
  </div>`;

    weatherByHour.insertAdjacentHTML("beforeend", html);
    timeToDsipaly++;
  }
};

const airQuality = function (data) {
  const number = data.days[0].aqieur;
  let description = "";

  switch (number) {
    case 1:
      description = "Bardzo Dobra";
      airQualityValue.style.color = "#37b24d";
      break;
    case 2:
      description = "Dobra";
      airQualityValue.style.color = "#8ce99a";
      break;
    case 3:
      description = "Umiarkowana";
      airQualityValue.style.color = "#ffd43b";
      break;
    case 4:
      description = "Dostateczna";
      airQualityValue.style.color = "#fd7e14";
      break;
    case 5:
      description = "Zła";
      airQualityValue.style.color = "#ff6b6b";
      break;
    case 6:
      description = "Bardzo zła";
      airQualityValue.style.color = "#c92a2a";
      break;
  }

  return description;
};

const clearDivs = function () {
  while (weatherByDayDiv.firstChild)
    weatherByDayDiv.removeChild(weatherByDayDiv.firstChild);

  while (weatherByHour.firstChild)
    weatherByHour.removeChild(weatherByHour.firstChild);
};

const setTime = function (data) {
  const day = data.days[0].datetime;
  const hour = data.currentConditions.datetime;
  const city = data.resolvedAddress;

  document.querySelector(
    ".topTitle"
  ).innerHTML = `${city}, ${day}, Stan na : ${hour.slice(0, 5)}`;
};

const fetchSearchCity = function () {
  if (search.value !== "") {
    clearDivs();

    fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${search.value}?&unitGroup=metric&lang=pl&key=JVQP5GT7AUS2RDJXXKF75T9V5&elements=%2Bpm2p5,%2Bpm10,%2Baqieur&options=useobs,useremote&events`
    )
      .then((response) => {
        if (!response.ok) throw new Error("Something went wrong, try again");
        return response.json();
      })
      .then((data) => {
        loadData(data);
        setTime(data);
        search.value = "";
      })
      .catch((err) => alert(err));
  }
};

///event listeners
search.addEventListener("keyup", function (event) {
  if (event.key === "Enter") fetchSearchCity();
});

searchBtn.addEventListener("click", fetchSearchCity);
console.log(search.value === "");
