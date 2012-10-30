function IndexToX(index){
	if(index == 0) return 0;
	else return Math.round(index%8);
}
function IndexToY(index){
	if(index == 0) return 0;
	else return parseInt(index/8); 
}
function CoordToIndex(x,y){
	return y * 8 + x ;
}
function getItemIndex(index,ditection,step){
	var curX = IndexToX(index);
	var curY = IndexToY(index);
	var nextX,nextY;
	if(typeof step == 'undefined' || step == 0){
		step = 1;
	}
	switch(ditection){
		case 0: 
			nextX = curX - step;
			nextY = curY; 
			break;
		case 1: 
			nextX = curX - step;
			nextY = curY - step; 
			break;
		case 2: 
			nextX = curX ;
			nextY = curY - step; 
			break;
		case 3: 
			nextX = curX + step;
			nextY = curY - step; 
			break;
		case 4: 
			nextX = curX + step;
			nextY = curY; 
			break;
		case 5: 
			nextX = curX + step;
			nextY = curY + step; 
			break;
		case 6: 
			nextX = curX ;
			nextY = curY + step; 
			break;
		case 7: 
			nextX = curX - step;
			nextY = curY + step; 
			break;	
	}
	if(typeof nextX == 'undefined' || typeof nextY == 'undefined' || nextX < 0 || nextY < 0 || nextX > 7 || nextY > 7){
		return null;
	}
	return CoordToIndex(nextX,nextY);
}

function Item(){
	//0:null;1:black;2:white;
	this.state = 0;
	this.enableFlg = false;
}
var itemList = new Array();
var stateNow = 1;
 function InitList(){
	for(var i = 0;i <= 63; i++){
		itemList[i] = new Item();
	}
	itemList[CoordToIndex(3,3)].state = 2;
	itemList[CoordToIndex(4,4)].state = 2;
	itemList[CoordToIndex(3,4)].state = 1;
	itemList[CoordToIndex(4,3)].state = 1;
	itemList[CoordToIndex(2,3)].enableFlg = true;
	itemList[CoordToIndex(3,2)].enableFlg = true;
	itemList[CoordToIndex(4,5)].enableFlg = true;
	itemList[CoordToIndex(5,4)].enableFlg = true;
	
 }
 
 function ResetEnableFlg(){
	var iList = itemList;
	for(var i = 0;i <= 63; i++){
		iList[i].enableFlg = false;
	}
 }
 
 function CheckEnable(state){
	var oState = state == 1? 2: 1;
	var enableFlg = false;
	var iList = itemList;
	for(var i = 0;i <= 63; i++){
		if(iList[i].state == state){
			for(var j = 0; j <= 7 ; j++){
				var index = getItemIndex(i,j,1);
				if(index != null && iList[index].state == 0){
					//get 0pposite direction
					var od;
					if(j < 4) od = j + 4;
					else od = j - 4;  
					for(var s = 1 ; s <= 7 ; s ++){
						var oIndex = getItemIndex(i,od,s);
						if(oIndex == null || iList[oIndex].state == 0 ) break;
						if(iList[oIndex].state == oState){
							iList[index].enableFlg = true;
							enableFlg = true;
							break;
						}
					}
				}
			}
		}
	}
	return enableFlg;
 }
 
 function SetEachState(index,state){
	var iList = itemList;
	iList[index].state = state ;
	StartAnimate(index,state);
 }
 
 function SetReveal(index,ditection,step,state){
	for(var s = 1; s < step;s++){
		SetEachState(getItemIndex(index,ditection,s),state);
	}
 }
 
 function Play(index,state){
	var oState = state == 1? 2: 1;
	var iList = itemList;
	SetEachState(index,state);
	directionLoop:
	for(var d = 0; d<= 7; d ++){
		stepLoop:
		var setFlg = false;
		for(var s = 1; s<= 7; s ++){
			var nIndex = getItemIndex(index,d,s);
			if(nIndex == null || iList[nIndex].state == 0 ) continue directionLoop;
			if(iList[nIndex].state == state){
				if(s == 1) continue directionLoop;
				if(setFlg){
					SetReveal(index,d,s,state);
					continue directionLoop;
				}
			}
			else{
				setFlg = true;
			}
		}
	}
	
 }
 
 function StartAnimate(index,state){
	//todo add animate here
 }
 
 $(function(){
	var modelflg = true;//true:com;false:VS;
	var aiSide = 2;
	var sim = false;
	
	function banding(){
		var bCount = 0;
		var wCount = 0;
		for(var i = 0;i <= 63; i++){
			var a = $("#a_" + i);
			a.removeClass();
			a.parent().removeClass();
			switch(itemList[i].state){
				case 0:
					break;
				case 1:
					a.addClass("black");
					bCount ++;
					break;
				case 2:
					a.addClass("white");
					wCount ++;
					break;
			}
			if(itemList[i].enableFlg){
				a.addClass("play");
				a.parent().addClass("play_li");
			} 
		}
		$("#sta").removeClass().addClass(stateNow == 1 ? "black" : "white");
		$("#b_count").text(bCount);
		$("#w_count").text(wCount);
	}
	
	function clean(){
		for(var i = 0;i <= 63; i++){
			var a = $("#a_" + i);
			a.removeClass();
			a.parent().removeClass();
		}
	}
	
	function aiPlay(){
		/*var seed = $("a.play").length;
		var index = parseInt(Math.random() * seed);
		$("a.play:eq("+index+")").click();*/
		$("#wait").show();
		sim = true;
		var aiName = $("#selectAi").val();
		setTimeout(function(){
			var index = doAI(aiName);
			sim = false;
			$("#a_" + index).click(); 
			$("#wait").hide();},0);
		//var index = doAI(aiName);
		//$("#a_" + index).click();
	}
	
	$("a").click(function(){
		if(!$(this).hasClass("play") || sim) return;
		Play($(this).attr('id').replace('a_',''),stateNow);
		ResetEnableFlg();
		if(!CheckEnable(stateNow)){
			stateNow = stateNow == 1? 2: 1;
			if(!CheckEnable(stateNow)){
				//game over
				banding();
				return;
			}
			else{
				stateNow = stateNow == 1? 2: 1;
				banding();
				if(stateNow == aiSide && modelflg){
					aiPlay();
				} 
			}
		}
		else{
			stateNow = stateNow == 1? 2: 1;
			banding();
			if(stateNow == aiSide && modelflg){
				aiPlay();
			} 
		}
	});
	
	$("#startVS").click(function(){
		modelflg = false;
		InitList();
		banding();
		$(".start").hide();
		$(".return").show();
	});
	$("#startCom").click(function(){
		modelflg = true;
		InitList();
		banding();
		$(".start").hide();
		$(".return").show();
		if(aiSide == 1) aiPlay();
	});
	$("#return").click(function(){
		clean();
		$(".start").show();
		$(".return").hide();
		aiSide = aiSide == 1? 2: 1;
	});
	$("#promptCheck").click(function(){
		if(!$(this).attr("checked")) $(".over").removeClass("showpro");
		else $(".over").addClass("showpro");
	});
	for(var i in aiList){
		$("#selectAi").append("<option value="+i+">"+i+"</option>");
	}
 })