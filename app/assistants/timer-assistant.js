function TimerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

var running;
var timerInterval;
var timerStartTime;
var timerDuration;
var timerCount;
var timerCurrentValue;	//do i need this?
var timerResetValue = "00:00:00";

TimerAssistant.prototype.btnStartHandler = function()
{
	Mojo.Log.info("## timer - Start button pressed!");
	
	//TODO: Need to re-establish timer from existing if user stop/started
	var Hours = Number((this.controller.get("hour_field").innerText).trim()).padWithZeroes();
	var Mins = Number((this.controller.get("minute_field").innerText).trim()).padWithZeroes();
	var Seconds = Number((this.controller.get("second_field").innerText).trim()).padWithZeroes();
	
	//Start timers
	running = true;
	timerCount = 0;
	timerStartTime = Date.now();
	timerDuration = ((Hours * 60) * 60) * 1000;
	timerDuration += (Mins * 60) * 1000;
	timerDuration += (Seconds * 1000);
	Mojo.Log.info("## timer - timer set for " + timerDuration + " milliseconds");

	//Set the timer value now, then repeatedly
	this.incrementTimer(timerDuration);
	timerInterval = setInterval(this.incrementTimer, 1000);

	this.setUIForRunning();
	systemService.SetSystemAlarmRelative("JonsTimer", Hours + ":" + Mins + ":" + Seconds + ".00");
	systemService.PlaySound("down2");
}

TimerAssistant.prototype.incrementTimer = function(showTimerValue)
{
	//Increment timer
	if (!showTimerValue)
	{
		timerCount++;
		var stopwatchTimerOffset = timerCount * 1000;
		var showTimerValue = timerDuration - stopwatchTimerOffset;
		//Mojo.Log.info("Updating timer using offsetvalue value " + stopwatchTimerOffset + " for timer value " + showTimerValue);
	}
	else
	{
		//Mojo.Log.info("Updating timer using passed value " + showTimerValue);
	}
	try
	{
		if (showTimerValue < 1000)
		{
			clearInterval(timerInterval);
			document.getElementById("timerViewFace").innerHTML = timerResetValue;
		}
		else
		{
			document.getElementById("timerViewFace").innerHTML = showTimerValue.toLongTimeValue();
			document.getElementById('runningSpinner').style.display = "block";
		}
	}
	catch(error)
	{
		//won't be able to update if the scene is not active, but that's ok
	}
}

TimerAssistant.prototype.timerDone = function()
{
	Mojo.Controller.getAppController().showBanner("Timer done!", {source:'notification'});
	if (appModel.AppSettingsCurrent["SoundEnabled"] == "true")
		systemService.PlaySound("alert_buzz");
	if (appModel.AppSettingsCurrent["VibeEnabled"] == "true")
		Mojo.Controller.getAppController().playSoundNotification("vibrate");
	running = false;
	clearInterval(timerInterval);

	//Clear system timer
	systemService.ClearSystemAlarm("JonsTimer");
}

TimerAssistant.prototype.btnStopHandler = function()
{
	Mojo.Log.info("## timer - stop button pressed!");
	//Cancel timers
	running = false;
	clearInterval(timerInterval);
	systemService.ClearSystemAlarm("JonsTimer");
	this.setUIForReset();
	systemService.PlaySound("delete_01");
}

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
}

TimerAssistant.prototype.setUIForRunning = function ()
{
	Mojo.Additions.DisableWidget("btnStart", true);
	Mojo.Additions.DisableWidget("btnStop", false);
	document.getElementById('runningSpinner').style.display = "block";
}

TimerAssistant.prototype.setUIForStopped = function ()
{
	Mojo.Additions.DisableWidget("btnStart", false);
	Mojo.Additions.DisableWidget("btnStop", true);
	document.getElementById('runningSpinner').style.display = "none";
}

TimerAssistant.prototype.setUIForReset = function ()
{
	Mojo.Additions.DisableWidget("btnStart", true);
	Mojo.Additions.DisableWidget("btnStop", true);
	this.controller.get("timerViewFace").innerHTML = timerResetValue;
	Mojo.Additions.SetPickerWidgetValue("hour_field", "0");
	Mojo.Additions.SetPickerWidgetValue("minute_field", "0");
	Mojo.Additions.SetPickerWidgetValue("second_field", "0");
	document.getElementById('timerViewFace').style.display = "block";
	document.getElementById('timerViewPicker').style.display = "none";
	document.getElementById('runningSpinner').style.display = "none";
}

