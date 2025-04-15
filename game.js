// *** GAME FLOW

// *** Show playbutton and afterwards the preload bar
function showPlaybutton()
{	
	game["status"] = "PLAYBUTTON";
	addSunbeam(700, 350, 1, "BETWEEN");
}

// *** Show preload bar
function showPreloader()
{
	if(versionHTML != gameEngine["version"])
	{
		alert("Je hebt een verouderde versie (" + gameEngine["version"] + ") in je cache staan terwijl het spel aangeeft dat er een nieuwere is (" + versionHTML + "). Verwijder je cache of druk SHIFT+F5.");
	}
	else
	{
		// *** Android must be in fullscreen as navigation bars are too big
		if(gameEngine["isAndroid"] && gameEngine["isTopWindow"])
		{
			gameEngine["globalFullscreen"] = checkFullscreen(); // does not work in all browsers
			console.log("globalFullscreen: " + gameEngine["globalFullscreen"]);
			if(!gameEngine["globalFullscreen"]) toggleFullScreen();
		}
			
		showPreloaderProceed();
	}
}

function showPreloaderProceed()
{
	game["status"] = "PRELOAD";
	loadManifest();
}

// *** Show intro screen
function showIntro()
{
	deleteAllO();
	game["status"] = "INTRO";
	if(!gameEngine["iOS"]) showIntroProceed();
}

function showIntroProceed()
{	
	gameEngine["playButtonIntroMessage"] = false;
}

// *** Start game (start playing)
function startGame()
{	
	console.log("startGame");
	//completeWL = "a,b";
	//spelPool = "a,b";

	stopSound(game["music"]);
	game["music"] = playSound("music3", true);
	
	game["score"] = 0;
	
	for(key in o) delete o[key];
	for(key in particle) delete particle[key];

	game["status"] = "";
	
	//wlNewWord();
	//checkvoice();
	
	//myGlitterbox = addGlitterbox(350, 250, 250, 150)
	//myGlittercircle = addGlittercircle(475, 325, 75);
	//if(!gameEngine["isTabletSmartphone"]) mySunbeam = addSunbeam(1200, 500, 0.5, "BEHIND");
	
	defenseGenerateMap();
}


// *** End game
function endGame()
{
	console.log("endGame");
	

	if(game["highscoreEmail"] != "")
	{
		highscoreSubmit();	
	}
	else
	{
		highscoreView();
	}
}


// *** Click in game
function click(thisX, thisY, scale)
{
	gameEngine["userInteractionOccured"] = true;
	
	if(!game["dragging"])
	{
		if(typeof scale === "undefined") scale = true;
		if(scale) { thisX = scaleX(thisX); thisY = scaleY(thisY); }
			
		//console.log("click: " + Math.ceil(thisX) + ", " + Math.ceil(thisY));
		//logGamePlay("click: " + Math.ceil(thisX) + ", " + Math.ceil(thisY));

		if(hitSpot(thisX, thisY, "CLOSE_ICON")) { if(confirm("Wil je het spel verlaten?")) history.go(-1); }
		else if(!gameEngine["globalFullscreenDisabled"] && hitSpot(thisX, thisY, "FULLSCREEN_ICON")) toggleFullScreen();
		else if(!gameEngine["globalAudioDisabled"] && hitSpot(thisX, thisY, "SOUND_ICON")) switchSound();
		else if(hitSpot(thisX, thisY, "KEYBOARD_ICON")) { if(keyboard["status"] == "hidden") showKeyboard("", true); else hideKeyboard(true); }		
		else if(keyboard["status"] == "show" && thisY > keyboard["yDest"]) clickKeyboard(thisX, thisY);		
		else if(game["status"] == "PLAYBUTTON")
		{
			if(hitSpot(thisX, thisY, "INTRO_PLAYBUTTON") && gameEngine["playButtonStatus"] == "PLAY") showPreloader();
		}
		else if(game["status"] == "INTRO")
		{
			if(hitTest(thisX, thisY, "INTRO_IOS_BUTTON", "button") && gameEngine["playButtonIntroMessage"]) showIntroProceed();
			else if(hitTest(thisX, thisY, "INTRO_PLAY_BUTTON", "button")) startGame();
			else if(hitTest(thisX, thisY, "INTRO_HIGHSCORE_BUTTON", "button")) endGame();
		}			
		else if(game["status"] == "" && game["gamePaused"])
		{
			// *** Game paused
			if(    !game["showHeroSelect"] && hitSpot(thisX, thisY, "UI_BUTTON_PAUSE") && !game["showSpellingWord"]) defenseTogglePause();
			else if(game["showHeroSelect"] && hitSpot(thisX, thisY, "HERO_SELECT_BUTTON_1")) defenseChooseHero(1);
			else if(game["showHeroSelect"] && hitSpot(thisX, thisY, "HERO_SELECT_BUTTON_2")) defenseChooseHero(2);
			else if(game["showHeroSelect"] && hitSpot(thisX, thisY, "HERO_SELECT_BUTTON_3")) defenseChooseHero(3);
			else if(game["showHeroSelect"] && hitSpot(thisX, thisY, "HERO_SELECT_BUTTON_4")) defenseChooseHero(4);
			else if(game["showHeroSelect"] && hitSpot(thisX, thisY, "HERO_SELECT_BUTTON_5")) defenseChooseHero(5);

			else if(game["showSpellingWord"] && hitTest(thisX, thisY, "VOICE", "voice") && game["preparevoicebutton"]==true) voice();	
			else if(game["showSpellingWord"] && hitTest(thisX, thisY, "VOICE_SENTENCE", "voice_sentence") && game["preparevoicebuttonsentences"]==true) voicesentence();	
			
		}
		else if(game["status"] == "")
		{
			if(game["gameFinishedScreen"])
			{
				if(game["gameFinishedCount"] > 100 && hitSpot(thisX, thisY, "END_BUTTON_2")) endGame();
				if(game["gameFinishedCount"] > 100 && hitSpot(thisX, thisY, "END_BUTTON_1")) game["gameFinishedScreen"] = false;
			}
			else if(game["gameGameOverScreen"])
			{
				if(game["gameFinishedCount"] > 100 && hitSpot(thisX, thisY, "END_BUTTON_3")) endGame();
			}
			else if(hitSpot(thisX, thisY, "UI_BUTTON_STOP") && !game["showHeroSelect"]) { if(confirm("Wil je stoppen?")) endGame(); }
			else if(hitSpot(thisX, thisY, "UI_BUTTON_PAUSE") && !game["showHeroSelect"] && !game["showSpellingWord"]) defenseTogglePause();
			else if(hitSpot(thisX, thisY, "UI_BUTTON_CASTLE") && !game["showHeroSelect"]) defenseCenterOnCastle();
			else if(hitSpot(thisX, thisY, "UI_BUTTON_HERO") && !game["showHeroSelect"]) defenseCenterOnHero();
			else if(hitSpot(thisX, thisY, "UI_BUTTON_BOMB") && !game["showHeroSelect"] && game["bombCount"] > 0) defenseDropDown();
			else if(hitSpot(thisX, thisY, "WAVE_QUICK") && game["levelWaveStatus"] == "COUNTDOWN" && !game["showHeroSelect"]) { defenseHurryNextWave(); } 
			else if(hitSpot(thisX, thisY, "UI_BUTTON_DISCOVER") && !game["showHeroSelect"]) { defenseToggleDiscover(); }
			else if(hitSpot(thisX, thisY, "UI_BUTTON_BUILD") && !game["showHeroSelect"]) { defenseToggleBuilding(); }
			else if(game["showBuilding"] && hitSpot(thisX, thisY, "BUILD_CLOSE")) { defenseToggleBuilding(); }
			else if(game["showBuilding"] && hitSpot(thisX, thisY, "BUILD_TOWER_AREA_1")) { defensePlaceBuilding(1); }
			else if(game["showBuilding"] && hitSpot(thisX, thisY, "BUILD_TOWER_AREA_2")) { defensePlaceBuilding(2); }
			else if(game["showBuilding"] && hitSpot(thisX, thisY, "BUILD_TOWER_AREA_3")) { defensePlaceBuilding(3); }
			else if(game["showBuilding"] && hitSpot(thisX, thisY, "BUILD_TOWER_AREA_4")) { defensePlaceBuilding(4); }
			else if(game["showBuilding"] && hitSpot(thisX, thisY, "BUILD_TOWER_AREA_5")) { defensePlaceBuilding(5); }
			else if(game["showBuilding"] && hitSpot(thisX, thisY, "BUILD_TOWER_AREA_6")) { defensePlaceBuilding(6); }
			else if(game["showBuilding"] && hitSpot(thisX, thisY, "BUILD_TOWER_AREA_7")) { defensePlaceBuilding(7); }
			else if(game["placeBuilding"] && hitSpot(thisX, thisY, "BUILD_CLOSE")) { game["subInfoText"] = ""; game["placeBuilding"] = 0; }
			else if(hitSpot(thisX, thisY, "DEBUG_BUTTON_1") && game["debugShow"])
			{ 
			
				thisKey = 0;
				for(key in o)
				{
					if(o[key].category == "heroes") thisKey = key;
				}
				
				defenseHeroDies(thisKey); 
			}
			else if(hitSpot(thisX, thisY, "DEBUG_BUTTON_2") && game["debugShow"]) { game["debugInfo"] = !game["debugInfo"]; }			
			else if(hitSpot(thisX, thisY, "DEBUG_BUTTON_3") && game["debugShow"])
			{ 
			
				var save = {};
				save["game"] = game;
				save["o"] = o;
				save["tile"] = tile;
				
				jsonSaveGame = JSON.stringify(save, true);
				console.log("SAVE GAME");
				console.log(jsonSaveGame);
				
				ge('savegame').value = jsonSaveGame;
				
				//setCookie("explorerSaveGame_o", JSON.stringify(save["o"], true));
				//setCookie("explorerSaveGame_game", JSON.stringify(save["game"], true));
				//setCookie("explorerSaveGame_tile", JSON.stringify(save["tile"], true));

			}
			else if(hitSpot(thisX, thisY, "DEBUG_BUTTON_4") && game["debugShow"])
			{
				game["resource1"] += 1000;
				game["resource2"] += 100;
				game["resource3"] += 100;
				game["resource4"] += 100;
				game["playerUpgradeLevel"] += 5;
				game["playerResearchLevel"] += 5;
			
			}
			else
			{
				// *** Click on map
				thisRealX = thisX - 700 - game["scrollX"];
				thisRealY = thisY - 350 - game["scrollY"];

				if(game["showDiscover"])
				{					
					//console.log("Checking tile " + tileX(thisRealX) + ", " + tileY(thisRealY));
					
					if(!defenseCheckTileDiscovered(thisRealX, thisRealY) && defenseDoesTileHaveAdjacentDiscoveredTile(tileX(thisRealX), tileY(thisRealY)))
					{
						// console.log("Can be discovered!");
						// defenseRevealTile(tileX(thisRealX), tileY(thisRealY));
						
						defenseShowSpellingWord(tile[tileX(thisRealX)][tileY(thisRealY)].word, "REVEAL_TILE", tileX(thisRealX) + "|" + tileY(thisRealY));
					}
					
					game["showDiscover"] = false;
				}
				else if(game["playerSelected"] != 0 && typeof o[game["playerSelected"]] != "undefined" && thisRealX >= o[game["playerSelected"]].x - 120 && thisRealX <= o[game["playerSelected"]].x - 36 && thisRealY >= o[game["playerSelected"]].y + o[game["playerSelected"]].mapUpgradeExtraY - 86 && thisRealY <= o[game["playerSelected"]].y + o[game["playerSelected"]].mapUpgradeExtraY - 17  && typeof o[game["playerSelected"]]["upgrade"][1][o[game["playerSelected"]]["upgrade1"]] !== "undefined" && game["playerUpgradeLevel"] >= o[game["playerSelected"]]["upgrade"][1][o[game["playerSelected"]]["upgrade1"]].upgradeLevel) { defenseUpgrade(1); }
				else if(game["playerSelected"] != 0 && typeof o[game["playerSelected"]] != "undefined" && thisRealX >= o[game["playerSelected"]].x + 30 && thisRealX <= o[game["playerSelected"]].x + 114 && thisRealY >= o[game["playerSelected"]].y + o[game["playerSelected"]].mapUpgradeExtraY - 86 && thisRealY <= o[game["playerSelected"]].y + o[game["playerSelected"]].mapUpgradeExtraY - 17  && typeof o[game["playerSelected"]]["upgrade"][2][o[game["playerSelected"]]["upgrade2"]] !== "undefined" && game["playerUpgradeLevel"] >= o[game["playerSelected"]]["upgrade"][2][o[game["playerSelected"]]["upgrade2"]].upgradeLevel) { defenseUpgrade(2); }				
				else if(game["playerSelected"] != 0 && typeof o[game["playerSelected"]] != "undefined" && thisRealX >= o[game["playerSelected"]].x - 120 && thisRealX <= o[game["playerSelected"]].x - 36 && thisRealY >= o[game["playerSelected"]].y + o[game["playerSelected"]].mapUpgradeExtraY + 33 && thisRealY <= o[game["playerSelected"]].y + o[game["playerSelected"]].mapUpgradeExtraY + 103 && typeof o[game["playerSelected"]]["upgrade"][3][o[game["playerSelected"]]["upgrade3"]] !== "undefined" && game["playerUpgradeLevel"] >= o[game["playerSelected"]]["upgrade"][3][o[game["playerSelected"]]["upgrade3"]].upgradeLevel) { defenseUpgrade(3); }
				else if(game["playerSelected"] != 0 && typeof o[game["playerSelected"]] != "undefined" && thisRealX >= o[game["playerSelected"]].x + 30 && thisRealX <= o[game["playerSelected"]].x + 114 && thisRealY >= o[game["playerSelected"]].y + o[game["playerSelected"]].mapUpgradeExtraY + 34 && thisRealY <= o[game["playerSelected"]].y + o[game["playerSelected"]].mapUpgradeExtraY + 103 && typeof o[game["playerSelected"]]["upgrade"][4][o[game["playerSelected"]]["upgrade4"]] !== "undefined" && game["playerUpgradeLevel"] >= o[game["playerSelected"]]["upgrade"][4][o[game["playerSelected"]]["upgrade4"]].upgradeLevel) { defenseUpgrade(4); }
				else if(game["playerSelected"] != 0 && typeof o[game["playerSelected"]] != "undefined" && o[game["playerSelected"]].category == "heroes")
				{
					// *** Move hero					
					if(defenseCheckTileDiscovered(thisRealX, thisRealY))
					{		
						playSound("select2");
									
						// console.log("Place hero marker at " + thisX + ", " + thisY + " -> " + thisRealX + ", " + thisRealY);
						
						o[game["playerSelected"]].xDest = thisRealX;
						o[game["playerSelected"]].yDest = thisRealY;
						
						game["playerSelected"] = 0;
					}
				}
				else if(game["placeBuilding"] != 0)
				{
					defenseBuildBuilding(thisX, thisY);
				}
				else
				{
					// *** Select castle/hero/tower
					tempPrevSelected = game["playerSelected"];
					game["playerSelected"] = 0;
					
					for(key in o)
					{
						if(o[key].category == "castles" || o[key].category == "heroes" || o[key].category == "towers")
						{
							if(thisX >= tX(o[key].x + o[key].clickareaX) && thisX <= tX(o[key].x + o[key].clickareaX + o[key].clickareaWidth) && thisY >= tY(o[key].y + o[key].clickareaY) && thisY <= tY(o[key].y + o[key].clickareaY + o[key].clickareaHeight))
							{
								console.log("Select " + key + " (selected: " + game["playerSelected"] + ")");
								
								playSound("select");
								if(tempPrevSelected == key) game["playerSelected"] = 0; else game["playerSelected"] = key;
							}
						}
					}
				}
			}
		}
		else if(game["status"] == "HIGHSCORES")
		{
			if(hitTest(thisX, thisY, "HIGHSCORE_SUBMIT", "button")) { if(game["score"] > 0) highscoreOpen(); }
			else if(hitTest(thisX, thisY, "HIGHSCORE_PLAY", "button")) { document.location = document.location; /* startGame(); */ }
			else if(hitSpot(thisX, thisY, "HIGHSCORE_SCROLL_TOP")) highscoreScroll("TOP");
			else if(hitSpot(thisX, thisY, "HIGHSCORE_SCROLL_UP")) highscoreScroll("UP");
			else if(hitSpot(thisX, thisY, "HIGHSCORE_SCROLL_USER")) highscoreScroll("USER");
			else if(hitSpot(thisX, thisY, "HIGHSCORE_SCROLL_DOWN")) highscoreScroll("DOWN");
			else if(hitSpot(thisX, thisY, "HIGHSCORE_SCROLL_BOTTOM")) highscoreScroll("BOTTOM");
		}		
	}
				
	endDrag();			
}

