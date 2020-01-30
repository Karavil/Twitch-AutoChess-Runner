//Imports
var tmi = require('tmi.js');
var jsonfile = require('jsonfile');
var lobbyGenerator = require('./lobby-generator.js');

//Persisten files
var playerDB = './players.json';
var settingsFile = './settings.json';

//Admin list for some commands
var adminList = ['zeturk', 'beryair', 'governmentmass', 'bananaslamjamma', 'zenode', 'grechi', 'iamrougenine'];

//Twitch bot settings
var tmiOptions = {
  options: {
    debug: true
  },
  connection: {
    cluster: "aws",
    reconnect: true
  },
  identity: {
    username: "BotSlamJamma",
    password: "",
  },
  channels: ["zeTurk", "BananaSlamJamma"]
};


var client = new tmi.client(tmiOptions);
client.connect();

var commandCounter = 0;

function commandCounterReset() {
  setInterval(() => {
    commandCounter = 0;
  }, 15000);
}
commandCounterReset();



client.on('connected', function (address, port) {
  console.log('Connected to Twitch servers.')
  console.log(address + ':' + port);
});

client.on('chat', function (channel, user, message, self) {
  if (self) return;
  message = message.toLowerCase();
  var args = message.split(/[ ]+/);

  if (commandCounter == 30) {
    client.say(channel, 'Bot commands are currently on cooldown, please wait a few seconds.');
    commandCounter++;
  } else if (commandCounter > 30) {
    return;
  } else if (message.startsWith('!jointourney')) {
    if (getSignupStatus()) joinTourney(channel, user);
    else client.say(channel, 'Signups are currently closed.');
    commandCounter++;
  } else if (message.startsWith('!leavetourney')) {
    if (getSignupStatus()) leaveTourney(channel, user);
    else client.say(channel, "Signups are currently closed. (Leaving and joining is currently not allowed.)");
    commandCounter++;
  } else if (message.startsWith('!count') && isAdmin(user)) {
    client.say(channel, getSignupCount().toString());
    commandCounter++;
  } else if (message.startsWith('!opensignups') && isAdmin(user)) {
    openSignups();
    client.say(channel, 'Signups are now open.');
    commandCounter++;
  } else if (message.startsWith('!closesignups') && isAdmin(user)) {
    closeSignups();
    client.say(channel, 'Signups are now closed.');
    commandCounter++;
  } else if (message.startsWith('!generatelobbies') && isAdmin(user)) {
    client.say(channel, 'Lobbies are being generated... this will take a few seconds.');
    lobbyGenerator.generateLobbies();
    var lobbylist = lobbyGenerator.getPlayerLobbies();
    client.say(channel, 'Lobbies generated, use !sendlobbies to whisper lobby info to players.');
    commandCounter = commandCounter + 2;
  } else if (message.startsWith('!sendlobbies') && isAdmin(user)) {
    var lobbylist = lobbyGenerator.getPlayerLobbies();
    var i = 0;

    function sendWhispers() {
      setTimeout(function () {
        if (lobbylist[i].isLobbyLeader) {
          client.whisper(lobbylist[i].displayName, "Round " + lobbylist[i].round + " is live for BSJ's auto chess tourney OhMyDog You are the LOBBY LEADER of lobby number: " + lobbylist[i].lobbyID + " KevinTurtle Please create a DOTA AUTO CHESS lobby with the password: " + lobbylist[i].lobbyPassword + " and wait for the other players.");
        } else {
          client.whisper(lobbylist[i].displayName, "Round " + lobbylist[i].round + " is live for BSJ's auto chess tourney OhMyDog Your lobby leader is " + lobbylist[i].lobbyLeaderDisplayname + ". You are in lobby number: " + lobbylist[i].lobbyID + " Please search for custom game lobbies with the password: " + lobbylist[i].lobbyPassword + " (Give your lobby leader a few minutes to create the lobby)");
        }
        i++
        if (i < lobbylist.length) {
          sendWhispers();
        }
      }, 300);
    }
    sendWhispers();
  } else if (message.startsWith('!removeplayer') && isAdmin(user)) {
    removeByDisplayName(channel, args[1]);
    commandCounter++;
  } else if (message.startsWith('!status')) {
    var playerStatus = getPlayerStatus(user);
    switch (playerStatus) {
      case 'signed-up-subscriber':
        client.say(channel, '@' + getDisplayName(user) + ', you are currently signed up, see you soon!');
        break;
      case 'not-signed-up':
        client.say(channel, '@' + getDisplayName(user) + ', you are currently not signed up for the tournament.');
        break;
      case 'not-a-subscriber':
        break;
      case 'banned':
        client.say(channel, '@' + getDisplayName(user) + ', you are banned from sub tourneys.');
        break;
      default:
        client.say(channel, 'ERROR: Something went wrong.');
    }
  } else if (message.startsWith('!advance') && isAdmin(user)) {
    if (args.length <= 2) {
      client.say(channel, '@' + getDisplayName(user) + ', wrong command usage. Do !advance {round number} player1, player2, player3, ...');
    } else if (!isInt(args[1])) {
      client.say(channel, '@' + getDisplayName(user) + ', wrong command usage. Do !advance {round number} player1, player2, player3, ...');
    } else {
      var displayNameList = [];
      for (var i = 2; i < args.length; i++) {
        var displayName = args[i].replace(',', '');
        displayNameList.push(displayName);
      }

      var advancedPlayerDictionary = [];
      var errorFound = false;
      try {
        advancedPlayerDictionary = lobbyGenerator.advancePlayers(parseInt(args[1]), displayNameList);
      } catch (error) {
        client.say(channel, '@' + getDisplayName(user) + ', ERROR: ' + error);
        errorFound = true;
      }

      if (!errorFound) {
        client.action(channel, 'has advanced the inputted players to the next round. Players in this lobby, check your private messages for the lobby info! The messages will be rolled out in waves, please be patient.');
        var i = 0;

        function sendAWhispers() {
          setTimeout(function () {
            if (advancedPlayerDictionary[i].isLobbyLeader) {
              client.whisper(advancedPlayerDictionary[i].displayName, "Round " + advancedPlayerDictionary[i].round + " is live for BSJ's auto chess tourney OhMyDog You are the LOBBY LEADER of lobby " + advancedPlayerDictionary[i].lobbyID + " KevinTurtle Please create a DOTA AUTO CHESS lobby with the password: " + advancedPlayerDictionary[i].lobbyPassword + " and wait for the other players.");
            } else {
              client.whisper(advancedPlayerDictionary[i].displayName, "Round " + advancedPlayerDictionary[i].round + " is live for BSJ's auto chess tourney OhMyDog Your lobby leader is " + advancedPlayerDictionary[i].lobbyLeaderDisplayname + " You are in lobby number " + advancedPlayerDictionary[i].lobbyID + ". Please search for custom game lobbies with the password: " + advancedPlayerDictionary[i].lobbyPassword + " (Give your lobby leader a few minutes to create the lobby)");
            }
            i++
            if (i < advancedPlayerDictionary.length) {
              sendAWhispers();
            }
          }, 300);
        }
        sendAWhispers();
      }
    }
  }
});


