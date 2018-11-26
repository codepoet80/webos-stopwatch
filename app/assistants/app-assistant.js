var alarmLaunch = null;
var systemService = null;
function AppAssistant(appController) {
    systemService = new SystemService();
    alarmLaunch = true;
	Mojo.Additions = Additions;
}

//This function will handle relaunching the app when an alarm goes off(see the device/alarm scene)
AppAssistant.prototype.handleLaunch = function(params) {

	Mojo.Log.error("Stopwatch App is Launching");
	if (!params || params["action"] == undefined)	//If no parameters were passed, this is a normal launch
	{	
		Mojo.Log.error("This is a normal launch");
		alarmLaunch = false;
		//get the proxy for the stage in the event it already exists (eg: app is currently open)
		var mainStage = this.controller.getStageProxy("");
		if (mainStage)  //if the stage already exists then let it handle the re-launch
		{
			var stageController = this.controller.getStageController("");
			stageController.window.focus();
		} 
		return;
	}
    else	//If parameters were passed, this is a launch from a system alarm
    {
		Mojo.Log.error("This is a re-launch with parameters: " + JSON.stringify(params));
		alarmLaunch = true;

		//get the proxy for the stage in the event it already exists (eg: app is currently open)
		var mainStage = this.controller.getStageProxy("");
		if (mainStage) //if the stage already exists then let it handle the re-launch
		{
			Mojo.Log.error("calling existing stage!");
			var stageController = this.controller.getStageController("");
			stageController.launchWithAlarm();
		}
		//If not, this will fall through to normal stage creation
		//	We'll have to handle the launch types in the stage as well
		return;
    }
};