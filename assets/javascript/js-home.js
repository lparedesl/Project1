$(document).ready(function($) {
    var config = {
        apiKey: "AIzaSyAD3GCPbQlu4xeI5snnMEU5TMcA_22Wsos",
        authDomain: "project-1-2329f.firebaseapp.com",
        databaseURL: "https://project-1-2329f.firebaseio.com",
        projectId: "project-1-2329f",
        storageBucket: "project-1-2329f.appspot.com",
        messagingSenderId: "554989098289"
    };

    firebase.initializeApp(config);

    var database = firebase.database();
    var n = 0;
    var m = 0;
    var totalPrice = 0;

    // variable for map
    var fLat = 0;
    var fLon = 0;
    var dLon = 0;
    var dLat = 0;
    var mymap = "";
    var routeObj = {};
    var locMarker = {};

    $("#btn-login").click(function(event) {
        $("#login-window").removeClass("hidden");
        $(".update-bg").removeClass("hidden");
    });

    $("#userMenu").click(function() {
        $(this).blur();
    });

    $("#login").click(function(event) {
        event.preventDefault();
        var email = $("#input-username").val().trim();
        var pass = $("#input-password").val().trim();
        var auth = firebase.auth();
        auth.signInWithEmailAndPassword(email, pass)
        .catch(function(error) {
            console.log(error.message);
            var wrongPass = "The password is invalid or the user does not have a password.";
            var noUser = "There is no user record corresponding to this identifier. The user may have been deleted.";
            var badEmail = "The email address is badly formatted.";

            $("#login-window").css({
                height: "52vh",
            });
            if (error.message === wrongPass) {
                $("#user-nonexistent").addClass("hidden");
                $("#bad-email").addClass("hidden");
                $("#password-incorrect").removeClass("hidden");
            } else if (error.message === noUser) {
                $("#password-incorrect").addClass("hidden");
                $("#bad-email").addClass("hidden");
                $("#user-nonexistent").removeClass("hidden");
            } else if (error.message === badEmail) {
                $("#password-incorrect").addClass("hidden");
                $("#user-nonexistent").addClass("hidden");
                $("#bad-email").removeClass("hidden");
            }
        });
        $("#input-username").val("");
        $("#input-password").val("");
    });

    $("#close-login").click(function() {
        $(".update-bg").addClass("hidden");
        $("#password-incorrect").addClass("hidden");
        $("#user-nonexistent").addClass("hidden");
        $("#bad-email").addClass("hidden");
        $("#input-username").val("");
        $("#input-password").val("");
        $("#login-window").css({
            height: "46vh",
        });
    });

    $("#signup").click(function(event) {
        event.preventDefault();
        $("#login-window").css({
            height: "46vh",
        });
        $("#signup-window").removeClass("hidden");
        $(".update-bg").removeClass("hidden");
        $("#user-nonexistent").addClass("hidden");
        $("#password-incorrect").addClass("hidden");
    });

    $("#register-user").click(function(event) {
        event.preventDefault();
        if ($("#password-new").val().trim() !== $("#confirm-password-new").val().trim() || $("#password-new").val().trim() === "" || $("#confirm-password-new").val().trim() === "") {
            $("#signup-window").css({
                height: "55vh",
            });
            $("#pass-min-length").addClass("hidden");
            $("#email-exists").addClass("hidden");
            $("#invalid-email").addClass("hidden");
            $("#password-mismatch").removeClass("hidden");
        } else {
            var email = $("#email-new").val().trim();
            var pass = $("#password-new").val().trim();
            var auth = firebase.auth();
            auth.createUserWithEmailAndPassword(email, pass)
            .catch(function(error) {
                console.log(error.message);
                var passLength = "Password should be at least 6 characters";
                var userExists = "The email address is already in use by another account.";
                var badEmail = "The email address is badly formatted.";

                $("#signup-window").css({
                    height: "55vh",
                });
                $("#password-mismatch").addClass("hidden");
                if (error.message === badEmail) {
                    $("#pass-min-length").addClass("hidden");
                    $("#email-exists").addClass("hidden");
                    $("#invalid-email").removeClass("hidden");
                } else if (error.message === userExists) {
                    $("#pass-min-length").addClass("hidden");
                    $("#invalid-email").addClass("hidden");
                    $("#email-exists").removeClass("hidden");
                } else if (error.message === passLength) {
                    $("#pass-min-length").removeClass("hidden");
                    $("#email-exists").addClass("hidden");
                    $("#invalid-email").addClass("hidden");
                }
            });
        }
    });

    $("#close-signup-window").click(function(event) {
        event.preventDefault();
        $("#signup-window").css({
            height: "50vh",
        });
        $("#signup-window").addClass("hidden");
        $(".update-bg").addClass("hidden");
        $("#password-mismatch").addClass("hidden");
        $("#email-exists").addClass("hidden");
        $("#pass-min-length").addClass("hidden");
        $("#invalid-email").addClass("hidden");
        var inputs = [$("#first-name-new"), $("#last-name-new"), $("#email-new"), $("#username-new"), $("#password-new"), $("#confirm-password-new")];
        for (var j = 0; j < inputs.length; j++) {
            inputs[j].val("");
        }
    });

    $("#btn-logout").click(function(event) {
        firebase.auth().signOut();
    });

    firebase.auth().onAuthStateChanged(function(firebaseUser) {
        if (firebaseUser) {
            $(".update-bg").addClass("hidden");
            $("#login-window").addClass("hidden");
            $("#btn-login").addClass("hidden");
            $("#password-incorrect").addClass("hidden");
            $("#user-nonexistent").addClass("hidden");
            $("#bad-email").addClass("hidden");
            $("#login-window").css({
                height: "46vh",
            });
            $("#signup-window").addClass("hidden");
            $("#password-mismatch").addClass("hidden");
            $("#email-exists").addClass("hidden");
            $("#pass-min-length").addClass("hidden");
            $("#invalid-email").addClass("hidden");
            $("#user").text(firebaseUser.email + " ");
            $("#userMenu").removeClass("hidden");
        } else {
            $("#btn-login").removeClass("hidden");
            $("#userMenu").addClass("hidden");
        }
    });

    function getTotalQty() {
        var totalQty = 0;
        cartQuantities = JSON.parse(localStorage.getItem("quantities"));

        if (Array.isArray(cartQuantities)) {
            console.log("false");
            for (var i = 0; i < cartQuantities.length; i++) {
                totalQty += cartQuantities[i];
            }
        }
        $("#cart-total-qty").text(totalQty);
    }
    getTotalQty();

    // initialize map
    mymap = L.map("mapid").setView([35.204697, -80.835403], 11);

    mapLink =
        '<a href="#">ESRI 2017</a>';
    L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
            maxZoom: 18,
        }).addTo(mymap);

    // ----------------------------------------------------------------- //

    var configLocations = {
        apiKey: "AIzaSyCsJTE4AtEAPYpmZ0gWDDph_8TIlcQap00",
        authDomain: "project-1-locations.firebaseapp.com",
        databaseURL: "https://project-1-locations.firebaseio.com",
        projectId: "project-1-locations",
        storageBucket: "project-1-locations.appspot.com",
        messagingSenderId: "431733192725"
    };
    var locationsApp = firebase.initializeApp(configLocations, "Locations");
    var locationsDB = locationsApp.database();

    // Add locations to page
    locationsDB.ref().orderByChild("fromTimestamp").on("child_added", function(snapshot) {
        var child = snapshot.val();
        var key = snapshot.key;
        var timeFrom = child.fromTimestamp;
        var timeTo = child.toTimestamp;
        var now = parseInt(moment().format("X"));

        var location = $("<div>")
            .addClass("location-item")
            .attr("data-key", key)
            .html(`
            <div class="col-md-8">
                <p class="address" data-index="${n}">${child.address}</p>
                <p><span class="city" data-index="${n}">${child.city}, </span><span class="state" data-index="${n}">${child.state}</span></p>
                <p class="zip-code" data-index="${n}">${child.zipCode}</p>
                <button type="button" class="btn btn-primary route" data-index="${n}" data-lon="${child.lon}" data-lat="${child.lat}">Get Route</button>
                <h4><span class="label label-success hidden" id="in-progress" data-index="${n}">We are here now!</span></h4>
            </div>
            <div class="col-md-4">
                <p class="date" data-index="${n}">${child.date}</p>
                <p class="hr-from" data-index="${n}">From ${child.from}</p>
                <p class="hr-to" data-index="${n}">Until ${child.to}</p>
            </div>
            `);

        $(".location-list-wrap").append(location);

        if (now > timeFrom && now < timeTo) {
            $(".location-list-wrap").children(".location-item[data-key=" + key + "]").children(".col-md-8").children("h4").children("#in-progress[data-index=" + n + "]").removeClass("hidden");
        }

        n++;

        //-- add markers to map --//
        var lon = child.lon;
        var lat = child.lat;
        var popupText = child.address;
        var popupText = "<h5>" + child.address + "</h5><h6>" + child.city + ", " + child.state + " " + child.zipCode + "</h6>";
        var markerLocation = new L.LatLng(lat, lon);
        var marker = new L.Marker(markerLocation);
        mymap.addLayer(marker);
        marker.bindPopup(popupText);
        //-----------------------//

    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });

    // ----------------------------------------------------------------- //

    // get lon & lat from button and call getRoute()
    function getRoutebtn() {
        if (fLat === 0) {
            $("#locations-list .alert").removeClass("hidden");
            return;
        }
        dLon = $(this).data('lon');
        dLat = $(this).data('lat');

        getRoute(dLat, dLon, fLat, fLon);
    }

    // get geolocation of user and plot on map. if previous location is on the map, remove it first.
    function mapMe() {
        if (Object.getOwnPropertyNames(routeObj).length !== 0) {
            routeObj.remove();
        }
        if (Object.getOwnPropertyNames(locMarker).length !== 0) {
            locMarker.remove();
        }

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
                L.Icon.Big = L.Icon.Default.extend({
                    options: {
                        // iconSize: new L.Point(45, 81),
                        iconSize: new L.Point(30, 60),
                    }
                });

                var bigIcon = new L.Icon.Big();

                fLat = data.coords.latitude;
                fLon = data.coords.longitude;

                var popupText = "<h4>Your Location</h4>";
                var markerLocation = new L.LatLng(fLat, fLon);
                locMarker = new L.Marker(markerLocation);
                locMarker.setIcon(bigIcon);
                mymap.addLayer(locMarker);
                locMarker.bindPopup(popupText).openPopup();
                mymap.panTo(markerLocation);

            })
            .catch(function(error) {
                console.log('Error', error);
            });
    };

    // take user input and call MapQuest API to get lon & lat. place location pin on map. 
    function geocodeAddress() {
        event.preventDefault();

        if (Object.getOwnPropertyNames(routeObj).length !== 0) {
            routeObj.remove();
        }
        if (Object.getOwnPropertyNames(locMarker).length !== 0) {
            locMarker.remove();
        }

        L.Icon.Big = L.Icon.Default.extend({
            options: {
                // iconSize: new L.Point(45, 81),
                iconSize: new L.Point(30, 60),
            }
        });

        var bigIcon = new L.Icon.Big();

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
            .then(function(response) {

                $("#latitude").html("Latitude: " + response.results[0].locations[0].latLng.lat);
                $("#longitude").html("Longitude: " + response.results[0].locations[0].latLng.lng);
                $("#locMap").attr("src", response.results[0].locations[0].mapUrl);
                fLon = response.results[0].locations[0].latLng.lng;
                fLat = response.results[0].locations[0].latLng.lat;

                var popupText = "<h4>Your Location</h4>";
                var markerLocation = new L.LatLng(fLat, fLon);
                locMarker = new L.Marker(markerLocation);
                locMarker.setIcon(bigIcon);
                mymap.addLayer(locMarker);
                locMarker.bindPopup(popupText).openPopup();
                mymap.panTo(markerLocation);

            });
    }

    // function to get route and plot on map. remove previous route if there is one
    function getRoute(y, x, y1, x1) {

        if (Object.getOwnPropertyNames(routeObj).length !== 0) {
            routeObj.remove();
        }

        routeObj = L.Routing.control({
            waypoints: [
                L.latLng(y, x),
                L.latLng(y1, x1)
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
        // console.log(routeObj._altContainer.innerHTML);
    };

    $(document).on("click", ".route", getRoutebtn);
    $(document).on("click", "#locMe", mapMe);
    $(document).on("click", "#aSubmit", geocodeAddress);
});