/**
 * Checks if the user is on the admin list.
 * @param {*} user 
 */
function isAdmin(user) {
  var twitchTag = getUserName(user);
  var displayTag = getDisplayName(user);

  for (var i = 0; i < adminList.length; i++) {
    if (twitchTag.toLowerCase() == adminList[i] || displayTag.toLowerCase() == adminList[i]) return true;
  }
  return false;
}

function isMod(user) {
  return user.mod;
}

function isVIP(user) {
  try {
    if (user.badges.vip == '1') return true;
    else return false;
  } catch (error) {
    return false;
  }
}
/**
 * Checks if this user is a subscriber in the channel where the message is sent.
 * @param {*} user 
 */
function isSub(user) {
  if (user.mod || user.subscriber || isVIP(user) || isAdmin(user)) return true;
  else return false;
}

function isInt(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
}

function getSubLength(user) {
  try {
    var subMonths = parseInt(user.badges.subscriber);
    return subMonths;
  } catch (error) {
    return 0;
  }
}
/**
 * Returns a dictionary with all the players and their information. (players.json)
 */
function getPlayerList() {
  var players = jsonfile.readFileSync(playerDB);
  return players;
}

/**
 * Returns a dictionary with the current settings. (settings.json)
 */
function getSettings() {
  var settings = jsonfile.readFileSync(settingsFile);
  return settings;
}

/**
 * Opens the signups by updating the settings file.
 */
function openSignups() {
  var settings = getSettings();
  settings.signupsOpen = true;
  jsonfile.writeFileSync(settingsFile, settings, {
    spaces: 1
  });
}

/**
 * Closes the signups by updatings the settings files
 */
function closeSignups() {
  var settings = getSettings();
  settings.signupsOpen = false;
  jsonfile.writeFileSync(settingsFile, settings, {
    spaces: 1
  });
}

function getSignupStatus() {
  var settings = getSettings();
  return settings.signupsOpen;
}

