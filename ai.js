 function AIParent(computeFun){
	this.defaultCompute = function(){
		var playList = getPlayList();
		var seed = playList.length;
		var index = parseInt(Math.random() * seed);
		return playList[index];
	};
	if(typeof computeFun == 'function') this.compute = computeFun;
	else this.compute = this.defaultCompute;
 }
 
function getPlayList(){
	var iList = itemList;
	var iplayList = new Array();
	for(var i = 0;i <= 63; i++){
		if(iList[i].enableFlg) iplayList.push(i);
	}
	return iplayList;
}
 
function AIList(){
	this.defaultAI = new AIParent();
	//add new ai here
	/*
	*this is a added ai simple
	function TestAI(){
		var playList = getPlayList();
		var iList = itemList;
		return playList[0];
	}
	this.test = new AIParent(TestAI);
	*/
	function WeightAI(){
		var maxWeightArray = WeightBase();
		var seed = maxWeightArray.length;
		var index = parseInt(Math.random() * seed);
		return maxWeightArray[index];
	}
	
	function WeightAIEX(){
		var iList = itemList;
		//clone the state array
		for(var i = 0;i <= 63; i++){
			itemListO[i] = new Item();
			itemListO[i].state = iList[i].state;
			itemListO[i].enableFlg = iList[i].enableFlg;
		}
		stateT = stateNow;
		//get maxArray
		var playList = getPlayList();
		//if only have one result return
		if(playList.length == 1) return playList[0];
		var wScore = WeightScore();
		if(wScore == 3) return WeightAI();
		var scoreList = new Array();
		for(var i in playList){
			Play(playList[i],stateT);
			ResetEnableFlg();
			CheckEnable(stateT);
			stateT = stateT == 1? 2: 1;
			var playListT = getPlayList();
			if(playListT.length == 0){
				//scoreList.push({"":playList[i],"":4});
				rollBackList();
				return playList[i];
			}
			var thirdFlg = true;
			for(var j in playListT){
				var thirdList = [1,6,8,9,14,15,48,49,54,55,57,62];
				var inFlg = false;
				for(var k in thirdList){
					if(playListT[j] == thirdList[k]) {
						inFlg = true;
						break;
					}
				}
				thirdFlg = thirdFlg && inFlg;
			}
			if(thirdFlg){
				//scoreList.push({"index":playList[i],"score":1});
				rollBackList();
				//continue;
				return playList[i];
			}
			var maxS = WeightScore();
			scoreList.push({"index":playList[i],"score":-maxS});
			rollBackList();
		}
		var maxWeightArray = WeightBase();
		var resArray = new Array();
		var maxScore = -3;
		for(var i in maxWeightArray){
			for(var j = 0; j < scoreList.length; j++){
				if(maxWeightArray[i] == scoreList[j].index){
					var fScore = wScore + scoreList[j].score;
					if(fScore > maxScore){
						maxScore = fScore;
						resArray = new Array();
						resArray.push(maxWeightArray[i]);
					}
					else if(fScore == maxScore){
						resArray.push(maxWeightArray[i]);
					}
				}
			}
		}
		var seed = resArray.length;
		var index = parseInt(Math.random() * seed);
		return resArray[index];
	}
	
	function MAXAI(){
		var playList = getPlayList();
		var iList = itemList;
		var newList = new Array();
		var playedCount = 0;
		//clone the state array
		for(var i = 0;i <= 63; i++){
			itemListO[i] = new Item();
			itemListO[i].state = iList[i].state;
			itemListO[i].enableFlg = iList[i].enableFlg;
			if(itemListO[i].state == 1 || itemListO[i].state == 2) playedCount++;
		}
		stateT = stateNow;
		var bestVal = -10000;
		var bestArray = new Array();
		var depth = 5;
		var fin = false;
		if(playedCount > 54) {depth = 10;fin = true;}
		for(var i in playList){
			Play(playList[i],stateT);
			ResetEnableFlg();
			CheckEnable(stateT);
			stateT = stateT == 1? 2: 1;
			var thisVal;
			//if(!fin &&(playList[i]==9||playList[i]==14||playList[i]==49||playList[i]==54)) thisVal = -MAXAIBase(-1000,1000,depth + 1,false,fin);
			/*else*/ thisVal = -MAXAIBase(-1000,1000,depth,false,fin);
			rollBackList();
			console.log(thisVal + ":" + playList[i]);
			if(thisVal > bestVal){
				bestArray = new Array();
				bestArray.push(playList[i]);
				bestVal = thisVal;
			}
			else if(thisVal == bestVal){
				bestArray.push(playList[i]);
			}
		}
		var res ;
		if(bestArray.length > 1)
			res = WeightAIEXList(bestArray);
		else res = bestArray[0];
		console.log(res);
		return res;
	}
	
	this.weightAI = new AIParent(WeightAI);
	this.weightEXAI = new AIParent(WeightAIEX);
	this.MAXAI = new AIParent(MAXAI);
}
//be used in WeightAI
function findSorted(num,array){
	for(var i in array){
		if(i > num || array[i] > num) return false;
		else if(array[i] == num) return true;
	}
}
function rollBackList(){
	for(var i = 0;i <= 63; i++){
		itemList[i] = new Item();
		itemList[i].state = itemListO[i].state;
		itemList[i].enableFlg = itemListO[i].enableFlg;
	}
	stateT = stateNow;
}
function rollBackOneLevel(olist ,ostate){
	for(var i = 0;i <= 63; i++){
		itemList[i] = new Item();
		itemList[i].state = olist[i].state;
		itemList[i].enableFlg = olist[i].enableFlg;
	}
	stateT = ostate;
}
var itemListO = new Array();
var stateT;
function WeightScore(playList){
	if(typeof playList == 'undefined') playList = getPlayList();
	var firstList = [0,7,56,63];
	var secnodList = [2,3,4,5,16,18,21,23,24,31,32,39,40,42,45,47,58,59,60,61];
	var thirdList = [1,6,8,9,14,15,48,49,54,55,57,62];
	var maxWeight = 0;
	for(var i in playList){
		if(findSorted(playList[i],firstList)){
			if(maxWeight == 3) continue;
			else{
				maxWeight = 3;
			}
			continue;
		}
		if(maxWeight < 3 && findSorted(playList[i],secnodList)){
			if(maxWeight == 2)continue;
			else if(maxWeight < 2){
				maxWeight = 2;
			}
			continue;
		}
		if(maxWeight < 1 && findSorted(playList[i],thirdList)){
			maxWeight = 0;
		}
		else{
			if(maxWeight == 1) continue;
			else if(maxWeight < 1){
				maxWeight = 1;
			}
		}
	}
	return maxWeight;
}
	