// *** Dragging starts
function drag(thisX, thisY)
{
	//console.log("drag: " + Math.ceil(thisX) + ", " + Math.ceil(thisY));
	game["scrollXsrc"] = game["scrollX"];
	game["scrollYsrc"] = game["scrollY"];
	
}

// *** Dragging ends
function endDrag()
{
	gameEngine["userInteractionOccured"] = true;
	
	thisX = game["mouseX"];
	thisY = game["mouseY"];
		
	if(game["dragging"])
	{
		// *** At the end of a drag invoce a click (when playing an intended click can accidentally easily become a short drag)
		//console.log("endDrag results in click: " + Math.ceil(thisX) + ", " + Math.ceil(thisY));
		game["dragging"] = false;
		//click(thisX, thisY, false);
	}

	game["draggingX"] = 0;
	game["draggingY"] = 0;
	game["dragging"] = false;
	game["draggingCheck"] = false;
}


// *** (custom) Keyboard key pressed
function keyboardKeyPressed(thisKey)
{
	console.log("keyboardKeyPressed: \"" + thisKey + "\"");
	
	if(thisKey == "<<")
	{
		if(game["showSpellingWord"]) spelledWord = spelledWord.slice(0, -1);
	}
	else if(thisKey == "SHIFT")
	{
		if(keyboard.shift) keyboard.shift = false; else keyboard.shift = true;
	}	
	else if(thisKey == "OK")
	{
		if(game["showSpellingWord"] && spelledWord != ""){ ControlAnswer(); }	
		// hideKeyboard();
	}		
	else
	{
		spelledWord += thisKey; lowercase();
	}
}

function keyPress(e)
{
	e = e || window.event;

	if(game["showSpellingWord"])
	{
		pressKeyboard(e.key);
	}
	else
	{		
		if 	(e.keyCode == '38' || e.keyCode == '87') 	{ defenseInchHero(0,-1); }
		else if (e.keyCode == '40' || e.keyCode == '83') 	{ defenseInchHero(0,1); }
		else if (e.keyCode == '37' || e.keyCode == '65') 	{ defenseInchHero(-1,0); }
		else if (e.keyCode == '39' || e.keyCode == '68') 	{ defenseInchHero(1,0); }
		else if (e.keyCode == '13') 				{ console.log("keyPress ENTER"); }
	}
	
}

// *** Answer returns from AJAX request
function ajaxReturn(data)
{
	var answer = $.parseJSON(data);
	
	console.log("ajaxReturn: " + answer["a"]);
	console.log(answer);
	
	if(answer["a"] == "highscoreView" && answer["status"] == "OK")
	{
		game["highscoreList"] = answer;
		game["highscoreListScroll"] = parseInt(answer["highscore_list_scroll"]);
		game["highscoreListBusy"] = false;
		
		console.log("highscoreListScroll: " + game["highscoreListScroll"]);
	}
	else if(answer["status"] == "OK")
	{
		console.log("ajaxReturn: " + answer["status"]);	
	}
	else
	{
		console.error("highscoreView ERROR: " + answer["status"]);
		game["highscoreListBusy"] = false;
	}
	
	if(answer["a"] == "highscoreSubmit" && answer["status"] == "OK")
	{
		highscoreView();
	}

	if(answer["a"] == "getTaak" && answer["status"] == "OK")
	{
		console.log("ajaxReturn>getTaak");
		startWLTaakReturn(answer);
	}
	
	if(answer["a"] == "highscoreList" && answer["status"] == "OK")
	{
		passiveMultiplayerList = answer["passiveMultiplayerList"];
		console.log(passiveMultiplayerList);
	}
}



// *** FUNCTIONS

// *** Objects in game
function addO(thisPrototype, thisX, thisY, thisWidth, thisHeight, thisSpecial, thisZ)
{	
	if(typeof thisZ === "undefined") thisZ = "";

	game["keyCount"]++;
	thisKeyO = game["keyCount"];

	//console.log("addO " + thisKeyO + ": prototype " + thisPrototype + " at (" + thisX + ", " + thisY + ")");
	
	o[thisKeyO] = new Object;

	for(keyTempO in oPrototype[thisPrototype]) o[thisKeyO][keyTempO] = oPrototype[thisPrototype][keyTempO];
	
	o[thisKeyO].prototype = thisPrototype;
	o[thisKeyO].x = thisX;
	o[thisKeyO].y = thisY;
	o[thisKeyO].z = thisZ;

	if(typeof thisWidth !== "undefined") o[thisKeyO].width = thisWidth;
	if(typeof thisHeight !== "undefined") o[thisKeyO].height = thisHeight;
	if(typeof thisSpecial !== "undefined") o[thisKeyO].special = thisSpecial;
	
	if(typeof o[thisKeyO].width === "undefined") o[thisKeyO].width = false;
	if(typeof o[thisKeyO].height === "undefined") o[thisKeyO].height = false;
	if(typeof o[thisKeyO].special === "undefined") o[thisKeyO].special = false;
	
	//if(o[thisKeyO].category == "particles" && thisSpecial == "OPPOSITE") o[thisKeyO].position = "bottom"; 
		
	/*
	o[thisKeyO].xSpeed = oPrototype[thisPrototype].xSpeed;
	o[thisKeyO].ySpeed = oPrototype[thisPrototype].ySpeed;

	o[thisKeyO].r = oPrototype[thisPrototype].r;
	o[thisKeyO].rSpeed = oPrototype[thisPrototype].rSpeed;
		
	o[thisKeyO].manifest = oPrototype[thisPrototype].manifest;
	*/
	
	return(thisKeyO);
}

