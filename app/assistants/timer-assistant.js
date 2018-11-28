function TimerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

var timerInterval;
var timerDuration;
var timerCount;
var timerResetValue = "00:00:00";

//Timer functions
TimerAssistant.prototype.startLocalTimer = function (Hours, Mins, Seconds)
{
	clearInterval(timerInterval);
	//Start timers
	timerCount = 0;
	timerDuration = parseInt(((Hours * 60) * 60) * 1000);
	timerDuration += parseInt((Mins * 60) * 1000);
	timerDuration += parseInt(Seconds * 1000);

	var timerValue = new Date();
	Mojo.Log.error("Timer started at: " + timerValue);
	Mojo.Log.error("Timer will end in: " + timerDuration + "ms");
	timerValue.setMilliseconds(timerValue.getMilliseconds() + timerDuration);
	Mojo.Log.error("Timer end time is: " + timerValue.toLocaleString());

	//Store end time, in case we're killed and restarted and need to re-hydrate
	appModel.AppSettingsCurrent["TimerRunning"] = true;
	appModel.AppSettingsCurrent["TimerEndTime"] = timerValue.toLocaleString();
	appModel.SaveSettings();

	//Set the local timer value now, then repeatedly
	this.incrementTimer();
	timerInterval = setInterval(this.incrementTimer, 1000);
}

TimerAssistant.prototype.incrementTimer = function(showTimerValue)
{
	//Increment timer
	if (!showTimerValue)
	{
		timerCount++;
		var stopwatchTimerOffset = timerCount * 1000;
		var showTimerValue = timerDuration - stopwatchTimerOffset;
		Mojo.Log.info("Updating timer using offsetvalue value " + stopwatchTimerOffset + " for timer value " + showTimerValue);
	}
	else
	{
		//TODO: I don't think I need this
		Mojo.Log.info("Updating timer using passed value " + showTimerValue);
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
	if (appModel.AppSettingsCurrent["SoundEnabled"] == true)
		systemModel.PlaySound("alert_buzz");
	if (appModel.AppSettingsCurrent["VibeEnabled"] == true)
		Mojo.Controller.getAppController().playSoundNotification("vibrate");
	appModel.AppSettingsCurrent["TimerRunning"] = false;
	appModel.SaveSettings();

	//Clear timers
	clearInterval(timerInterval);
	systemModel.ClearSystemAlarm("JonsTimer");
}

//UI event handlers
TimerAssistant.prototype.btnStartHandler = function()
{
	Mojo.Log.info("## timer - Start button pressed!");
	
	//Figure out what the timer should go to
	var Hours = Number((this.controller.get("hour_field").innerText).trim()).padWithZeroes();
	var Mins = Number((this.controller.get("minute_field").innerText).trim()).padWithZeroes();
	var Seconds = Number((this.controller.get("second_field").innerText).trim()).padWithZeroes();
	
	//Start the local and system timers
	this.startLocalTimer(Hours, Mins, Seconds);
	systemModel.SetSystemAlarmRelative("JonsTimer", Hours + ":" + Mins + ":" + Seconds + ".00");

	//Do UI updates and feedback
	this.setUIForRunning();
	systemModel.PlaySound("down2");
}

TimerAssistant.prototype.btnStopHandler = function()
{
	Mojo.Log.info("## timer - stop button pressed!");
	//Cancel timers
	appModel.AppSettingsCurrent["TimerRunning"] = false;
	clearInterval(timerInterval);
	systemModel.ClearSystemAlarm("JonsTimer");
	this.setUIForReset();
	systemModel.PlaySound("delete_01");
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

TimerAssistant.prototype.togglePressed = function(event){
	var findSettingName = event.srcElement.id.replace("att-toggle-", "");
	findSettingName = findSettingName + "Enabled";
	if (event.value == true || event.value == "true")
		appModel.AppSettingsCurrent[findSettingName] = true;
	else
		appModel.AppSettingsCurrent[findSettingName] = false;
	appModel.SaveSettings();
	Mojo.Log.error("**** Settings when toggle pressed: " + JSON.stringify(appModel.AppSettingsCurrent));
}

//UI manipulation functions
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

//Mojo interface implementations
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
	if (appModel.AlarmLaunch)
	{
		Mojo.Log.error("*** timer scene activated because of alarm");
		appModel.AlarmLaunch = false;
		this.timerDone();
		this.setUIForReset();
	}
	else
	{
		Mojo.Log.error("*** timer scene launched without an alarm");
		if (appModel.AppSettingsCurrent["TimerRunning"] == true && appModel.AppSettingsCurrent["TimerEndTime"] != "null")
		{
			Mojo.Log.error("*** timer scene is attempting to re-hydrate a running timer");
			var remainAlarmDifference = Date.parse(appModel.AppSettingsCurrent["TimerEndTime"]) - new Date();
			Mojo.Log.error("*** previously running timer delta from now: " + remainAlarmDifference);
			if (remainAlarmDifference > 0)
			{
				remainAlarmDifference = Number(remainAlarmDifference).toLongTimeValue();
				remainAlarmDifference = remainAlarmDifference.split(":");
				Mojo.Log.error("*** resuming remaining alarm timer: " + remainAlarmDifference);
				//TODO: for some reason this ends up different from the system timer by a few seconds
				this.startLocalTimer(remainAlarmDifference[0], remainAlarmDifference[1], remainAlarmDifference[2]);
				this.setUIForRunning();
			} 
			else
			{
				Mojo.Log.error("*** timer scene is dicarding a previously running timer that has expired");
				appModel.AppSettingsCurrent["TimerEndTime"] = "null";
				appModel.AppSettingsCurrent["TimerRunning"] = false;
				this.setUIForReset();
			}
		}
		else
		{
			Mojo.Log.error("*** timer scene has no active timers");
			this.setUIForReset();
		}
	}
	
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
	Mojo.Log.error("**** timer scene is dying with settings: " + JSON.stringify(appModel.AppSettingsCurrent));

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