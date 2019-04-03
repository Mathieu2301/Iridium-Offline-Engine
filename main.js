const {app, BrowserWindow, Tray, autoUpdater} = require('electron');
const fs = require("fs");
const path = require("path");
const updater = new (require("./updater"))("op2FVigbAO6w17mUhByICKSfQasnkLqeGP45lzYjt3Jr8TZHvxE09cMuDNWdXR", "win", "1.0.0");

__dirname = __dirname.replace("\\resources\\app.asar", "");

function update_check(){
  updater.check((result, version) => {
    if (result){
      console.log("Update found : " + version.last_version)
      updater.download(function(){
        var tray = new Tray(__dirname + "\\resources\\app.asar/update.ico");
        tray.setToolTip("CLick to update to " + version.last_version);
        tray.on('click', () => {
          updater.update();
        })
      })
    }else{
      setTimeout(function(){
        update_check();
      }, 30000)
    }
  })
}

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

    if (app.enable_debug_tools == true){
      windows[appid].webContents.openDevTools();
    }

    windows[appid].loadURL(app.url);
    if (app.menubar != true){
      windows[appid].setMenu(null);
    }

    if (app.stay == false){
      windows[appid].once('ready-to-show', () => {
        windows[appid].show()
      })
    }

    windows[appid].on('close', function (evt) {
      if (app.stay != false){
        evt.preventDefault();
        windows[appid].hide();
      }else{
        windows[appid] = null;
      }
    })

  }else{
    windows[appid].show();
  }
}

function closeApp(appid){
  var app = apps[appid];
  var window = windows[appid];

  if (app.stay != false){
    window.hide();
  }else{
    window.close();
    windows[appid] = null;
  }
}

function init(){

  var nbr = 0;

  require("./getapps").getApps(function(err, app){
    if (!err && app){
      apps.push(app);

      var appid = nbr;

      startApp(appid);
      
      var tray = new Tray(__dirname + "\\" + app.options.icon);

      trays.push(tray);
      tray.setToolTip(app.name);

      tray.on('click', () => {
        (windows[appid] && windows[appid].isVisible()) ? closeApp(appid) : startApp(appid)
      })

      nbr++;
    }else{
      console.log("APPLICATION LOAD ERROR: " + err);
    }
  });

  update_check();
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit();
}else{
  app.on('ready', init);
  app.on('second-instance', function(evt, commandLine, dir){
    try{
      var arg = commandLine[2];
      if (arg && arg != "."){
        apps.forEach(function(app, appid){
          if (app.name == arg){
            startApp(appid);
          }
        })
      }
    }catch(e){}
  });
}

app.on('window-all-closed', function () {})