TimerAssistant.prototype.setup = function() {
	Mojo.Log.info("## timer - scene started."); 
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	/* setup widgets here */
	this.controller.get("timerViewTitle").innerHTML = "Timer";
	this.controller.get("timerViewFace").innerHTML = timerResetValue;

	this.btnStopHandler = this.btnStopHandler.bind(this);
	this.controller.setupWidget('btnStop', this.attributes={}, this.model={label:"Stop", buttonClass: 'palm-button negative buttonfloat', disabled: true});

	this.btnStartHandler = this.btnStartHandler.bind(this);
	this.controller.setupWidget('btnStart', this.attributes={}, this.model={label:"Start", buttonClass: 'palm-button affirmative buttonfloat', disabled: true});

	this.setupToggle('Sound');
	this.setupToggle('Vibe');

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
	Mojo.Log.error("*** timer scene activated. alarm launch? " + appModel.AlarmLaunch);
	if (appModel.AlarmLaunch)
	{
		Mojo.Log.error("*** timer scene activated because of alarm");
		appModel.AlarmLaunch = false;
		this.timerDone();
		//Reset some things
	}
	else
	{
		Mojo.Log.error("*** timer scene launched without an alarm");
		if (running)
		{
			Mojo.Log.error("*** timer was running");
			this.setUIForRunning();
		}
		else
		{
			Mojo.Log.error("*** timer was not running");
			this.setUIForReset();
		}
	}
	//Set widget settings that can't be done during setup
	document.getElementById('runningSpinner').style.display = "none";
	
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	Mojo.Event.listen(this.controller.get('btnStop'), Mojo.Event.tap, this.btnStopHandler);;
	Mojo.Event.listen(this.controller.get('btnStart'), Mojo.Event.tap, this.btnStartHandler);
	Mojo.Event.listen(this.controller.get('timerViewFace'), Mojo.Event.tap, this.timerFaceTapped);
	Mojo.Event.listen(this.controller.get('hour_field'), Mojo.Event.propertyChange, this.propertyChanged);
	Mojo.Event.listen(this.controller.get('minute_field'), Mojo.Event.propertyChange, this.propertyChanged);
	Mojo.Event.listen(this.controller.get('second_field'), Mojo.Event.propertyChange, this.propertyChanged);

	Mojo.Additions.SetToggleState("att-toggle-Sound", appModel.AppSettingsCurrent["SoundEnabled"]);
	Mojo.Additions.SetToggleState("att-toggle-Vibe", appModel.AppSettingsCurrent["VibeEnabled"]);
};

TimerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	Mojo.Event.stopListening(this.controller.get('btnStop'),Mojo.Event.tap, this.btnStopHandler);
	Mojo.Event.stopListening(this.controller.get('btnStart'),Mojo.Event.tap, this.btnStartHandler);
	Mojo.Event.stopListening(this.controller.get('timerViewFace'), Mojo.Event.tap, this.timerFaceTapped);
	Mojo.Event.stopListening(this.controller.get('hour_field'), Mojo.Event.propertyChange, this.propertyChanged);
	Mojo.Event.stopListening(this.controller.get('minute_field'), Mojo.Event.propertyChange, this.propertyChanged);
	Mojo.Event.stopListening(this.controller.get('second_field'), Mojo.Event.propertyChange, this.propertyChanged);
};

TimerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

TimerAssistant.prototype.setupToggle = function (toggleName)
{
	this.attribute = {
		trueLabel:  'on',
		trueValue:  'true',
		falseLabel:  'off',
		falseValue: 'false',
		fieldName:  'toggle'
	}
	this.model = {
		value : false,
		disabled: false 
	}
	this.controller.setupWidget('att-toggle-' + toggleName, this.attribute, this.model);

	this.togglePressed = this.togglePressed.bind(this);
	Mojo.Event.listen(this.controller.get('att-toggle-' + toggleName), Mojo.Event.propertyChange, this.togglePressed);
}

TimerAssistant.prototype.togglePressed = function(event){
	var findSettingName = event.srcElement.id.replace("att-toggle-", "");
	findSettingName = findSettingName;

	appModel.AppSettingsCurrent[findSettingName + "Enabled"] = event.value.toString();
	appModel.SaveSettings();
	Mojo.Log.error("**** Settings when toggle pressed: " + JSON.stringify(appModel.AppSettingsCurrent));
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