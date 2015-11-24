$(document).ready(function(){

	console.log("hello");

	$("form").on('submit', function(event){

		event.preventDefault();
		var query = $(".gif-query").val();

		if(query){

			$.ajax({
				"url":"http://localhost:3000/gifit",
				"method": "POST",
				"data":{"query":query}
			})
			.done(function(resp){
				console.log(resp)
			})
			.error(function(err){
				console.log(err)
			})

		} else {
			console.log("no text detected")
		}

	})

})