function TimerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

TimerAssistant.prototype.setup = function() {
	Mojo.Log.info("Timer scene started."); 
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	/* setup widgets here */
	this.controller.get("timerViewTitle").innerHTML = "Timer";
	this.controller.get("timerViewFace").innerHTML = "00:00";
	this.controller.get("timerCompleteOptionsDiv").innerHTML = "";

	this.controller.setupWidget("hour_field",
		this.attributes = {
			label: ' ',
			modelProperty: 'hour',
			min: 0,
			max: 23,
			padNumbers: true
		},
		this.model = {
			hour: 0
		}
	); 

	this.controller.setupWidget("minute_field",
		this.attributes = {
			label: ' ',
			labelPlacement: Mojo.Widget.labelPlacementRight,
			modelProperty: 'minute',
			min: 1,
			max: 59,
			padNumbers: true
		},
		this.model = {
			minute: 1
		}
	); 

	this.propertyChanged = this.propertyChanged.bind(this)
	Mojo.Event.listen(this.controller.get('hour_field'),Mojo.Event.propertyChange,this.propertyChanged);

	this.controller.setupWidget('btnStop', this.attributes={}, this.model={label:"Stop", buttonClass: 'palm-button negative disabled buttonfloat', disabled: true});
	//this.btnStopHandler = this.btnStopHandler.bind(this);

	this.controller.setupWidget('btnReset', this.attributes={}, this.model={label:"Reset", buttonClass: 'palm-button buttonfloat', disabled: true});
	//this.btnResetHandler = this.btnResetHandler.bind(this);

	this.controller.setupWidget('btnStart', this.attributes={}, this.model={label:"Start", buttonClass: 'palm-button affirmative buttonfloat', disabled: false});
	//this.btnStartHandler = this.btnStartHandler.bind(this);

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
	
	Mojo.Event.listen(this.controller.get('timerViewFace'),Mojo.Event.tap,this.timerFaceTapped);

	Mojo.Log.info("Scene setup done."); 

	/* app-level event handlers */
	//Mojo.Event.listen(this.controller.stageController.document,	Mojo.Event.stageDeactivate, this.appDeactivated);
	//Mojo.Event.listen(this.controller.stageController.document,	Mojo.Event.stageActivate, this.appActivated);
};

TimerAssistant.prototype.timerFaceTapped = function(event){
	Mojo.Log.error("the watch face was tapped");
	//var myobj = this.controller.get('timerViewFace');
	Mojo.Log.error(JSON.stringify(event));
	
}

TimerAssistant.prototype.propertyChanged = function(event){
	/* log the text field value when the value changes */
		this.showDialogBox("Integer changed", "The value of the Integer field is now: " + event.value);
}

TimerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

TimerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

TimerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