// *** Particles
function addParticle(thisPrototype, thisX, thisY, thisZ)
{
	if(typeof thisZ === "undefined") thisZ = "";
	
	if(gameEngine["isTabletSmartphone"] && Math.random() > 0.5)
	{
		// *** Save CPU
		thisKey = 0
	}
	else
	{
		game["keyCount"]++;
		thisKey = game["keyCount"];
		
		particle[thisKey] = new Object;
		
		particle[thisKey].prototype = thisPrototype;
		particle[thisKey].x = thisX;
		particle[thisKey].y = thisY;
		particle[thisKey].z = thisZ;
			
		particle[thisKey].xSpeed = particlePrototype[thisPrototype].xSpeed + particlePrototype[thisPrototype].xSpeedVariation * Math.random();
		particle[thisKey].xSpeedChange = particlePrototype[thisPrototype].xSpeedChange + particlePrototype[thisPrototype].xSpeedChangeVariation * Math.random();
		
		particle[thisKey].ySpeed = particlePrototype[thisPrototype].ySpeed + particlePrototype[thisPrototype].ySpeedVariation * Math.random();
		particle[thisKey].ySpeedChange = particlePrototype[thisPrototype].ySpeedChange + particlePrototype[thisPrototype].ySpeedChangeVariation * Math.random();
		
		particle[thisKey].size = particlePrototype[thisPrototype].size + particlePrototype[thisPrototype].sizeVariation * Math.random();
		particle[thisKey].sizeChange = particlePrototype[thisPrototype].sizeChange + particlePrototype[thisPrototype].sizeChangeVariation * Math.random();
		
		particle[thisKey].alpha = particlePrototype[thisPrototype].alpha + particlePrototype[thisPrototype].alphaVariation * Math.random();
		particle[thisKey].alphaChange = particlePrototype[thisPrototype].alphaChange + particlePrototype[thisPrototype].alphaChangeVariation * Math.random();
		
		tempParticleManifest = particlePrototype[thisPrototype].manifest;
		if(particlePrototype[thisPrototype].manifestVariation > 0 && Math.random() < particlePrototype[thisPrototype].manifestVariation) tempParticleManifest = particlePrototype[thisPrototype].manifestVariationManifest;
		particle[thisKey].manifest = tempParticleManifest;
	}
	
	return(thisKey);
}

function renderParticles(thisZ)
{
	for(key in particle)
	{
		if(particle[key].z == thisZ)
		{
			context.globalAlpha = particle[key].alpha;
			tempSize = particle[key].size;
			
			// *** Flash
			if(particlePrototype[particle[key].prototype].flashChance > 0 && Math.random() < particlePrototype[particle[key].prototype].flashChance)
			{
				context.globalAlpha = 1; 
				tempSize *= particlePrototype[particle[key].prototype].flashSizeMultiplier;
			}
			
			thisX = particle[key].x;
			thisY = particle[key].y;
			
			if(particle[key].prototype <= 9)
			{
				thisX = tX(thisX);
				thisY = tY(thisY);
			}
			
			drawImage(manifest[particle[key].manifest], thisX, thisY, tempSize, tempSize, false, false, false, true);
		}			      		
	}
	
	context.globalAlpha = 1; 
}	

