/* This is an assistant for the popup alarm alert
 */
function AlarmAssistant(argFromPusher){
    this.passedArguments = argFromPusher;
}

AlarmAssistant.prototype.setup = function(){
	appModel.LoadSettings();
    //set up button widget
	this.controller.setupWidget('quit-button', {}, {buttonLabel:'Close'})
	this.quitButtonHandler = this.handleQuitButton.bind(this);
    Mojo.Event.listen(this.controller.get('quit-button'), Mojo.Event.tap, this.quitButtonHandler);
}

AlarmAssistant.prototype.handleQuitButton = function(){
	//close just this popupAlert stage
    Mojo.Controller.appController.closeStage("alarm");

    var stageController = Mojo.Controller.appController.getStageController("");
    if (stageController)
    {
        stageController.activate();
        if (stageController.activeScene().sceneName == "timer")
        {
            //Re-draw the timer scene now that its done
            stageController.swapScene({transition: Mojo.Transition.none, name: "timer"});
        }
    }
}

// Cleanup anything we did in setup function
AlarmAssistant.prototype.cleanup = function() {
	this.controller.stopListening('quit-button', Mojo.Event.tap, this.quitButtonHandler);
}