$(document).ready(function(){

	console.log("hello");

	var searchGiphy = false;

	$("#check").on('click', function(event){
		if($(this).is(":checked")){
			searchGiphy = true;
		} else {
			searchGiphy = false;
		}
		console.log(searchGiphy)
	})

	$("form").on('submit', function(event){

		event.preventDefault();
		var query = $(".gif-query").val();
		query = $.trim(query); //remove whitespace

		if(!query){
			console.log("no query");
			return;
		}

		if(!searchGiphy){

			$.ajax({
				"url":"http://localhost:3000/imgtogif",
				"method": "POST",
				"data":{"query":query}
			})
			.done(function(resp){
				console.log("GOT GIF FROM IMGS")
				console.log(resp)
			})
			.error(function(err){
				console.log(err)
			})

		} else {
			$.ajax({
				"url":"http://localhost:3000/giftogif",
				"method": "POST",
				"data":{"query":query}
			})
			.done(function(resp){
				console.log("GOT GIF FROM GIFS")
				console.log(resp)
			})
			.error(function(err){
				console.log(err)
			})
		}

	})

})