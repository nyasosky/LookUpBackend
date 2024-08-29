var fs = require('fs').promises

const LATITUDE_INDEX = 6
const LONGITUDE_INDEX = 5

async function parseFlights() {
    console.log("Starting to parse new flight data")
    const data = require("./test_data.json")
    const flights = data["states"]
    const unitedStatesGeos = await loadShapefileData()
    var flightsInUnitedStates = []
    flights.forEach(flight => {
        if (isFlightInBoundaries(flight[LATITUDE_INDEX], flight[LONGITUDE_INDEX], unitedStatesGeos)) {
            flightsInUnitedStates.push(flight)
        }
    })
    console.log(`Found ${flightsInUnitedStates.length} flights in the United States`)
}


async function loadShapefileData() {
    var shapefile = require("shapefile");
    try {
        const file = await shapefile.open("../shapefiles/nation/cb_2018_us_nation_5m.shp")
        const data = await file.read()
        console.log("Shapefile loaded successfully")
        return data.value
    }
    catch (error) {
        console.error(error.stack)
    }
}


function pointInPolygon(point, polygon) {
    var x = point[0]
    var y = point[1]

    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i][1], yi = polygon[i][0];
        var xj = polygon[j][1], yj = polygon[j][0];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
}

function isFlightInBoundaries(lat, lng, geos) {
    const polygons = geos["geometry"]["coordinates"]
    for (var i = 0; i < polygons.length; i++) {
        if (pointInPolygon([lat, lng], polygons[i][0])) {
            return true
        }
    }
    return false
}

parseFlights()