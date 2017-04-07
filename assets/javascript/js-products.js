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
	// var items = [];
	var quantities = [];

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

	function putOnPage() {
		$("#cart-items").empty(); // empties out the html

		itemsList = JSON.parse(localStorage.getItem("items"));
		quantitiesList = JSON.parse(localStorage.getItem("quantities"));

		if (!Array.isArray(itemsList)) {
			itemsList = [];
		}

		if (!Array.isArray(quantitiesList)) {
			quantitiesList = [];
		}

		database.ref().on("value", function(snapshot) {
			sv = snapshot.val();

			for (var i = 0; i < itemsList.length; i++) {
				var name = $("<p>").text(sv[itemsList[i]].name);
				var price = $("<p>").text("$" + sv[itemsList[i]].price);
				var quantity = $("<p>").text(quantitiesList[i]);
				var b = $("<button class='delete'>").text("x").attr("data-index", i);
	        	name.append(price);
	        	name.append(quantity);
	        	name.append(b);
				$("#cart-items").append(name);
			}
		});
	}

	putOnPage();

	$(document).on("click", "button.delete", function() {
		var items = JSON.parse(localStorage.getItem("items"));
		var quantities = JSON.parse(localStorage.getItem("quantities"));
		var currentIndex = $(this).attr("data-index");

		items.splice(currentIndex, 1);
		itemsList = items;

		quantities.splice(currentIndex, 1);
		quantitiesList = quantities;

		localStorage.setItem("items", JSON.stringify(items));
		localStorage.setItem("quantities", JSON.stringify(quantities));

		$(this).parent().remove();
	});

	$(document).on("click", "#add-to-cart", function() {
		event.preventDefault();
		var items = JSON.parse(localStorage.getItem("items"));
		if (!Array.isArray(items)) {
			items = [];
		}
		var quantities = JSON.parse(localStorage.getItem("quantities"));
		if (items.indexOf($(this).attr("data-key")) === -1) {
			var val = $(this).attr("data-key");
			var val2 = 1;
			itemsList.push(val);
			quantitiesList.push(val2);
			localStorage.setItem("items", JSON.stringify(itemsList));
			localStorage.setItem("quantities", JSON.stringify(quantitiesList));
			putOnPage();
		} else {
			var itemIndex = items.indexOf($(this).attr("data-key"));
			var newQuantity = parseInt(quantities[itemIndex]);
			newQuantity++;
			quantities[itemIndex] = newQuantity;
			quantitiesList = quantities;
			localStorage.setItem("quantities", JSON.stringify(quantities));
			putOnPage();
		}
	});
});