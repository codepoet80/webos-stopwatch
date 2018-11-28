function StopwatchAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

var running=false;
var timerStartValue=0;	//Value to start the timer at (non-0 for debugging)
var stopWatchStartTime=0;	//TODO: Replace this with a cookie so we can use on re-launch
var stopWatchTimerValue=0;
var lapStartTime=0;	
var lapTimerValue=0;
var lapCount = 0; //Value to start the laps at (non-0 for debugging)
var stopWatchTimerInterval;
var lapDivEmptyHTML = "<table class='watchLap'><tr><td>&nbsp;</td></tr></table>";

//Timer functions
StopwatchAssistant.prototype.incrementTimer = function()
{
	//Increment timer
	running = true;
	var stopwatchTimerOffset = Date.now() - stopWatchStartTime;
	var showTimerValue = stopWatchTimerValue + stopwatchTimerOffset;
	try
	{
		document.getElementById("watchViewDetail").innerHTML = (showTimerValue / 100).toLongTimeValueMS();
	}
	catch (error)
	{
		//won't be able to update if the scene is not active, but that's ok
	}
}

StopwatchAssistant.prototype.stopTimer = function()
{
	//Stop Timer
	Mojo.Log.info("Stopping timer.");
	running = false;
	clearInterval(stopWatchTimerInterval);

	var stopwatchTimerOffset = Date.now() - stopWatchStartTime;
	stopWatchTimerValue = stopWatchTimerValue + stopwatchTimerOffset;
}

//UI event handlers
StopwatchAssistant.prototype.btnStartHandler = function()
{
	Mojo.Log.info("starting timer at " + stopWatchTimerValue)
	running = true;

	//Record start times and start timers
	stopWatchStartTime = Date.now();
	lapStartTime = Date.now();
	stopWatchTimerInterval = setInterval(this.incrementTimer, 100);
	this.setUIForRunning();
	systemModel.PlaySound("down2");
}

StopwatchAssistant.prototype.btnStopHandler = function()
{
	Mojo.Log.info("The Stop button was pressed.");
	running = false;
	this.stopTimer();

	//Update watch face
	var	stoppedTime = Number(stopWatchTimerValue / 100);
	document.getElementById("watchViewDetail").innerHTML = stoppedTime.toLongTimeValueMS();
	
	//Update laps
	var lapTimerOffset = Date.now() - lapStartTime;
	lapTimerValue = lapTimerValue + lapTimerOffset;;
	this.addLapToList(lapCount+1, (lapTimerValue / 100));
	this.setUIForStopped();
	systemModel.PlaySound("down2");
}

StopwatchAssistant.prototype.btnLapResetHandler = function()
{
	if (running)	//Lap Button
	{
		Mojo.Log.info("The Lap button was pressed.");
		var lapTimerOffset = Date.now() - lapStartTime;
		lapTimerValue = lapTimerValue + lapTimerOffset;;
		this.addLapToList(lapCount+1, (lapTimerValue / 100));
		
		//Increment laps
		lapStartTime=Date.now();
		lapTimerOffset=0;
		lapTimerValue=0;
		lapCount++;
		systemModel.PlaySound("up2");
	}
	else	//Reset Button
	{
		Mojo.Log.info("The Reset button was pressed.");
		this.stopTimer();
		running = false;

		//Reset global variables
		lapTimerOffset=0;
		lapTimerValue=0;
		lapCount = 0;
		stopWatchTimerValue=timerStartValue;
		Mojo.Additions.DisableWidget("btnLapReset", true);

		//Reset the timer
		this.controller.get("watchViewDetail").innerHTML = timerStartValue.toLongTimeValueMS();
		this.controller.get("watchLapTimes").innerHTML = "";
		this.controller.get("watchLapPlaceholder").innerHTML = lapDivEmptyHTML + lapDivEmptyHTML;
		systemModel.PlaySound("delete_01");
	}
}

//UI manipulation functions
StopwatchAssistant.prototype.addLapToList = function(showLap, timerValue) 
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

//Mojo interface implementations
StopwatchAssistant.prototype.setup = function() {
	Mojo.Log.info("Stopwatch scene started."); 
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
	this.controller.setupWidget(Mojo.Menu.appMenu, {}, Mojo.Controller.stageController.appMenuModel);

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
					{iconPath: 'images/count-up.png', command:'do-Stopwatch'},
					{iconPath: 'images/count-down.png', command:'do-Timer'}
				],toggleCmd:'do-Stopwatch', 
			},
			{}
		]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, this.cmdMenuAttributes, this.cmdMenuModel);
	Mojo.Log.info("Scene setup done."); 
};

StopwatchAssistant.prototype.activate = function(event) {
	Mojo.Log.info("Stopwatch scene activated.");
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	
	Mojo.Event.listen(this.controller.get('btnStop'), Mojo.Event.tap, this.btnStopHandler);
	Mojo.Event.listen(this.controller.get('btnLapReset'), Mojo.Event.tap, this.btnLapResetHandler);
	Mojo.Event.listen(this.controller.get('btnStart'), Mojo.Event.tap, this.btnStartHandler);

	if (running)	//If we came back to this scene when the timer was already running
	{
		this.setUIForRunning();
		//TODO: Need to re-draw lap rows too
	}
	else
	{
		this.setUIForStopped();
		//Reset counters
		stopWatchTimerValue = timerStartValue;
		lapCount = 0;
	}
};

StopwatchAssistant.prototype.deactivate = function(event) {
	Mojo.Log.info("Stopwatch scene deactivated.");
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	
	Mojo.Event.stopListening(this.controller.get('btnStop'),Mojo.Event.tap, this.btnStopHandler)
	Mojo.Event.stopListening(this.controller.get('btnLapReset'),Mojo.Event.tap, this.btnLapResetHandler)
	Mojo.Event.stopListening(this.controller.get('btnStart'),Mojo.Event.tap, this.btnStartHandler)
	systemModel.AllowDisplaySleep();
};

StopwatchAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	systemModel.AllowDisplaySleep();
};

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