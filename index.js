const exp = require('express');
const requestN = require('request');
let fs = require('fs');
let config = JSON.parse(fs.readFileSync("config.json"));

const port = process.env.PORT || 3001;

const webhookURL = config.webhookURL;

const app = exp();

const web = config.web;
let cnt = "yolo";
let botName="Rusty"
let status = ['UP', 'DOWN'];
let statusDesc = ['Back Online', 'no longer responding'];
let isDown = false;
let notified = false;

const notifier = (botName, status, statusDesc) => {
	requestN.post({
		headers: {'content-type': 'application/json'},
		url: webhookURL,
		body: {
				"username": "Status bot",
				"content": cnt,
				"embeds": [
					{
						"title": `${botName} is ${status}`,
						"color": "14177041",
						"description": `Uptimer has detected **${botName} is ${statusDesc}**. Details can be found [here](https://google.com)`
					}
				]
			},
		json: true
	});
}

setInterval(

	function(){
		requestN.get( web, (err, res, body) => {

			if(res != undefined) {
				if(isDown) {
					isDown = false;
					notifier(botName, status[0], statusDesc[0]);
				}
				console.log('status : ' + res.statusCode);
			} else {
				if(!notified) {
					notified = true;
					isDown = true;
					notifier(botName, status[1], statusDesc[1]);
				}
				console.log('status : OFFLINE');
			}

			if(err){
				console.log(err);
			}
		});
	}, 5000); // <-- ping frequency

app.listen(port, () => {
	console.log('ping-pong listening on port: ' + port);
});
