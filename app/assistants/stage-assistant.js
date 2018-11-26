function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {

	/* this function is for setup tasks that have to happen when the stage is first created */
	//Bind local members
	var stageController = Mojo.Controller.stageController;
	stageController.launchWithAlarm = this.launchWithAlarm;

	//Setup App Menu
	stageController.appMenuModel = {
		items: [{label: "About Stopwatch", command: 'do-myAbout'}]
	};

	this.controller.pushScene("stopwatch");
	//this.controller.pushScene("timer");
};

StageAssistant.prototype.handleCommand = function(event) {
	this.controller=Mojo.Controller.stageController.activeScene();
	stageController = Mojo.Controller.stageController;

	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'do-myAbout':
				this.controller.showAlertDialog({
					onChoose: function(value) {},
					title: $L("Stopwatch"),
					message: $L("Copyright 2018, Jonathan Wise. Available under an MIT License. Source code available at: https://github.com/codepoet80/webos-stopwatch"),
					choices:[
						{label:$L("OK"), value:""}
					]
				});
				break;

			case 'do-Timer':
			{
				if (this.controller.sceneName != "timer")
				{
					stageController.swapScene("timer");
				}
				break;	
			}

			case 'do-Stopwatch':
			{
				if (this.controller.sceneName != "stopwatch")
					{
						stageController.swapScene("stopwatch");
					}
				break;
			}
		}
	}
	Mojo.Log.info("current scene: " + this.controller.sceneName);
}; 

StageAssistant.prototype.launchWithAlarm = function()
{
	var stageController = Mojo.Controller.stageController;
	this.controller = stageController.activeScene();

	if (stageController.topScene().sceneName == "timer")
	{
		Mojo.Log.info("timer scene is active, need to call its timerDone function");
		this.controller.activate();
	}
	else
	{
		Mojo.Log.info("timer scene is not active, push it to the top, which will call its timerDone function");
		stageController.pushScene("timer");
	}
}