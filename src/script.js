const search = document.querySelector('#search');
const apiKey = 'ac899cd09bcd0ddfbf697724d0c5206a';

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

const curLoc = document.querySelector('#curLoc');
curLoc.addEventListener('click', forecast);
search.addEventListener('click', forecast);

document.addEventListener('DOMContentLoaded', () => {
    let storedCity = localStorage.getItem('cityName');
    if (storedCity) {
        displayToday(storedCity);
        displayFourDays(storedCity);
    } else {
        console.log('No city stored in localStorage.');
    }
});

function isValidCity(city) {
    const cityRegex = /^[a-zA-Z\s]+$/;
    return cityRegex.test(city);
}

async function forecast(e) {
    let citySearch = '';

    if (e.target.id.includes('search')) {
        citySearch = document.querySelector('#input').value.trim();

        document.querySelector('#input').value = '';

        // Validate city name
        if (!isValidCity(citySearch)) {
            alert('Please enter a valid city name.');
            return;
        }
    }

    try {
        const position = await getCurrentLocation();
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        if (e.target.id.includes('curLoc')) {
            const fetchGN = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
            const getName = await fetchGN.json();
            citySearch = getName.name;
        }

        localStorage.setItem('cityName', citySearch);
        if(localStorage.getItem('cityName')){
            document.querySelector('#history').style ="display:unset"
            dropdown();


        }
        
       
        if (citySearch) {
            displayToday(citySearch);
            displayFourDays(citySearch);
        } else {
            alert('Please enter a city');
        }
    } catch (error) {
        console.error('Error during forecast:', error);
        alert('Failed to get location or weather data. Please try again.');
    }
}

// Display today's weather
async function displayToday(city) {
    const today = document.querySelector('#today');
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        if (!response.ok) {
            throw new Error('City not found');
        }

        const todayData = await response.json();
        const date = new Date().toDateString();

        const temp = todayData.main.temp;
        const wind = todayData.wind.speed;
        const humid = todayData.main.humidity;
        const iconCode = todayData.weather[0].icon;
        const desc = todayData.weather[0].description;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        today.innerHTML = `
        <div class="flex flex-col gap-2  ">
            <p class="text-xl font-bold">${city} - ${date}  </p>
          
           
            <p>Temperature: ${temp} °C</p>
            <p>Wind: ${wind} m/s</p>
            <p>Humidity: ${humid} %</p>

            </div>
            <div class='flex flex-col gap-2 justify-center md:mr-10 items-center'>
             <img class='w-24 ' src="${iconUrl}" />
            <p class='font-semibold'>${desc}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching today\'s weather:', error);
        today.innerHTML = `<p>City not found. Please check the city name and try again.</p>`;
    }
}

// Display four days of weather
async function displayFourDays(city) {
    const fourDays = document.querySelector('#fourDays');
    try {
        const fetchfollowingdays = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
        const fourDaysData = await fetchfollowingdays.json();

        fourDays.innerHTML = '';
        for (let i = 1; i <= 4; i++) {
            let forecast = fourDaysData.list[i * 8];  // Get data for the same time each day
            let date = new Date(forecast.dt_txt).toDateString();
            let temp = forecast.main.temp;
            let wind = forecast.wind.speed;
            let humid = forecast.main.humidity;
            let iconCode = forecast.weather[0].icon;
            let desc = forecast.weather[0].description;
            let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

            fourDays.innerHTML += `
                <div class='bg-gray-600 text-white p-4 md:p-5 lg:p-6'>
                    <p class=" date border-blue-500 font-semibold">${date}</p>
                    <img src="${iconUrl}" alt="Icon">
                   
                    <p>Temp: ${temp} °C</p>
                    <p>Wind: ${wind} m/s</p>
                    <p>Humidity: ${humid}%</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching the forecast:', error);
        fourDays.innerHTML = `<p>Unable to retrieve forecast data. Please try again later.</p>`;
    }
}

// Dropdown for recently searched cities
function dropdown() {
    let history = document.querySelector('#history')
    let locVal = localStorage.getItem('cityName');

    


    let val = JSON.parse(sessionStorage.getItem('city-history')) || [];
    
    if (locVal && !val.includes(locVal)) {
        val.push(locVal);
        sessionStorage.setItem('city-history', JSON.stringify(val));
       history .innerHTML += `<option value="${val[val.length - 1]}">${val[val.length - 1]}</option>`;
    }
}

// Event listener for dropdown menu
document.querySelector('#history').addEventListener('change', (e) => {
    const selectedCity = e.target.value;
    displayToday(selectedCity);
    displayFourDays(selectedCity);
});
