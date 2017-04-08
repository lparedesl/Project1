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

	// Add item to page
	database.ref().on("child_added", function(snapshot) {
		var child = snapshot.val();
		var key = snapshot.key;
		var name = child.name.capitalizeFirstLetter();
	  	var description = child.description.capitalizeFirstLetter();
	  	var price = child.price;
	  	var img = "assets/images/" + child.imgName;

	  	// Create row
	  	if (n % 3 === 0) {
	  		var row = $("<div>");
	  		row.addClass("row");
	  		row.attr("data-index", m);
	  		$(".products-content").append(row);
	  	}

	  	var itemPrice = $("<div>");
	  	itemPrice.addClass("price pull-left");
	  	itemPrice.text("$" + price);

	  	var addToCart = $("<button>");
	  	addToCart.addClass("btn btn-primary pull-right");
	  	addToCart.attr("type", "button");
	  	addToCart.attr("id", "add-to-cart");
	  	addToCart.attr("data-key", key);
	  	addToCart.text("Add to cart");

	  	var buyContent = $("<div>");
	  	buyContent.addClass("clearfix");
	  	buyContent.append(itemPrice);
	  	buyContent.append(addToCart);

	  	var caption = $("<div>");
	  	caption.addClass("caption");
	  	caption.html("<h3>" + name + "</h3><p class=\"description\">" + description + "</p>");
	  	caption.append(buyContent);

	  	var itemImg = $("<img>");
	  	itemImg.attr("src", img);
	  	itemImg.attr("alt", name);

	  	var itemCard = $("<div>");
	  	itemCard.addClass("thumbnail");
	  	itemCard.append(itemImg);
	  	itemCard.append(caption);

	  	var item = $("<div>");
	  	item.addClass("col-sm-6 col-md-4");
	  	item.append(itemCard);

	  	$(".row[data-index=" + m + "]").append(item);

	  	if (n % 3 === 2) {
	  		m++;
	  	}

	  	n++;
	}, function(errorObject) {
		console.log("Errors handled: " + errorObject.code);
	});

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