function renderObjects(thisZ)
{
	// *** Objects
	for(key in o)
	{
		
		if(o[key].z == thisZ)
		{
			
			
			if(o[key].category == "sunbeam")
			{					
				for(i = 1; i <= 10; i++)
				{	
					if(!o[key].initialize)
					{
						context.globalAlpha = Math.sin(o[key][i].alpha)/10;
						drawImage(manifest["sunbeam"], o[key].x, o[key].y, manifest["sunbeam"].width * o[key].radius, manifest["sunbeam"].height * o[key].radius, o[key][i].r, false, false, true);
					}
				}				
			}
			else if(o[key].category == "castles")
			{
				if(game["playerSelected"] == key)
				{
					context.globalAlpha = 0.5 + game["pulsate"]/2;
					context.strokeStyle = "#4e6a02";
					drawEllipseByCenter(tX(o[key].x), tY(o[key].y), o[key].shootDistance*2, o[key].shootDistance*2 * 0.75)
					
					context.globalAlpha = 1;						
				}
							
				if(game["debugInfo"]) 
				{
					drawText("STATUS: " + o[key].status + " (" + o[key].aniFrame + ")", "DEBUG_TEXT", tX(o[key].x) + 100, tY(o[key].y - 45));
					drawText("HP: " + o[key].hp + "/" + o[key].hpMax, "DEBUG_TEXT", tX(o[key].x) + 100, tY(o[key].y - 30));
				}
				
				for(key2 in o)
				{
					if(typeof o[key2].status !== "undefined" && o[key2].status == "WALK_OUT" && o[key].status != "WALK_OUT" && key != key2)
					{
						console.log("Set castle to WALK_OUT");
						o[key].status = "WALK_OUT";
						o[key].aniFrame = 0;
						o[key].aniFrameCount = 0;
						
					}
				}

				if(o[key].status == "WALK_OUT")
				{				
					o[key].aniFrameCount++;
					
					if(o[key].aniFrameCount >= 2)
					{
						o[key].aniFrameCount = 0;							
						o[key].aniFrame++;
						
						if(o[key].aniFrame < 1) o[key].aniFrame = 1;

						if(o[key].aniFrame == 1) playSound("stone_door");
						
						//if(o[key].aniFrame > 9) o[key].aniFrame = 9;
						
						if(o[key].aniFrame <= 9) o[key].manifest = "castle_open_" + o[key].aniFrame;
						if(o[key].aniFrame > 9) o[key].manifest = "castle_open_9";
						
						if(o[key].aniFrame == 10)
						{
							for(key2 in o)
							{
								if(typeof o[key2].status !== "undefined" && o[key2].status == "WALK_OUT" && key != key2)
								{
									console.log("Objects can WALK_OUT of castle");
									o[key2].status = "";
								}
							}						
						}

						if(o[key].aniFrame >= 20 && o[key].aniFrame <= 29) o[key].manifest = "castle_open_" + (9-(o[key].aniFrame - 20));
						if(o[key].manifest == "castle_open_0") o[key].manifest = "castle_static";
						if(o[key].aniFrame >= 30) o[key].manifest = "castle_static";
						if(o[key].aniFrame >= 35) { o[key].status = ""; }
						
						//console.log(o[key].manifest);
					}
					
				}
				
				// *** Draw			
				if(defenseVisible(key))
				{
					if(game["playerSelected"] == key) context.globalAlpha = 0.5 + game["pulsate"]/2;
					drawImage(manifest[o[key].manifest], tX(o[key].x), tY(o[key].y), true, true, o[key].r, false, false, true);
					
					if(o[key].hpDecreaseAni > 0)
					{
						context.globalAlpha = o[key].hpDecreaseAni;
						o[key].hpDecreaseAni *= 0.9;
						
						drawImage(manifest["castle_damage"], tX(o[key].x), tY(o[key].y), true, true, o[key].r, false, false, true);
					}
					
					context.globalAlpha = 1;
					
					defenseDrawHealthbar(tX(o[key].x) - 20, tY(o[key].y) + o[key].clickareaY, o[key].hp/o[key].hpMax);
				}
				
				// *** Destroy building
				if(o[key].hp <= 0)
				{
					console.log("Destroyed " + o[key].x);
					playSound("explosion");
					stopSound(game["music"]);					
					
					for(j = 1; j <= 100; j++) addParticle(3, o[key].x + o[key].clickareaX + Math.random()*o[key].clickareaWidth, o[key].y + o[key].clickareaY + Math.random()*o[key].clickareaHeight, "MAP");
				
					for(key2 in o)
					{
						if(o[key2].category == "heroes") defenseHeroDies(key2);
						else if(o[key2].relatedTo == key) delete o[key2];
					}
					
					delete o[key];
					
					defenseGameOver();
				}
			}
			else if(o[key].category == "shots")
			{
				
				o[key].x += o[key].xSpeed;
				o[key].y += o[key].ySpeed;
				
				tempDeleted = false;
				
				//console.log("shotHasSetTarget: " + o[key].shotHasSetTarget + ": " + o[key].shotHasSetTargetX + ", " + o[key].shotHasSetTargetY + " ... shotFocusOnTarget: " + o[key].shotFocusOnTarget);
				
				if(o[key].manifest == "shot_5" || o[key].manifest == "shot_6" || o[key].manifest == "shot_7")
				{
					if(Math.random() > 0.0) addParticle(1, o[key].x + Math.random()*6-3, o[key].y + Math.random()*6-3, "MAP");
				}
				
				for(key2 in o)
				{
					if(!tempDeleted && (!o[key].shotFocusOnTarget || (o[key].shotFocusOnTarget && key2 == o[key].shotHasSetTargetKey)))
					{
						
						if(!tempDeleted && (o[key2].category == "resources" || o[key2].category == "blobs"))
						{
							tempHit = false;
							
							if(o[key].shotHasSetTarget && o[key].x > o[key].shotHasSetTargetX - 20 && o[key].x < o[key].shotHasSetTargetX + 20 && o[key].y > o[key].shotHasSetTargetY - 20 && o[key].y < o[key].shotHasSetTargetY + 20)
							{
								//console.log("hit on: " + o[key].shotHasSetTargetX + ", " + o[key].shotHasSetTargetY)
								
								if(o[key].shotFocusOnTarget)
								{
									o[key].x = o[o[key].shotHasSetTargetKey].x;
									o[key].y = o[o[key].shotHasSetTargetKey].y;
									
									// console.log("hit on: " + o[key].shotHasSetTargetKey + " (" + o[o[key].shotHasSetTargetKey].category + "), " + o[key].x + ", " + o[key].y)
								
									//if(o[key].shotHasSetTargetKey == key2) tempHit = true;
								}
								
								//console.log(o[key].x + " > " + o[key2].x);
								
								if(o[key].x > o[key2].x + o[key2].hitareaX && o[key].x < o[key2].x + o[key2].hitareaX + o[key2].hitareaWidth && o[key].y > o[key2].y + o[key2].hitareaY && o[key].y < o[key2].y + o[key2].hitareaY + o[key2].hitareaHeight)
								{
									//console.log("HIT!");
									tempHit = true;
								}
	
								// *** No blob in vicinity
								if(!tempHit)
								{
									console.log("No blob in vicinity");
									if(!o[key].shotFocusOnTarget) tempHit = true;
									
								}
							
							}						
							else if(!o[key].shotHasSetTarget && o[key].x > o[key2].x + o[key2].hitareaX && o[key].x < o[key2].x + o[key2].hitareaX + o[key2].hitareaWidth && o[key].y > o[key2].y + o[key2].hitareaY && o[key].y < o[key2].y + o[key2].hitareaY + o[key2].hitareaHeight)
							{
								//console.log("tempHit determined here");
								tempHit = true;
							}
							
							if(!tempDeleted && tempHit)
							{
								o[key2].shake = 10;
								
								// *** Determine multiplier (increased by tower 4)
								thisMultiplier = 1;
								
								for(key3 in o)
								{
									if(typeof o[o[key].origin] !== "undefined" && o[key3].category == "towers" && o[key3].towerID == 4 && distance(o[o[key].origin].x, o[o[key].origin].y, o[key3].x, o[key3].y) <= o[key3].shootDistance) thisMultiplier += o[key3].damage;
								}
								
								// console.log("thisMultiplier: " + thisMultiplier + ", origin: " + o[key].origin);
								
								
								// *** Normal damage
								// console.log("Normal damage: " + o[key].damage + " * " + thisMultiplier + " . key2: " + key2 + ", " + o[key2].category);
								o[key2].hp -= o[key].damage * thisMultiplier;
								
								
								// *** Burn damage within a radius (cumulative)
								o[key2].hpBurn += o[key].damageBurn * thisMultiplier;
								
								if(o[key2].hpBurn > 0 && typeof o[o[key].origin] !== "undefined")
								{
									playSound("burn");
									
									/*
									context.beginPath();
									context.strokeStyle = "#4e6a02";
									context.arc(tX(o[key].x), tY(o[key].y), o[o[key].origin].shotSplashRadius, 0, 2 * Math.PI);
									context.stroke();
									*/
									
									//console.log("BURN Origin " + o[key2].hpBurn + ": " + o[key].origin + " " + o[o[key].origin].shotSplashRadius);
									
									for(key3 in o)
									{
										if(o[key3].map && o[key3].category == "blobs" && distance(o[key].x, o[key].y, o[key3].x, o[key3].y) < o[o[key].origin].shotSplashRadius)
										{
											//console.log("Distance: " + distance(o[key].x, o[key].y, o[key3].x, o[key3].y));
											o[key3].hpBurn += o[key].damageBurn * thisMultiplier;
										}
									}
								}

								// *** Cold damage within a radius (non cumulative)
								o[key2].hpCold = o[key].damageCold * thisMultiplier;
								
								if(o[key2].hpCold > 0 && typeof o[o[key].origin] !== "undefined")
								{
									/*
									context.beginPath();
									context.strokeStyle = "#4e6a02";
									context.arc(tX(o[key].x), tY(o[key].y), o[o[key].origin].shotSplashRadius, 0, 2 * Math.PI);
									context.stroke();
									*/
									
									//console.log("COLD Origin: " + o[key].origin + " " + o[o[key].origin].shotSplashRadius);
									
									for(key3 in o)
									{
										if(o[key3].map && o[key3].category == "blobs" && distance(o[key].x, o[key].y, o[key3].x, o[key3].y) < o[o[key].origin].shotSplashRadius)
										{
											//console.log("Distance " + o[key].damageCold + " damage: " + distance(o[key].x, o[key].y, o[key3].x, o[key3].y));
											o[key3].hpCold = o[key].damageCold * thisMultiplier;
										}
									}
								}
																
								// *** Lightning damage
								if(o[key].damageLightning > 0)
								{
									playSound("flash");
								
									o[key2].hp -= o[key].damageLightning * thisMultiplier;								
									for(j = 0; j <= 700; j = j + 5) addParticle(4, o[key2].x, o[key2].y - j, "MAP"); 
								}
								
								// *** Reduces size on hit
								if(typeof o[key2].damageReducesSize !== "undefined" && o[key2].damageReducesSize)
								{
									o[key2].size *= 0.995;
									if(o[key2].size < 1) o[key2].size = 1;
								}
								
								// *** Blob blood
								if(o[key2].category == "blobs")
								{
									for(j = 1; j <= 5; j++)
									{
										tempKey = addParticle(5, o[key2].x + o[key2].hitareaX + Math.random()*o[key2].hitareaWidth, o[key2].y + o[key2].hitareaY + Math.random()*o[key2].hitareaHeight, "MAP");
										if(tempKey != 0) particle[tempKey].manifest = o[key2].manifest + "_particle";
									}
								}
								
								// *** Impact ani
								if(o[key].hasImpactAni)
								{
									//console.log("IMPACT_" + o[key].manifest.toUpperCase());
									defenseAddToMap("IMPACT_" + o[key].manifest.toUpperCase(), o[key].x, o[key].y);
								}
								
								if(typeof o[key].soundHit !== "undefined" && o[key].soundHit != "") playSound(o[key].soundHit);
								
								// *** Delete shot
								tempDeleted = true;
								delete o[key];
							}
						}
					}
				}
				
				if(!tempDeleted && defenseVisible(key))
				{
					drawImage(manifest[o[key].manifest], tX(o[key].x), tY(o[key].y), true, true, o[key].r, false, false, true);
				}
				
				if(!tempDeleted)
				{
					o[key].lifetime--;
					if(o[key].lifetime <= 0) delete o[key];
				}
			}
			else if(o[key].category == "impacts")
			{
				o[key].aniFrameCount++;
				tempDeleted = false;
				
				if(o[key].aniFrameCount >= 1)
				{
					o[key].aniFrameCount = 0;							
					o[key].aniFrame++;
					
					if(o[key].aniFrame < 1) o[key].aniFrame = 1;
					if(o[key].aniFrame > o[key].aniFrames) o[key].aniFrame = o[key].aniFrames;
					
					o[key].manifest = o[key].manifestBase + o[key].aniFrame;


					if(o[key].aniFrame == 3 && o[key].manifestBase == "tower_3_impact_")
					{
						for(j = 1; j <= 20; j = j + 4) addParticle(3, o[key].x, o[key].y - j*3, "MAP");						
						for(j = 1; j <= 20; j = j + 4) addParticle(7, o[key].x - 10*4 + j*4 , o[key].y, "MAP");
					}
					
					if(o[key].aniFrame == o[key].aniFrames)
					{
						tempDeleted = true;
						delete o[key];
					}

				}
				
				if(!tempDeleted && defenseVisible(key))
				{
					drawImage(manifest[o[key].manifest], tX(o[key].x), tY(o[key].y), true, true, o[key].r, false, false, true);
				}
			}									
			else if(o[key].category == "heroes")
			{
				if(game["playerSelected"] == key)
				{
					context.globalAlpha = 0.5 + game["pulsate"]/2;
					context.strokeStyle = "#4e6a02";
					drawEllipseByCenter(tX(o[key].x), tY(o[key].y), o[key].shootDistance*2, o[key].shootDistance*2 * 0.75)
					context.globalAlpha = 1;						
				}
				
				if(game["debugInfo"])
				{
					drawText("STATUS: " + o[key].status + " (" + o[key].aniFrame + ")", "DEBUG_TEXT", tX(o[key].x) + 40, tY(o[key].y - 45));
					drawText("HP: " + o[key].hp + "/" + o[key].hpMax, "DEBUG_TEXT", tX(o[key].x) + 40, tY(o[key].y - 30));
					drawText("DMG: " + o[key].damage, "DEBUG_TEXT", tX(o[key].x) + 40, tY(o[key].y) - 15);
					drawText("BURN: " + o[key].damageBurn + " / L:" + o[key].lightningChance, "DEBUG_TEXT", tX(o[key].x) + 40, tY(o[key].y));
				}
				
				//console.log(o[key].xDest + ", " + o[key].yDest);
				
				//drawText(o[key].xDest, "RESOURCE_4", tX(o[key].x) + 40, tY(o[key].y + 10));
				//drawText(o[key].yDest, "RESOURCE_4", tX(o[key].x) + 40, tY(o[key].y + 40));
				//drawText(o[key].aniFrame, "RESOURCE_4", tX(o[key].x) + 40, tY(o[key].y + 70));
				
				if((o[key].xDest == 0 && o[key].yDest == 0) || o[key].status == "DEAD" || o[key].status == "WALK_OUT")
				{
					//drawText("Static", "RESOURCE_4", tX(o[key].x) + 40, tY(o[key].y - 20));
					
					// *** Static / shoot / gather resource action
					if(o[key].status == "")
					{
						o[key].manifest = "hero_static";
					
						tempMinDistanceKey = defenseDetermineTarget(key);

						o[key].aniFrame = 0;
						o[key].aniFrameCount = 0;				
					}
					else if(o[key].status == "SHOOT")
					{
						// *** Shoot
						if(o[key].shootXspeed < 0) game["playerMirrored"] = true; else game["playerMirrored"] = false;
						
						//context.globalAlpha = 0.25;
						//drawImage(manifest["hero_marker"], tX(o[tempMinDistanceKey].x), tY(o[tempMinDistanceKey].y) - game["pulsate"]*100, true);
						//context.globalAlpha = 1;
					
						o[key].aniFrameCount++;
						
						if(o[key].aniFrameCount >= 2)
						{
							o[key].aniFrameCount = 0;							
							o[key].aniFrame++;
							
							if(o[key].aniFrame < 1) o[key].aniFrame = 1;
							if(o[key].aniFrame > 7) o[key].aniFrame = 1;
							
							if(o[key].aniFrame == 1) o[key].manifest = "hero_shoot_1";
							if(o[key].aniFrame == 2) o[key].manifest = "hero_shoot_2";
							if(o[key].aniFrame == 3) o[key].manifest = "hero_shoot_3";
							if(o[key].aniFrame == 4) o[key].manifest = "hero_shoot_4";
							if(o[key].aniFrame == 5) o[key].manifest = "hero_shoot_5";
							if(o[key].aniFrame == 6) o[key].manifest = "hero_shoot_6";
							if(o[key].aniFrame == 7) o[key].manifest = "hero_shoot_6";
							
						}
						
						if(o[key].aniFrame == 7)
						{
							o[key].status = "";								
							tempMinDistanceKey = defenseDetermineTarget(key);
							
							thisDamageLightning = 0;
							
							if(o[key].lightningChance > 0)
							{
								if(Math.random()*100 < o[key].lightningChance) thisDamageLightning = o[key].damage*2;
							}
							
							defenseAddShot(1, key, o[key].x, o[key].y - 31, o[key].shootXspeed, o[key].shootYspeed, o[key].damage, o[key].damageBurn, thisDamageLightning);
						}
						
					}
					else if(o[key].status == "DEAD")
					{
						// *** Hero dies
						game["playerMirrored"] = false;
											
						o[key].aniFrameCount++;
						
						if(o[key].aniFrameCount >= 1)
						{
							o[key].aniFrameCount = 0;
							o[key].aniFrame++;
							
							
							if(o[key].aniFrame < 1) o[key].aniFrame = 1;
							//if(o[key].aniFrame > 32) o[key].aniFrame = 32;

							if(o[key].aniFrame == 15) playSound("weapon_drop");
							if(o[key].aniFrame == 60) playSound("beam_up");
							if(o[key].aniFrame == 90) playSound("sound_tower_shot_7");
							
							if(o[key].aniFrame <= 15) o[key].manifest = "hero_dead_" + o[key].aniFrame;
							if(o[key].aniFrame > 15 && o[key].aniFrame <= 49) o[key].manifest = "hero_dead_15";
							if(o[key].aniFrame >= 50 && o[key].aniFrame <= 58) o[key].manifest = "hero_dead_" + (o[key].aniFrame - 35);
							if(o[key].aniFrame > 58 && o[key].aniFrame <= 89) o[key].manifest = "hero_dead_23";
							if(o[key].aniFrame >= 90 && o[key].aniFrame <= 101) o[key].manifest = "hero_dead_" + (o[key].aniFrame - 64);
							if(o[key].aniFrame > 101) { o[key].manifest = "hero_dead_33"; o[key].x = 0; o[key].y = -30 }
						}
						
						if(o[key].aniFrame == 110)
						{
							// *** Walk out of castle again
							o[key].status = "WALK_OUT";
							o[key].aniFrameCount = 0;
							o[key].aniFrame = 0;	
							o[key].xDest = 0;
							o[key].yDest = 50;
						}
						
					}
					else if(o[key].status == "WALK_OUT")
					{
						o[key].manifest = "hero_dead_33";
					}					
				}
				else
				{
					// *** Move to marker
					o[key].status = "";
					
					//drawText("Move", "RESOURCE_4", tX(o[key].x) + 40, tY(o[key].y - 20));
					
					o[key].aniFrameCount++;
					
					if(o[key].aniFrameCount >= 2)
					{
						o[key].aniFrameCount = 0;							
						o[key].aniFrame++;
						
						if(o[key].aniFrame < 1) o[key].aniFrame = 1;
						if(o[key].aniFrame > 6) o[key].aniFrame = 1;
						
						if(o[key].aniFrame == 1) o[key].manifest = "hero_walk_1";
						if(o[key].aniFrame == 2) o[key].manifest = "hero_walk_2";
						if(o[key].aniFrame == 3) o[key].manifest = "hero_walk_3";
						if(o[key].aniFrame == 4) o[key].manifest = "hero_walk_4";
						if(o[key].aniFrame == 5) o[key].manifest = "hero_walk_3";
						if(o[key].aniFrame == 6) o[key].manifest = "hero_walk_2";
						
					}
					
					markX = (o[key].x);
					markY = (o[key].y);
					markR = Math.atan((markX - o[key].xDest) / (markY - o[key].yDest));
					markR = toDegrees(markR);
					if(markY - o[key].yDest < 0) markR = markR + 180;
					
					markXspeed = Math.sin(toRadians(markR+180))*o[key].speed;
					if(markXspeed < 0) game["playerMirrored"] = true; else game["playerMirrored"] = false;
					
					o[key].x += markXspeed;
					o[key].y += Math.cos(toRadians(markR+180))*o[key].speed;
					
					// *** Snap in place
					if(o[key].x > o[key].xDest - 5 && o[key].x < o[key].xDest + 5 && o[key].y > o[key].yDest - 5 && o[key].y < o[key].yDest + 5)
					{
						o[key].xDest = 0;
						o[key].yDest = 0;
					}
				}

				for(j = 34; j < 100; j++)
				{
					if(o[key].manifest == "hero_dead_" + j) o[key].manifest = "hero_dead_33";
				}
				
				if(game["playerSelected"] == key) context.globalAlpha = 0.5 + game["pulsate"]/2;
				if(o[key].manifest != "hero_dead_33") drawImage(manifest["hero_shadow"], tX(o[key].x), tY(o[key].y), true, true, o[key].r, false, false, true);
				
				drawImage(manifest[o[key].manifest], tX(o[key].x), tY(o[key].y), true, true, o[key].r, game["playerMirrored"], false, true);

				if(o[key].hpDecreaseAni > 0)
				{
					context.globalAlpha = o[key].hpDecreaseAni;
					o[key].hpDecreaseAni *= 0.9;
					
					drawImage(manifest["hero_damage"], tX(o[key].x), tY(o[key].y), true, true, o[key].r, false, false, true);
				}
								
				context.globalAlpha = 1;
				
				defenseDrawHealthbar(tX(o[key].x) - 20, tY(o[key].y) + o[key].clickareaY - 20, o[key].hp/o[key].hpMax);

				// *** Destroy hero
				if(o[key].hp <= 0 && o[key].status != "DEAD")
				{
					defenseHeroDies(key);
				}									
			}			
			else if(o[key].category == "resources")
			{					
				if(defenseVisible(key))
				{
					o[key].shake *= 0.85;
					if(o[key].shake < 0.1) o[key].shake = 0;
					
					drawImage(manifest[o[key].manifest], tX(o[key].x), tY(o[key].y), true, true, Math.random() * (o[key].shake*2) - o[key].shake, false, false, true);			
				}
				
				// *** Dead
				if(o[key].hp <= 0)
				{
					game["resource" + o[key].resource] += o[key].resourceAmount;								
					game["score"] += o[key].score;
					
					for(j = 1; j <= 20; j++) addParticle(1, o[key].x + o[key].hitareaX + Math.random()*o[key].hitareaWidth, o[key].y + o[key].hitareaY + Math.random()*o[key].hitareaHeight, "MAP");
					delete o[key];
				}				
			}
			else if(o[key].category == "archers")
			{
				
				if(game["debugInfo"])
				{
					drawText(o[key].damage, "DEBUG_TEXT", tX(o[key].x) - 6, tY(o[key].y - 40));
				}
							
				//drawText("DMG: " + o[key].damage, "DEBUG_TEXT", tX(o[key].x), tY(o[key].y - 25));
				
				// *** Static / shoot
				if(o[key].status == "")
				{
					//console.log("Archer status ''");	
											
					o[key].manifest = "archer_static";
				
					if(Math.random() > 0.99) o[key].mirrored = !o[key].mirrored;
					
					if(Math.random() > 0.9) tempMinDistanceKey = defenseDetermineTarget(key);

					o[key].aniFrame = 0;
					o[key].aniFrameCount = 0;
					
				}
				else if(o[key].status == "SHOOT")
				{
					//console.log("Archer status 'SHOOT'");

					// *** Shoot
					if(o[key].shootXspeed < 0) o[key].mirrored = true; else o[key].mirrored = false;
					
					o[key].aniFrameCount++;
					
					if(o[key].aniFrameCount >= 2)
					{
						o[key].aniFrameCount = 0;							
						o[key].aniFrame++;
						
						if(o[key].aniFrame < 1) o[key].aniFrame = 1;
						//if(o[key].aniFrame > 6) o[key].aniFrame = 6;
						
						if(o[key].aniFrame == 1) o[key].manifest = "archer_shoot_1";
						if(o[key].aniFrame == 2) o[key].manifest = "archer_shoot_2";
						if(o[key].aniFrame == 3) o[key].manifest = "archer_shoot_3";
						if(o[key].aniFrame == 4) o[key].manifest = "archer_shoot_4";
						if(o[key].aniFrame == 5) o[key].manifest = "archer_shoot_5";
						if(o[key].aniFrame >= 6) o[key].manifest = "archer_static";

						if(o[key].aniFrame == 6)
						{
							tempMinDistanceKey = defenseDetermineTarget(key);						
							defenseAddShot(o[key].shot, key, o[key].x, o[key].y + o[key].extraY, o[key].shootXspeed, o[key].shootYspeed, o[key].damage, o[key].damageBurn);					
						}
						
						if(o[key].aniFrame >= 6 + o[key].speed)
						{
							o[key].status = "";					
						}						
					}
					
					
				}
							
				if(defenseVisible(key))
				{
					drawImage(manifest[o[key].manifest], tX(o[key].x), tY(o[key].y + o[key].extraY), true, true, o[key].r, o[key].mirrored, false, true);
					if(o[key].extraY < -20) drawImage(manifest["archer_hay"], tX(o[key].x), tY(o[key].y + o[key].extraY), true, true, o[key].r, false, false, true);
				}
			}
			else if(o[key].category == "towers")
			{	
				
				if(game["debugInfo"])
				{
					drawText("STATUS: " + o[key].status + " (" + o[key].aniFrame + ")", "DEBUG_TEXT", tX(o[key].x) + 40, tY(o[key].y - 45));
					drawText("HP: " + o[key].hp + "/" + o[key].hpMax, "DEBUG_TEXT", tX(o[key].x) + 40, tY(o[key].y - 30));
					drawText("DMG: " + o[key].damage, "DEBUG_TEXT", tX(o[key].x) + 40, tY(o[key].y) - 15);
					drawText("BURN: " + o[key].damageBurn + " / L:" + o[key].lightningChance, "DEBUG_TEXT", tX(o[key].x) + 40, tY(o[key].y));
				}
											
				if(o[key].shoots)
				{
					// *** Static / shoot
					if(o[key].status == "")
					{
						o[key].manifest = "tower_" + o[key].towerID + "_static";						
						tempMinDistanceKey = defenseDetermineTarget(key);														

						o[key].aniFrame = 0;
						o[key].aniFrameCount = 0;

						/*
						console.log("tempMinDistanceKey: " + tempMinDistanceKey);
						
						if(tempMinDistanceKey != 0 && o[key].shotHasSetTarget)
						{
							console.log("shotHasSetTarget at " + o[tempMinDistanceKey].x + ", " + o[tempMinDistanceKey].y);
							o[key].shotHasSetTargetX = o[tempMinDistanceKey].x;
							o[key].shotHasSetTargetY = o[tempMinDistanceKey].y;
						}
						*/
					}
					else if(o[key].status == "SHOOT")
					{						
						// *** Shoot
						
						if(o[key].towerID == 7 && o[key].aniFrame <= 8)
						{
							if(Math.random() > 0.5) addParticle(3, o[key].x - 10 + Math.random()*(12-o[key].aniFrame), o[key].y - 50 - o[key].aniFrame * 8, "MAP");
						}
						
						o[key].aniFrameCount++;
						
						if(o[key].aniFrameCount >= 2)
						{
							o[key].aniFrameCount = 0;							
							o[key].aniFrame++;
							
							if(o[key].aniFrame < 1) o[key].aniFrame = 1;
							//if(o[key].aniFrame > 6) o[key].aniFrame = 6;
							
							if(o[key].aniFrame == 1 && typeof o[key].shotSound !== "undefined" && o[key].shotSound != "") playSound(o[key].shotSound);
							
							if(o[key].towerID == 2 && o[key].aniFrame == 1)
							{
								for(j = 0; j <= 10; j++) addParticle(6, o[key].x, o[key].y - j, "MAP");
								for(j = 0; j <= 20; j++) addParticle(2, o[key].x + Math.random()*20-10, o[key].y + Math.random()*20-10 - j*3, "MAP");
							}
							
							if(o[key].aniFrame <= o[key].shootsAniFrames) o[key].manifest = "tower_" + o[key].towerID + "_shoot_" + o[key].aniFrame;
							if(o[key].aniFrame > o[key].shootsAniFrames) o[key].manifest = "tower_" + o[key].towerID + "_static";
	
							if(o[key].aniFrame == o[key].shootsOnFrame)
							{
								//console.log("lightningChance: " + o[key].lightningChance);
								
								thisDamageLightning = 0;
								
								if(o[key].lightningChance > 0)
								{
									if(Math.random()*100 < o[key].lightningChance) thisDamageLightning = o[key].damage*2;
								}
														
								if(o[key].towerID == 6)
								{
									tempMinDistanceKey = defenseDetermineTarget(key);
									
									if(Math.random()*100 <= o[key].chanceShot5)
									{
										// *** Manatoren: lightning
										if(Math.random() > 0.75) thisDamageLightning = o[key].damage*2;
										defenseAddShot(o[key].shot, key, o[key].x, o[key].y + o[key].extraY, o[key].shootXspeed, o[key].shootYspeed, o[key].damage, o[key].damageBurn, thisDamageLightning, o[key].selectedTarget);
									}

									tempMinDistanceKey = defenseDetermineTarget(key, -30, 20);
									
									if(Math.random()*100 <= o[key].chanceShot6)
									{
										// *** Manatoren: cold
										defenseAddShot(o[key].shot+1, key, o[key].x - 30, o[key].y + o[key].extraY + 20, o[key].shootXspeed, o[key].shootYspeed, o[key].damage, o[key].damageBurn, thisDamageLightning, o[key].selectedTarget, o[key].damageShotCold);
									}

									tempMinDistanceKey = defenseDetermineTarget(key, 30, 20);
									
									if(Math.random()*100 <= o[key].chanceShot7)
									{
										// *** Manatoren: burn
										thisDamageBurn = 0;
										if(Math.random() > 0.75) thisDamageBurn = o[key].damageShotBurn;
										defenseAddShot(o[key].shot+2, key, o[key].x + 30, o[key].y + o[key].extraY + 20, o[key].shootXspeed, o[key].shootYspeed, o[key].damage, thisDamageBurn, thisDamageLightning, o[key].selectedTarget);
									}
								}
								else if(o[key].towerID == 7)
								{
									tempMinDistanceKey = defenseDetermineTarget(key);
									tempShotKey = defenseAddShot(o[key].shot, key, o[key].x, o[key].y + o[key].extraY, o[key].shootXspeed, o[key].shootYspeed, o[key].damage, o[key].damageBurn, thisDamageLightning, o[key].selectedTarget);
									
									if(typeof tempShotKey !== "undefined")
									{
										o[tempShotKey].x = o[tempMinDistanceKey].x;
										o[tempShotKey].y = o[tempMinDistanceKey].y;
										
										for(j = 1; j <= 20; j++) addParticle(1, o[tempShotKey].x + Math.random()*10-5, o[tempShotKey].y - Math.random()*60, "MAP");
										for(j = 1; j <= 10; j++) addParticle(7, o[tempShotKey].x + Math.random()*40-20, o[tempShotKey].y + Math.random()*10-5, "MAP");
										for(j = 1; j <= 20; j++) addParticle(4, o[tempShotKey].x + Math.random()*20-10, o[tempShotKey].y - Math.random()*10-5 - j*20, "MAP");
									}
								}								
								else
								{
									tempMinDistanceKey = defenseDetermineTarget(key);
									defenseAddShot(o[key].shot, key, o[key].x, o[key].y + o[key].extraY, o[key].shootXspeed, o[key].shootYspeed, o[key].damage, o[key].damageBurn, thisDamageLightning, o[key].selectedTarget);
								}
							}
							
							if(o[key].aniFrame >= o[key].shootsAniFrames + o[key].speed) o[key].status = "";					
						}
					}
				}
				
				if(defenseVisible(key))
				{
					if(game["playerSelected"] == key)
					{
						context.globalAlpha = 0.5 + game["pulsate"]/2;
						context.strokeStyle = "#4e6a02";
						drawEllipseByCenter(tX(o[key].x), tY(o[key].y), o[key].shootDistance*2, o[key].shootDistance*2 * 0.75)						
					}
					
					drawImage(manifest[o[key].manifest], tX(o[key].x), tY(o[key].y), true, true, o[key].r, o[key].mirrored, false, true);

					if(o[key].hpDecreaseAni > 0)
					{
						context.globalAlpha = o[key].hpDecreaseAni;
						o[key].hpDecreaseAni *= 0.9;
						
						drawImage(manifest["tower_" + o[key].towerID + "_damage"], tX(o[key].x), tY(o[key].y), true, true, o[key].r, false, false, true);
					}
											
					context.globalAlpha = 1;
					
					// *** Glitter on other towers when tower 4 or 5
					if(o[key].towerID == 4)
					{
						for(key3 in o)
						{
							if(Math.random() > 0.95 && (o[key3].category == "towers" || o[key3].category == "castles" || o[key3].category == "heroes") && key != key3 && distance(o[key].x, o[key].y, o[key3].x, o[key3].y) <= o[key].shootDistance) addParticle(9, o[key3].x + o[key3].clickareaX + Math.random()*o[key3].clickareaWidth, o[key3].y + o[key3].clickareaY + Math.random()*o[key3].clickareaHeight, "MAP");
						}													
					}
					
					if(o[key].towerID == 5)
					{
						for(key3 in o)
						{
							if(Math.random() > 0.95 && (o[key3].category == "towers" || o[key3].category == "castles" || o[key3].category == "heroes") && key != key3 && o[key3].hp < o[key3].hpMax && distance(o[key].x, o[key].y, o[key3].x, o[key3].y) <= o[key].shootDistance) addParticle(8, o[key3].x + o[key3].clickareaX + Math.random()*o[key3].clickareaWidth, o[key3].y + o[key3].clickareaY + Math.random()*o[key3].clickareaHeight, "MAP");
						}
					}

					defenseDrawHealthbar(tX(o[key].x) - 20, tY(o[key].y) + o[key].clickareaY - 20, o[key].hp/o[key].hpMax);					
				}
				

				// *** Destroy building
				if(o[key].hp <= 0)
				{
					console.log("Destroyed " + key);
					playSound("explosion");
					
					for(j = 1; j <= 100; j++) addParticle(3, o[key].x + o[key].clickareaX + Math.random()*o[key].clickareaWidth, o[key].y + o[key].clickareaY + Math.random()*o[key].clickareaHeight, "MAP");
				
					for(key2 in o)
					{
						if(o[key2].relatedTo == key) delete o[key2];
					}


					for(i = 1; i <= 4; i++)
					{
						oPrototype["TOWER_" + o[key].towerID]["priceResource" + i] /= 1.3;
						oPrototype["TOWER_" + o[key].towerID]["priceResource" + i] = Math.round(oPrototype["TOWER_" + o[key].towerID]["priceResource" + i])
					}
					
					
					delete o[key];
				}				
			}
			else if(o[key].category == "blobs")
			{	
				
				if(game["debugInfo"]) drawText("HP: " + (Math.round(o[key].hp*100)/100), "DEBUG_TEXT", tX(o[key].x + 20), tY(o[key].y));

				// *** Cold effect
				tempSpeedMultiplier = 1;
				
				if(o[key].hpCold > 0)
				{
					tempSpeedMultiplier = 1 - (o[key].hpCold/100);
					if(tempSpeedMultiplier > 0.9) tempSpeedMultiplier = 0.9;								
					o[key].hpCold *= 0.98;
					if(o[key].hpCold < 0.1) o[key].hpCold = 0;
				}
				
				// *** Move
				if(Math.random() > 0.9 || o[key].xSpeed == 0 || o[key].ySpeed == 0) tempMinDistanceKey = defenseDetermineTarget(key);
				o[key].x += o[key].xSpeed * tempSpeedMultiplier;
				o[key].y += o[key].ySpeed * tempSpeedMultiplier;
				
				
				if(typeof o[key].slowsDown !== "undefined" && o[key].slowsDown)
				{
					o[key].speed *= 0.995;
				}
								
				// *** Burn effect
				if(o[key].hpBurn > 0)
				{
					//console.log("Blob Burn damage of " + o[key].hpBurn);
					o[key].hp -= o[key].hpBurn;
					o[key].hpBurn *= 0.95;
										
					addParticle(2, o[key].x + o[key].hitareaX + Math.random()*o[key].hitareaWidth, o[key].y + o[key].hitareaY + Math.random()*o[key].hitareaHeight, "MAP");
					
					if(o[key].hpBurn < 0.1) o[key].hpBurn = 0;
				}
				
				// *** Jumpy animation
				o[key].jumpY += o[key].jumpYspeed;
				o[key].jumpYspeed += 0.5;
				
				if(o[key].jumpY >= 0)
				{
					o[key].jumpY = -0.1;
					o[key].jumpYspeed = -2 - Math.random()*2;
					if(Math.random() > 0.95) o[key].jumpYspeed *= 1.5;
				}
				
				// *** Attack
				tempAttackDone = false;
				
				for(key2 in o)
				{
					if(o[key2].category == "towers" || o[key2].category == "castles" || o[key2].category == "heroes")
					{
						if(o[key].x >= o[key2].x + o[key2].clickareaX && o[key].x <= o[key2].x + o[key2].clickareaX + o[key2].clickareaWidth && o[key].y >= o[key2].y + o[key2].clickareaY && o[key].y <= o[key2].y + o[key2].clickareaY + o[key2].clickareaHeight)
						{
							if(!tempAttackDone && o[key2].status != "DEAD" && o[key2].status != "WALK_OUT")
							{
								playSound("hurt" + (Math.ceil(Math.random()*3)));
								/*
								context.globalAlpha = 0.75;
								context.fillColor = "#000000";
								context.fillRect(o[key2].x + o[key2].clickareaX, o[key2].y + o[key2].clickareaY, o[key2].clickareaWidth, o[key2].clickareaHeight); 			
								*/
												
								// console.log("Blob attacks " + o[key2].category + " / X: " + (o[key2].x + o[key2].clickareaX) + "");
								
								o[key2].hp -= o[key].damage;
								o[key].hp -= o[key].damage; // *** Blob also suffers dmg

								for(j = 1; j <= 4; j++)
								{
									tempKey = addParticle(5, o[key2].x + o[key2].clickareaX + Math.random()*o[key2].clickareaWidth, o[key2].y + o[key2].clickareaY + Math.random()*o[key2].clickareaHeight, "MAP");
									if(tempKey != 0) particle[tempKey].manifest = o[key].manifest + "_particle";
								}
																
								o[key2].hpDecreaseAni = 0.5;
								tempAttackDone = true;
							}
						}
					}
				}
				
				// *** Draw
				if(defenseVisible(key))
				{
					drawImage(manifest[o[key].manifest + "_shadow"], tX(o[key].x), tY(o[key].y), o[key].width * o[key].size * (1 - o[key].jumpY/200), o[key].height * o[key].size * (1 - o[key].jumpY/200), o[key].r, o[key].mirrored, false, true);
					
					drawImage(manifest[o[key].manifest], tX(o[key].x), tY(o[key].y) + o[key].jumpY, o[key].width * o[key].size * (1 + game["pulsate"]/5), o[key].height * o[key].size * (1 + game["pulsateCos"]/5), o[key].r, o[key].mirrored, false, true);

					if(typeof o[key].altAppearance !== "undefined" && o[key].altAppearance)
					{
						context.globalAlpha = game["pulsate"];
						drawImage(manifest[o[key].manifest + "_alt"], tX(o[key].x), tY(o[key].y) + o[key].jumpY, o[key].width * o[key].size * (1 + game["pulsate"]/5), o[key].height * o[key].size * (1 + game["pulsateCos"]/5), o[key].r, o[key].mirrored, false, true);
						context.globalAlpha = 1;
					}
					
					if(o[key].hpCold > 0)
					{
						context.globalAlpha = o[key].hpCold / 100;
						drawImage(manifest[o[key].manifest + "_cold"], tX(o[key].x), tY(o[key].y) + o[key].jumpY, o[key].width * o[key].size * (1 + game["pulsate"]/5), o[key].height * o[key].size * (1 + game["pulsateCos"]/5), o[key].r, o[key].mirrored, false, true);
						context.globalAlpha = 1;
					}
					
					if(o[key].showHealthBar) defenseDrawHealthbar(tX(o[key].x) - 20, tY(o[key].y) + o[key].showHealthBarY, o[key].hp/o[key].hpMax);
				}
				
				// *** Spawns children when count reached
				if(typeof o[key].spawns !== "undefined" && o[key].spawns)				
				{
					o[key].spawnsCount++;
					
					if(o[key].spawnsCount >= o[key].spawnsCountMax)
					{
						o[key].spawnsCount = 0;
						defenseAddToMap(o[key].spawnsBlob, o[key].x, o[key].y - 10);
					}
				}
				

				// *** Dead
				if(isNaN(o[key].hp))
				{
					delete o[key];
				}
				else if(o[key].hp <= 0)
				{
					playSound("sound_blob_" + (Math.ceil(Math.random()*3)));
					
					game["resource" + o[key].resource] += o[key].resourceAmount;
					game["score"] += o[key].score;
					
					for(j = 1; j <= 20; j++) addParticle(1, o[key].x + o[key].hitareaX + Math.random()*o[key].hitareaWidth, o[key].y + o[key].hitareaY + Math.random()*o[key].hitareaHeight, "MAP");
					
					if(typeof o[key].splits !== "undefined" && o[key].splits)
					{
						// console.log("Mob splits");
						
						for(j = 1; j <= o[key].splitsAmount; j++)
						{
							// console.log("Add split mob");
							defenseAddToMap(o[key].splitsTo, o[key].x + o[key].hitareaX + Math.random()*o[key].hitareaWidth, o[key].y + o[key].hitareaY + Math.random()*o[key].hitareaHeight);
						}						
					}
					
					// *** Very end boss
					if(o[key].manifest == "blob_13")
					{
						for(j = 1; j <= 100; j++) addParticle(3, o[key].x + o[key].hitareaX + Math.random()*o[key].hitareaWidth/2, o[key].y + o[key].hitareaY + Math.random()*o[key].hitareaHeight, "MAP");
						for(j = 1; j <= 100; j++) addParticle(2, o[key].x + o[key].hitareaX + Math.random()*o[key].hitareaWidth, o[key].y + o[key].hitareaY + Math.random()*o[key].hitareaHeight, "MAP");

						console.log("Game finished!");
						
						setTimeout(function(){ stopSound(game["music"]); playSound("music5"); }, 2000);
						
						game["gameFinished"] = true;
						game["gameFinishedScreen"] = true;
						game["gameFinishedCount"] = 0;
						
						for(key in o)
						{
							if(o[key].category == "blobs") delete o[key];
						}
						
					}
					
					delete o[key];								
				}
			}									
			else
			{	
				proto = oPrototype[o[key].prototype];
				
				if(typeof o[key].manifest !== "undefined" && o[key].manifest != "")
				{	
					console.log("Here");		
					
					if(proto.hasShadow) drawImage(manifest[o[key].manifest + "_shadow"], o[key].x + 5, o[key].y + 5, true, true, false, false, false, true);
					drawImage(manifest[o[key].manifest], o[key].x, o[key].y, true, true, o[key].r, false, false, true);
					drawImage(manifest[o[key].manifest], tX(o[key].x), tY(o[key].y), true, true, o[key].r, false, false, true);
				}
			}
		}
	}
	
	context.globalAlpha = 1; 
}
	
		
function applyShadow()
{
	context.shadowColor = "rgba(0, 0, 0, 1)";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 1;
	context.shadowBlur = 4;
}


