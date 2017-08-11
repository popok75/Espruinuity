



function start (){


	var i1=true;
	var i2=true;
	var i3=true;
	var i4=true;

	var t1=function(){
		print("connected 1 " );
		i1=false;
	};
	var t2=function(){
		print("connected 2 " );
		i2=false;
	};

	var t3=function(){
		print("connected 3 " );
//		i3=false;
	};
	var t4=function(){
		print("connected 4 " );
		i4=false;
	};  



	var wifi=require("Wifi");
	wifi.on("connected",function(){
		if(i1) {t1();if(!i1) t1="";}
	});
	wifi.on("connected",function(){
		if(i2) {t2();if(!i2) t2="";}
	});
	wifi.on("connected",function(){
		if(i3) {t3();if(!i3) t3="";}
	});
	wifi.on("connected",function(){
		if(i4) {t4();if(!i4) t4="";}
	});

}
E.on("init",start);
save();