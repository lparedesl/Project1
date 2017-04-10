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

	String.prototype.capitalizeFirstLetter = function() {
	    return this.charAt(0).toUpperCase() + this.slice(1);
	};

	$("#btn-login").click(function(event) {
		$("#login-window").removeClass("hidden");
		$(".update-bg").removeClass("hidden");
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

	$("#close-login").click(function() {
		$(".update-bg").addClass("hidden");
		$("#login-window").addClass("hidden");
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

	// Add item to page
	// database.ref().on("child_added", function(snapshot) {
	// 	var child = snapshot.val();
	// 	var key = snapshot.key;
	// 	var name = child.name.capitalizeFirstLetter();
	//   	var description = child.description.capitalizeFirstLetter();
	//   	var price = child.price;
	//   	var img = "assets/images/" + child.imgName;

	//   	// Create row
	//   	if (n % 3 === 0) {
	//   		var row = $("<div>");
	//   		row.addClass("row");
	//   		row.attr("data-index", m);
	//   		$(".products-content").append(row);
	//   	}

	//   	var itemPrice = $("<div>");
	//   	itemPrice.addClass("price pull-left");
	//   	itemPrice.text("$" + price);

	//   	var addToCart = $("<button>");
	//   	addToCart.addClass("btn btn-primary pull-right");
	//   	addToCart.attr("type", "button");
	//   	addToCart.attr("id", "add-to-cart");
	//   	addToCart.attr("data-key", key);
	//   	addToCart.text("Add to cart");

	//   	var buyContent = $("<div>");
	//   	buyContent.addClass("clearfix");
	//   	buyContent.append(itemPrice);
	//   	buyContent.append(addToCart);

	//   	var caption = $("<div>");
	//   	caption.addClass("caption");
	//   	caption.html("<h3>" + name + "</h3><p class=\"description\">" + description + "</p>");
	//   	caption.append(buyContent);

	//   	var itemImg = $("<img>");
	//   	itemImg.attr("src", img);
	//   	itemImg.attr("alt", name);

	//   	var itemCard = $("<div>");
	//   	itemCard.addClass("thumbnail");
	//   	itemCard.append(itemImg);
	//   	itemCard.append(caption);

	//   	var item = $("<div>");
	//   	item.addClass("col-sm-6 col-md-4");
	//   	item.append(itemCard);

	//   	$(".row[data-index=" + m + "]").append(item);

	//   	if (n % 3 === 2) {
	//   		m++;
	//   	}

	//   	n++;
	// }, function(errorObject) {
	// 	console.log("Errors handled: " + errorObject.code);
	// });

	function showCart() {
		$("#cart-items").empty();

		itemsList = JSON.parse(localStorage.getItem("items"));
		quantitiesList = JSON.parse(localStorage.getItem("quantities"));

		if (!Array.isArray(itemsList)) {
			itemsList = [];
		}

		if (!Array.isArray(quantitiesList)) {
			quantitiesList = [];
		}

		if (itemsList.length > 0) {
			$(".cart").removeClass("hidden");
		} else {
			$(".cart").addClass("hidden");
		}

		database.ref().on("value", function(snapshot) {
			sv = snapshot.val();

			for (var i = 0; i < itemsList.length; i++) {
				var name = $("<p>").text(sv[itemsList[i]].name);
				var price = $("<p>").text("$" + (parseFloat(sv[itemsList[i]].price) * parseInt(quantitiesList[i])));
				var quantity = $("<select>");
				quantity.addClass("form-control");
				quantity.attr("data-index", i);
				for (var j = 0; j < 10; j++) {
					var option = $("<option>");
					option.attr("value", j+1);
					if (j+1 === parseInt(quantitiesList[i])) {
						option.attr("selected", "selected");
					}
					option.text(j+1);
					quantity.append(option);
				}
				var b = $("<button class='btn btn-default delete'>").text("Remove").attr("data-index", i);
				totalPrice += (parseFloat(sv[itemsList[i]].price) * parseInt(quantitiesList[i]));
	        	name.append(price);
	        	name.append(quantity);
	        	name.append(b);
				$("#cart-items").append(name);
				$("#total-price").text("Total: $" + totalPrice);
			}
		});
	}

	showCart();

	// Add item to cart
	$(document).on("click", "#add-to-cart", function() {
		event.preventDefault();
		var items = JSON.parse(localStorage.getItem("items"));
		if (!Array.isArray(items)) {
			items = [];
		}
		totalPrice = 0;
		var quantities = JSON.parse(localStorage.getItem("quantities"));

		// If item is not in cart
		if (items.indexOf($(this).attr("data-key")) === -1) {
			var itemKey = $(this).attr("data-key");
			var quantity = 1;
			itemsList.push(itemKey);
			quantitiesList.push(quantity);
			localStorage.setItem("items", JSON.stringify(itemsList));
			localStorage.setItem("quantities", JSON.stringify(quantitiesList));
			showCart();

		// If item is in the cart
		} else {
			var itemIndex = items.indexOf($(this).attr("data-key"));
			var newQuantity = parseInt(quantities[itemIndex]);
			newQuantity++;
			quantities[itemIndex] = newQuantity;
			localStorage.setItem("quantities", JSON.stringify(quantities));
			showCart();
		}
	});

	// Update item quantity
	$(document).on("change", "select", function() {
		totalPrice = 0;
		var itemIndex = $(this).attr("data-index");
		var quantities = JSON.parse(localStorage.getItem("quantities"));
		var newQuantity = parseInt($(this).val());
		quantities[itemIndex] = newQuantity;
		localStorage.setItem("quantities", JSON.stringify(quantities));
		showCart();
	});

	// Remove item from cart
	$(document).on("click", "button.delete", function() {
		var items = JSON.parse(localStorage.getItem("items"));
		var quantities = JSON.parse(localStorage.getItem("quantities"));
		var currentIndex = $(this).attr("data-index");

		items.splice(currentIndex, 1);
		quantities.splice(currentIndex, 1);

		localStorage.setItem("items", JSON.stringify(items));
		localStorage.setItem("quantities", JSON.stringify(quantities));

		$(this).parent().remove();

		totalPrice = 0;
		showCart();
	});
});