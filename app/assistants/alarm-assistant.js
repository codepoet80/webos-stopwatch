/* This is an assistant for the popup alert
 */
function AlarmAssistant(argFromPusher){
    this.passedArguments = argFromPusher;
}


AlarmAssistant.prototype.setup = function(){
	//update the scene with the message passed in when setting the alarm
    this.controller.get('info').update("Hello world!");
	
    //set up button widget
	this.controller.setupWidget('quit-button', {}, {buttonLabel:'Close'})
	this.quitButtonHandler = this.handleQuitButton.bind(this);
    Mojo.Event.listen(this.controller.get('quit-button'), Mojo.Event.tap, this.quitButtonHandler)
}

AlarmAssistant.prototype.handleQuitButton = function(){
	//close just this popupAlert stage
    Mojo.Controller.appController.closeStage("alarm");
}

// Cleanup anything we did in setup function
AlarmAssistant.prototype.cleanup = function() {
	this.controller.stopListening('quit-button', Mojo.Event.tap, this.quitButtonHandler);
}