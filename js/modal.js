Modal = {
	msg: function(text) {
		var popup = $("<div class='container-popup'>");
		var popupDialog = $("<div class='popup'>");
		var popupContent = $("<p>" + text + "</p>");

		popup.append(popupDialog);
		popupDialog.append(popupContent);

		popup.click(function() { $(this).remove(); });

		$(".app").append(popup);
	},

	yesNo: function(text, callback) {
		var popup = $("<div class='container-popup'>");
		var popupDialog = $("<div class='popup'>");
		var popupContent = $("<p>" + text + "</p>");
		
		var buttons = $("<p class='modal-buttons'>");

		var yesButton = $("<div class='button button-text'>YES</div>");
		yesButton.click(function() {
			popup.remove();
			callback('yes');
		});

		var noButton = $("<div class='button button-text'>NO</div>");
		noButton.click(function() {
			popup.remove();
			callback('no');
		});

		buttons.append(yesButton);
		buttons.append(noButton);

		popup.append(popupDialog);
		popupDialog.append(popupContent);
		popupDialog.append(buttons);

		popup.click(function() {
			popup.remove();
			callback('no');
		});

		$(".app").append(popup);
	},
};