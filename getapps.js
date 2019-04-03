__dirname = __dirname.replace("\\resources\\app.asar", "");
const fs = require("fs");

module.exports.getApps = function(callback){

    !fs.existsSync(__dirname + "/apps") ? fs.mkdirSync(__dirname + "/apps") : 0;

    fs.readdir(__dirname + "/apps", (err1, files) => {
        if (!err1 && files){
            files.forEach(file => {        
                if (!err1){
                    if (file.split(".")[file.split(".").length - 1] == "irapp"){
                        fs.readFile(__dirname + "/apps/" + file, 'utf8', function(err2, data){
                            if (!err2){
                                try{
                                    var app = JSON.parse(data);    
                                    callback(null, app);
                                }catch(e){
                                    console.log("[2]ERROR: " + e);
                                    callback(e, null);
                                }
                            }else{
                                console.log("[1]ERROR: " + err2);
                                callback(err2, null);
                            }
                        })
                    }
                }else{
                    console.log("[0]ERROR: " + err1);
                    callback(err1, null);
                }
            });
        }
    });

    callback(null, {
        "name": "Iridium store",
        "url": "https://usp-3.fr/offline/store",
        "enable_debug_tools": true,
        "options": {
            "title": "Iridium store",
            "icon": "\\resources\\app.asar/logo.ico",
            "width": 1280,
            "height": 720
        }
    });
}