function WeightBase(playList){
	if(typeof playList == 'undefined') playList = getPlayList();
	var firstList = [0,7,56,63];
	var secnodList = [2,3,4,5,16,18,21,23,24,31,32,39,40,42,45,47,58,59,60,61];
	var thirdList = [1,6,8,9,14,15,48,49,54,55,57,62];
	var maxWeight = 0;
	var maxWeightArray = new Array();
	for(var i in playList){
		if(findSorted(playList[i],firstList)){
			if(maxWeight == 3) maxWeightArray.push(playList[i]);
			else{
				maxWeight = 3;
				maxWeightArray = new Array();
				maxWeightArray.push(playList[i]);
			}
			continue;
		}
		if(maxWeight < 3 && findSorted(playList[i],secnodList)){
			if(maxWeight == 2) maxWeightArray.push(playList[i]);
			else if(maxWeight < 2){
				maxWeight = 2;
				maxWeightArray = new Array();
				maxWeightArray.push(playList[i]);
			}
			continue;
		}
		if(maxWeight < 1 && findSorted(playList[i],thirdList)){
			maxWeight = 0;
			maxWeightArray.push(playList[i]);
		}
		else{
			if(maxWeight == 1) maxWeightArray.push(playList[i]);
			else if(maxWeight < 1){
				maxWeight = 1;
				maxWeightArray = new Array();
				maxWeightArray.push(playList[i]);
			}
		}
	}
	return maxWeightArray;
}

