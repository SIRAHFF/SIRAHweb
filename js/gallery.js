$(document).ready(function() {

	$(`[unique-script-id="w-w-dm-id"] .btn-box`).click(function() {
			$(this).parent().children(".overlay").show();
	});


	$(`[unique-script-id="w-w-dm-id"] .close`).click(function() {
			$(`[unique-script-id="w-w-dm-id"] .overlay`).hide();
	});
});