function addGlitterbox(thisX, thisY, thisWidth, thisHeight)
{
	thisKey = addO("GLITTERBOX", thisX, thisY, thisWidth, thisHeight);
	return(thisKey);
}


function addGlittercircle(thisX, thisY, thisR)
{
	thisKey = addO("GLITTERCIRCLE", thisX, thisY); 
	o[thisKey].r = thisR;
	return(thisKey);
}


function addSunbeam(thisX, thisY, thisRadius, thisZ)
{
	thisKey = addO("SUNBEAM", thisX, thisY); 
	
	if(typeof thisRadius === "undefined") thisRadius = 1;
	if(typeof thisZ === "undefined") thisZ = "";
	
	o[thisKey].radius = thisRadius;
	o[thisKey].z = thisZ;
	
	return(thisKey);
}



// *** Functions with wl (woordenlijst)
function wlInit(completeWL)
{
	wl = new Array();
	wl = completeWL.split(",");

	for(key in wl)
	{
		wl[key] = wl[key].split("*").join("");
		wl[key] = wl[key].split("'").join("`");
		wl[key] = wl[key].trim();
	
		if(wl[key] == "") wl[key] = "-";
	}	
}

function wlUnderscore(thisTyped, thisWord)
{
	thisUnderscores = "";
	
	if(thisWord.length > thisTyped.length)
	{
		for(i = 0; i < thisWord.length-thisTyped.length; i++) thisUnderscores += "_";
	}
	
	return(thisTyped + thisUnderscores);
}

