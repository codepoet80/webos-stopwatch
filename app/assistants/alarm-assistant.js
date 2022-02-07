/* This is an assistant for the popup alarm alert
 */
function AlarmAssistant(argFromPusher){
    this.passedArguments = argFromPusher;
}

AlarmAssistant.prototype.setup = function(){
	appModel.LoadSettings();
}

AlarmAssistant.prototype.activate = function() {
    var useSound = false;
    if (appModel.AppSettingsCurrent["SoundEnabled"])
        useSound = "/media/internal/ringtones/" + appModel.AppSettingsCurrent["AlarmName"] + ".mp3";
    Mojo.Log.warn("using sound file " + useSound);
    systemModel.PlayAlertSound(useSound);
}

// Cleanup anything we did in setup function
AlarmAssistant.prototype.cleanup = function() {
	systemModel.StopAlertSound();
}