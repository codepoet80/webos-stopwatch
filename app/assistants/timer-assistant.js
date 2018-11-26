function TimerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

var timerInterval;
var timerStartTime;
var timerDuration;
var timerResetValue = "00:00:00";

TimerAssistant.prototype.btnStartHandler = function()
{
	Mojo.Log.info("## timer - Start button pressed!");
	var Hours = Number((this.controller.get("hour_field").innerText).trim()).padWithZeroes();
	var Mins = Number((this.controller.get("minute_field").innerText).trim()).padWithZeroes();
	var Seconds = Number((this.controller.get("second_field").innerText).trim()).padWithZeroes();
	
	Mojo.Controller.getAppController().showBanner("Countdown: "+ Hours + "H:" + Mins + "M:" + Seconds + "S", {source: 'notification'});
	Mojo.Additions.DisableWidget("btnStop", false);
	document.getElementById('runningSpinner').style.display = "block";
	//Start timers
	timerStartTime = Date.now();
	timerDuration = ((Hours * 60) * 60) * 1000;
	timerDuration += (Mins * 60) * 1000;
	timerDuration += (Seconds * 1000);
	Mojo.Log.info("## timer - timer set for " + timerDuration + " milliseconds");
	this.incrementTimer();
	timerInterval = setInterval(this.incrementTimer, 1000);
	//Setup system alarm
	systemService.SetSystemAlarmRelative("JonsTimer", Hours + ":" + Mins + ":" + Seconds + ".00");
	systemService.PlaySound("down2");
}

TimerAssistant.prototype.incrementTimer = function()
{
	//Increment timer
	var stopwatchTimerOffset = Date.now() - timerStartTime;
	var showTimerValue = timerDuration - stopwatchTimerOffset;
	if (showTimerValue < 1000)
	{
		clearInterval(timerInterval);
	}
	else
	{
		try
		{
			document.getElementById("timerViewFace").innerHTML = showTimerValue.toLongTimeValue();
		}
		catch(error)
		{
			//won't be able to update if the scene is not active, but that's ok
		}
	}
}

TimerAssistant.prototype.timerDone = function()
{
	clearInterval(timerInterval);
	//Reset some things
	this.SetPickerValue("hour_field", "0");
	this.SetPickerValue("minute_field", "0");
	this.SetPickerValue("second_field", "0");
	document.getElementById("timerViewFace").innerHTML = timerResetValue;
	document.getElementById('runningSpinner').style.display = "none";
	Mojo.Additions.DisableWidget("btnStop", true);
	Mojo.Additions.DisableWidget("btnStart", true);
	
	Mojo.Controller.getAppController().showBanner("Timer finished!", {source: 'notification'});
	Mojo.Controller.getAppController().playSoundNotification('vibrate', "/media/internal/ringtones/Rain Dance.mp3", 5);
	
	//Clear system timer
	systemService.ClearSystemAlarm("JonsTimer");
	//figure out how to make a sound
	Mojo.Controller.getAppController().showBanner("Timer finished!", {source: 'notification'});
	//figure out how to vibrate
	systemService.Vibrate(1000, 1000);
	Mojo.Controller.getAppController().playSoundNotification('vibrate', "/media/internal/ringtones/Rain Dance.mp3", 5);
	
}

TimerAssistant.prototype.btnResetHandler = function()
{
	Mojo.Log.info("## timer - reset button pressed!");
	this.btnStopHandler();
	Mojo.Additions.DisableWidget("btnStart", true);
	this.controller.get("timerViewFace").innerHTML = timerResetValue;
	this.SetPickerValue("hour_field", "0");
	this.SetPickerValue("minute_field", "0");
	this.SetPickerValue("second_field", "0");
	document.getElementById('timerViewFace').style.display = "block";
	document.getElementById('timerViewPicker').style.display = "none";
	systemService.PlaySound("delete_01");
}

TimerAssistant.prototype.btnStopHandler = function()
{
	Mojo.Log.info("## timer - stop button pressed!");
	//Cancel timers
	clearInterval(timerInterval);
	//Cancel system alarm
	Mojo.Additions.DisableWidget("btnStart", false);
	Mojo.Additions.DisableWidget("btnStop", true);
	document.getElementById('runningSpinner').style.display = "none";
	systemService.PlaySound("down2");
}

