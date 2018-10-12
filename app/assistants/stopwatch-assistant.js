function StopwatchAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

var running=false;
var sceneTitle="Stopwatch";
var timerStartValue=0;	//Value to start the timer at (non-0 for debugging)
var stopWatchTimerValue=0;	//Init the timer (will be set later)
var stopWatchTimerInterval;
var lapCount = 0;
var lapDivEmptyHTML = "<table class='watchLap'><tr><td>&nbsp;</td></tr></table>";



StopwatchAssistant.prototype.btnStopHandler = function()
{
	//TODO: This is wonky if you stop and start without resetting
	
	Mojo.Log.info("The Stop button was pressed.");
	//Stop Timer
	running = false;
	clearInterval(stopWatchTimerInterval);

	//Update watch face
	document.getElementById("watchViewDetail").innerHTML = stopWatchTimerValue.toLongTimeValue();
	this.addLapToList(lapCount+1, stopWatchTimerValue);

	//Update UI
	this.SetWidgetLabel("btnLapReset", "Reset");
	this.SetWidgetDisablement("btnStart", false);
	this.SetWidgetDisablement("btnLapReset", false);
	this.SetWidgetDisablement("btnStop", true);
}

StopwatchAssistant.prototype.btnLapResetHandler = function()
{
	if (running)
	{
		Mojo.Log.info("The Lap button was pressed.");
		this.addLapToList(lapCount+1, stopWatchTimerValue);
		
		//Increment laps
		this.controller.get("watchViewDetail").innerHTML = timerStartValue.toLongTimeValue();
		stopWatchTimerValue=timerStartValue;
		lapCount++;
	}
	else
	{
		Mojo.Log.info("The Reset button was pressed.");
		
		//Reset global variables
		lapCount = 0;
		stopWatchTimerValue=timerStartValue;
		this.SetWidgetDisablement("btnLapReset", true);

		//Reset the timer
		this.controller.get("watchViewDetail").innerHTML = timerStartValue.toLongTimeValue();
		this.controller.get("watchLapTimes").innerHTML = "";
		this.controller.get("watchLapPlaceholder").innerHTML = lapDivEmptyHTML + lapDivEmptyHTML
	}
}

StopwatchAssistant.prototype.addLapToList = function(showLap, timerValue) {

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
				currColumn.innerHTML = timerValue.toLongTimeValue();
			}
		}
	}
	//If the row doesn't exist, we need to create it -- slightly differently for the first 2 rows
	if (!rowExists)
	{
		Mojo.Log.info("Creating new lap row " + showLap + " with time " + timerValue);
		var newLap = "<table class='watchLap' id='Lap" + showLap + "'><tr><td class='leftLap'>Lap " + 
			showLap + "</td><td class='rightLap' title='" + timerValue.toString() + "'>" + 
			timerValue.toLongTimeValue() + "</td></tr></table>";
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

StopwatchAssistant.prototype.updateBestWorstLaps = function() {
	
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

StopwatchAssistant.prototype.btnStartHandler = function()
{
	Mojo.Log.info("The Start button was pressed.");
	//Start Timer
	running = true;
	stopWatchTimerInterval = setInterval(this.incrementTimer, 100);

	//Update UI
	this.SetWidgetLabel("btnLapReset", "Lap");
	this.SetWidgetDisablement("btnStart", true);
	this.SetWidgetDisablement("btnLapReset", false);
	this.SetWidgetDisablement("btnStop", false);
}

StopwatchAssistant.prototype.incrementTimer = function()
{
	stopWatchTimerValue++;
	document.getElementById("watchViewDetail").innerHTML = stopWatchTimerValue.toLongTimeValue();
}

StopwatchAssistant.prototype.setup = function() {
	Mojo.Log.info("Scene started."); 
	/* this function is for setup tasks that have to happen when the scene is first created */
	stopWatchTimerValue = timerStartValue;

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	this.controller.get("watchViewTitle").innerHTML = sceneTitle;
	this.controller.get("watchViewDetail").innerHTML = timerStartValue.toLongTimeValue();
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
					{iconPath: 'images/count-up.png', command:'countUp'},
					{iconPath: 'images/count-down.png', command:'countDown'}
				],toggleCmd:'countUp', 
			},
			{}
		]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, this.cmdMenuAttributes, this.cmdMenuModel);

	/* add event handlers to listen to events from widgets */
	Mojo.Log.info("Scene setup done."); 
};

StopwatchAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	Mojo.Event.listen(this.controller.get('btnStop'), Mojo.Event.tap, this.btnStopHandler);
	Mojo.Event.listen(this.controller.get('btnLapReset'), Mojo.Event.tap, this.btnLapResetHandler);
	Mojo.Event.listen(this.controller.get('btnStart'), Mojo.Event.tap, this.btnStartHandler);
};

StopwatchAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	Mojo.Event.stopListening(this.controller.get('btnStop'),Mojo.Event.tap, this.btnStopHandler)
	Mojo.Event.stopListening(this.controller.get('btnLapReset'),Mojo.Event.tap, this.btnLapResetResetHandler)
	Mojo.Event.stopListening(this.controller.get('btnStart'),Mojo.Event.tap, this.btnStartHandler)
};

StopwatchAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

//Helper functions
StopwatchAssistant.prototype.SetWidgetDisablement = function(widgetName, newvalue)
{
	var thisWidgetModel = this.controller.getWidgetSetup(widgetName).model;
	thisWidgetModel.disabled = newvalue;
	this.controller.setWidgetModel(widgetName, thisWidgetModel);
	//This might not be necessary. Nothing seems to care, but this site said to do it: https://semisignal.com/changing-the-model-of-activity-buttons-on-webos/
	//	this.controller.modelChanged(this.controller.get(widgetName));
}

StopwatchAssistant.prototype.SetWidgetLabel = function(widgetName, newvalue)
{
	var thisWidgetModel = this.controller.getWidgetSetup(widgetName).model;
	thisWidgetModel.label = newvalue;
	this.controller.setWidgetModel(widgetName, thisWidgetModel);
}

Number.prototype.toLongTimeValue = function() {
	
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