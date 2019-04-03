// C:\Users\sdkca\Desktop\electron-workspace\build.js
var electronInstaller = require('electron-winstaller');

// In this case, we can use relative paths
var settings = {
    // Specify the folder where the built app is located
    appDirectory: '.',
    // Specify the existing folder where 
    outputDirectory: './build/1.0.0',
    // The name of the Author of the app (the name of your company)
    authors: 'Iridium',
    // The name of the executable of your built
    exe: './build/1.0.0/win.exe'
};

resultPromise = electronInstaller.createWindowsInstaller(settings);
 
resultPromise.then(() => {
    console.log("The installers of your application were succesfully created !");
}, (e) => {
    console.log(`Well, sometimes you are not so lucky: ${e.message}`)
});