function wlNewWord()
{
	console.log("=== wlNewWord");
	console.log(wl);
	
	/*
	tempFound = false;
	
	for(key in wl)
	{
		if(wl[key].done) {} else tempFound = true;
	}
	
	if(!tempFound)
	{
		for(key in wl)
		{
			wl[key].done = false;
		}	
	}
	*/
	game["word"] = wlPick(true);
	game["wordTyped"] = "";
	
	game["wordSyllable"] = wlSyllabify(game["word"]);
	game["wordSyllableCount"] = 0;
	
	spelWord = game["word"];
	console.log("wlNewWord: " + game["word"]);
}

function wlPick(thisDeleteWord)
{
	if(typeof thisDeleteWord === "undefined") thisDeleteWord = true;
	
	thisPossible = false;
		
	for(key in wl)
	{
		if(wl[key] != "-") thisPossible = true;
	}

	if(thisPossible)
	{
		thisFound = false;
		
		while(!thisFound)
		{
			thisArray = Math.floor(wl.length*Math.random());
			
			if(wl[thisArray] != "-")
			{
				thisWord = wl[thisArray];
				if(thisDeleteWord) wl[thisArray] = "-";
				thisFound = true;
			}
		}
	}
	else thisWord = "-";

	thisSyl = wlSyllabify(thisWord);

	//console.log("wlPick: " + thisWord + ". wlSyllabify:");
	//console.log(thisSyl);
	//console.log(wl);
	
	return(thisWord);	
}


