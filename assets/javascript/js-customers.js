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
			// Initialize customers database
			var configCustomers = {
				apiKey: "AIzaSyBGvojl_lmUCBdcOBC2UlqUZo8KXKzlpa8",
			    authDomain: "project-1-customers.firebaseapp.com",
			    databaseURL: "https://project-1-customers.firebaseio.com",
			    projectId: "project-1-customers",
			    storageBucket: "project-1-customers.appspot.com",
			    messagingSenderId: "686478727174"
			};
			var customersApp = firebase.initializeApp(configCustomers, "Customers");
			var customersDB = customersApp.database();

			var imgName = "";
			var updateImgName = "";
			var n = 0;
			var sortedAsc = false;
			var sortedDesc = false;

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

			// Add customers to table
			customersDB.ref().on("child_added", function(snapshot) {
				var child = snapshot.val();
				var key = snapshot.key;

				// Create row
				$("#customers-table tbody").append("<tr data-key=\"" + key + "\"><td></td><td></td><td></td><td></td><td></td></tr>");

				// Add values to corresponding column
				var rowTds = $("#customers-table")
					.children()
					.eq(1)
					.children("tr")
					.eq(n)
					.children("td");
				var headings = [key, child.created, child.name, child.email, child.phone];
				for (var i = 0; i < headings.length; i++) {
					rowTds.eq(i).text(headings[i]);
				}

				n++;
			}, function(errorObject) {
				console.log("Errors handled: " + errorObject.code);
			});

			// Sort Table Ascending
			$(".fa-caret-down").click(function() {
				var table, rows, switching, x, y, shouldSwitch;
				table = document.getElementById("customers-table");
				switching = true;
				while (switching) {
					switching = false;
					rows = table.getElementsByTagName("TR");
					for (var i = 1; i < (rows.length - 1); i++) {
						shouldSwitch = false;
						x = rows[i].getElementsByTagName("TD")[$(this).attr("data-index")];
						y = rows[i+1].getElementsByTagName("TD")[$(this).attr("data-index")];
						if ($(this).attr("data-index") === "4") {
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
				table = document.getElementById("customers-table");
				switching = true;
				while (switching) {
					switching = false;
					rows = table.getElementsByTagName("TR");
					for (var i = 1; i < (rows.length - 1); i++) {
						shouldSwitch = false;
						x = rows[i].getElementsByTagName("TD")[$(this).attr("data-index")];
						y = rows[i+1].getElementsByTagName("TD")[$(this).attr("data-index")];
						if ($(this).attr("data-index") === "4") {
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