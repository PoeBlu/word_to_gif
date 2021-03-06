$(document).ready(function(){

	var searchGiphy = false;

	var searchApi = 'bing';

	var loading = $(".loading")
	var bing = $("#searchBing");
	var giphy = $("#searchGiphy");
	var flickr = $("#searchFlickr")

	var maxQueryAllowed = 7;

	$(".examples").typed({
		strings: ["donald-trump eats giraffe^300","clinton cycles through wormhole^300","steve-martin loves burger^300","justin-bieber slaps pizza^300","think funny thoughts^300","donkey walks through fire rainbow^300"],
		showCursor: false,
		loop: true,
		typeSpeed:5,
		backSpeed:0
	})

	$('#query').focus();

	$("body").on('click','#searchGiphy', function(event){
		event.preventDefault();
		searchGiphy = !searchGiphy;
		//console.log(searchApi, searchGiphy);
		giphy.addClass('selected');
		bing.removeClass('selected');
		flickr.removeClass('selected');
	})

	$("body").on('focus',"#query", function(event){
		//$(".examples").hide();
	})

	$("body").on('click', '#searchFlickr', function(event){
		event.preventDefault();
		searchApi = 'flickr';	
		searchGiphy = false;
		//console.log(searchApi, searchGiphy);	
		giphy.removeClass('selected');
		bing.removeClass('selected');
		flickr.addClass('selected');
	})

	$("body").on('click', '#searchBing', function(event){
		event.preventDefault();
		searchApi = 'bing';
		searchGiphy = false;
		//console.log(searchApi, searchGiphy);
		giphy.removeClass('selected');
		bing.addClass('selected');
		flickr.removeClass('selected');
	})

	$("#query").on('keyup', function(){
		// ensure only 5 words can be typed in
		var words = this.value.match(/\S+/g);

		if(words == null){
			return
		}

		if(words.length>maxQueryAllowed){
			var trimmed = $(this).val().split(/\s+/,maxQueryAllowed).join(" ")
			$(this).val(trimmed + " ")
		}
	})

	$("#gifit").on('submit', function(event){

		event.preventDefault();
		var query = $(".gif-query").val();
		query = query.toLowerCase().trim(); //remove whitespace

		if(!query){
			//console.log("no query");
			return;
		}

		// ensure only max 6 words are sent
		query = query.split(" ")
		if(query.length > maxQueryAllowed){
			query = query.slice(0,maxQueryAllowed)
		} else if(query.length == 1){
			alert("A one word GIF is just a normal image. Give me more than one word.");
			return;
		}

		query = query.join(" ");

		$(".examples").hide();
		$(".explain").hide();
		loading.show();

		if(!searchGiphy){

			$.ajax({
				"url":"/imgtogif",
				"method": "POST",
				"data":{"query":query, "searchApi":searchApi}
			})
			.done(function(resp){
				//console.log("GOT GIF FROM IMGS")
				//console.log(resp)
				loading.hide();
				if(resp!='no'){
					showGif(resp)
				} else {
					alertUser();
				}
				
			})
			.error(function(err){
				//console.log(err)
				loading.hide();
				alert("Oops there was an error, try again!")
			})

		} else {
			$.ajax({
				"url":"/giftogif",
				"method": "POST",
				"data":{"query":query}
			})
			.done(function(resp){
				console.log("GOT GIF FROM GIFS")
				//console.log(resp)
				loading.hide();
				if(resp!='no'){
					showGif(resp)
				}else{
					alertUser();
				}
			})
			.error(function(err){
				//console.log(err)
				loading.hide();
				alert("Oops there was an error, try again")
			})
		}

	})

	function alertUser(){
		alert("Looks like there was an issue. Try different words")
	}

	function showGif(resp){
		//console.log(resp);
		$(".result").show();
		$("#newgif").attr('src',resp);
		$("#newgifurl").attr('href',resp);
		$("#newgifurl").html(resp)
		
	}


})