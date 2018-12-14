//Globals
var timerStartValue=0;	//Value to start the timer at (non-0 for debugging)
var stopWatchTimerValue=0;	
var stopWatchMaxValue=5999999;
var stopWatchTimerInterval = false;
var lapDivEmptyHTML = "<table class='watchLap'><tr><td>&nbsp;</td></tr></table>";

function StopwatchAssistant() {
	
}

StopwatchAssistant.prototype.setup = function() {
	Mojo.Log.info("## stopwatch - scene started."); 
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	/* setup widgets here */
	this.controller.get("watchViewTitle").innerHTML = "Stopwatch";
	this.controller.get("watchViewDetail").innerHTML = timerStartValue.toLongTimeValueMS();
	this.controller.get("watchLapTimes").innerHTML = "";
	this.controller.get("watchLapPlaceholder").innerHTML = lapDivEmptyHTML + lapDivEmptyHTML;

	this.controller.setupWidget('btnStop', this.attributes={}, this.model={label:"Stop", buttonClass: 'palm-button negative disabled buttonfloat', disabled: true});
	this.btnStopHandler = this.btnStopHandler.bind(this);

	this.controller.setupWidget('btnLapReset', this.attributes={}, this.model={label:"Reset", buttonClass: 'palm-button buttonfloat', disabled: true});
	this.btnLapResetHandler = this.btnLapResetHandler.bind(this);

	this.controller.setupWidget('btnStart', this.attributes={}, this.model={label:"Start", buttonClass: 'palm-button affirmative buttonfloat', disabled: false});
	this.btnStartHandler = this.btnStartHandler.bind(this);

	//App Menu (handled in stage controller: stage-assistant.js)
	this.controller.setupWidget(Mojo.Menu.appMenu, Mojo.Controller.stageController.appMenuAttributes, Mojo.Controller.stageController.appMenuModel);

	//Command Menu (buttons on the bottom)
	this.cmdMenuAttributes = {
		menuClass: 'watch-command-menu'
	}
	this.cmdMenuModel = {
		visible: true,
		items: [
			{},
			{
				items: [
					{iconPath: 'assets/count-up.png', command:'do-Stopwatch'},
					{iconPath: 'assets/count-down.png', command:'do-Timer'}
				],toggleCmd:'do-Stopwatch', 
			},
			{}
		]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, this.cmdMenuAttributes, this.cmdMenuModel);
	Mojo.Log.info("## stopwatch - scene setup done."); 
};

StopwatchAssistant.prototype.activate = function(event) {
	Mojo.Log.info("Stopwatch scene activated.");
	if (appModel.AppSettingsCurrent["running"])	//If we came back to this scene when the timer was already running
	{
		var stopwatchTimerOffset = Date.now() - appModel.AppSettingsCurrent["StopWatchStartTime"];
		if (stopwatchTimerOffset >= stopWatchMaxValue)
		{
			Mojo.Log.warn("Not re-activating a full stopwatch!");
			stopTimer();
			this.setUIForStopped();
			document.getElementById("watchViewDetail").innerHTML = (5999999 / 100).toLongTimeValueMS();
			Mojo.Additions.ShowDialogBox("Stopwatch", "Wow! you've got lots of stamina! Unfortunately that's as high as this stopwatch can go...");
			stopWatchTimerInterval = false;
			lapTimerOffset=0;
			stopWatchTimerValue=0;
			appModel.AppSettingsCurrent["running"] = false;
		}
		else
		{
			Mojo.Log.warn("Re-activating running stopwatch!");
			if (!stopWatchTimerInterval)
			{
				Mojo.Log.warn("Activating stopwatch timer!");
				stopWatchTimerInterval = setInterval(this.incrementTimer, 100);
			}
			this.setUIForRunning();
		}
	}
	else
	{
		this.setUIForStopped();
		if (appModel.AppSettingsCurrent["LapTimes"].length > 0)	//Display previous lap times, if available
		{
			for (var l=0;l<appModel.AppSettingsCurrent["LapTimes"].length;l++)
			{
				this.addLapToList(l+1, appModel.AppSettingsCurrent["LapTimes"][l], true);
			}
			Mojo.Additions.DisableWidget("btnStart", true);
		}
		else	//Otherwise, get ready for our next run
		{
			Mojo.Additions.DisableWidget("btnLapReset", true);
			this.resetTimer();
		}
	}
	
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	Mojo.Event.listen(this.controller.get('btnStop'), Mojo.Event.tap, this.btnStopHandler);
	Mojo.Event.listen(this.controller.get('btnLapReset'), Mojo.Event.tap, this.btnLapResetHandler);
	Mojo.Event.listen(this.controller.get('btnStart'), Mojo.Event.tap, this.btnStartHandler);

};