function wlSyllabify(word)
{
	/* *** Lettergrepen
	syllableRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;
	thisSyl = word.match(syllableRegex);
	if(!thisSyl) thisSyl = word;
	return(thisSyl);
	*/
	
	// *** Splitsen in delen van 3 letters
	if(word.length < 8)
	{
		thisSyl = word.match(/.{1,2}/g);
	}
	else
	{
		thisSyl = word.match(/.{1,3}/g);
	}
	

	/* *** Splitsen in 3 delen van X letters
	if(word.length <= 6)
	{
		thisSyl = word.match(/.{1,2}/g);
	}
	else
	{
		thisLetters = word.length;
		thisLength = word.length/3;
		
		if(thisLetters == 7 || thisLetters == 10 || thisLetters == 13) thisLength = Math.floor(thisLength); else thisLength = Math.ceil(thisLength);
		
		thisSyl = new Array();
		thisSyl[0] = word.substr(0,thisLength);
		thisSyl[1] = word.substr(thisLength, thisLength);
		thisSyl[2] = word.substr(thisLength*2);
	}
	*/
	
	return(thisSyl);
}

function wlRandomSyllable()
{
	thisRandomSyllableArray = wlSyllabify(wlPick(false));
	thisRandomSyllable = thisRandomSyllableArray[Math.floor(Math.random()*thisRandomSyllableArray.length)];
	
	return(thisRandomSyllable);
}




// *** Spelling word
function checkvoice(){
	
	
	for (WordOrSentence = 1; WordOrSentence<3; WordOrSentence++)
	{
		if(WordOrSentence == 1){
		var MethodenMetWoorden = mergeLists([lijn3,veiliglerenlezen,taalactief3,taalactief4,spellinginbeeld2,taaljournaal,taalverhaalnu,pit,staal,Categorie]);
		}
		if(WordOrSentence == 2){
		var MethodenMetWoorden = mergeLists([taalactief4,Categorie]);
		}
			
			
			
		WoordenMetGeluid = "";
		WoordPakketten = "";

			for(key in MethodenMetWoorden)
			{	
				WoordPakketten += "," + key + ",";				
			}

		TempPakketten = WoordPakketten.split(",");	

			for(i = 0; i < TempPakketten.length; i++)
			{
				if(TempPakketten[i] != "")
				{
					WoordenMetGeluid += MethodenMetWoorden[TempPakketten[i]].woorden + ",";
				}
			}

		WoordenMetGeluid = WoordenMetGeluid.split(",,").join(",");	
		WoordenMetGeluid = WoordenMetGeluid.split(",")



		var geluid = false;

		for (key in WoordenMetGeluid){

			if(WoordenMetGeluid[key] == spelWord){geluid = true;}

		}

		if(WordOrSentence == 1){
			if (geluid == false){console.log("Hier is geen woordbestand van");game["preparevoicebutton"]=false;} else{console.log("Hier is wel een woordbestand van");game["preparevoicebutton"]=true;}
		}
		else if(WordOrSentence == 2){
			if (geluid == false){console.log("Hier is geen zinsbestand van");game["preparevoicebuttonsentences"]=false;} else{console.log("Hier is wel een zinsbestand van");game["preparevoicebuttonsentences"]=true;}
		}

	
	}

	
	//if(game["preparevoicebutton"]==true){setTimeout(function(){ voice(); }, 600);};
	
	//SentenceAudio.onerror = function(){console.log("Hier is geen bestand van");game["preparevoicebuttonsentences"]=false;}
	//WordAudio.onerror = function(){console.log("Hier is geen bestand van");game["preparevoicebutton"]=false;}
	
	
}
function voice()
{
	console.log("voice (speak word again)");
	
	
	MySound = "https://afbeeldingen.spellingoefenen.nl/oefenen/sound/words/"+spelWord[0]+"/"+spelWord+".mp3"
	if (spelWord[0]=="'"){MySound = "https://afbeeldingen.spellingoefenen.nl/oefenen/sound/words/s/"+spelWord+".mp3"}
	
	var WordAudio = new Audio(replaceSpecialChars(MySound));
	
	
	WordAudio.play();
		
}

function voicesentence()
{
	console.log("voice (speak sentence again)");
	
	
	MySound = "https://afbeeldingen.spellingoefenen.nl/oefenen/sound/sentences/"+spelWord[0]+"/"+spelWord+".mp3"
	if (spelWord[0]=="'"){MySound = "https://afbeeldingen.spellingoefenen.nl/oefenen/sound/sentences/s/"+spelWord+".mp3"}
	
	var WordAudio = new Audio(replaceSpecialChars(MySound));
	
	
	WordAudio.play();
		
}
function replaceSpecialChars(t)
{
	t = t.split("Ã¤").join("a");
	t = t.split("Ã¡").join("a");
	t = t.split("Ã ").join("a");

	t = t.split("Ã«").join("e");
	t = t.split("Ã©").join("e");
	t = t.split("Ã¨").join("e");

	t = t.split("Ã¯").join("i");
	t = t.split("Ã­").join("i");
	t = t.split("Ã®").join("i");

	t = t.split("Ã¶").join("o");
	t = t.split("Ã³").join("o");
	t = t.split("Ã²").join("o");

	t = t.split("Ã¼").join("u");
	t = t.split("Ãº").join("u");
	t = t.split("Ã¹").join("u");

	t = t.split("-").join("");
	t = t.split("'").join("");
	t = t.split("`").join("");
	t = t.split("?").join("");
	t = t.split("!").join("");
	t = t.toLowerCase();

	return(t);
}

function xCorrectie(Letter)
{
	if (Letter=="m"){var Correctie = -14;}
	else if (Letter=="f"){var Correctie = 8;}
	else if (Letter=="i"){var Correctie = 16;}
	else if (Letter=="j"){var Correctie = 16;}
	else if (Letter=="l"){var Correctie = 16;}
	else if (Letter=="r"){var Correctie = 7;}
	else if (Letter=="s"){var Correctie = 4;}
	else if (Letter=="t"){var Correctie = 8;}
	else if (Letter=="w"){var Correctie = -8;}
	else if (Letter=="A"){var Correctie = -5;}
	else if (Letter=="B"){var Correctie = -3;}
	else if (Letter=="C"){var Correctie = -10;}
	else if (Letter=="D"){var Correctie = -3;}
	else if (Letter=="E"){var Correctie = -8;}
	else if (Letter=="F"){var Correctie = -3;}
	else if (Letter=="G"){var Correctie = -14;}
	else if (Letter=="H"){var Correctie = -10;}
	else if (Letter=="I"){var Correctie = 13;}
	else if (Letter=="J"){var Correctie = -3;}
	else if (Letter=="K"){var Correctie = -6;}
	else if (Letter=="L"){var Correctie = -3;}
	else if (Letter=="M"){var Correctie = -16;}
	else if (Letter=="N"){var Correctie = -10;}
	else if (Letter=="O"){var Correctie = -12;}
	else if (Letter=="P"){var Correctie = -3;}
	else if (Letter=="Q"){var Correctie = -10;}
	else if (Letter=="R"){var Correctie = -10;}
	else if (Letter=="S"){var Correctie = -6;}
	else if (Letter=="T"){var Correctie = -3;}
	else if (Letter=="U"){var Correctie = -8;}
	else if (Letter=="V"){var Correctie = -6;}
	else if (Letter=="W"){var Correctie = -22;}
	else if (Letter=="X"){var Correctie = -7;}
	else if (Letter=="Y"){var Correctie = -7;}
	else if (Letter=="Z"){var Correctie = -3;}
	else if (Letter=="'"){var Correctie = 18;}
	else if (Letter=="-"){var Correctie = 14;}
	else{Correctie = 0;}
	return Correctie;
}