TimerAssistant.prototype.setup = function() {
	Mojo.Log.info("## timer - scene started."); 
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	/* setup widgets here */
	this.controller.get("timerViewTitle").innerHTML = "Timer";
	this.controller.get("timerViewFace").innerHTML = timerResetValue;

	this.btnStopHandler = this.btnStopHandler.bind(this);
	this.controller.setupWidget('btnStop', this.attributes={}, this.model={label:"Stop", buttonClass: 'palm-button negative buttonfloat', disabled: true});

	this.btnResetHandler = this.btnResetHandler.bind(this);
	this.controller.setupWidget('btnReset', this.attributes={}, this.model={label:"Reset", buttonClass: 'palm-button buttonfloat', disabled: false});

	this.btnStartHandler = this.btnStartHandler.bind(this);
	this.controller.setupWidget('btnStart', this.attributes={}, this.model={label:"Start", buttonClass: 'palm-button affirmative buttonfloat', disabled: true});

	this.propertyChanged = this.propertyChanged.bind(this);
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

	this.controller.setupWidget("second_field",
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
	
	Mojo.Log.info("## timer - scene setup done."); 

	/* app-level event handlers */
	//Mojo.Event.listen(this.controller.stageController.document, Mojo.Event.stageDeactivate, this.appDeactivated);
	//Mojo.Event.listen(this.controller.stageController.document, Mojo.Event.stageActivate, this.appActivated);
};

TimerAssistant.prototype.activate = function(event) {
	if (alarmLaunch)
	{
		Mojo.Log.info("timer scene launched because of alarm");
		alarmLaunch = false;
		this.timerDone();
	}
	else
	{
		Mojo.Log.info("timer scene launched without an alarm");
	}
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	document.getElementById('runningSpinner').style.display = "none";
	Mojo.Event.listen(this.controller.get('btnStop'), Mojo.Event.tap, this.btnStopHandler);
	Mojo.Event.listen(this.controller.get('btnReset'), Mojo.Event.tap, this.btnResetHandler);
	Mojo.Event.listen(this.controller.get('btnStart'), Mojo.Event.tap, this.btnStartHandler);
	Mojo.Event.listen(this.controller.get('timerViewFace'), Mojo.Event.tap, this.timerFaceTapped);
	Mojo.Event.listen(this.controller.get('hour_field'), Mojo.Event.propertyChange, this.propertyChanged);
	Mojo.Event.listen(this.controller.get('minute_field'), Mojo.Event.propertyChange, this.propertyChanged);
	Mojo.Event.listen(this.controller.get('second_field'), Mojo.Event.propertyChange, this.propertyChanged);

	
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
	Mojo.Event.stopListening(this.controller.get('second_field'), Mojo.Event.propertyChange, this.propertyChanged);
};

TimerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};


TimerAssistant.prototype.timerFaceTapped = function(event){
	Mojo.Log.info("## timer - the watch face was tapped");
	document.getElementById('timerViewFace').style.display = "none";
	document.getElementById('timerViewPicker').style.display = "block";
	Mojo.Log.error("## timer - visibility was toggled");
}

TimerAssistant.prototype.propertyChanged = function(event){
	/* log the text field value when the value changes */
	Mojo.Log.info("## timer - a field changed");
	var Hours = (this.controller.get("hour_field").innerText).trim();
	var Mins = (this.controller.get("minute_field").innerText).trim();
	var Seconds = (this.controller.get("second_field").innerText).trim();

	this.controller.get("timerViewFace").innerHTML = Hours + ":" + Mins + ":" + Seconds;
	document.getElementById('timerViewFace').style.display = "block";
	document.getElementById('timerViewPicker').style.display = "none";

	if (Number(Seconds) > 0 || Number(Mins) > 0 || Number(Hours) > 0)
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
	var hours = Math.floor(minutes/60);
	
	//Format milliseconds into a single digit
	milliseconds = milliseconds - (seconds * 1000);
	milliseconds = milliseconds.toString().substr(0, 1);

	//Format time segments into exactly 2 digits
	if (seconds > 59)
		seconds = seconds - (minutes * 60)
	seconds = seconds.padWithZeroes();
	minutes = minutes.padWithZeroes();
	hours = hours.padWithZeroes();

	//Return formatted string
	return hours + ":" + minutes + ":" + seconds;
}

Number.prototype.padWithZeroes = function() {
	numberToPad = this;
	if (numberToPad < 10)
		numberToPad = "0" + numberToPad;
	return numberToPad;
}