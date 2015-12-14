$(document).ready(function(){

	var searchGiphy = false;

	var searchApi = 'bing';

	$("body").on('click','#searchGiphy', function(event){
		event.preventDefault();
		searchGiphy = !searchGiphy;
		console.log(searchApi, searchGiphy);
	})

	$("body").on('click', '#searchFlickr', function(event){
		event.preventDefault();
		searchApi = 'flickr';	
		searchGiphy = false;
		console.log(searchApi, searchGiphy);	
	})

	$("body").on('click', '#searchBing', function(event){
		event.preventDefault();
		searchApi = 'bing';
		searchGiphy = false;
		console.log(searchApi, searchGiphy);
	})

	$("form").on('submit', function(event){

		event.preventDefault();
		var query = $(".gif-query").val();
		query = query.trim(); //remove whitespace

		if(!query){
			console.log("no query");
			return;
		}

		if(!searchGiphy){

			$.ajax({
				"url":"http://localhost:3000/imgtogif",
				"method": "POST",
				"data":{"query":query, "searchApi":searchApi}
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