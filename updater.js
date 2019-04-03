const https = require('https');
var fs = require('fs');
const os = require('os');

class updater {
    
    constructor(token, platform, version, allow_beta = true, allow_alpha = true) {
        this.token = token;
        this.platform = platform;
        this.version = version;
        this.allow_beta = allow_beta;
        this.allow_alpha = allow_alpha;

        this.downloading = false;
        this.downloaded = false;
    }

    check(callback){
        if (!this.downloading){
            var thisclass = this;
            request("https://versioning.usp-3.fr/api/get.php?token=" + this.token + "&platform=" + this.platform, function(version_infos){
                try{
                    if (thisclass.version != version_infos.last_version){
                        if (version_infos.last_version_type == "RELEASE"){
                            thisclass.newversion = version_infos; 
                            callback(true, version_infos);
                        }else if (version_infos.last_version_type == "BETA" && thisclass.allow_beta){
                            thisclass.newversion = version_infos;
                            callback(true, version_infos);
                        }else if (version_infos.last_version_type == "ALPHA" && thisclass.allow_alpha){
                            thisclass.newversion = version_infos;
                            callback(true, version_infos);
                        }else{
                            callback(false, version_infos);
                        }
                    }else{
                        callback(false, version_infos);
                    }
                }catch(ex){
                }
            })
        }
    }

    download(callback = () =>{}){
        var thisclass = this;
        if (!thisclass.downloading){
            var dest = os.tmpdir() + "\\update.exe";
            if (!thisclass.downloaded){
                https.get(thisclass.newversion.url, (resp) => {
                    var url = resp.headers.location;
                    fs.unlink(dest, function(){
                        var file = fs.createWriteStream(dest);
                        thisclass.downloading = true;
                        var request = https.get(url, function(response) {
                          response.pipe(file);
                        });
        
                        file.on('finish', () => {
                            file.close();
                            thisclass.downloaded = true;
                            thisclass.downloading = false;
                            callback(dest);
                        });
        
                        request.on('error', (err) => {
                            fs.unlinkSync(dest);
                            thisclass.downloading = false;
                        });
        
                        file.on('error', (err) => {
                            fs.unlinkSync(dest);
                        });
                    })
                });
                
            }else{
                callback(dest);
            }
        }
    }

    update(){
        this.download(function(dest){
            console.log("Opening " + dest);
            var exec = require('child_process').exec;
            exec(dest);
        })
    }
}

function request(url, callback) {
    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            callback(JSON.parse(data));
        });
    });
}

module.exports = updater;