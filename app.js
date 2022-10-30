const fs = require('fs'),
	express = require('express'),
    multer  = require('multer'),
    plex = require('./services/plex'),
    app = express(),
    http = require('http'),
    request = require('request');

app.use(express.static(__dirname+'/storage'));
app.set('view engine', 'ejs');
config = JSON.parse(fs.readFileSync('./config/config.json'));
upload = multer({ dest: './storage/multer/' });	

let plexData;
let nowPlaying = '';



/*Known issues and todos:
 - PiPup server seems to crash randomly, and needs to be manually restarted - we might be able to kick off the service and/or check status with ADB - do disable power/battery saving
 - config needs user/player info for TV - right now, if someone else is using the PMS on a different device (eg. mobile phone), their webhooks will trigger the overlays on the TV
 	-- need to test with shared users vs guest vs local users to see where we need to detect...or maybe IP based
 - need to test with local auth/secure connection enforcement on/off - ideally should be able to run with 'secure connection (always)' enabled - need to add PMS ip to "List of IP addresses and networks that are allowed without auth" in Settings > Network
 - video (face-api.js, in progress)
 - last.fm + nowplaying notification (small)
 - not sure if we can do anything about 'plex pass only'
 - need a way to remove the overlay when it gets 'stuck' showing for whatever reason (pipup service crash, or plex webhook misfires/delays)
*/


function startRouter(){
	
	app.get('/', (req, res) =>{
		updatePage(res);	
	});


	app.post(['/plex', '/tasker'], upload.single('thumb'), async function (req, res, next) {
		switch(req.url){
			case "/plex":
				console.log(timeStamp(),'=========================================================\n');
				plexData = await plex.processPayload(config, req);
				//console.log('got back w/ :', plexData);
				plexData.tvdbToken = config.tvdbToken;
				//if we're on a new media, update overlay with new content
				if(plexData.title != nowPlaying){ //need to check with a movie
					nowPlaying = plexData.title;
					//setPageInfo	
					console.log('Now Playing Change: ', nowPlaying);
					updatePage(res);
				}

				///move all this somewhere else
				if(plexData.event == 'media.pause'){
					postOverlay(9999);			
				}
				else{ //might need to change to capture other events and filter...we don't want to send bunch of requests if user is ffwd'ing, etc.
					//remove overlay, contents don't matter, just want duration 0
					postOverlay(0);
				}
				break;
		}
	});
	app.listen(config.webhookPort, config.plexServerIp);
	console.log('listening on '+config.plexServerIp+':'+config.webhookPort+'...');


}
startRouter();




function updatePage(res){
	res.render('pages/index',{
		plexData: plexData
	});
}


function timeStamp(){
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	return date+' '+time;
}



function postOverlay(dur){
	var clientServerOptions = {
        uri: 'http://'+config.tvIp+':'+config.tvPort+'/notify',
        body: '{"duration": '+dur+', "position": 0, "backgroundColor": "#00ffffff", "media": { "web": { "uri": "http://'+config.plexServerIp+':'+config.webhookPort+'", "width": 1920, "height": 1080}}}',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    //comment out this request to test locally
    request(clientServerOptions, function (error, response) {
        //console.log(error,response);
        return;
    });	
}