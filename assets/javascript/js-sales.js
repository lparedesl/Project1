$(document).ready(function($) {
	// Initialize inventory database
	var config = {
		apiKey: "AIzaSyAD3GCPbQlu4xeI5snnMEU5TMcA_22Wsos",
		authDomain: "project-1-2329f.firebaseapp.com",
		databaseURL: "https://project-1-2329f.firebaseio.com",
		projectId: "project-1-2329f",
		storageBucket: "project-1-2329f.appspot.com",
		messagingSenderId: "554989098289"
	};
	firebase.initializeApp(config);
	var inventoryDB = firebase.database();

	firebase.auth().onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			// Initialize sales database
			var configSales = {
				apiKey: "AIzaSyD6Dify4yji4waHQ-BZxwwvK-UHrfZdOlk",
			    authDomain: "project-1-sales.firebaseapp.com",
			    databaseURL: "https://project-1-sales.firebaseio.com",
			    projectId: "project-1-sales",
			    storageBucket: "project-1-sales.appspot.com",
			    messagingSenderId: "933119782430"
			};
			var salesApp = firebase.initializeApp(configSales, "Sales");
			var salesDB = salesApp.database();

			var imgName = "";
			var updateImgName = "";
			var n = 0;
			var m = 0;
			var sortedAsc = false;
			var sortedDesc = false;

			// Add item to table
			salesDB.ref().on("child_added", function(snapshot) {
				var child = snapshot.val();
				var key = snapshot.key;

				if (child.status === "Open") {
					// Create row
					$("#open-table tbody").append("<tr data-key=\"" + key + "\"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");

					// Add values to corresponding column
					var rowTds = $("#open-table")
						.children()
						.eq(1)
						.children("tr")
						.eq(n)
						.children("td");
					var headings = [child.orderNumber, child.created, child.name, child.amount, child.description, child.card, child.last4];
					for (var i = 0; i < headings.length; i++) {
						rowTds.eq(i).text(headings[i]);
					}

					// Append Remove Button
					var prickedUpButton = $("<button>");
					prickedUpButton.attr("type", "button");
					prickedUpButton.attr("data-key", key);
					prickedUpButton.attr("class", "btn btn-warning picked-up-button");
					prickedUpButton.text("Picked Up");
					$("#open-table tbody tr:last td:last").append(prickedUpButton);

					n++;
				} else if (child.status === "Picked Up") {
					// Create row
					$("#picked-up-table tbody").append("<tr data-key=\"" + key + "\"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");

					// Add values to corresponding column
					var rowTds = $("#picked-up-table")
						.children()
						.eq(1)
						.children("tr")
						.eq(m)
						.children("td");
					var headings = [child.orderNumber, child.created, child.name, child.amount, child.description, child.card, child.last4];
					for (var i = 0; i < headings.length; i++) {
						rowTds.eq(i).text(headings[i]);
					}

					// Append Remove Button
					var unPickedUpButton = $("<button>");
					unPickedUpButton.attr("type", "button");
					unPickedUpButton.attr("data-key", key);
					unPickedUpButton.attr("class", "btn btn-success unpicked-up-button");
					unPickedUpButton.text("Picked Up");
					$("#picked-up-table tbody tr:last td:last").append(unPickedUpButton);

					m++;
				}
			}, function(errorObject) {
				console.log("Errors handled: " + errorObject.code);
			});

			// Mark order as picked up
			$(document).on("click", ".picked-up-button", function() {
				// Update object in database
				salesDB.ref("/" + $(this).attr("data-key")).update({
					status: "Picked Up",
				});
			});

			// Unmark order as picked up
			$(document).on("click", ".unpicked-up-button", function() {
				// Update object in database
				salesDB.ref("/" + $(this).attr("data-key")).update({
					status: "Open",
				});
			});

			// Update item in table
			salesDB.ref().on("child_changed", function(snapshot) {
				var child = snapshot.val();
				var key = snapshot.key;

				if (child.status === "Picked Up") {
					// Remove order from open orders table
					$("#open-table tr[data-key=" + key + "]").remove();
					n--;

					// Create row
					$("#picked-up-table tbody").append("<tr data-key=\"" + key + "\"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");

					// Add values to corresponding column
					var rowTds = $("#picked-up-table")
						.children()
						.eq(1)
						.children("tr")
						.eq(m)
						.children("td");
					var headings = [child.orderNumber, child.created, child.name, child.amount, child.description, child.card, child.last4];
					for (var i = 0; i < headings.length; i++) {
						rowTds.eq(i).text(headings[i]);
					}

					// Append Remove Button
					var unPickedUpButton = $("<button>");
					unPickedUpButton.attr("type", "button");
					unPickedUpButton.attr("data-key", key);
					unPickedUpButton.attr("class", "btn btn-success unpicked-up-button");
					unPickedUpButton.text("Picked Up");
					$("#picked-up-table tbody tr:last td:last").append(unPickedUpButton);

					m++;
				} else if (child.status === "Open") {
					// Remove order from picked up orders table
					$("#picked-up-table tr[data-key=" + key + "]").remove();
					m--;

					// Create row
					$("#open-table tbody").append("<tr data-key=\"" + key + "\"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");

					// Add values to corresponding column
					var rowTds = $("#open-table")
						.children()
						.eq(1)
						.children("tr")
						.eq(n)
						.children("td");
					var headings = [child.orderNumber, child.created, child.name, child.amount, child.description, child.card, child.last4];
					for (var i = 0; i < headings.length; i++) {
						rowTds.eq(i).text(headings[i]);
					}

					// Append Remove Button
					var pickedUpButton = $("<button>");
					pickedUpButton.attr("type", "button");
					pickedUpButton.attr("data-key", key);
					pickedUpButton.attr("class", "btn btn-warning picked-up-button");
					pickedUpButton.text("Picked Up");
					$("#open-table tbody tr:last td:last").append(pickedUpButton);

					n++;
				}
			});

			// Sort Table Ascending
			$(".fa-caret-down").click(function() {
				var table, rows, switching, x, y, shouldSwitch;
				table = document.getElementById($(this).attr("data-table"));
				switching = true;
				while (switching) {
					switching = false;
					rows = table.getElementsByTagName("TR");
					for (var i = 1; i < (rows.length - 1); i++) {
						shouldSwitch = false;
						x = rows[i].getElementsByTagName("TD")[$(this).attr("data-index")];
						y = rows[i+1].getElementsByTagName("TD")[$(this).attr("data-index")];
						if ($(this).attr("data-index") === "0" || $(this).attr("data-index") === "3" || $(this).attr("data-index") === "6") {
							if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
								shouldSwitch= true;
								break;
							}
						}
						else if ($(this).attr("data-index") === "1") {
							if (moment(x.innerHTML, "MMM DD, YYYY hh:mm:ss").format("X") > moment(y.innerHTML, "MMM DD, YYYY hh:mm:ss").format("X")) {
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
				table = document.getElementById($(this).attr("data-table"));
				switching = true;
				while (switching) {
					switching = false;
					rows = table.getElementsByTagName("TR");
					for (var i = 1; i < (rows.length - 1); i++) {
						shouldSwitch = false;
						x = rows[i].getElementsByTagName("TD")[$(this).attr("data-index")];
						y = rows[i+1].getElementsByTagName("TD")[$(this).attr("data-index")];
						if ($(this).attr("data-index") === "0" || $(this).attr("data-index") === "3" || $(this).attr("data-index") === "6") {
							if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
								shouldSwitch= true;
								break;
							}
						}
						else if ($(this).attr("data-index") === "1") {
							if (moment(x.innerHTML, "MMM DD, YYYY hh:mm:ss").format("X") < moment(y.innerHTML, "MMM DD, YYYY hh:mm:ss").format("X")) {
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