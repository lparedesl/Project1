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

	firebase.auth().onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			var database = firebase.database();
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
			        for (var i = 0; i < cartQuantities.length; i++) {
			            totalQty += cartQuantities[i];
			        }
			    }
			    $("#cart-total-qty").text(totalQty);
			}
			getTotalQty();

			// Get image name
			$("#upload").change(function () {
				imgName = this.value.split(/(\\|\/)/g).pop();
			});

			$("#update-upload").change(function () {
				updateImgName = this.value.split(/(\\|\/)/g).pop();
			});

			// Show add item window
			$("#create-item").click(function() {
				$(".update-bg").removeClass("hidden");
				$("#create-item-window").removeClass("hidden");
			});

			// Add item to database
			$("#add-new-item").click(function(event) {
				event.preventDefault();

				// Push data to database
				database.ref().push({
				  name: $("#name-input").val().trim(),
				  price: parseFloat($("#price-input").val().trim()),
				  glutenFree: $("#gluten-free-input").val().trim(),
				  description: $("#description-input").val().trim(),
				  quantity: parseInt($("#quantity-input").val().trim()),
				  imgName: imgName,
				});

				// Clear input fields
				var inputs = [$("#name-input"), $("#price-input"), $("#gluten-free-input"), $("#description-input"), $("#quantity-input"), $("#upload")];
				for (i = 0; i < inputs.length; i++) {
					inputs[i].val("");
				}
				$(".update-bg").addClass("hidden");
				$("#create-item-window").addClass("hidden");
			});

			// Add item to table
			database.ref().on("child_added", function(snapshot) {
				var child = snapshot.val();
				var key = snapshot.key;

			  	// Create row
			  	$("#inventory-table tbody").append("<tr data-key=\"" + key + "\"><td></td><td></td><td></td><td></td><td></td><td></td></tr>");

			  	// Add values to corresponding column
			  	var rowTds = $("#inventory-table")
			  		.children()
			  		.eq(1)
			  		.children("tr")
			  		.eq(n)
			  		.children("td");
			  	var headings = [child.name, child.price, child.glutenFree, child.description, child.quantity];
			  	for (var i = 0; i < headings.length; i++) {
			  		rowTds.eq(i).text(headings[i]);
			  	}

			  	// Append Remove Button
			  	var removeButton = $("<button>");
			  	removeButton.attr("type", "button");
			  	removeButton.attr("data-key", key);
			  	removeButton.attr("class", "btn btn-danger remove-button");
			  	removeButton.html("<i class=\"fa fa-trash\" aria-hidden=\"true\"></i>");
			  	$("#inventory-table tbody tr:last td:last").append(removeButton);

			  	// Append Edit Button
			  	var editButton = $("<button>");
			  	editButton.attr("type", "button");
			  	editButton.attr("data-key", key);
			  	editButton.attr("class", "btn btn-primary edit-button");
			  	editButton.html("<i class=\"fa fa-pencil\" aria-hidden=\"true\"></i>");
			  	$("#inventory-table tbody tr:last td:last").append(editButton);

			  	n++;
			}, function(errorObject) {
				console.log("Errors handled: " + errorObject.code);
			});

			// Close add item window
			$("#cancel-new-item").click(function(event) {
				event.preventDefault();
				$(".update-bg").addClass("hidden");
				$("#create-item-window").addClass("hidden");
			});

			// Remove item
			$(document).on("click", ".remove-button", function() {
				// Remove item from table
				$("tr[data-key=" + $(this).attr("data-key") + "]").remove();
				// Remove item from the database
				database.ref().child($(this).data("key")).remove();
				n--;
			});

			// Show update window
			$(document).on("click", ".edit-button", function() {
				$(".update-bg").removeClass("hidden");
				$("#update-window").removeClass("hidden");

				var self = $(this);
				// Get object from database
				database.ref().on("value", function(snapshot) {
					var sv = snapshot.val();
					object = sv[self.attr("data-key")];
				}, function(errorObject) {
					console.log("Errors handled: " + errorObject.code);
				});

				// Show current values on form
				$("#update-name-input").val(object.name);
				$("#update-price-input").val(object.price);
				$("#update-gluten-free-input").val(object.glutenFree);
				$("#update-description-input").val(object.description);
				$("#update-quantity-input").val(object.quantity);
				updateImgName = object.imgName;

				$("#submit-update").attr("data-key", $(this).data("key"));
			});

			// Update item in database
			$("#submit-update").click(function(event) {
				event.preventDefault();
				$(".update-bg").addClass("hidden");
				$("#update-window").addClass("hidden");

				// Update object in database
				database.ref("/" + $(this).attr("data-key")).update({
				  name: $("#update-name-input").val().trim(),
				  price: parseFloat($("#update-price-input").val().trim()),
				  glutenFree: $("#update-gluten-free-input").val().trim(),
				  description: $("#update-description-input").val().trim(),
				  quantity: parseInt($("#update-quantity-input").val().trim()),
				  imgName: updateImgName,
				});

				$("#submit-update").removeAttr("data-key");
			});

			// Update item in table
			database.ref().on("child_changed", function(snapshot) {
				var child = snapshot.val();
				var key = snapshot.key;

				// Update table
				var rowTds = $("#inventory-table")
					.children()
					.eq(1)
					.children("tr[data-key=" + key + "]")
					.children("td");

				// Update table on page
				var headings = [child.name, child.price, child.glutenFree, child.description, child.quantity];
				for (var i = 0; i < headings.length; i++) {
					rowTds.eq(i).text(headings[i]);
				}
			});

			// Close Update Window
			$("#cancel-update").click(function(event) {
				event.preventDefault();
				$(".update-bg").addClass("hidden");
				$("#update-window").addClass("hidden");
				$("#submit-update").removeAttr("data-key");
			});

			// Sort Table Ascending
			$(".fa-caret-down").click(function() {
				var table, rows, switching, x, y, shouldSwitch;
				table = document.getElementById("inventory-table");
				switching = true;
				while (switching) {
					switching = false;
					rows = table.getElementsByTagName("TR");
					for (var i = 1; i < (rows.length - 1); i++) {
						shouldSwitch = false;
						x = rows[i].getElementsByTagName("TD")[$(this).attr("data-index")];
						y = rows[i+1].getElementsByTagName("TD")[$(this).attr("data-index")];
						if ($(this).attr("data-index") === "1" || $(this).attr("data-index") === "4") {
							if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
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
				table = document.getElementById("inventory-table");
				switching = true;
				while (switching) {
					switching = false;
					rows = table.getElementsByTagName("TR");
					for (var i = 1; i < (rows.length - 1); i++) {
						shouldSwitch = false;
						x = rows[i].getElementsByTagName("TD")[$(this).attr("data-index")];
						y = rows[i+1].getElementsByTagName("TD")[$(this).attr("data-index")];
						if ($(this).attr("data-index") === "1" || $(this).attr("data-index") === "4") {
							if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
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