/**
 * Display name can be different from username, as display name can be changed on twitch.
 * @param {*} user 
 */
function getDisplayName(user) {
  return user['display-name'];
}

/**
 * Username on twitch cannot be changed.
 * @param {*} user 
 */
function getUserName(user) {
  return user['username'];
}

/**
 * User ID on twitch cannot be changed.
 * @param {*} user 
 */
function getUserID(user) {
  return user['user-id'];
}

function joinTourney(channel, user) {
  switch (getPlayerStatus(user)) {
    case 'not-signed-up':
      client.action(channel, 'added @' + getDisplayName(user) + ' to the tournament.');
      addPlayer(user, 'signed-up-subscriber');
      break;
    case 'banned':
      client.action(channel, 'denied @' + getDisplayName(user) + ' from signing up. You are banned from sub tourneys. :rage:');
      break;
    case 'signed-up-subscriber':
      client.action(channel, 'denied @' + getDisplayName(user) + ' from signing up. You are already signed up! BrokeBack');
      break;
    case 'not-a-subscriber':
      client.action(channel, 'denied @' + getDisplayName(user) + ' from signing up. Plebs are not allowed to play in the tourney. SoBayed');
      break;
    default:
      client.action(channel, 'has encountered an error, please contact an admin.');
  }
}

function leaveTourney(channel, user) {
  switch (getPlayerStatus(user)) {
    case 'not-signed-up':
      client.action(channel, 'denied @' + getDisplayName(user) + ". You can't leave if you are not signed up...  BrokeBack ");
      break;
    case 'banned':
      client.action(channel, 'question marks @' + getDisplayName(user) + '. Banned players are not allowed to play or leave the tournament.');
      break;
    case 'signed-up-subscriber':
      client.action(channel, 'removed @' + getDisplayName(user) + " from the tournament. Farewell banana lover... ");
      removePlayer(getUserID(user));
      break;
    case 'not-a-subscriber':
      //client.action(channel, 'denied @' + getDisplayName(user) + '. Plebs are not allowed to play or leave the tournament! SoBayed');
      break;
    default:
      client.action(channel, 'has encountered an error, please contact an admin.');
  }
}

function getPlayerStatus(user) {
  var playerList = getPlayerList();
  if (!isSub(user)) {
    return 'not-a-subscriber';
  } else {
    for (var i = 0; i < playerList.length; i++) {
      if (playerList[i].userID == getUserID(user)) {
        return playerList[i].status;
      }
    }
    return 'not-signed-up';
  }
}

function getPlayerPriority(user) {
  if (isAdmin(user)) return 5;
  if (isMod(user)) return 4;
  if (isVIP(user)) return 3;
  if (isSub(user)) {
    var subbedMonths = getSubLength(user);

    if (subbedMonths >= 6) {
      return 2;
    } else if (subbedMonths >= 3) {
      return 1;
    } else {
      return 0;
    }
  }
}

function getSignupCount() {
  var count = 0;
  playerList = getPlayerList();
  for (var i = 0; i < playerList.length; i++) {
    if (playerList[i].status == 'signed-up-subscriber') count++;
  }
  return count;
}

function addPlayer(user, status) {
  var playerList = getPlayerList();

  var displayName = getDisplayName(user);
  var username = getUserName(user);
  var userID = getUserID(user);
  var playerPriority = getPlayerPriority(user);

  playerList = [...playerList, {
    displayName,
    username,
    userID,
    status,
    playerPriority
  }]

  jsonfile.writeFileSync(playerDB, playerList, {
    spaces: 2
  });
}

function removePlayer(userID) {
  var playerList = getPlayerList();
  var tempList = [];
  var found = false;

  for (var i = 0; i < playerList.length; i++) {
    if (playerList[i].userID != userID) {
      tempList = [...tempList, playerList[i]];
    } else {
      found = true;
    }
  }

  jsonfile.writeFileSync(playerDB, tempList, {
    spaces: 2
  });
  return found;
}

function removeExtraPlayers(channel) {
  var playerList = getPlayerList();
  var playerCount = getCount();
  var extraPlayerCount = playerCount % 8;
  var removeCounter = 0;

  for (var i = (playerList.length - 1); i >= 0; i--) {
    if (playerList[i].status == 'signed-up-subscriber' && removeCounter < extraPlayerCount) {
      client.say(channel, '@' + playerList[i].displayName + ' has been removed as they were one of the last players to sign up and were above the cutoff point.');
      removePlayer(playerList[i].userID);
      removeCounter++;
    }
  }
}