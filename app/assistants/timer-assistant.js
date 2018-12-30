//Globals
var timerInterval;
var timerDuration;
var timerCount;
var timerDefaultValue = "00:00:00";
var timerResetValue = timerDefaultValue;

function TimerAssistant() {

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

	//Setup sound picker
	this.controller.setupWidget("drawerSound",
		this.attributes = {
			modelProperty: 'open',
			unstyled: false
		},
		this.model = {
			open: appModel.AppSettingsCurrent["SoundEnabled"]
		}
	);
	this.controller.get('SoundOptionLabel').textContent = "Play Sound: " + appModel.AppSettingsCurrent["AlarmName"];
	this.controller.get('SoundOptionLabel').observe(Mojo.Event.tap, this.setAlarmSound);
	
	//Setup App Menu
	this.appMenuAttributes = {omitDefaultItems: true};
	this.appMenuModel = {
		items: [{label: "Awake while Running", checkEnabled: true, command: 'do-stayAwake', chosen:appModel.AppSettingsCurrent["StayAwake"]},
		{label: "About Stopwatch", command: 'do-myAbout'}]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttributes, this.appMenuModel);

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
				],toggleCmd:'do-Timer', 
			},
			{}
		]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, this.cmdMenuAttributes, this.cmdMenuModel);	
	Mojo.Log.info("## timer - scene setup done."); 
};