//UI event handlers
StopwatchAssistant.prototype.btnStartHandler = function()
{
	Mojo.Log.info("starting timer at " + stopWatchTimerValue)
	appModel.AppSettingsCurrent["running"] = true;

	//Record start times and start timers
	appModel.AppSettingsCurrent["StopWatchStartTime"] = Date.now();
	appModel.AppSettingsCurrent["LapStartTime"] = Date.now();
	stopWatchTimerInterval = setInterval(this.incrementTimer, 100);
	this.setUIForRunning();
	systemModel.PlaySound("down2");
	appModel.SaveSettings();
}

StopwatchAssistant.prototype.btnStopHandler = function()
{
	Mojo.Log.info("The Stop button was pressed.");
	appModel.AppSettingsCurrent["running"] = false;
	stopTimer();

	//Update watch face
	var	stoppedTime = Number(stopWatchTimerValue / 100);
	document.getElementById("watchViewDetail").innerHTML = stoppedTime.toLongTimeValueMS();
	
	//Update laps
	var lapTimerOffset = Date.now() - appModel.AppSettingsCurrent["LapStartTime"];
	appModel.AppSettingsCurrent["LapTimerValue"] = appModel.AppSettingsCurrent["LapTimerValue"] + lapTimerOffset;;
	this.addLapToList(appModel.AppSettingsCurrent["LapTimes"].length, (appModel.AppSettingsCurrent["LapTimerValue"] / 100));
	this.setUIForStopped();
	systemModel.PlaySound("down2");
	appModel.SaveSettings();
}

StopwatchAssistant.prototype.btnLapResetHandler = function()
{
	if (appModel.AppSettingsCurrent["running"])	//Lap Button
	{
		Mojo.Log.info("The Lap button was pressed.");
		var lapTimerOffset = Date.now() - appModel.AppSettingsCurrent["LapStartTime"];
		appModel.AppSettingsCurrent["LapTimerValue"] = appModel.AppSettingsCurrent["LapTimerValue"] + lapTimerOffset;;
		this.addLapToList(appModel.AppSettingsCurrent["LapTimes"].length+1, (appModel.AppSettingsCurrent["LapTimerValue"] / 100));
		
		//Increment laps
		lapTimerOffset=0;
		appModel.AppSettingsCurrent["LapStartTime"]=Date.now();
		appModel.AppSettingsCurrent["LapTimerValue"]=0;
		systemModel.PlaySound("up2");
		appModel.SaveSettings();
	}
	else	//Reset Button
	{
		Mojo.Log.info("The Reset button was pressed.");
		stopTimer();
		this.resetTimer();

		this.setUIForStopped();
		Mojo.Additions.DisableWidget("btnLapReset", true);
		systemModel.PlaySound("delete_01");
		appModel.SaveSettings();
	}
}

