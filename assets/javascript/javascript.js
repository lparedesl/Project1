$(document).ready(function($) {
	    var fLat = 0;
    var fLon = 0;
    var mymap = "";

    mymap = L.map("mapid").setView([35.065017, -80.782693], 14);
    var marker = L.marker([35.065017, -80.782693]).addTo(mymap);
    marker.bindPopup("<h4>BakeSale2Go is here!</h4>").openPopup();


    mapLink =
        '<a href="#">ESRI 2017</a>';
    L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
            maxZoom: 18,
        }).addTo(mymap);

    // alternate map style - fast load, doesn't look that great

    // mapLink =
    //     '<a href="https://openstreetmap.org">OpenStreetMap</a>';
    // L.tileLayer(
    //     'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //         attribution: '&copy; ' + mapLink + ' Contributors',
    //         maxZoom: 18,
    //     }).addTo(mymap);


    // alternate map style - looks good but slow loading

    // mapLink =
    //     '<a href="http://stamen.com">Stamen Design</a>';
    // L.tileLayer(
    //     'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
    //         attribution: '&copy; ' + mapLink + ' Contributors',
    //         maxZoom: 18,
    //     }).addTo(mymap);

    function mapMe() {
        var userPositionPromise = new Promise(function(resolve, reject) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(data) {
                    resolve(data);
                }, function(error) {
                    reject(error);
                });
            } else {
                reject({
                    error: 'browser doesn\'t support geolocation'
                });
            };
        });

        userPositionPromise
            .then(function(data) {
                fLat = data.coords.latitude;
                fLon = data.coords.longitude;

                getRoute(fLat, fLon);
            })
            .catch(function(error) {
                console.log('Error', error);
            });
    };

    function geocodeAddress() {
        event.preventDefault();

        var addr = $("#fAddress").val().trim();
        addr = addr.split(' ').join('+');
        var city = $("#fCity").val().trim();
        var state = $("#fState").val().trim();
        var zip = $("#fZip").val().trim();

        var queryURL = "https://open.mapquestapi.com/geocoding/v1/address?key=8SklnM7QrMDyxrSAGzwibn3ukb6f9yCs&location=" + addr + "+" + city + "+" + state + "+" + zip;

        $.ajax({
                url: queryURL,
                method: "GET"
            })
            .done(function(response) {

                // console.log(response);

                $("#latitude").html("Latitude: " + response.results[0].locations[0].latLng.lat);
                $("#longitude").html("Longitude: " + response.results[0].locations[0].latLng.lng);
                $("#locMap").attr("src", response.results[0].locations[0].mapUrl);
                long = response.results[0].locations[0].latLng.lng;
                lati = response.results[0].locations[0].latLng.lat;
                getRoute(lati, long);
            });

    }

    function getRoute(y, x) {
        // var umarker = L.marker([y, x]).addTo(mymap);
        // umarker.bindPopup("<h4>You are here!</h4>").openPopup();
        var routeObj = L.Routing.control({
            waypoints: [
                L.latLng(y, x),
                L.latLng(35.065017, -80.782693)
            ],
            lineOptions: {
                styles: [{ color: 'red', opacity: .5, weight: 10 }]
            },
            units: 'imperial',
            show: false,
            routeWhileDragging: true,
            fitSelectedRoutes: true,
            router: L.Routing.mapbox('pk.eyJ1IjoiZGxwaGlsbGlwcyIsImEiOiJjajE2dW81bDEwNDFmMzJvN3U1MWk4MWNiIn0.xbXgZRPMshuOtr-I8OxIeA')
        }).addTo(mymap);
        console.log(routeObj);
    };


    $(document).on("click", "#locMe", mapMe);
    $(document).on("click", "#aSubmit", geocodeAddress);
});