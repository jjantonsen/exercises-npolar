const baseUrl = 'https://api.npolar.no/indicator/timeseries/';
const params = {
    'facets': 'label.en',
    'q': '',
    'filter-systems': 'mosj.no',
    'filter-authors.@id': 'met.no',
    'filter-keywords.@value': 'land',
    'filter-locations.placename': 'Janssonhaugen',
    'filter-label.en': '15+m',
    'format': 'json',
    'variant': 'array',
    'limit': '1'
}

function buildUrl(baseUrl, params) {
    let url = baseUrl + '?';
    Object.keys(params).forEach((k, i) => {
        if (i > 0) {
            url += '&';
        }
        url += `${k}=${params[k]}`
    })
    return url;
}

const url15m = buildUrl(baseUrl, params);
params['filter-label.en'] = '25+m';
const url25m = buildUrl(baseUrl, params);
params['filter-label.en'] = '40+m';
const url40m = buildUrl(baseUrl, params);

const fetchTemperatureData = async (url) => {
    const response = await fetch(url)
    const json = await response.json();
    const data = json[0].data;
    const temperatures = data.map(d => d.value);
    const dates = data.map(d => d.when);
    return { temperatures, dates }
}

initGraphs();

async function initGraphs() {
    const h15data = await fetchTemperatureData(url15m);
    const h25data = await fetchTemperatureData(url25m);
    const h40data = await fetchTemperatureData(url40m);
    const labels = h15data.dates.map(d => d.substring(0,7));
    const graphData = {
    labels: labels,
    datasets: [
        {
            label: '15m',
            data: h15data.temperatures,
            backgroundColor: 'rgb(255, 200, 132)',
            borderColor: 'rgb(255, 200, 132)',
        },
        {
            label: '25m',
            data: h25data.temperatures,
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
        },
        {
            label: '40m',
            data: h40data.temperatures,
            backgroundColor: 'rgb(100, 99, 30)',
            borderColor: 'rgb(100, 99, 30)',
        }
    ]
    };

    const config = {
        type: 'line',
        data: graphData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Ground temperature, Janssonhaugen'
            }
          }
        },
      };

    var myChart = new Chart(
        document.getElementById('myChart'),
        config
    );
}
