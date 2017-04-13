$(document).ready(function($) {
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

    var n = 0;

    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

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

    // Add location to page
    locationsDB.ref().on("child_added", function(snapshot) {
        var child = snapshot.val();
        var key = snapshot.key;
        var timeFrom = child.fromTimestamp;
        var timeTo = child.toTimestamp;
        var now = parseInt(moment().format("X"));

        var location = $("<div>")
        .addClass("row locations")
        .attr("data-key", key)
        .html(`
            <div class="col-md-8">
                <p class="address" data-index="${n}">${child.address}</p>
                <p><span class="city" data-index="${n}">${child.city}, </span><span class="state" data-index="${n}">${child.state}</span></p>
                <p class="zip-code" data-index="${n}">${child.zipCode}</p>
                <button type="button" class="btn btn-primary" data-index="${n}">Get Directions</button>
                <span class="label label-success hidden" id="in-progress" data-index="${n}">In progress</span>
            </div>
            <div class="col-md-4">
                <p class="date" data-index="${n}">${child.date}</p>
                <p class="hr-from" data-index="${n}">${child.from}</p>
                <p class="hr-to" data-index="${n}">${child.to}</p>
            </div>
            <hr>
        `);

        $("#locations-list").append(location);

        if (now > timeFrom && now < timeTo) {
            $("#locations-list").children(".row[data-key=" + key + "]").children(".col-md-8").children("#in-progress[data-index=" + n + "]").removeClass("hidden");
        }

        n++;
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
});