function uppercase()
{
	/*	
	keyboard.keys["q"].y = 100;keyboard.keys["Q"].y = 1; 
	keyboard.keys["w"].y = 100;keyboard.keys["W"].y = 1; 
	keyboard.keys["e"].y = 100;keyboard.keys["E"].y = 1; 
	keyboard.keys["r"].y = 100;keyboard.keys["R"].y = 1; 
	keyboard.keys["t"].y = 100;keyboard.keys["T"].y = 1; 
	keyboard.keys["y"].y = 100;keyboard.keys["Y"].y = 1; 
	keyboard.keys["u"].y = 100;keyboard.keys["U"].y = 1; 
	keyboard.keys["i"].y = 100;keyboard.keys["I"].y = 1; 
	keyboard.keys["o"].y = 100;keyboard.keys["O"].y = 1; 
	keyboard.keys["p"].y = 100;keyboard.keys["P"].y = 1; 
		
	keyboard.keys["a"].y = 100;keyboard.keys["A"].y = 2;
	keyboard.keys["s"].y = 100;keyboard.keys["S"].y = 2; 
	keyboard.keys["d"].y = 100;keyboard.keys["D"].y = 2; 
	keyboard.keys["f"].y = 100;keyboard.keys["F"].y = 2; 
	keyboard.keys["g"].y = 100;keyboard.keys["G"].y = 2; 
	keyboard.keys["h"].y = 100;keyboard.keys["H"].y = 2; 
	keyboard.keys["j"].y = 100;keyboard.keys["J"].y = 2; 
	keyboard.keys["k"].y = 100;keyboard.keys["K"].y = 2; 
	keyboard.keys["l"].y = 100;keyboard.keys["L"].y = 2; 
		
	keyboard.keys["z"].y = 100;keyboard.keys["Z"].y = 3; 
	keyboard.keys["x"].y = 100;keyboard.keys["X"].y = 3; 
	keyboard.keys["c"].y = 100;keyboard.keys["C"].y = 3;
	keyboard.keys["v"].y = 100;keyboard.keys["V"].y = 3; 
	keyboard.keys["b"].y = 100;keyboard.keys["B"].y = 3; 
	keyboard.keys["n"].y = 100;keyboard.keys["N"].y = 3; 
	keyboard.keys["m"].y = 100;keyboard.keys["M"].y = 3; 
		
	keyboard.keys["Ã©"].y = 100;keyboard.keys["Ã§"].y = 0; 
	keyboard.keys["Ã¨"].y = 100;keyboard.keys["Ã±"].y = 0;
	keyboard.keys["Ã«"].y = 100;keyboard.keys["Ã­"].y = 0;
	keyboard.keys["Ãª"].y = 100;keyboard.keys["Ãº"].y = 0;
	keyboard.keys["Ã¯"].y = 100;keyboard.keys["Ã¹"].y = 0;
	keyboard.keys["Ã¼"].y = 100;keyboard.keys["Ã³"].y = 0;
	keyboard.keys["Ã¤"].y = 100;keyboard.keys["Ã²"].y = 0;
	keyboard.keys["Ã¶"].y = 100;keyboard.keys["Ã¡"].y = 0;
	*/
}

function lowercase()
{
	/*	
	keyboard.keys["Q"].y = 100;keyboard.keys["q"].y = 1; 
	keyboard.keys["W"].y = 100;keyboard.keys["w"].y = 1; 
	keyboard.keys["E"].y = 100;keyboard.keys["e"].y = 1; 
	keyboard.keys["R"].y = 100;keyboard.keys["r"].y = 1; 
	keyboard.keys["T"].y = 100;keyboard.keys["t"].y = 1; 
	keyboard.keys["Y"].y = 100;keyboard.keys["y"].y = 1; 
	keyboard.keys["U"].y = 100;keyboard.keys["u"].y = 1; 
	keyboard.keys["I"].y = 100;keyboard.keys["i"].y = 1; 
	keyboard.keys["O"].y = 100;keyboard.keys["o"].y = 1; 
	keyboard.keys["P"].y = 100;keyboard.keys["p"].y = 1; 
		
	keyboard.keys["A"].y = 100;keyboard.keys["a"].y = 2;
	keyboard.keys["S"].y = 100;keyboard.keys["s"].y = 2; 
	keyboard.keys["D"].y = 100;keyboard.keys["d"].y = 2; 
	keyboard.keys["F"].y = 100;keyboard.keys["f"].y = 2; 
	keyboard.keys["G"].y = 100;keyboard.keys["g"].y = 2; 
	keyboard.keys["H"].y = 100;keyboard.keys["h"].y = 2; 
	keyboard.keys["J"].y = 100;keyboard.keys["j"].y = 2; 
	keyboard.keys["K"].y = 100;keyboard.keys["k"].y = 2; 
	keyboard.keys["L"].y = 100;keyboard.keys["l"].y = 2; 
		
	keyboard.keys["Z"].y = 100;keyboard.keys["z"].y = 3; 
	keyboard.keys["X"].y = 100;keyboard.keys["x"].y = 3; 
	keyboard.keys["C"].y = 100;keyboard.keys["c"].y = 3;
	keyboard.keys["V"].y = 100;keyboard.keys["v"].y = 3; 
	keyboard.keys["B"].y = 100;keyboard.keys["b"].y = 3; 
	keyboard.keys["N"].y = 100;keyboard.keys["n"].y = 3; 
	keyboard.keys["M"].y = 100;keyboard.keys["m"].y = 3;
		
	keyboard.keys["Ã©"].y = 0;keyboard.keys["Ã§"].y = 100; 
	keyboard.keys["Ã¨"].y = 0;keyboard.keys["Ã±"].y = 100;
	keyboard.keys["Ã«"].y = 0;keyboard.keys["Ã­"].y = 100;
	keyboard.keys["Ãª"].y = 0;keyboard.keys["Ãº"].y = 100;
	keyboard.keys["Ã¯"].y = 0;keyboard.keys["Ã¹"].y = 100;
	keyboard.keys["Ã¼"].y = 0;keyboard.keys["Ã³"].y = 100;
	keyboard.keys["Ã¤"].y = 0;keyboard.keys["Ã²"].y = 100;
	keyboard.keys["Ã¶"].y = 0;keyboard.keys["Ã¡"].y = 100;
	*/
}

function ControlAnswer()
{
	console.log("ControlAnswer " + gameWordCurrent);
	
	if(spelledWord=="Jibbe")
			{	
				game["resource1"] += 1000;
				game["resource2"] += 100;
				game["resource3"] += 100;
				game["resource4"] += 100;
			};
	
	// if(spelWord==spelledWord && gameWordCurrent == 15 || gameWordCurrent == 15 && Attempt>1){gameCollectableItem += 1;game["status"] = "RESULT";}
	
	if(Attempt == 0){ spelledWordsAttempt1[gameWordCurrent] = spelledWord; spelledWordsAttempt2[gameWordCurrent] = ""; }
	if(Attempt == 1){ spelledWordsAttempt2[gameWordCurrent] = spelledWord; }
	
	if(spelWord==spelledWord)
	{
		
		
		game["spellingAmountCount"]++;
		
		if(game["spellingAmountCount"] < game["spellingAmount"])
		{
			//console.log();
			
			nextWord(); 
			newSpelWord();
			
			//if(gameWordCurrent < 16) { newSpelWord(); }
		}
		else
		{
			console.log("Spelling finished!");
			playSound("select3");
			
			game["showSpellingWord"] = false;
			game["gamePaused"] = false;
			
			// *** Reward for spelling
			if(game["spellingType"] == "REVEAL_TILE")
			{
				temp = game["spellingVar"].split("|");
				defenseRevealTile(parseInt(temp[0]), parseInt(temp[1]));
			}

			if(game["spellingType"] == "PLACE_TOWER")
			{
				defensePlaceBuildingMap(game["spellingVar"]);
			}
				
			if(game["spellingType"] == "DROP_BOMB")
			{
				defenseDropDownNow();
			}			
		}
	}
	else
	{
		console.log("Fout antwoord")
		Mistake();
	}	
}

function nextWord()
{
	console.log("nextWord");
	console.log("---");
	console.log("check: " + spelWord);
	//console.log("spelledWordsAttempt1:" + spelledWordsAttempt1[gameWordCurrent]);
	//console.log("spelledWordsAttempt2:" + spelledWordsAttempt2[gameWordCurrent]);
	console.log("gameWordCurrent:" + gameWordCurrent);
	//console.log("klas_wachtwoord:" + klas_wachtwoord);
	//console.log("taak:" + taak);
	//console.log("leerling:" + leerling);
	
	playSound("bell_chord");
	
	//addO("PROGRESS_BAR_" + tempDot, spot["PROGRESS_BAR"].x + spot["PROGRESS_BAR"].paddingLeft + (gameWordCurrent - 1) * spot["PROGRESS_BAR"].interval, spot["PROGRESS_BAR"].y + spot["PROGRESS_BAR"].paddingTop);
	
	//walkCharacter();
	
	//o["character"].x = spot["CHARACTER"].x = ((gameWordCurrent - 1) * spot["PROGRESS_BAR"].interval)-13;
	
	gameWordCurrent++;
	voortgang++;
	
	if(taak != "")
	{
		//ajaxUpdate("a=progressTaak&klas_wachtwoord=" + klas_wachtwoord + "&taak=" + taak + "&leerling=" + leerling + "&woord=" + spelWord + "&poging_1=" + spelledWordsAttempt1[gameWordCurrent-1] + "&poging_2=" + spelledWordsAttempt2[gameWordCurrent-1] + "&voortgang=" + voortgang);
	}
	
	Attempt = 0;
	spelledWord = "";
	
	voicebutton();
	setTimeout(function(){ voice(); }, 600);
}

function Mistake()
{
	playSound("error");
	Attempt += 1;
	MistakeFeedback = 25;
	if(mark[gameNumber]>1){mark[gameNumber] -= 0.5};
	// Feedback fout antwoord gegeven.	
}


function newSpelWord()
{
	console.log("newSpelWord:  " + spelPool);
	
	temp = spelPool.split(","); 
		
	spelWord = temp[Math.floor(Math.random() * (temp.length - 1))];	

		var Used = false	

		for (a=0; a<spelWords.length; a++)
		{
			if(spelWord == spelWords[a]){Used = true}
		}

		if(Used == false)
		{
			spelWord = spelWord.trim();
			
			//if(spelWord.indexOf("?")>0){keyboard.keys["."].y = 200;keyboard.keys["?"].y = 2;} else{keyboard.keys["."].y = 2;keyboard.keys["?"].y = 200;}
			
			if(spelWord.indexOf("`")>-1){spelWord = spelWord.split("`").join("'");}
			if(spelWord.indexOf("Â´")>-1){spelWord = spelWord.split("Â´").join("'");}
			if(spelWord.indexOf("â€™")>-1){spelWord = spelWord.split("â€™").join("'");}
			console.log ("Spelword apostrofje verbeterd!!")

			console.log("newSpelWord: " + spelWord);

			spelWords[gameWordCurrent] = spelWord;

			temp = spelWord.split("");

			// if(gameType=="dictee"){setTimeout(function(){ voice(); }, 600);}

			spelledWord = "";
			letterBrightness = 0.3;
			if(ShowKeyboardOnce == true){hideKeyboard();ShowKeyboardOnce = false;}

			if (spelWord.indexOf('Ã«') > -1 ||spelWord.indexOf('Ã©') > -1 ||spelWord.indexOf('Ã¨') > -1 ||spelWord.indexOf('Ã¯') > -1 ||spelWord.indexOf('Ã¶') > -1 ||spelWord.indexOf('Ã¤') > -1){if (keyboard["status"] != "show"){showKeyboard();ShowKeyboardOnce = true;}}
		}
		else
		{

			for (a=0; a<spelWords.length; a++)
			{
				spelWords[a] = "";
			}
			
			newSpelWord();
		}
	
	
	// setTimeout(function(){ voice(); }, 600);
}



function voicebutton(){

if (game["preparevoicebutton"]==true){game["ShowVoiceButton"]=true}
if (game["preparevoicebutton"]==false){game["ShowVoiceButton"]=false}
	
if (game["preparevoicebuttonsentences"]==true){game["ShowVoiceButtonSentences"]=true}
if (game["preparevoicebuttonsentences"]==false){game["ShowVoiceButtonSentences"]=false}

	
}
// *** /Spelling word
