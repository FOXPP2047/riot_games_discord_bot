const discord = require("discord.js");
const app = new discord.Client();

const https = require("https");

const CONNECTED = 200;

const jsonLoader = require("jsonloader");
let jsonTokenFile = new jsonLoader("config.json");
const key = jsonTokenFile.api_key;
let url = "https://kr.api.riotgames.com/lol";

app.on("ready", () => {
  console.log("Logged in as ${app.user.tag}!");
});

app.on("message", msg => {
  let userMsg = msg.content;
  let res = userMsg.split(" ");
  let name = res[1];
  for(let i = 2; i < res.length; ++i)
    name += res[i];

  var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;

  if(res[0] === "!레벨") {
    var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;

    https.get(link, function(res) {
        if(res.statusCode === CONNECTED) {
          res.on("data", function(data) {
            const parsedData = JSON.parse(data);
            msg.reply(name + "님의 레벨은 " + parsedData.summonerLevel + "입니다.");
          });
        }
    });
  } else if(res[0] === "!티어" || res[0] === "!티어솔로") {
    var user_id = "";
    var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;
    https.get(link, function(res) {
        if(res.statusCode === CONNECTED) {
          res.on("data", function(data) {
            let parsedData = JSON.parse(data);
            user_id = parsedData.id;

            var link = url + "/league/v4/entries/by-summoner/" + user_id + "?api_key=" + key;
            https.get(link, function(res) {
              if(res.statusCode === CONNECTED) {
                res.on("data", function(data) {
                  const parsedData = JSON.parse(data);
                  msg.reply(name + "님의 티어는 " + parsedData[0].tier + " " + parsedData[0].rank + " " + "입니다.");
                });
              }
            });
          });
        }
    });
  } else if(res[0] === "!티어팀랭") {
    var user_id = "";
    var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;
    https.get(link, function(res) {
        if(res.statusCode === CONNECTED) {
          res.on("data", function(data) {
            let parsedData = JSON.parse(data);
            user_id = parsedData.id;

            var link = url + "/league/v4/entries/by-summoner/" + user_id + "?api_key=" + key;
            https.get(link, function(res) {
              if(res.statusCode === CONNECTED) {
                res.on("data", function(data) {
                  const parsedData = JSON.parse(data);
                  msg.reply(name + "님의 티어는 " + parsedData[1].tier + " " + parsedData[1].rank + " " + "입니다.");
                });
              }
            });
          });
        }
    });
  } else if(res[0] === "!라인") {
    var account_id = "";
    var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;
    https.get(link, function(res) {
        if(res.statusCode === CONNECTED) {
          res.on("data", function(data) {
            let parsedData = JSON.parse(data);
            account_id = parsedData.accountId;

            var link = url + "/match/v4/matchlists/by-account/" + account_id + "?api_key=" + key;
            https.get(link, function(res) {
              if(res.statusCode === CONNECTED) {
                res.on("data", function(data) {
                  const parsedData = JSON.parse(data);
                  let line = {"TOP": 0, "JUNGLE": 0, "MID": 0, "BOTTOM": 0, "NONE": 0};
                  for(let i = 0; i < 20; ++i) {
                      line[parsedData.matches[i].lane]++;
                  }
                  let rankCount = 20 - Number(line["NONE"])
                  msg.reply(name + "님은 최근 " + rankCount + "의 랭크 게임중\n" +
                            name + "님은 최근 TOP을 " + line["TOP"] + "번 플레이 했습니다.\n" +
                            name + "님은 최근 JUNGLE을 " + line["JUNGLE"] + "번 플레이 했습니다.\n" +
                            name + "님은 최근 MID를 " + line["MID"] + "번 플레이 했습니다.\n" +
                            name + "님은 최근 BOTTOM을 " + line["BOTTOM"] + "번 플레이 했습니다.\n");
                });
              }
            });
          });
        }
    });
  }
});

app.login(jsonTokenFile.token);