//UI manipulation functions
StopwatchAssistant.prototype.addLapToList = function(showLap, timerValue, rehydrate) 
{
	var rowTables = document.getElementById("watchLapTimes").children;
	var rowExists = false;
	//Check if this row exists and needs to be updated
	for (var i = 0; i < rowTables.length; i++) {
		var currTableId = rowTables[i].id;
		if (currTableId == "Lap" + showLap)
		{
			rowExists = true;
			Mojo.Log.info("Updating existing lap row " + showLap + " with time " + timerValue);
			if (!rehydrate)	//store the lap in cookie (if its not already there)
				appModel.AppSettingsCurrent["LapTimes"][showLap] = timerValue;
			var countColumn = rowTables[i].getElementsByClassName("rightLap");
			for (var j=0; j < countColumn.length; j++)
			{
				var currColumn = countColumn[j];
				currColumn.title = timerValue.toString();
				currColumn.innerHTML = Number(timerValue).toLongTimeValueMS();
			}
		}
	}
	//If the row doesn't exist, we need to create it -- slightly differently for the first 2 rows
	if (!rowExists)
	{
		Mojo.Log.info("Creating new lap row " + showLap + " with time " + timerValue);
		if (!rehydrate)	//store the lap in cookie (if its not already there)
			appModel.AppSettingsCurrent["LapTimes"].push(timerValue);
		var newLap = "<table class='watchLap' id='Lap" + showLap + "'><tr><td class='leftLap'>Lap " + 
			showLap + "</td><td class='rightLap' title='" + timerValue.toString() + "'>" + 
			Number(timerValue).toLongTimeValueMS() + "</td></tr></table>";
		this.controller.get("watchLapTimes").innerHTML = newLap + this.controller.get("watchLapTimes").innerHTML;
	}
	//Add placeholder rows if needed
	if (showLap == 1)
		this.controller.get("watchLapPlaceholder").innerHTML = lapDivEmptyHTML;
	else
		this.controller.get("watchLapPlaceholder").innerHTML = "";

	//Update lap colors
	appModel.SaveSettings();
	this.updateBestWorstLaps();
}

StopwatchAssistant.prototype.updateBestWorstLaps = function() 
{	
	//Find lowest and highest laps
	var highestLapTime = 0;
	var lowestLapTime = 0;
	var rowTables = document.getElementById("watchLapTimes").children;
	for (var i = 0; i < rowTables.length; i++) {
		var countColumn = rowTables[i].getElementsByClassName("rightLap");
		for (var j=0; j < countColumn.length; j++)
		{
			var currColumn = countColumn[j];
			var currLapTime = parseInt(currColumn.title);
			if (lowestLapTime == 0 || currLapTime < lowestLapTime)
				lowestLapTime = currLapTime;
			if (currLapTime > highestLapTime)
				highestLapTime = currLapTime;
		}
	}

	//Compare all laps to lowest and highest
	for (var i = 0; i < rowTables.length; i++) {
		var countColumn = rowTables[i].getElementsByClassName("rightLap");
		for (var j=0; j < countColumn.length; j++)
		{
			var currColumn = countColumn[j];
			var currLapTime = parseInt(currColumn.title);
			currColumn.className = "rightLap default";
			if (currLapTime >= highestLapTime)
			{
				currColumn.className = "rightLap high";
			}
			if (currLapTime <= lowestLapTime)
			{
				currColumn.className = "rightLap low";
			}
		}
	}
}

StopwatchAssistant.prototype.setUIForRunning = function()
{
	systemModel.PreventDisplaySleep();
	//Update Widgets
	Mojo.Additions.SetWidgetLabel("btnLapReset", "Lap");
	Mojo.Additions.DisableWidget("btnStart", true);
	Mojo.Additions.DisableWidget("btnLapReset", false);
	Mojo.Additions.DisableWidget("btnStop", false);
	//Re-draw laps
	for (var l=0;l<appModel.AppSettingsCurrent["LapTimes"].length;l++)
	{
		this.addLapToList(l+1, appModel.AppSettingsCurrent["LapTimes"][l], true);
	}
}

