$(document).ready(function(){
	var shuff = function(){
		$(".img-container").animate(
			{"margin-left":"-489px"},1000,"linear",function(){
				$(this).animate({"margin-left":"-489px"},2000,"linear",function(){
					$(this).animate({"margin-left":"-1467px"},1000,"linear",function(){
						$(this).animate({"margin-left":"-1467px"},2000,"linear",function(){
							$(this).animate({"margin-left":"-2445px"},1000,"linear",function(){
								$(this).animate({"margin-left":"-2445px"},2000,"linear",function(){shuff()});
							});
						});
					});
				});	
			}
		);
	}
	shuff();
});