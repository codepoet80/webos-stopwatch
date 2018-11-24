function TimerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

var timerInterval;
var timerStartTime;
var timerDuration;

TimerAssistant.prototype.btnStartHandler = function()
{
	Mojo.Log.info("Start button pressed!");
	var Hours = Number((this.controller.get("hour_field").innerText).trim());
	var Mins = Number((this.controller.get("minute_field").innerText).trim());
	Mojo.Controller.getAppController().showBanner("Count down: "+ Hours + " hours, " + Mins + " minutes...", {source: 'notification'});
	Mojo.Additions.DisableWidget("btnStop", false);
	document.getElementById('runningSpinner').style.display = "block";
	//Start timers
	timerStartTime = Date.now();
	timerDuration = ((Hours * 60) * 60) * 1000;
	timerDuration += (Mins * 60) * 1000;
	Mojo.Log.info("Timer set for " + timerDuration + " milliseconds");
	timerInterval = setInterval(this.incrementTimer, 1000);
	//Setup system alarm
}

TimerAssistant.prototype.incrementTimer = function()
{
	//Increment timer
	var stopwatchTimerOffset = Date.now() - timerStartTime;
	var showTimerValue = timerDuration - stopwatchTimerOffset;
	if (showTimerValue < 1000)
	{
		clearInterval(timerInterval);
		document.getElementById("timerViewFace").innerHTML = "00:00";
		document.getElementById('runningSpinner').style.display = "none";
	}
	else
	{
		document.getElementById("timerViewFace").innerHTML = showTimerValue.toLongTimeValue();
	}
}

TimerAssistant.prototype.btnResetHandler = function()
{
	Mojo.Log.info("Reset button pressed!");
	this.btnStopHandler();
	Mojo.Additions.DisableWidget("btnStart", true);
	this.controller.get("timerViewFace").innerHTML = "00:00";
	this.SetPickerValue("hour_field", "0");
	this.SetPickerValue("minute_field", "1");
	document.getElementById('timerViewFace').style.display = "block";
	document.getElementById('timerViewPicker').style.display = "none";
}

TimerAssistant.prototype.btnStopHandler = function()
{
	Mojo.Log.info("Stop button pressed!");
	//Cancel timers
	clearInterval(timerInterval);
	//Cancel system alarm
	Mojo.Additions.DisableWidget("btnStart", false);
	Mojo.Additions.DisableWidget("btnStop", true);
	document.getElementById('runningSpinner').style.display = "none";
}

TimerAssistant.prototype.setup = function() {
	Mojo.Log.info("Timer scene started."); 
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	/* setup widgets here */
	this.controller.get("timerViewTitle").innerHTML = "Timer";
	this.controller.get("timerViewFace").innerHTML = "00:00";
	//this.controller.get("timerCompleteOptionsDiv").innerHTML = "Play a sound";

	this.controller.setupWidget('btnStop', this.attributes={}, this.model={label:"Stop", buttonClass: 'palm-button negative buttonfloat', disabled: true});
	this.btnStopHandler = this.btnStopHandler.bind(this);

	this.controller.setupWidget('btnReset', this.attributes={}, this.model={label:"Reset", buttonClass: 'palm-button buttonfloat', disabled: false});
	this.btnResetHandler = this.btnResetHandler.bind(this);

	this.controller.setupWidget('btnStart', this.attributes={}, this.model={label:"Start", buttonClass: 'palm-button affirmative buttonfloat', disabled: true});
	this.btnStartHandler = this.btnStartHandler.bind(this);

	this.controller.setupWidget("hour_field",
		this.attributes = {
			label: ' ',
			labelPlacement: Mojo.Widget.labelPlacementRight,
			modelProperty: 'value',
			min: 0,
			max: 23,
			padNumbers: true
		},
		this.model = {
			value: 0
		}
	); 
	this.propertyChanged = this.propertyChanged.bind(this);
	
	this.controller.setupWidget("minute_field",
		this.attributes = {
			label: ' ',
			labelPlacement: Mojo.Widget.labelPlacementLeft,
			modelProperty: 'value',
			min: 0,
			max: 59,
			padNumbers: true
		},
		this.model = {
			value: 0
		}
	); 
	this.propertyChanged = this.propertyChanged.bind(this);

	this.controller.setupWidget("runningSpinner",
		this.attributes = {
			spinnerSize: "small"
		},
		this.model = {
			spinning: true
		}
	);
	
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
				],toggleCmd:'do-Timer', 
			},
			{}
		]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, this.cmdMenuAttributes, this.cmdMenuModel);
	
	Mojo.Log.info("Scene setup done."); 

	/* app-level event handlers */
	//Mojo.Event.listen(this.controller.stageController.document, Mojo.Event.stageDeactivate, this.appDeactivated);
	//Mojo.Event.listen(this.controller.stageController.document, Mojo.Event.stageActivate, this.appActivated);
};

TimerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	document.getElementById('runningSpinner').style.display = "none";
	Mojo.Event.listen(this.controller.get('btnStop'), Mojo.Event.tap, this.btnStopHandler);
	Mojo.Event.listen(this.controller.get('btnReset'), Mojo.Event.tap, this.btnResetHandler);
	Mojo.Event.listen(this.controller.get('btnStart'), Mojo.Event.tap, this.btnStartHandler);
	Mojo.Event.listen(this.controller.get('timerViewFace'), Mojo.Event.tap, this.timerFaceTapped);
	Mojo.Event.listen(this.controller.get('hour_field'), Mojo.Event.propertyChange, this.propertyChanged);
	Mojo.Event.listen(this.controller.get('minute_field'), Mojo.Event.propertyChange, this.propertyChanged);

};

TimerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	Mojo.Event.stopListening(this.controller.get('btnStop'),Mojo.Event.tap, this.btnStopHandler)
	Mojo.Event.stopListening(this.controller.get('btnReset'),Mojo.Event.tap, this.btnResetHandler)
	Mojo.Event.stopListening(this.controller.get('btnStart'),Mojo.Event.tap, this.btnStartHandler)
	Mojo.Event.stopListening(this.controller.get('timerViewFace'), Mojo.Event.tap, this.timerFaceTapped);
	Mojo.Event.stopListening(this.controller.get('hour_field'), Mojo.Event.propertyChange, this.propertyChanged);
	Mojo.Event.stopListening(this.controller.get('minute_field'), Mojo.Event.propertyChange, this.propertyChanged);
};

TimerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};


TimerAssistant.prototype.timerFaceTapped = function(event){
	Mojo.Log.info("the watch face was tapped");
	document.getElementById('timerViewFace').style.display = "none";
	document.getElementById('timerViewPicker').style.display = "block";
	Mojo.Log.error("visibility was toggled");
}

TimerAssistant.prototype.propertyChanged = function(event){
	/* log the text field value when the value changes */
	Mojo.Log.info("a field changed");
	var Hours = (this.controller.get("hour_field").innerText).trim();
	var Mins = (this.controller.get("minute_field").innerText).trim();

	this.controller.get("timerViewFace").innerHTML = Hours + ":" + Mins;
	document.getElementById('timerViewFace').style.display = "block";
	document.getElementById('timerViewPicker').style.display = "none";

	if (Number(Mins) > 0 || Number(Hours) > 0)
	{
		Mojo.Additions.DisableWidget("btnStart", false);
	}
	//this.showDialogBox("Integer changed", "The value of the Integer field is now: " + event.value);
}

TimerAssistant.prototype.SetPickerValue = function(widgetName, newvalue)
{
	var thisWidgetModel = this.controller.getWidgetSetup(widgetName).model;
	thisWidgetModel.value = newvalue;
	this.controller.setWidgetModel(widgetName, thisWidgetModel);
}

//Helper functions
Number.prototype.toLongTimeValue = function() {

	//Calculate time segments
	var milliseconds = this;
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
	return minutes + ":" + seconds
}