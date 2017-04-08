$(document).ready(function($) {
	// Checkout
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

	function setOutcome(result) {
		var successElement = document.querySelector('.success');
		var errorElement = document.querySelector('.error');
		successElement.classList.remove('visible');
		errorElement.classList.remove('visible');

		if (result.token) {
			// Use the token to create a charge or a customer
			// https://stripe.com/docs/charges
			// successElement.querySelector('.token').textContent = result.token.id;
			token = result.token.id;
			$(".success").append($('<input type="hidden" name="stripeToken" />').val(token));
			// console.log(token);
			$(".success").append($('<input type="hidden" name="chargeAmount" />').val(totalPrice));
			successElement.classList.add('visible');
			payment();
			// document.getElementById("checkout-form").submit();
		} else if (result.error) {
			errorElement.textContent = result.error.message;
			errorElement.classList.add('visible');
		}
	}

	card.on('change', function(event) {
		setOutcome(event);
	});

	document.querySelector('form').addEventListener('submit', function(e) {
		e.preventDefault();
		form = document.querySelector('form');
		var extraDetails = {
			name: form.querySelector('input[name=cardholder-name]').value,
		};
		stripe.createToken(card, extraDetails).then(setOutcome);
	});

	// Payment
	function payment() {
		console.log("it works");
		console.log("token: " + token);

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
				description: 'Test charge with AJAX'
			},
			success: function(response) {
				console.log("successful payment: ", response);
				window.location = "paysuccess.html";
			},
			error: function(response) {
				console.log("error payment: ", response);
			}
		});
	}
});