function WeightAIEXList(playList){
		var iList = itemList;
		//clone the state array
		for(var i = 0;i <= 63; i++){
			itemListO[i] = new Item();
			itemListO[i].state = iList[i].state;
			itemListO[i].enableFlg = iList[i].enableFlg;
		}
		stateT = stateNow;
		//get maxArray
		//var playList = getPlayList();
		//if only have one result return
		if(playList.length == 1) return playList[0];
		var wScore = WeightScore();
		if(wScore == 3) {
			var maxWeightArray = WeightBase();
			var seed = maxWeightArray.length;
			var index = parseInt(Math.random() * seed);
			return maxWeightArray[index];
		}
		var scoreList = new Array();
		for(var i in playList){
			Play(playList[i],stateT);
			ResetEnableFlg();
			CheckEnable(stateT);
			stateT = stateT == 1? 2: 1;
			var playListT = getPlayList();
			if(playListT.length == 0){
				//scoreList.push({"":playList[i],"":4});
				rollBackList();
				return playList[i];
			}
			var thirdFlg = true;
			for(var j in playListT){
				var thirdList = [1,6,8,9,14,15,48,49,54,55,57,62];
				var inFlg = false;
				for(var k in thirdList){
					if(playListT[j] == thirdList[k]) {
						inFlg = true;
						break;
					}
				}
				thirdFlg = thirdFlg && inFlg;
			}
			if(thirdFlg){
				//scoreList.push({"index":playList[i],"score":1});
				rollBackList();
				//continue;
				return playList[i];
			}
			var maxS = WeightScore();
			scoreList.push({"index":playList[i],"score":-maxS});
			rollBackList();
		}
		var maxWeightArray = WeightBase(playList);
		var resArray = new Array();
		var maxScore = -3;
		for(var i in maxWeightArray){
			for(var j = 0; j < scoreList.length; j++){
				if(maxWeightArray[i] == scoreList[j].index){
					var fScore = wScore + scoreList[j].score;
					if(fScore > maxScore){
						maxScore = fScore;
						resArray = new Array();
						resArray.push(maxWeightArray[i]);
					}
					else if(fScore == maxScore){
						resArray.push(maxWeightArray[i]);
					}
				}
			}
		}
		var seed = resArray.length;
		var index = parseInt(Math.random() * seed);
		return resArray[index];
	}

function WeightAIEXScore(playList){
		var iList = itemList;
		var newList = new Array();
		//clone the state array
		for(var i = 0;i <= 63; i++){
			newList[i] = new Item();
			newList[i].state = iList[i].state;
			newList[i].enableFlg = iList[i].enableFlg;
		}
		stateT = stateNow;
		//get maxArray
		//var playList = getPlayList();
		//if only have one result return
		//if(playList.length == 1) return playList[0];
		var wScore = WeightScore();
		if(wScore == 3) {
			return wScore*10;
		}
		var scoreList = new Array();
		for(var i in playList){
			Play(playList[i],stateT);
			ResetEnableFlg();
			CheckEnable(stateT);
			stateT = stateT == 1? 2: 1;
			var playListT = getPlayList();
			if(playListT.length == 0){
				//scoreList.push({"":playList[i],"":4});
				rollBackList();
				return 40;
			}
			var thirdFlg = true;
			for(var j in playListT){
				var thirdList = [1,6,8,9,14,15,48,49,54,55,57,62];
				var inFlg = false;
				for(var k in thirdList){
					if(playListT[j] == thirdList[k]) {
						inFlg = true;
						break;
					}
				}
				thirdFlg = thirdFlg && inFlg;
			}
			if(thirdFlg){
				//scoreList.push({"index":playList[i],"score":1});
				rollBackList();
				//continue;
				return 40;
			}
			var maxS = WeightScore();
			scoreList.push({"index":playList[i],"score":-maxS});
			rollBackOneLevel(newList,stateT == 1? 2: 1);
		}
		var maxWeightArray = WeightBase(playList);
		var resArray = new Array();
		var maxScore = -3;
		for(var i in maxWeightArray){
			for(var j = 0; j < scoreList.length; j++){
				if(maxWeightArray[i] == scoreList[j].index){
					var fScore = wScore + scoreList[j].score;
					if(fScore > maxScore){
						maxScore = fScore;
						resArray = new Array();
						resArray.push(maxWeightArray[i]);
					}
					else if(fScore == maxScore){
						resArray.push(maxWeightArray[i]);
					}
				}
			}
		}
		return maxScore*10;
	}	
