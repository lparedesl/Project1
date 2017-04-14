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

	firebase.auth().onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			// Initialize customers database
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
			var imgName = "";
			var updateImgName = "";
			var n = 0;
			var sortedAsc = false;
			var sortedDesc = false;

			$("#userMenu").click(function() {
				$(this).blur();
			});

			$("#user").text(firebaseUser.email + " ");

			$("#btn-logout").click(function(event) {
				firebase.auth().signOut();
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

			// Show add location window
			$("#add-location").click(function() {
				$(".update-bg").removeClass("hidden");
				$("#create-location-window").removeClass("hidden");
				console.log("works");
			});

			// Add item to database
			$("#add-new-item").click(function(event) {
				event.preventDefault();

				var fromTimestamp = parseInt(moment($("#date-input").val().trim() + " " + $("#hr-from-input").val().trim(), "MM/DD/YY HH:mm").format("X"));
				var toTimestamp = parseInt(moment($("#date-input").val().trim() + " " + $("#hr-to-input").val().trim(), "MM/DD/YY HH:mm").format("X"));

				// Push data to database
				locationsDB.ref().push({
				  date: $("#date-input").val().trim(),
				  from: $("#hr-from-input").val().trim(),
				  fromTimestamp: fromTimestamp,
				  to: $("#hr-to-input").val().trim(),
				  toTimestamp: toTimestamp,
				  address: $("#address-input").val().trim(),
				  city: $("#city-input").val().trim(),
				  state: $("#state-input").val().trim(),
				  zipCode: parseInt($("#zip-code-input").val().trim()),
				});

				// Clear input fields
				var inputs = [$("#date-input"), $("#hr-from-input"), $("#hr-to-input"), $("#address-input"), $("#city-input"), $("#state-input"), $("#zip-code-input")];
				for (i = 0; i < inputs.length; i++) {
					inputs[i].val("");
				}
				$(".update-bg").addClass("hidden");
				$("#create-location-window").addClass("hidden");
			});

			// Add item to table
			locationsDB.ref().on("child_added", function(snapshot) {
				var child = snapshot.val();
				var key = snapshot.key;

			  	// Create row
			  	$("#locations-table tbody").append("<tr data-key=\"" + key + "\"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");

			  	// Add values to corresponding column
			  	var rowTds = $("#locations-table")
			  		.children()
			  		.eq(1)
			  		.children("tr")
			  		.eq(n)
			  		.children("td");
			  	var headings = [child.date, child.from, child.to, child.address, child.city, child.state, child.zipCode];
			  	for (var i = 0; i < headings.length; i++) {
			  		rowTds.eq(i).text(headings[i]);
			  	}

			  	// Append Remove Button
			  	var removeButton = $("<button>");
			  	removeButton.attr("type", "button");
			  	removeButton.attr("data-key", key);
			  	removeButton.attr("class", "btn btn-danger remove-button");
			  	removeButton.html("<i class=\"fa fa-trash\" aria-hidden=\"true\"></i>");
			  	$("#locations-table tbody tr:last td:last").append(removeButton);

			  	// Append Edit Button
			  	var editButton = $("<button>");
			  	editButton.attr("type", "button");
			  	editButton.attr("data-key", key);
			  	editButton.attr("class", "btn btn-primary edit-button");
			  	editButton.html("<i class=\"fa fa-pencil\" aria-hidden=\"true\"></i>");
			  	$("#locations-table tbody tr:last td:last").append(editButton);

			  	n++;
			}, function(errorObject) {
				console.log("Errors handled: " + errorObject.code);
			});

			// Close add item window
			$("#cancel-new-item").click(function(event) {
				event.preventDefault();
				$(".update-bg").addClass("hidden");
				$("#create-location-window").addClass("hidden");
			});

			// Remove item
			$(document).on("click", ".remove-button", function() {
				// Remove item from table
				$("tr[data-key=" + $(this).attr("data-key") + "]").remove();
				// Remove item from the database
				locationsDB.ref().child($(this).data("key")).remove();
				n--;
			});

			// Show update window
			$(document).on("click", ".edit-button", function() {
				$(".update-bg").removeClass("hidden");
				$("#update-location-window").removeClass("hidden");

				var self = $(this);
				// Get object from database
				locationsDB.ref().on("value", function(snapshot) {
					var sv = snapshot.val();
					object = sv[self.attr("data-key")];
				}, function(errorObject) {
					console.log("Errors handled: " + errorObject.code);
				});

				// Show current values on form
				$("#update-date-input").val(object.date);
				$("#update-hr-from-input").val(object.from);
				$("#update-hr-to-input").val(object.to);
				$("#update-address-input").val(object.address);
				$("#update-city-input").val(object.city);
				$("#update-state-input").val(object.state);
				$("#update-zip-code-input").val(object.zipCode);

				$("#submit-update").attr("data-key", $(this).data("key"));
			});

			// Update item in database
			$("#submit-update").click(function(event) {
				event.preventDefault();
				$(".update-bg").addClass("hidden");
				$("#update-location-window").addClass("hidden");

				var fromTimestamp = parseInt(moment($("#update-date-input").val().trim() + " " + $("#update-hr-from-input").val().trim(), "MM/DD/YY HH:mm").format("X"));
				var toTimestamp = parseInt(moment($("#update-date-input").val().trim() + " " + $("#update-hr-to-input").val().trim(), "MM/DD/YY HH:mm").format("X"));

				// Update object in database
				locationsDB.ref("/" + $(this).attr("data-key")).update({
				  date: $("#update-date-input").val().trim(),
				  from: $("#update-hr-from-input").val().trim(),
				  fromTimestamp: fromTimestamp,
				  to: $("#update-hr-to-input").val().trim(),
				  toTimestamp: toTimestamp,
				  address: $("#update-address-input").val().trim(),
				  city: $("#update-city-input").val().trim(),
				  state: $("#update-state-input").val().trim(),
				  zipCode: parseInt($("#update-zip-code-input").val().trim()),
				});

				$("#submit-update").removeAttr("data-key");
			});

			// Update item in table
			locationsDB.ref().on("child_changed", function(snapshot) {
				var child = snapshot.val();
				var key = snapshot.key;

				// Update table
				var rowTds = $("#locations-table")
					.children()
					.eq(1)
					.children("tr[data-key=" + key + "]")
					.children("td");

				// Update table on page
				var headings = [child.date, child.from, child.to, child.address, child.city, child.state, child.zipCode];
				for (var i = 0; i < headings.length; i++) {
					rowTds.eq(i).text(headings[i]);
				}
			});

			// Close Update Window
			$("#cancel-update").click(function(event) {
				event.preventDefault();
				$(".update-bg").addClass("hidden");
				$("#update-location-window").addClass("hidden");
				$("#submit-update").removeAttr("data-key");
			});

			// Sort Table Ascending
			$(".fa-caret-down").click(function() {
				var table, rows, switching, x, y, shouldSwitch;
				table = document.getElementById("locations-table");
				switching = true;
				while (switching) {
					switching = false;
					rows = table.getElementsByTagName("TR");
					for (var i = 1; i < (rows.length - 1); i++) {
						shouldSwitch = false;
						x = rows[i].getElementsByTagName("TD")[$(this).attr("data-index")];
						y = rows[i+1].getElementsByTagName("TD")[$(this).attr("data-index")];
						if ($(this).attr("data-index") === "6") {
							if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
								shouldSwitch= true;
								break;
							}
						}
						else if ($(this).attr("data-index") === "0") {
							if (moment(x.innerHTML, "MM/DD/YY").format("X") > moment(y.innerHTML, "MM/DD/YY").format("X")) {
								shouldSwitch= true;
								break;
							}
						}
						else if ($(this).attr("data-index") === "1" || $(this).attr("data-index") === "2") {
							if (moment(x.innerHTML, "HH:mm").format("X") > moment(y.innerHTML, "HH:mm").format("X")) {
								shouldSwitch= true;
								break;
							}
						}
						else {
							if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
								shouldSwitch= true;
								break;
							}
						}
					}
					if (shouldSwitch) {
						rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
						switching = true;
					}
				}
				sortedAsc = true;
				sortedDesc = false;
				sortedByAsc = $(this).attr("data-index");
			});

			// Sort Table Descending
			$(".fa-caret-up").click(function() {
				var table, rows, switching, x, y, shouldSwitch;
				table = document.getElementById("locations-table");
				switching = true;
				while (switching) {
					switching = false;
					rows = table.getElementsByTagName("TR");
					for (var i = 1; i < (rows.length - 1); i++) {
						shouldSwitch = false;
						x = rows[i].getElementsByTagName("TD")[$(this).attr("data-index")];
						y = rows[i+1].getElementsByTagName("TD")[$(this).attr("data-index")];
						if ($(this).attr("data-index") === "6") {
							if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
								shouldSwitch= true;
								break;
							}
						}
						else if ($(this).attr("data-index") === "0") {
							if (moment(x.innerHTML, "MM/DD/YY").format("X") < moment(y.innerHTML, "MM/DD/YY").format("X")) {
								shouldSwitch= true;
								break;
							}
						}
						else if ($(this).attr("data-index") === "1" || $(this).attr("data-index") === "2") {
							if (moment(x.innerHTML, "HH:mm").format("X") < moment(y.innerHTML, "HH:mm").format("X")) {
								shouldSwitch= true;
								break;
							}
						}
						else {
							if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
								shouldSwitch= true;
								break;
							}
						}
					}
					if (shouldSwitch) {
						rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
						switching = true;
					}
				}
				sortedAsc = false;
				sortedDesc = true;
				sortedByAsc = $(this).attr("data-index");
			});
		} else {
			window.location = "products.html";
		}
	});
});