TimerAssistant.prototype.activate = function(event) {
	Mojo.Log.info("Timer scene activated.");
	document.getElementById("divTimerOptions").style.display = "block";
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

//UI event handlers
TimerAssistant.prototype.btnStartHandler = function()
{
	Mojo.Log.info("## timer - Start button pressed!");
	timerResetValue = document.getElementById("timerViewFace").innerHTML;
	//Figure out what the timer should go to
	var Hours = Number((this.controller.get("hour_field").innerText).trim()).padWithZeroes();
	var Mins = Number((this.controller.get("minute_field").innerText).trim()).padWithZeroes();
	var Seconds = Number((this.controller.get("second_field").innerText).trim()) + 1;
	var SystemSeconds = Seconds - 1;
	
	//Start the local and system timers
	this.startLocalTimer(Hours, Mins, Seconds.padWithZeroes());
	systemModel.SetSystemAlarmRelative("JonsTimer", Hours + ":" + Mins + ":" + SystemSeconds.padWithZeroes() + ".00");

	//Do UI updates and feedback
	this.setUIForRunning();
	systemModel.PlaySound("down2");
}

TimerAssistant.prototype.btnStopHandler = function()
{
	Mojo.Log.info("## timer - stop button pressed!");
	if (appModel.AppSettingsCurrent["TimerRunning"] == true)
	{
		//Cancel timers
		appModel.AppSettingsCurrent["TimerRunning"] = false;
		appModel.SaveSettings();
		clearInterval(timerInterval);
		systemModel.ClearSystemAlarm("JonsTimer");
		document.getElementById("timerViewFace").innerHTML = timerResetValue;
		this.setUIForStopped();
		systemModel.PlaySound("down2");
	}
	else
	{
		systemModel.PlaySound("delete_01");
		this.setUIForReset();
	}
}

TimerAssistant.prototype.timerFaceTapped = function(event){
	Mojo.Log.info("## timer - the watch face was tapped");
	if (!appModel.AppSettingsCurrent["TimerRunning"])
	{
		document.getElementById('timerViewFace').style.display = "none";
		document.getElementById('timerViewPicker').style.display = "block";
		Mojo.Log.error("## timer - visibility was toggled");
	}
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

// opens ringtone picker.
TimerAssistant.prototype.setAlarmSound = function() {
	var self = this.controller; //Retain the reference for the callback
	var params = { defaultKind: 'ringtone',
		onSelect: function(file){
			var fileToUse = file.fullPath.replace("/media/internal/ringtones/", "").replace(".mp3", "");
			appModel.AppSettingsCurrent["AlarmName"] = fileToUse;
			document.getElementById('SoundOptionLabel').innerHTML = "Play Sound: " + appModel.AppSettingsCurrent["AlarmName"];
			appModel.SaveSettings();
			Mojo.Log.info("alarm sound changed to: " + fileToUse);
		}
	}
	Mojo.FilePicker.pickFile(params, Mojo.Controller.stageController);
}

//UI manipulation functions
TimerAssistant.prototype.setUIForRunning = function ()
{
	var appController = Mojo.Controller.getAppController();
	if (appModel.AppSettingsCurrent["StayAwake"])
	{
		systemModel.PreventDisplaySleep();
		appController.showBanner("Screen will stay on while running", {source: 'notification'});
	}
	Mojo.Additions.DisableWidget("btnStart", true);
	Mojo.Additions.DisableWidget("btnStop", false);
	Mojo.Additions.SetWidgetLabel("btnStop", "Stop");
	document.getElementById('timerViewFace').style.display = "block";
	document.getElementById('timerViewPicker').style.display = "none";
	document.getElementById('runningSpinner').style.display = "block";
}

TimerAssistant.prototype.setUIForStopped = function ()
{
	systemModel.AllowDisplaySleep();
	Mojo.Additions.DisableWidget("btnStart", false);
	Mojo.Additions.DisableWidget("btnStop", false);
	Mojo.Additions.SetWidgetLabel("btnStop", "Clear");
	document.getElementById('timerViewFace').style.display = "none";
	document.getElementById('timerViewPicker').style.display = "block";
	document.getElementById('runningSpinner').style.display = "none";
}

TimerAssistant.prototype.setUIForReset = function ()
{
	systemModel.AllowDisplaySleep();
	timerResetValue = timerDefaultValue;
	document.getElementById("timerViewFace").innerHTML = timerDefaultValue;
	Mojo.Additions.DisableWidget("btnStart", true);
	Mojo.Additions.DisableWidget("btnStop", true);
	Mojo.Additions.SetWidgetLabel("btnStop", "Stop");
	Mojo.Additions.SetPickerWidgetValue("hour_field", "0");
	Mojo.Additions.SetPickerWidgetValue("minute_field", "0");
	Mojo.Additions.SetPickerWidgetValue("second_field", "0");
	document.getElementById('timerViewFace').style.display = "none";
	document.getElementById('timerViewPicker').style.display = "block";
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

TimerAssistant.prototype.deactivate = function(event) {
	Mojo.Log.info("Timer scene deactivated.");
	appModel.SaveSettings();
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	Mojo.Event.stopListening(this.controller.get('btnStop'),Mojo.Event.tap, this.btnStopHandler);
	Mojo.Event.stopListening(this.controller.get('btnStart'),Mojo.Event.tap, this.btnStartHandler);
	Mojo.Event.stopListening(this.controller.get('timerViewFace'), Mojo.Event.tap, this.timerFaceTapped);
	Mojo.Event.stopListening(this.controller.get('hour_field'), Mojo.Event.propertyChange, this.propertyChanged);
	Mojo.Event.stopListening(this.controller.get('minute_field'), Mojo.Event.propertyChange, this.propertyChanged);
	Mojo.Event.stopListening(this.controller.get('second_field'), Mojo.Event.propertyChange, this.propertyChanged);
	systemModel.AllowDisplaySleep();
};

TimerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

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
	//this.incrementTimer();
	timerInterval = setInterval(this.incrementTimer, 1000);
}

TimerAssistant.prototype.incrementTimer = function(showTimerValue)
{
	//Increment timer
	if (!showTimerValue)
	{
		timerCount++;
		
		showTimerValue = Date.parse(appModel.AppSettingsCurrent["TimerEndTime"]) - new Date();
		Mojo.Log.error("*** previously running timer delta from now: " + showTimerValue);
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
			document.getElementById("timerViewFace").innerHTML = timerDefaultValue;
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
	Mojo.Log.error("timer done called");

	//Clear timers
	clearInterval(timerInterval);
	systemModel.ClearSystemAlarm("JonsTimer");
	appModel.AppSettingsCurrent["TimerRunning"] = false;
	appModel.AppSettingsCurrent["TimerEndTime"] = "null";
	appModel.SaveSettings();

	try
	{
		Mojo.Log.error("timer done is asking UI to reset");
		this.setUIForReset();
	}
	catch (error)
	{
		Mojo.Log.error("timer done could not reset UI");
		//will have to do this next time we activate
	}
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

	//Format seconds segments into exactly 2 digits
	if (seconds > 59)
		seconds = seconds - (minutes * 60)
	seconds = seconds.padWithZeroes();

	if (minutes > 59)
		minutes = minutes - (hours * 60)
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