const exp = require('express');
const requestN = require('request');
let fs = require('fs');
let config = JSON.parse(fs.readFileSync("config.json"));
let bots = JSON.parse(fs.readFileSync("botInfo.json"));

const port = process.env.PORT || 3001;

const webhookURL = config.webhookURL || process.env.WURL;

const app = exp();

const web = config.web;
let content = "**ALERT**";
// let status = ['UP', 'DOWN'];
// let statusDesc = ['Back Online', 'no longer responding'];

let status = [
	{
		"ud": "UP",
		"desc": "Back Online",
		"color": "3201040"
	},

	{
		"ud": "DOWN",
		"desc": "no longer responding",
		"color": "14177041"
	}
]

let downArray = [];
let notifiedArr = [];

const notifier = (botName, sIndex) => {
	requestN.post({
		headers: {'content-type': 'application/json'},
		url: webhookURL,
		body: {
				"username": "UpTimer",
				"content": content,
				"embeds": [
					{
						"title": `${botName} is ${status[sIndex].ud}`,
						"color": status[sIndex].color,
						"description": `Uptimer has detected **${botName} is ${status[sIndex].desc}**. Details can be found [here](https://google.com)`
					}
				]
			},
		json: true
	});
}

setInterval(

	function(){

		for(let i=0; i<bots.length; i++) {

			requestN.get( {uri: bots[i].ip, time: true}, (err, res) => {

				if(res != undefined) {
					if(downArray.includes(bots[i].name)) {

						downArray.splice(downArray.indexOf(bots[i].name), 1);
						notifiedArr.splice(notifiedArr.indexOf(bots[i].name), 1);

						notifier(bots[i].name, 0);
					}
					console.log(`${bots[i].name}'s status :  ${res.statusCode}  || Latency -> ${res.timings.end}`);
					// console.log(res)
				} else {
					if(!notifiedArr.includes(bots[i].name)) {

						notifiedArr.push(bots[i].name);
						downArray.push(bots[i].name)
						notifier(bots[i].name, 1);

					}
					console.log(`${bots[i].name} : OFFLINE`);
				}
	
				if(err){
					console.log(err);
				}
			});

		}
		
	}, 15000); // <-- ping frequency

	app.get('/', (re1, res) => {
		res.send("UpTimer")
	})

app.listen(port, () => {
	console.log('ping-pong listening on port: ' + port);
});
