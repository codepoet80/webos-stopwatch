/*
Handle launches and the app menu here
*/

function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() 
{
	//Bind local members
	var stageController = Mojo.Controller.stageController;
	stageController.launchWithAlarm = this.launchWithAlarm;

	//Setup App Menu
	stageController.appMenuAttributes = {omitDefaultItems: true};
	stageController.appMenuModel = {
		items: [{label: "About Stopwatch", command: 'do-myAbout'}]
	};

	//Figure out how we were launched
	if (appModel.AlarmLaunch)
	{
		Mojo.Log.warn("Stage launched after an alarm, so showing timer scene and alert.");
		this.launchWithAlarm();
	}
	else
	{
		Mojo.Log.warn("Stage launched normal, so going to default scene");
		stageController.pushScene(appModel.DefaultScene);
	}
};

StageAssistant.prototype.launchWithAlarm = function(AlarmName)
{
	var stageController = Mojo.Controller.stageController;
	//Bring timer scene into focus	
	stageController.swapScene({transition: Mojo.Transition.none, name: "timer"});
	
	//Show alert stage
	systemModel.ShowNotificationStage("alarm", "timer/alarm-scene", 150, appModel.AppSettingsCurrent["SoundEnabled"], appModel.AppSettingsCurrent["VibeEnabled"]);
}

//Since the app menu and buttons are common to both scenes, we'll handle them in the stage
StageAssistant.prototype.handleCommand = function(event) 
{
	var currentScene = Mojo.Controller.stageController.activeScene();
	var stageController = Mojo.Controller.stageController;

	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'do-myAbout':
			currentScene.showAlertDialog({
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
				if (currentScene.sceneName != "timer")
					stageController.swapScene({transition: Mojo.Transition.crossFade, name: "timer"});
				break;	
			}

			case 'do-Stopwatch':
			{
				if (currentScene.sceneName != "stopwatch")
					stageController.swapScene({transition: Mojo.Transition.crossFade, name: "stopwatch"});
				break;
			}
		}
	}
	Mojo.Log.info("current scene: " + currentScene.sceneName);
}; 