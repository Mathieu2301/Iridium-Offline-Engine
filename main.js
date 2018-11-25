const {app, ipcMain, BrowserWindow, Tray, Menu, session} = require('electron');
const fs = require("fs");
const util = require("util");

var apps = [];
var windows = [];
let tray = null

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

var contextMenu_template = [];
var contextMenu = Menu.buildFromTemplate(contextMenu_template);


function init(){
 
  tray = new Tray(__dirname + '/logo.ico')
  tray.setToolTip('Iridium')
  tray.setContextMenu(contextMenu)

  var nbr = 0;

  require("./getapps").getApps(function(err, app){
    if (!err && app){
      apps.push(app);

      var appid = nbr;

      startApp(appid);

      contextMenu_template.push({ label: app.name, type: 'normal', click: function(){ new function(){ startApp(appid) }}})
      contextMenu = Menu.buildFromTemplate(contextMenu_template)
      tray.setContextMenu(contextMenu)

      nbr++;
    }else{
      console.log("ERROR: " + err);
    }
  });
}

app.on('ready', init);

app.on('window-all-closed', function () {})