//	
function MAXAIBase(alpha, beta, depth, passed, fin){
	var bestVal = -10000;
	var playList = getPlayList();
	var iList = itemList;
	var newList = new Array();
	//game ending
	if(fin){
		if(depth == 0)return getScore(iList ,stateT);
		var canmove=false;
		for(var i = 0;i <= 63; i++){
			newList[i] = new Item();
			newList[i].state = iList[i].state;
			newList[i].enableFlg = iList[i].enableFlg;
		}
		for(var i in playList){
				
			Play(playList[i],stateT);
			ResetEnableFlg();
			CheckEnable(stateT);
			stateT = stateT == 1? 2: 1;
			var thisVal = -MAXAIBase(-beta, -alpha, depth-1, false ,true);
			rollBackOneLevel(newList,stateT == 1? 2: 1);
			//Alpha-beta Pruning
			if(thisVal > bestVal){
				bestVal = thisVal;
				if (thisVal > alpha) {
					if (thisVal >= beta) {
						return thisVal;
					}
					alpha = thisVal;
				}
			}	
		}	
		if(playList.length == 0){
			if(passed){
				return getScore(iList);
			}
			else{
				stateT = stateT == 1? 2: 1;
				ResetEnableFlg();
				CheckEnable(stateT);
				bestVal = -MAXAIBase(-beta, -alpha, depth-1, true,true);
				rollBackOneLevel(newList,stateT == 1? 2: 1);
			}
		}
		return bestVal;
	}
	if(depth == 0){
		return Appraisement();
	}
	else{
		//clone the state array
		for(var i = 0;i <= 63; i++){
			newList[i] = new Item();
			newList[i].state = iList[i].state;
			newList[i].enableFlg = iList[i].enableFlg;
		}
		for(var i in playList){
			Play(playList[i],stateT);
			ResetEnableFlg();
			CheckEnable(stateT);
			stateT = stateT == 1? 2: 1;
			//Principal Variation Search
			if(bestVal == alpha){
				var thisVal = -MAXAIBase(-alpha-1, -alpha, depth-1, false);
				if(thisVal <= alpha){
					rollBackOneLevel(newList,stateT == 1? 2: 1);
					continue;
				}
				if(thisVal >= beta){
					rollBackOneLevel(newList,stateT == 1? 2: 1);
					return thisVal;
				}
			}
			var thisVal = -MAXAIBase(-beta, -alpha, depth-1, false);
			rollBackOneLevel(newList,stateT == 1? 2: 1);
			//Alpha-beta Pruning
			if(thisVal > bestVal){
				bestVal = thisVal;
				if (thisVal > alpha) {
					if (thisVal >= beta) {
						return thisVal;
					}
					alpha = thisVal;
				}
			}
		}
		if(playList.length == 0){
			if(passed){
				return Appraisement();//getScore(iList) * 100 ;
			}
			else{
				stateT = stateT == 1? 2: 1;
				ResetEnableFlg();
				CheckEnable(stateT);
				bestVal = -MAXAIBase(-beta, -alpha, depth-1, true);
				rollBackOneLevel(newList,stateT == 1? 2: 1);
			}
		}
	}
	return bestVal;
}

function Appraisement(){
	var res = 0;
	var iList = itemList;
	for(var i =0 ; i < 64; i++){
		var d;
		if(stateNow == iList[i].state) 
			d=1;
		else if (stateNow == (iList[i].state==1 ? 2 : 1)) 
			d=-1;
		else continue;
		var seed = 1;//WeightScore([i]);
		if(i == 0) seed = 30;
		else if(i==9) seed = -25;
		else if(i==1) seed = -5;
		else if(i==8) seed = -5;
		if(i == 7) seed = 30;
		else if(i==14) seed = -25;
		else if(i==6) seed = -5;
		else if(i==15) seed = -5;
		if(i == 56) seed = 30;
		else if(i==49) seed = -25;
		else if(i==48) seed = -5;
		else if(i==57) seed = -5;
		if(i == 63) seed = 30;
		else if(i==54) seed = -25;
		else if(i==55) seed = -5;
		else if(i==62) seed = -5;
		res = res + (seed*d);
	}
	var playlist = getPlayList();
	return res + playlist.length;
}

function getScore(iList , state){
	if(!state) state = stateNow;
	var oState = state == 1? 2: 1;
	var score = 0;
	for(var i =0 ; i < 64 ; i++){
		if(iList[i].state == state) score++;
		else if(iList[i].state == oState) score--;
	}
	return score;
}
	
var aiList = new AIList();
function doAI(id){
	for( ai in aiList){
		if(ai == id){
			return aiList[ai].compute();
		}
	}
}
