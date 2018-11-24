var systemService = null;
function StageAssistant() {
	/* this is the creator function for your stage assistant object */
	Mojo.Additions = Additions;
	systemService = new SystemService();
}

StageAssistant.prototype.setup = function() {

	/* this function is for setup tasks that have to happen when the stage is first created */
	StageController = Mojo.Controller.stageController;

	//Setup App Menu
	StageController.appMenuModel = {
		items: [{label: "About Stopwatch", command: 'do-myAbout'}]
	};

	this.controller.pushScene("stopwatch");
};

StageAssistant.prototype.handleCommand = function(event) {
	this.controller=Mojo.Controller.stageController.activeScene();
	StageController = Mojo.Controller.stageController;

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
					StageController.swapScene("timer");
				}
				break;	
			}

			case 'do-Stopwatch':
			{
				if (this.controller.sceneName != "stopwatch")
					{
						StageController.swapScene("stopwatch");
					}
				break;
			}
		}
	}
	Mojo.Log.info("current scene: " + this.controller.sceneName);
}; 