var systemModel = null;
var appModel = null;
function AppAssistant() {
	appModel = new AppModel();
	systemModel = new SystemModel();
	Mojo.Additions = Additions;
	showAlarm = this.showAlarm;
}

//This function will handle normal launching and relaunching the app when an alarm goes off(see the device/alarm scene)
AppAssistant.prototype.handleLaunch = function(params) {

	Mojo.Log.error("Stopwatch App is Launching");
	appModel.LoadSettings();
	if (!params || params["action"] == undefined)	//If no parameters were passed, this is a normal launch
	{	
		Mojo.Log.error("This is a normal launch");
		appModel.AlarmLaunch = false;
		return;
	}
    else	//If parameters were passed, this is a launch from a system alarm
    {
		Mojo.Log.error("This is an alarm launch!");
		appModel.AlarmLaunch = true;
		appModel.showNotificationStage("alarm", 150, appModel.AppSettingsCurrent["SoundEnabled"], appModel.AppSettingsCurrent["VibeEnabled"]);
    }
};