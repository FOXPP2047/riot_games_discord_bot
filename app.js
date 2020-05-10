const discord = require("discord.js");
const app = new discord.Client();

const https = require("https");

const CONNECTED = 200;
const BADGATE = 404;
const BADREQUEST = 400;

const jsonLoader = require("jsonloader");
let jsonTokenFile = new jsonLoader("config.json");
const key = jsonTokenFile.api_key;
let url = "https://kr.api.riotgames.com/lol";

let region = "한국";

app.on("ready", () => {
  console.log("Logged in as ${app.user.tag}!");
});

app.on("message", msg => {
  let userMsg = msg.content;
  let res = userMsg.split(" ");
  let name = res[1];
  var printName = "";

  for(let i = 2; i < res.length; ++i) {
    name += res[i];
  }

  if(res[0] === "!세팅" || res[0] === "!set") {
    if(name === "북미" || name === "na") {
      url = "https://na1.api.riotgames.com/lol";
      region = "북미";
    } else if(name === "한국" || name === "kr") {
      url = "https://kr.api.riotgames.com/lol";
      region = "한국";
    } else if(name === "일본" || name === "jp") {
      url = "https://jp1.api.riotgames.com/lol";
      region = "일본";
    } else if(name === "브라질" || name === "br") {
      url = "https://br1.api.riotgames.com/lol";
      region = "브라질";
    } else if(name === "유럽" || name === "서유럽" || name === "eu") {
      url = "https://euw1.api.riotgames.com/lol";
      region = "서유럽";
    } else if(name === "북유럽" || name === "euw") {
      url = "https://euw1.api.riotgames.com/lol";
      region = "북유럽";
    }
    msg.reply("검색지역이 " + region + "서버로 변경되었습니다.");
  }

  if(res[0] === "!지역" || res[0] === "!region") {
    msg.reply("현재 검색 서버는 " + region + "입니다.\n" +
              "서버 바꾸기를 원하실 경우 !세팅 키워드를 이용해 주세요.");
  }
  var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;

  if(res[0] === "!레벨" || res[0] === "!level") {
    var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;

    https.get(link, function(res) {
        if(res.statusCode === CONNECTED) {
          res.on("data", function(data) {
            var parsedData = JSON.parse(data);
            printName = parsedData.name;
            msg.reply(printName + "님의 레벨은 " + parsedData.summonerLevel + "입니다.");
          });
        } else if(res.statusCode === BADGATE) {
          msg.reply(name + "은 잘못된 소환사 명 입니다.");
        }
    });
  } else if(res[0] === "!티어" || res[0] === "!티어솔로" || res[0] === "!tier" || res[0] === "solotier") {
    var user_id = "";
    var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;
    https.get(link, function(res) {
        if(res.statusCode === CONNECTED) {
          res.on("data", function(data) {
            var parsedData = JSON.parse(data);
            user_id = parsedData.id;
            printName = parsedData.name;

            var link = url + "/league/v4/entries/by-summoner/" + user_id + "?api_key=" + key;
            https.get(link, function(res) {
              if(res.statusCode === CONNECTED) {
                res.on("data", function(data) {
                  var parsedData = JSON.parse(data);
                  msg.reply(printName + "님의 티어는 " + parsedData[0].tier + " " + parsedData[0].rank + " " + "입니다.");
                });
              }
            });
          });
        } else if(res.statusCode === BADGATE) {
          msg.reply(name + "은 잘못된 소환사 명 입니다.");
        }
    });
  } else if(res[0] === "!티어팀랭" || res[0] === "!teamtier") {
    var user_id = "";
    var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;
    https.get(link, function(res) {
        if(res.statusCode === CONNECTED) {
          res.on("data", function(data) {
            var parsedData = JSON.parse(data);
            user_id = parsedData.id;
            printName = parsedData.name;

            var link = url + "/league/v4/entries/by-summoner/" + user_id + "?api_key=" + key;
            https.get(link, function(res) {
              if(res.statusCode === CONNECTED) {
                res.on("data", function(data) {
                  var parsedData = JSON.parse(data);
                  msg.reply(printName + "님의 티어는 " + parsedData[1].tier + " " + parsedData[1].rank + " " + "입니다.");
                });
              }
            });
          });
        } else if(res.statusCode === BADGATE) {
          msg.reply(name + "은 잘못된 소환사 명 입니다.");
        }
    });
  } else if(res[0] === "!라인" || res[0] === "!line") {
    var account_id = "";
    var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;
    https.get(link, function(res) {
        if(res.statusCode === CONNECTED) {
          res.on("data", function(data) {
            var parsedData = JSON.parse(data);
            account_id = parsedData.accountId;
            printName = parsedData.name;

            var link = url + "/match/v4/matchlists/by-account/" + account_id + "?api_key=" + key;
            https.get(link, function(res) {
              if(res.statusCode === CONNECTED) {
                res.on("data", function(data) {
                  var parsedData = JSON.parse(data);
                  let line = {"TOP": 0, "JUNGLE": 0, "MID": 0, "BOTTOM": 0, "NONE": 0};
                  for(let i = 0; i < 20; ++i) {
                      line[parsedData.matches[i].lane]++;
                  }
                  let rankCount = 20 - Number(line["NONE"])
                  msg.reply(printName + "님은 최근 " + rankCount + "의 랭크 게임중\n" +
                            printName + "님은 최근 TOP을 " + line["TOP"] + "번 플레이 했습니다.\n" +
                            printName + "님은 최근 JUNGLE을 " + line["JUNGLE"] + "번 플레이 했습니다.\n" +
                            printName + "님은 최근 MID를 " + line["MID"] + "번 플레이 했습니다.\n" +
                            printName + "님은 최근 BOTTOM을 " + line["BOTTOM"] + "번 플레이 했습니다.\n");
                });
              }
            });
          });
        } else if(res.statusCode === BADGATE) {
          msg.reply(name + "은 잘못된 소환사 명 입니다.");
        }
    });
  } else if(res[0] === "!숙련도" || res[0] === "!master") {
    var user_id = "";
    var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;
    https.get(link, function(res) {
        if(res.statusCode === CONNECTED) {
          res.on("data", function(data) {
            var parsedData = JSON.parse(data);
            user_id = parsedData.id;

            printName = parsedData.name;

            var link = url + "/champion-mastery/v4/champion-masteries/by-summoner/" + user_id + "?api_key=" + key;
            https.get(link, function(res) {
              if(res.statusCode === CONNECTED) {
                var buffers = [];
                res.on("data", function(chunk) {
                  buffers.push(chunk);
                })
                .on("end", function() {
                  var parsedData = JSON.parse(Buffer.concat(buffers).toString());
                  var championID = [];
                  var championPoint = [];

                  for(let i = 0; i < 3; ++i) {
                    championID.push(parsedData[i].championId);
                    championPoint.push(parsedData[i].championPoints);
                  }

                  let champions = new jsonLoader("champions.json");
                  let champName = [];

                  for(let i = 0; i < 3; ++i) {
                    for(let data in champions.data) {
                        if(champions.data[data]["key"] == championID[i])
                          champName.push(champions.data[data]["name"]);
                    }
                  }

                  msg.reply(printName + "님의 최고 숙련 챔피언은 " + champName[0] + "이고, 숙련도는 " + championPoint[0] + " 입니다.\n" +
                                        "두번째 숙련 챔피언은 " + champName[1] + "이고, 숙련도는 " + championPoint[1] + " 입니다.\n" +
                                        "세번째 숙련 챔피언은 " + champName[2] + "이고, 숙련도는 " + championPoint[2] + " 입니다.");
                })
              }
            });
          });
        } else if(res.statusCode === BADGATE) {
          msg.reply(name + "은 잘못된 소환사 명 입니다.");
        }
    });
  } else if(res[0] === "!현재" || res[0] === "!current") {
    var user_id = "";
    var link = url + "/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;
    https.get(link, function(res) {
        if(res.statusCode === CONNECTED) {
          res.on("data", function(data) {
            var parsedData = JSON.parse(data);
            user_id = parsedData.id;

            printName = parsedData.name;

            var link = url + "/spectator/v4/active-games/by-summoner/" + user_id + "?api_key=" + key;
            https.get(link, function(res) {
              if(res.statusCode === CONNECTED) {
                res.on("data", function(data) {
                  var parsedData = JSON.parse(data);
                  var withSummoners = [];
                  var notSummoners = [];
                  var currentChampionId = "";
                  var currentChampionName = "";
                  var teamId = "";

                  for(let p in parsedData.participants) {
                    if(printName == parsedData.participants[p].summonerName) {
                      teamId = parsedData.participants[p].teamId;
                      currentChampionId = parsedData.participants[p].championId;
                    }
                  }

                  for(let p in parsedData.participants) {
                    if(printName !== parsedData.participants[p].summonerName && teamId == parsedData.participants[p].teamId) {
                        withSummoners.push(parsedData.participants[p].summonerName);
                    } else if(printName !== parsedData.participants[p].summonerName && teamId !== parsedData.participants[p].teamId) {
                        notSummoners.push(parsedData.participants[p].summonerName);
                    }
                  }

                  let champions = new jsonLoader("champions.json");

                    for(let data in champions.data) {
                        if(champions.data[data]["key"] == currentChampionId)
                          currentChampionName = champions.data[data]["name"];
                    }
                  msg.reply(printName + "님은 현재 " + currentChampionName + "을 플레이 중입니다.\n" +
                            "아군 : " + withSummoners + "\n" +
                            "적군 : " + notSummoners);
                })
              } else if(res.statusCode === BADGATE) {
                msg.reply(printName + "님은 현재 게임 중이 아닙니다.");
              } else if(res.statusCode === BADREQUEST) {
                msg.reply(printName + "님은 잘못된 소환사 명 입니다.");
              }
            });
          });
        } else if(res.statusCode === BADGATE) {
          msg.reply(name + "은 잘못된 소환사 명 입니다.");
        }
    });
  }
});

app.login(jsonTokenFile.token);
