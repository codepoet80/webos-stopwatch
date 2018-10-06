function WatchViewAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

WatchViewAssistant.prototype.btnStopHandler = function()
{
	Mojo.Log.info("The Stop button was pressed");
	this.controller.get("watchViewDetail").innerHTML = "Stop";
	this.SetWidgetDisablement("btnStart", false);
	this.SetWidgetDisablement("btnLap", true);
	this.SetWidgetDisablement("btnStop", true);
}

WatchViewAssistant.prototype.btnLapHandler = function()
{
	Mojo.Log.info("The Lap button was pressed");
	this.controller.get("watchViewDetail").innerHTML = "Do a lap";

}

WatchViewAssistant.prototype.btnStartHandler = function()
{
	Mojo.Log.info("The Start button was pressed");
	this.controller.get("watchViewDetail").innerHTML = "Start";
	this.SetWidgetDisablement("btnStart", true);
	this.SetWidgetDisablement("btnLap", false);
	this.SetWidgetDisablement("btnStop", false);
}

WatchViewAssistant.prototype.SetWidgetDisablement = function(widgetName, newvalue)
{
	var thisWidgetModel = this.controller.getWidgetSetup(widgetName).model;
	thisWidgetModel.disabled = newvalue;
	this.controller.setWidgetModel(widgetName, thisWidgetModel);
	//This might not be necessary. Nothing seems to care, but this site said to do it: https://semisignal.com/changing-the-model-of-activity-buttons-on-webos/
	//	this.controller.modelChanged(this.controller.get(widgetName));
}

WatchViewAssistant.prototype.setup = function() {
	Mojo.Log.info("Scene started!"); 
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	var watchViewTitleElement = this.controller.get("watchViewTitle");
	watchViewTitleElement.innerHTML = "Stopwatch";

	var watchViewDetailElement = this.controller.get("watchViewDetail");
	watchViewDetailElement.innerHTML = "00:00.00";

	this.controller.setupWidget('btnStop', this.attributes={}, this.model={label:"Stop", buttonClass: 'palm-button negative disabled buttonfloat', disabled: true});
	this.btnStopHandler = this.btnStopHandler.bind(this);

	this.controller.setupWidget('btnLap', this.attributes={}, this.model={label:"Lap", buttonClass: 'palm-button buttonfloat', disabled: true});
	this.btnLapHandler = this.btnLapHandler.bind(this);

	this.controller.setupWidget('btnStart', this.attributes={}, this.model={label:"Start", buttonClass: 'palm-button affirmative buttonfloat', disabled: false});
	this.btnStartHandler = this.btnStartHandler.bind(this);

	/* add event handlers to listen to events from widgets */
	Mojo.Log.info("Scene setup done!"); 
};

WatchViewAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	Mojo.Event.listen(this.controller.get('btnStop'), Mojo.Event.tap, this.btnStopHandler);
	Mojo.Event.listen(this.controller.get('btnLap'), Mojo.Event.tap, this.btnLapHandler);
	Mojo.Event.listen(this.controller.get('btnStart'), Mojo.Event.tap, this.btnStartHandler);
};

WatchViewAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	Mojo.Event.stopListening(this.controller.get('btnStop'),Mojo.Event.tap, this.btnStopHandler)
	Mojo.Event.stopListening(this.controller.get('btnLap'),Mojo.Event.tap, this.btnLapHandler)
	Mojo.Event.stopListening(this.controller.get('btnStart'),Mojo.Event.tap, this.btnStartHandler)
};

WatchViewAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
