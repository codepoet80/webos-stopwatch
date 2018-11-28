function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {

	/* this function is for setup tasks that have to happen when the stage is first created */
	//Bind local members
	var stageController = Mojo.Controller.stageController;
	appModel.LoadSettings();

	//Setup App Menu
	stageController.appMenuModel = {
		items: [{label: "About Stopwatch", command: 'do-myAbout'}]
	};

	if (appModel.AlarmLaunch)
	{
		Mojo.Log.error("stage setting up an alarm launch, showing timer scene");
		stageController.pushScene("timer");
		Mojo.Log.error("stage setting up an alarm launch, showing alert scene");
		appModel.showNotificationStage("alarm", null);
	}
	else
	{
		Mojo.Log.error("stage setting up a normal launch");
		stageController.pushScene(appModel.DefaultScene);
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