function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {

	/* this function is for setup tasks that have to happen when the stage is first created */
	StageController = Mojo.Controller.stageController;
	StageController.appMenuModel = {
		items: [{label: "About Stopwatch", command: 'do-myAbout'}]
	};

	this.controller.pushScene("stopwatch");
};

StageAssistant.prototype.handleCommand = function(event) {
	this.controller=Mojo.Controller.stageController.activeScene();
  
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
  
			case 'do-appPrefs':
				this.controller.pushScene("myAppPrefs");
				break;
  
			case 'do-appHelp':
				this.controller.pushScene("myAppHelp");
				break;
		}
	}
  }; 
