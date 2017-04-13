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
    var m= 0;
    var totalPrice = 0;

    var fLat = 0;
    var fLon = 0;
    var mymap = "";

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
        $(".update-bg").addClass("hidden");
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