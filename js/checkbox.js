var CheckBox = {
	init: function() {
		$(".check-icon").click(CheckBox._checkChange);
		$(".uncheck-icon").click(CheckBox._checkChange);
	},

	updateCheckState: function(checkId, state) {
		var check = $(checkId);
		check.attr('data-checked', state);
		CheckBox._updateCheckView(check);	
	},

	_checkChange: function(e) {
		var $this = $(this);

		var parent = $this.parent();
		
		if (parent.attr("data-checked") == "false") {
			parent.attr("data-checked", "true");
		} else {
			parent.attr("data-checked", "false");
		}

		CheckBox._updateCheckView(parent);

		parent.trigger("check-change");
	},

	_updateCheckView: function(check) {
		var checkIcon = check.find(".check-icon");
		var uncheckIcon = check.find(".uncheck-icon");

		if (check.attr("data-checked") == "true") {
			checkIcon.show();
			uncheckIcon.hide();
		} else {
			uncheckIcon.show();
			checkIcon.hide();
		}
	}	
}