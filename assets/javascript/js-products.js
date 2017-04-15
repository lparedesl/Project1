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
	var cartBackup = [];

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
	        for (var i = 0; i < cartQuantities.length; i++) {
	            totalQty += cartQuantities[i];
	        }
	    }
	    $("#cart-total-qty").text(totalQty);
	}
	getTotalQty();

	// Add item to page
	database.ref().on("child_added", function(snapshot) {
		var child = snapshot.val();
		var key = snapshot.key;
		var name = child.name.capitalizeFirstLetter();
	  	var description = child.description.capitalizeFirstLetter();
	  	var price = child.price;
	  	var img = "assets/images/" + child.imgName;

	  	var itemPrice = $("<div>")
	  	.addClass("price pull-left")
	  	.text("$" + price);

	  	var addToCart = $("<button>")
	  	.attr("type", "button")
	  	.attr("id", "add-to-cart")
	  	.attr("data-key", key);
	  	if (child.quantity > 0) {
	  		addToCart.addClass("btn btn-primary pull-right")
	  		.text("Add to cart");
	  	} else {
	  		addToCart.addClass("btn btn-danger disabled pull-right")
	  		.text("Out of stock");
	  	}

	  	var buyContent = $("<div>")
	  	.addClass("clearfix")
	  	.append(itemPrice)
	  	.append(addToCart);

	  	var caption = $("<div>")
	  	.addClass("caption")
	  	.html("<h3>" + name + "</h3><p class=\"description\">" + description + "</p>")
	  	.append(buyContent);

	  	var itemImg = $("<img>")
	  	.attr("src", img)
	  	.attr("alt", name);

	  	var itemCard = $("<div>")
	  	.addClass("thumbnail")
	  	.append(itemImg)
	  	.append(caption);

	  	var item = $("<div>")
	  	// item.addClass("col-sm-6 col-md-4");
	  	.addClass("col-xs-12 col-sm-6 col-md-4")
	  	.append(itemCard);

	  	$(".products-content .row").append(item);

	  	n++;
	}, function(errorObject) {
		console.log("Errors handled: " + errorObject.code);
	});

	function showCart() {
		$("#cart-items").empty();

		items = JSON.parse(localStorage.getItem("items"));
		quantities = JSON.parse(localStorage.getItem("quantities"));

		if (!Array.isArray(items)) {
			items = [];
		}

		if (!Array.isArray(quantities)) {
			quantities = [];
		}

		if (items.length > 0) {
			$(".cart").removeClass("hidden");
		} else {
			$(".cart").addClass("hidden");
		}

		database.ref().on("value", function(snapshot) {
			if (items !== cartBackup) {
				sv = snapshot.val();

				for (var i = 0; i < items.length; i++) {
					var name = $("<p>")
					.addClass("cart-item-name")
					.text(sv[items[i]].name);
					var remove = $("<a>")
					.addClass("delete")
					.attr("data-index", i)
					.text("Remove");

					var colName = $("<div>")
					.addClass("col-md-6 col-sm-4")
					.append(name, remove);

					var quantity = $("<select>")
					.addClass("form-control")
					.attr("data-index", i);
					for (var j = 0; j < 10; j++) {
						var option = $("<option>")
						.attr("value", j+1);
						if (j+1 === parseInt(quantities[i])) {
							option.attr("selected", "selected");
						}
						option.text(j+1);
						quantity.append(option);
					}

					var colQty = $("<div>")
					.addClass("col-md-4 col-sm-4")
					.append(quantity);

					var price = $("<p>")
					.addClass("cart-item-price")
					.text("$" + (parseFloat(sv[items[i]].price) * parseInt(quantities[i])));

					var colPrice = $("<div>")
					.addClass("col-md-2 col-sm-4")
					.append(price);

					var item = $("<div>")
					.addClass("row")
					.attr("id", "item-" + i)
					.append(colName, colQty, colPrice);

					totalPrice += (parseFloat(sv[items[i]].price) * parseInt(quantities[i]));

					getTotalQty();

					$("#cart-items").append(item);
					$("#total-price").text("Total: $" + totalPrice);

					cartBackup = items;
				}
			}
		});
	}

	showCart();

	// Add item to cart
	$(document).on("click", "#add-to-cart", function() {
		event.preventDefault();
		if ($(this).text() === "Add to cart") {
			var self = $(this);

			database.ref().once("value", function(snapshot) {
				var sv = snapshot.val();
				var keys = Object.keys(sv);
				var items = JSON.parse(localStorage.getItem("items"));
				if (!Array.isArray(items)) {
					items = [];
				}
				totalPrice = 0;
				var quantities = JSON.parse(localStorage.getItem("quantities"));
				if (!Array.isArray(quantities)) {
					quantities = [];
				}
				var itemIndex = items.indexOf(self.attr("data-key"));
				var thisKey = items[itemIndex];

				// If item is not in cart
				if (items.indexOf(self.attr("data-key")) === -1) {
					var itemKey = self.attr("data-key");
					var quantity = 1;
					items.push(itemKey);
					quantities.push(quantity);
					localStorage.setItem("items", JSON.stringify(items));
					localStorage.setItem("quantities", JSON.stringify(quantities));

				// If item is in the cart
				} else {
					var newQuantity = parseInt(quantities[itemIndex]);
					newQuantity++;
					// If inventory is less than new quantity, set value to max and show alert
					if (sv[thisKey].quantity < newQuantity) {
						newQuantity = sv[thisKey].quantity;
						var txt = $("<p>")
						.attr("data-index", itemIndex)
						.text(sv[thisKey].name + "s " + "currently in stock: " + sv[thisKey].quantity);
						$("#quantity-alert").append(txt);
						$("#quantity-alert").removeClass("hidden");
					} else {
						var numOfAlerts = $("#quantity-alert").children().length;
						if (numOfAlerts === 1) {
							$("#quantity-alert").addClass("hidden");
						}
						$("#quantity-alert").children("p[data-index=\"" + itemIndex + "\"]").remove();
					}
					quantities[itemIndex] = newQuantity;
					localStorage.setItem("quantities", JSON.stringify(quantities));
				}
				showCart();
			});
		}
	});

	// Update item quantity
	$(document).on("change", "select", function() {
		var self = $(this);
		database.ref().on("value", function(snapshot) {
			var sv = snapshot.val();
			var keys = Object.keys(sv);
			var itemIndex = self.attr("data-index");
			var items = JSON.parse(localStorage.getItem("items"));
			var thisKey = items[itemIndex];
			var quantities = JSON.parse(localStorage.getItem("quantities"));

			// If inventory is less than quantity selected, set value to max and show alert
			if (sv[thisKey].quantity < parseInt(self.val())) {
				self.val(sv[thisKey].quantity);
				var txt = $("<p>")
				.attr("data-index", itemIndex)
				.text(sv[thisKey].name + "s " + "currently in stock: " + sv[thisKey].quantity);
				$("#quantity-alert").append(txt);
				$("#quantity-alert").removeClass("hidden");
			} else {
				var numOfAlerts = $("#quantity-alert").children().length;
				if (numOfAlerts === 1) {
					$("#quantity-alert").addClass("hidden");
				}
				$("#quantity-alert").children("p[data-index=\"" + itemIndex + "\"]").remove();
			}

			var newQuantity = parseInt(self.val());
			totalPrice = 0;
			quantities[itemIndex] = newQuantity;
			localStorage.setItem("quantities", JSON.stringify(quantities));
			showCart();
		});
	});

	// Remove item from cart
	$(document).on("click", ".delete", function() {
		var items = JSON.parse(localStorage.getItem("items"));
		var quantities = JSON.parse(localStorage.getItem("quantities"));
		var currentIndex = $(this).attr("data-index");

		items.splice(currentIndex, 1);
		quantities.splice(currentIndex, 1);

		localStorage.setItem("items", JSON.stringify(items));
		localStorage.setItem("quantities", JSON.stringify(quantities));

		$("#item-" + $(this).attr("data-index")).remove();

		totalPrice = 0;

		if (quantities.length === 0) {
			localStorage.removeItem("items");
			localStorage.removeItem("quantities");
			totalQty = 0;
			$("#cart-total-qty").text(totalQty);
		}
		showCart();
	});
});