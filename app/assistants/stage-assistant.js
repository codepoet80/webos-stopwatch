function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {

	/* this function is for setup tasks that have to happen when the stage is first created */
	//Bind local members
	var stageController = Mojo.Controller.stageController;

	//Setup App Menu
	stageController.appMenuModel = {
		items: [{label: "About Stopwatch", command: 'do-myAbout'}]
	};

	if (alarmLaunch)
	{
		Mojo.Log.error("stage setting up an alarm launch");
		stageController.pushScene("timer");
	}
	else
	{
		Mojo.Log.error("stage setting up a normal launch");
		stageController.pushScene("stopwatch");
	}
};

StageAssistant.prototype.handleCommand = function(event) {
	var sceneController = Mojo.Controller.stageController.activeScene();
	var stageController = Mojo.Controller.stageController;

	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'do-myAbout':
			sceneController.showAlertDialog({
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
				if (sceneController.sceneName != "timer")
				{
					stageController.swapScene(
						{
							transition: Mojo.Transition.crossFade,
							name: "timer"
						});
				}
				break;	
			}

			case 'do-Stopwatch':
			{
				if (sceneController.sceneName != "stopwatch")
					{
						stageController.swapScene(
							{
								transition: Mojo.Transition.crossFade,
								name: "stopwatch"
							});
					}
				break;
			}
		}
	}
	Mojo.Log.info("current scene: " + sceneController.sceneName);
}; 