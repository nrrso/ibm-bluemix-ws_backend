// var substringMatcher = function(strs) {
// return function findMatches(q, cb) {
// var matches, substringRegex;
 
// // an array that will be populated with substring matches
// matches = [];
 
// // regex used to determine if a string contains the substring `q`
// substrRegex = new RegExp(q, 'i');
 
// // iterate through the pool of strings and for any string that
// // contains the substring `q`, add it to the `matches` array
// $.each(strs, function(i, str) {
// if (substrRegex.test(str)) {
// matches.push(str);
// }
// });
 
// cb(matches);
// };
// };
 
// var src = ['sandy_carter','BarackObama']; 

// $("#hase #textinput").typeahead({
// 	minLength: 1,
// 	highlight: true,
// 	hint: false
// },{
// 	name: "twitter-accounts",
// 	source: substringMatcher(src)
// });

function reportError(txt){
	$.notify({
		message: "Analyse ist fehlgeschlagen!"
	},{
		type: "danger",
		delay: 1500
	});	
	
}

function showReport(term,data,isJSON){
	var out = "";
	var details = "";
	var c = 0;
	var theFive = [];
	//console.log(data);
	$(".report").show('slow');
	
	$('.pi-val').each(function(){
		var n = Math.floor(data[c].percentage * 100);
		theFive.push(n);
		$(this).radialIndicator({
			initValue: n,
			barWidth: 15,
			percentage: true
		});
		c++;
	});
	//console.log(theFive);
	if(theFive[0] > 45 && theFive[2] < 15){
		$('.five-details h1').html('Persönlichkeits-Typ <span>A</span>');
	} 
	if(theFive[0] < 45 && theFive[2] > 15){
		$('.five-details h1').html('Persönlichkeits-Typ <span>C</span>');
	} 
	if(theFive[0] > 45 && theFive[2] > 15){
		$('.five-details h1').html('Persönlichkeits-Typ <span>B</span>');
	} else {
		$('.five-details h1').html('Persönlichkeits-Typ <span>D</span>');
	}

	for (var i = 0; i < data.length; i++) {
		details += "<div><h4>"+data[i].name+" - "+Math.floor(data[i].percentage * 100)+"%</h4><ul>"
		for (var j = 0; j < data[i].children.length; j++) {
			var obj = data[i].children[j];
			details += "<li>"+obj.name+" - "+Math.floor(obj.percentage * 100)+"%</li>"
		};
		details += "</ul></div><hr />";
	};
	$('.five-details').append(details);
	
	//"<h2>Hier ist das Ergebnis:</h2><br>"+tweets+
	$("#content").html(out);
	$("body").scrollTop();
}

function getProfile(term) {
	if (term != "") {
		$.notify({
			message: "Analysiere Text..."
		},{
			type: "info",
			delay: 1500
		});
	   	$.ajax({
			url: "/api/analyze",
			type: 'GET',
			contentType:'application/json',
			data: {
				text: term
			},
	  		success: function(data) {
			try {
					data = data[0].children[0].children; // get Big Five only
					// console.log(data);
					showReport("your Text",data,false);
					$.notify({
						message: "Erfolgreich"
					},{
						type: "success",
						delay: 1000
					});
				} catch(err) {
					reportError(err);
					//console.log(err);
				}},
			error: function(xhr, textStatus, thrownError) {
				reportError(textStatus);
				console.log("Error1: " + xhr);
				console.log("Error2.2: " + thrownError);
				console.log("Error3: " + textStatus);
			}
		});
	}
}
