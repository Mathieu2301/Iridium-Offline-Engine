const {app, BrowserWindow, Tray, autoUpdater} = require('electron');
const fs = require("fs");
const util = require("util");

const feed = `https://hazel-server-qekwhinebb.now.sh/update/${process.platform}/${app.getVersion()}`
console.log(feed)
autoUpdater.setFeedURL(feed)

var apps = [];
var windows = [];
var trays = [];

function startApp(appid) {
  console.log("Starting : " + appid);

  if (windows[appid] == null){

    var app = apps[appid];
    var options = app.options;
    options.show = false;

    windows[appid] = new BrowserWindow(options);

    windows[appid].loadURL(app.url);
    if (app.menubar != true){
      windows[appid].setMenu(null);
    }

    /*windows[appid].once('ready-to-show', () => {
      windows[appid].show()
    })*/

    windows[appid].on('close', function (evt) {
      evt.preventDefault();
      windows[appid].hide();
    })

  }else{
    windows[appid].show();
  }
}

function init(){

  var nbr = 0;

  require("./getapps").getApps(function(err, app){
    if (!err && app){
      apps.push(app);

      var appid = nbr;

      startApp(appid);

      var tray = new Tray(__dirname + "/" + app.options.icon);

      trays.push(tray);
      tray.setToolTip(app.name);

      tray.on('click', () => {
        windows[appid].isVisible() ? windows[appid].hide() : windows[appid].show()
      })

      nbr++;
    }else{
      console.log("ERROR: " + err);
    }
  });
}

app.requestSingleInstanceLock();

app.on('ready', init);

app.on('second-instance', function(evt, commandLine, dir){
  var arg = commandLine[1];
  console.log(arg)
  if (arg && arg != "."){
    apps.forEach(function(app, appid){
      if (app.name == arg){
        startApp(appid);
      }
    })
  }
});

app.on('window-all-closed', function () {})