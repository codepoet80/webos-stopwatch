/*
AppModel Model
 Version 0.2
 Created: 2018
 Author: Jonathan Wise
 License: MIT
 Description: Common functions for webOS apps, particularly for managing persisted options in cookies
*/

var AppModel = function()
{
    //Define your app-wide static settings here
    this.AlarmLaunch = false;
    this.DefaultScene = "stopwatch";    //This is used when defaults are re-loaded
    
    this.AppSettingsCurrent = null;
    //Define cookie defaults here and they will be loaded and enforced below
    this.AppSettingsDefaults = {
		Debug: false,
        VibeEnabled: true,
		SoundEnabled: false,
		TimerRunning: false,
		TimerEndTime: "null"
    };
}

//You probably don't need to change the below functions since they all work against the Cookie defaults you defined above.
//  LoadSettings: call when your app starts, or you want to load previously persisted options.
//  SaveSettings: call any time you want to persist an option.
//  ResetSettings: call if you want to forget stored settings and return to defaults. Your default scene will be popped and re-pushed.
AppModel.prototype.LoadSettings = function () {
    this.AppSettingsCurrent = this.AppSettingsDefaults;
    var loadSuccess = false;
    var settingsCookie = new Mojo.Model.Cookie("settings");
	try
	{
		appSettings = settingsCookie.get();
		if (typeof appSettings === "undefined" || appSettings == null || !this.checkSettingsValid(appSettings)) {
			Mojo.Log.error("** Using first run default settings");
		}
		else
		{
			Mojo.Log.error("** Using cookie settings!");
            Mojo.Log.error(JSON.stringify(appSettings))
            this.AppSettingsCurrent = appSettings;
            loadSuccess = true;
		}
	}
	catch(ex)
	{
		settingsCookie.put(null);
		Mojo.Log.error("** Settings cookie were corrupt and have been purged!");
	}
	return loadSuccess;
}

AppModel.prototype.checkSettingsValid = function (loadedSettings)
{
	var retValue = true;
	for (var key in this.AppSettingsDefaults) {
		if (typeof loadedSettings[key] === undefined || loadedSettings[key] == null)
		{
			Mojo.Log.warn("** An expected saved setting, " + key + ", was null or undefined.");
			retValue = false;
		}
		if (typeof loadedSettings[key] !== typeof this.AppSettingsDefaults[key])
		{
			Mojo.Log.warn("** A saved setting, " + key + ", was of type " + typeof(loadedSettings[key]) + " but expected type " + typeof(this.AppSettingsDefaults[key]));
			retValue = false;
		}
	 }
	 return retValue;
}

AppModel.prototype.SaveSettings = function ()
{
	var settingsCookie = new Mojo.Model.Cookie("settings");
	settingsCookie.put(appModel.AppSettingsCurrent);
}

AppModel.prototype.ResetSettings = function()
{
	//Tell main scene to drop settings
	this.DoReset = true;
	//Restart main scene
	var stageController = Mojo.Controller.stageController;
	stageController.popScene('DefaultScene');
	stageController.pushScene('DefaultScene');
}