StopwatchAssistant.prototype.setUIForStopped = function()
{
	systemModel.AllowDisplaySleep();
	//Update UI
	Mojo.Additions.SetWidgetLabel("btnLapReset", "Reset");
	Mojo.Additions.DisableWidget("btnStart", false);
	Mojo.Additions.DisableWidget("btnLapReset", false);
	Mojo.Additions.DisableWidget("btnStop", true);
}

StopwatchAssistant.prototype.deactivate = function(event) {
	Mojo.Log.info("Stopwatch scene deactivated.");
	systemModel.AllowDisplaySleep();
	appModel.SaveSettings();
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	
	Mojo.Event.stopListening(this.controller.get('btnStop'),Mojo.Event.tap, this.btnStopHandler)
	Mojo.Event.stopListening(this.controller.get('btnLapReset'),Mojo.Event.tap, this.btnLapResetHandler)
	Mojo.Event.stopListening(this.controller.get('btnStart'),Mojo.Event.tap, this.btnStartHandler)
};

StopwatchAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	systemModel.AllowDisplaySleep();
};

//Timer functions
StopwatchAssistant.prototype.incrementTimer = function()
{
	//Increment timer
	appModel.AppSettingsCurrent["running"] = true;
	var stopwatchTimerOffset = Date.now() - appModel.AppSettingsCurrent["StopWatchStartTime"];
	var showTimerValue = stopWatchTimerValue + stopwatchTimerOffset;
	try
	{
		if (showTimerValue < stopWatchMaxValue)
		{
			document.getElementById("watchViewDetail").innerHTML = (showTimerValue / 100).toLongTimeValueMS();
		}
		else
		{
			Mojo.Log.error("stopwatch full at " + showTimerValue);
			//stopTimer();
			Mojo.Controller.stageController.swapScene({transition: Mojo.Transition.none, name: "stopwatch"});
		}
	}
	catch (error)
	{
		//won't be able to update if the scene is not active, but that's ok
	}
}

stopTimer = function()
{
	//Stop Timer
	Mojo.Log.info("Stopping timer.");
	clearInterval(stopWatchTimerInterval);
	stopWatchTimerInterval = false;
	
	appModel.AppSettingsCurrent["running"] = false;
	var stopwatchTimerOffset = Date.now() - appModel.AppSettingsCurrent["StopWatchStartTime"];
	stopWatchTimerValue = stopWatchTimerValue + stopwatchTimerOffset;
}

StopwatchAssistant.prototype.resetTimer = function()
{
	//Reset global variables
	stopWatchTimerInterval = false;
	lapTimerOffset=0;
	stopWatchTimerValue=0;
	appModel.AppSettingsCurrent["LapCount"] = 0;
	appModel.AppSettingsCurrent["LapTimerValue"]=0;
	appModel.AppSettingsCurrent["LapTimes"].length = 0;
	appModel.AppSettingsCurrent["running"] = false;

	//Reset the timer face
	this.controller.get("watchViewDetail").innerHTML = timerStartValue.toLongTimeValueMS();
	this.controller.get("watchLapTimes").innerHTML = "";
	this.controller.get("watchLapPlaceholder").innerHTML = lapDivEmptyHTML + lapDivEmptyHTML;
}

//Helper functions
Number.prototype.toLongTimeValueMS = function() {
	
	//Calculate time segments
	var milliseconds = this * 100;
	var seconds = Math.floor(milliseconds/1000);
	var minutes = Math.floor(milliseconds/60000);
	
	//Format milliseconds into a single digit
	milliseconds = milliseconds - (seconds * 1000);
	milliseconds = milliseconds.toString().substr(0, 1);

	//Format seconds into exactly 2 digits
	if (seconds > 59)
		seconds = seconds - (minutes * 60)
	if (seconds < 10)
		seconds = "0" + seconds;

	//Format minutes into exactly 2 digits
	if (minutes < 0)
		minutes = "00";
	else if (minutes < 10)
		minutes = "0" + minutes;

	//Return formatted string
	return minutes + ":" + seconds + "." + milliseconds;
}

