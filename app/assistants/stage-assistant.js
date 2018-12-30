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
	vibeTimes = false;
	if (appModel.AppSettingsCurrent["VibeEnabled"] == true)
		vibeTimes = 5;
	var useSound = false;
	if (appModel.AppSettingsCurrent["SoundEnabled"])
		useSound = "/media/internal/ringtones/" + appModel.AppSettingsCurrent["AlarmName"] + ".mp3";
	Mojo.Log.warn("using sound file " + useSound);
	systemModel.ShowNotificationStage("alarm", "timer/alarm-scene", 150, useSound, vibeTimes);

	Mojo.Log.error("checking bluetooth");
	//Notify MyWatch if Bluetooth is on
	this.radioState = new Mojo.Service.Request("palm://com.palm.bluetooth/gap", {
		method: "gettrusteddevices",
		parameters: { },
		onSuccess: function(response) {
			Mojo.Log.error("checking bluetooth response: " + JSON.stringify(response));
			if(response) {
				if(JSON.stringify(response).indexOf("Pebble") != -1) {
					Mojo.Log.error("sending bluetooth message:");
					var request = new Mojo.Service.Request('palm://com.palm.applicationManager', {
						method: 'launch',
						parameters: {
							id: "de.metaviewsoft.mwatch",
							params: {command: "INFO", info: "Timer finished!", appid: "com.jonandnic.webos.stopwatch"}
							},
						onSuccess: function() {},
						onFailure: function() {}
						});
				}
			}
		}.bind(this),
		onFailure: function(response) { Mojo.Log.error("error: " + JSON.stringify(response))}
	});
}

//Since the app menu and buttons are common to both scenes, we'll handle them in the stage
StageAssistant.prototype.handleCommand = function(event) 
{
	var currentScene = Mojo.Controller.stageController.activeScene();
	var stageController = Mojo.Controller.stageController;
	var appController = Mojo.Controller.getAppController();
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'do-myAbout':
			{
				Mojo.Additions.ShowDialogBox("Stopwatch", "Copyright 2018, Jonathan Wise. Available under an MIT License. Source code available at: https://github.com/codepoet80/webos-stopwatch");
				break;
			}
			case 'do-stayAwake':
			{
				if (appModel.AppSettingsCurrent["StayAwake"] == true)
					appModel.AppSettingsCurrent["StayAwake"] = false;
				else
					appModel.AppSettingsCurrent["StayAwake"] = true;			
				stageController.swapScene({transition: Mojo.Transition.none, name: currentScene.sceneName});
				break;
			}
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