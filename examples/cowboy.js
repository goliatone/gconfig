var config = new GConfig({
	data:{
		app:{
			cowboy:true
		}
	}
});

console.log(config.get('cowboy'));