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
	var database = firebase.database();

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
		items = JSON.parse(localStorage.getItem("items"));
		quantities = JSON.parse(localStorage.getItem("quantities"));

		database.ref().on("value", function(snapshot) {
			sv = snapshot.val();

			for (var i = 0; i < items.length; i++) {
				totalPrice += (parseFloat(sv[items[i]].price) * quantities[i]);
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
			n = 0;
			customersDB.ref().on("value", function(snapshot) {
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
		var name = $("#name-input").val().trim();
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
					var customerId = response.id;
					var dateTime = moment(response.created, "X").format("MMM DD, YYYY hh:mm:ss");
					// Push customer to database
					customersDB.ref().child(customerId).set({
						name: name,
						created: dateTime,
						email: email,
						phone: phone,
					});

					// Create charge
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
							// Push sale to database
							salesDB.ref().child(response.id).set({
								name: name,
								created: dateTime,
								description: response.description,
								amount: response.amount / 100,
								card: response.source.brand,
								zipCode: response.source.address_zip,
							});
							window.location = "paysuccess.html";
						},
						error: function(response) {
							console.log("error payment: ", response);
						}
					});

					// Empty cart
					localStorage.setItem("items", JSON.stringify([]));
					localStorage.setItem("quantities", JSON.stringify([]));
				},
				error: function(response) {
					console.log("error payment: ", response);
				}
			});
		} else {
			// Create charge
			$.ajax({
				type: "POST",
				url: "https://api.stripe.com/v1/charges",
				headers: {
					Authorization: "Bearer sk_test_WGpUaEkdiJuUYiXlaDEeow10"
				},
				data: {
					amount: totalPrice * 100,
					currency: "usd",
					source: token,
					description: "BakeSale2Go sale"
				},
				success: function(response) {
					var dateTime = moment(response.created, "X").format("MMM DD, YYYY hh:mm:ss");
					// Push sale to database
					salesDB.ref().child(response.id).set({
						name: name,
						created: dateTime,
						description: response.description,
						amount: response.amount / 100,
						card: response.source.brand,
						zipCode: response.source.address_zip,
					});
					window.location = "paysuccess.html";

					// Empty cart
					localStorage.setItem("items", JSON.stringify([]));
					localStorage.setItem("quantities", JSON.stringify([]));
				},
				error: function(response) {
					console.log("error payment: ", response);
				}
			});
		}
	}
});