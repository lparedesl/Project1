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

	// Get total price from cart
	function getTotalPrice() {
		totalPrice = 0;
		cartItems = JSON.parse(localStorage.getItem("items"));
		cartQuantities = JSON.parse(localStorage.getItem("quantities"));

		inventoryDB.ref().on("value", function(snapshot) {
			sv = snapshot.val();

			for (var i = 0; i < cartItems.length; i++) {
				totalPrice += (parseFloat(sv[cartItems[i]].price) * cartQuantities[i]);
			}

			$("#cart-total").text(totalPrice);
			$("#chargeAmount").text(totalPrice);
		});
	}
	getTotalPrice();

	// Show card input field on the page
	var stripe = Stripe('pk_test_zWFvhJOfoM9WR1AijVf0WcRb');
	var elements = stripe.elements();

	var card = elements.create('card', {
		style: {
			base: {
				iconColor: '#666EE8',
				color: '#31325F',
				lineHeight: '40px',
				fontWeight: 300,
				fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
				fontSize: '15px',

				'::placeholder': {
					color: '#CFD7E0',
				},
			},
		}
	});
	card.mount('#card-element');

	// Create token for payment
	document.querySelector('form').addEventListener('submit', function(e) {
		e.preventDefault();
		form = document.querySelector('form');
		var extraDetails = {
			name: form.querySelector('input[name=cardholder-name]').value,
		};
		stripe.createToken(card, extraDetails).then(setOutcome);
	});

	function setOutcome(result) {
		var successElement = document.querySelector('.success');
		var errorElement = document.querySelector('.error');
		successElement.classList.remove('visible');
		errorElement.classList.remove('visible');

		if (result.token) {
			token = result.token.id;
			$(".success").append($('<input type="hidden" name="stripeToken" />').val(token));
			$(".success").append($('<input type="hidden" name="chargeAmount" />').val(totalPrice));
			successElement.classList.add('visible');
			// Check if customer exists
			var email = $("#email-input").val().trim();
			var n = 0;
			customersDB.ref().once("value", function(snapshot) {
				if (n === 0) {
					customerExists = false;
					var sv = snapshot.val();
					if (sv !== null) {
						keys = Object.keys(sv);
						for (var i = 0; i < keys.length; i++) {
							if (sv[keys[i]].email === email) {
								customerExists = true;
								break;
							}
						}
					}
					n++;
					payment();
				}
			});
		} else if (result.error) {
			errorElement.textContent = result.error.message;
			errorElement.classList.add('visible');
		}
	}

	card.on('change', function(event) {
		setOutcome(event);
	});

	// Payment
	function payment() {
		name = $("#name-input").val().trim();
		var email = $("#email-input").val().trim();
		var phone = $("#phone-input").val().trim();

		if (customerExists === false) {
			// Create customer
			$.ajax({
				type: "POST",
				url: "https://api.stripe.com/v1/customers",
				headers: {
					Authorization: "Bearer sk_test_WGpUaEkdiJuUYiXlaDEeow10"
				},
				data: {
					description: "Customer for " + email,
					email: email,
					source: token,
				},
				success: function(response) {
					customerId = response.id;
					var dateTime = moment(response.created, "X").format("MMM DD, YYYY hh:mm:ss");
					// Push customer to database
					customersDB.ref().child(customerId).set({
						name: name,
						created: dateTime,
						email: email,
						phone: phone,
					});

					createCharge();
				},
				error: function(response) {
					console.log("error payment: ", response);
				}
			});
		} else {
			// Get the customer id
			customersDB.ref().on("child_added", function(snapshot) {
				var sv = snapshot.val();
				if (sv.email === email) {
					customerId = snapshot.key;

					// Create new card for customer
					$.ajax({
						type: "POST",
						url: "https://api.stripe.com/v1/customers/" + customerId + "/sources",
						headers: {
							Authorization: "Bearer sk_test_WGpUaEkdiJuUYiXlaDEeow10"
						},
						data: {
							source: token,
						},
						success: function(response) {
							cardId = response.id;

							// Check if new card exists in customer profile
							$.ajax({
								type: "GET",
								url: "https://api.stripe.com/v1/customers/" + customerId,
								headers: {
									Authorization: "Bearer sk_test_WGpUaEkdiJuUYiXlaDEeow10"
								},
								success: function(response) {
									var lastCardIndex = response.sources.data.length - 1;
									for (var i = 0; i < lastCardIndex; i++) {
										var expMonth = response.sources.data[i].exp_month;
										var expYear = response.sources.data[i].exp_year;
										var last4 = response.sources.data[i].last4;

										if (expMonth === response.sources.data[lastCardIndex].exp_month && expYear === response.sources.data[lastCardIndex].exp_year && last4 === response.sources.data[lastCardIndex].last4) {
											// Delete created card
											$.ajax({
												type: "DELETE",
												url: "https://api.stripe.com/v1/customers/" + customerId + "/sources/" + cardId,
												headers: {
													Authorization: "Bearer sk_test_WGpUaEkdiJuUYiXlaDEeow10"
												},
												success: function(response) {
													createCharge();
												},
											});
											break;
										} else {
											createCharge();
										}
									}
								},
							});
						},
					});
				}
			});
		}
	}

	function createCharge() {
		$.ajax({
			type: "POST",
			url: "https://api.stripe.com/v1/charges",
			headers: {
				Authorization: "Bearer sk_test_WGpUaEkdiJuUYiXlaDEeow10"
			},
			data: {
				amount: totalPrice * 100,
				currency: "usd",
				customer: customerId,
				description: "BakeSale2Go sale"
			},
			success: function(response) {
				var dateTime = moment(response.created, "X").format("MMM DD, YYYY hh:mm:ss");
				salesDB.ref().once("value", function(snapshot) {
					var orderNumber = snapshot.numChildren() + 1;
					if (orderNumber < 10) {
						orderNumber = "000" + String(orderNumber);
					} else if (orderNumber < 100) {
						orderNumber = "00" + String(orderNumber);
					} else if (orderNumber < 1000) {
						orderNumber = "0" + String(orderNumber);
					}

					// Push sale to database
					salesDB.ref().child(response.id).set({
						orderNumber: orderNumber,
						name: name,
						created: dateTime,
						description: response.description,
						amount: response.amount / 100,
						card: response.source.brand,
						last4: response.source.last4,
						status: "Open",
					});

					// Update inventory
					inventoryDB.ref().on("child_added", function(snapshot) {
						var sv = snapshot.val();
						var key = snapshot.key;
						if (cartItems.indexOf(key) !== -1) {
							var index = cartItems.indexOf(key);
							var newCartQty = sv.quantity - cartQuantities[index];
							inventoryDB.ref("/" + key).update({
								quantity: newCartQty,
							});
						}
					});

					window.location = "paysuccess.html";

					// Empty cart
					localStorage.setItem("items", JSON.stringify([]));
					localStorage.setItem("quantities", JSON.stringify([]));
				});
			},
			error: function(response) {
				console.log("error payment: ", response);
			}
		});
	}
});