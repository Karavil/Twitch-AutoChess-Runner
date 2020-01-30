/*
    Defining dependencies
*/

var moment = require('moment');
var jsonfile = require('jsonfile');
var fs = require('fs');

var playerDB = './players.json';
var playerTrackerDB = './playerTracker.json';
var methods = {};

var roundLobbyCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

methods.generateLobbies = function () {
  assignLobbies();
}
methods.getPlayerLobbies = function () {
  var lobbies = jsonfile.readFileSync(playerTrackerDB);
  return lobbies;
};

methods.advancePlayers = function (newRound, advancedPlayerUsernames) {
  return advancePlayers(newRound, advancedPlayerUsernames);
}

var adjectives = ["White", "Gray", "Brown", "Red", "Pink", "Crimson", "Carnelian", "Orange", "Yellow", "Ivory", "Cream", "Green", "Viridian", "Aquamarine", "Cyan", "Blue", "Cerulean", "Azure", "Indigo", "Navy", "Violet", "Purple", "Lavender", "Magenta", "Rainbow", "Iridescent", "Spectrum", "Prism", "Bold", "Vivid", "Pale", "Clear", "Glass", "Translucent", "Misty", "Dark", "Light", "Gold", "Silver", "Copper", "Bronze", "Steel", "Iron", "Brass", "Mercury", "Zinc", "Chrome", "Platinum", "Titanium", "Nickel", "Lead", "Pewter", "Rust", "Metal", "Stone", "Quartz", "Granite", "Marble", "Alabaster", "Agate", "Jasper", "Pebble", "Pyrite", "Crystal", "Geode", "Obsidian", "Mica", "Flint", "Sand", "Gravel", "Boulder", "Basalt", "Ruby", "Beryl", "Scarlet", "Citrine", "Sulpher", "Topaz", "Amber", "Emerald", "Malachite", "Jade", "Abalone", "Lapis", "Sapphire", "Diamond", "Peridot", "Gem", "Jewel", "Bevel", "Coral", "Jet", "Ebony", "Wood", "Tree", "Cherry", "Maple", "Cedar", "Branch", "Bramble", "Rowan", "Ash", "Fir", "Pine", "Cactus", "Alder", "Grove", "Forest", "Jungle", "Palm", "Bush", "Mulberry", "Juniper", "Vine", "Ivy", "Rose", "Lily", "Tulip", "Daffodil", "Honeysuckle", "Fuschia", "Hazel", "Walnut", "Almond", "Lime", "Lemon", "Apple", "Blossom", "Bloom", "Crocus", "Rose", "Buttercup", "Dandelion", "Iris", "Carnation", "Fern", "Root", "Branch", "Leaf", "Seed", "Flower", "Petal", "Pollen", "Orchid", "Mangrove", "Cypress", "Sequoia", "Sage", "Heather", "Snapdragon", "Daisy", "Mountain", "Hill", "Alpine", "Chestnut", "Valley", "Glacier", "Forest", "Grove", "Glen", "Tree", "Thorn", "Stump", "Desert", "Canyon", "Dune", "Oasis", "Mirage", "Well", "Spring", "Meadow", "Field", "Prairie", "Grass", "Tundra", "Island", "Shore", "Sand", "Shell", "Surf", "Wave", "Foam", "Tide", "Lake", "River", "Brook", "Stream", "Pool", "Pond", "Sun", "Sprinkle", "Shade", "Shadow", "Rain", "Cloud", "Storm", "Hail", "Snow", "Sleet", "Thunder", "Lightning", "Wind", "Hurricane", "Typhoon", "Dawn", "Sunrise", "Morning", "Noon", "Twilight", "Evening", "Sunset", "Midnight", "Night", "Sky", "Star", "Stellar", "Comet", "Nebula", "Quasar", "Solar", "Lunar", "Planet", "Meteor", "Sprout", "Pear", "Plum", "Kiwi", "Berry", "Apricot", "Peach", "Mango", "Pineapple", "Coconut", "Olive", "Ginger", "Root", "Plain", "Fancy", "Stripe", "Spot", "Speckle", "Spangle", "Ring", "Band", "Blaze", "Paint", "Pinto", "Shade", "Tabby", "Brindle", "Patch", "Calico", "Checker", "Dot", "Pattern", "Glitter", "Glimmer", "Shimmer", "Dull", "Dust", "Dirt", "Glaze", "Scratch", "Quick", "Swift", "Fast", "Slow", "Clever", "Fire", "Flicker", "Flash", "Spark", "Ember", "Coal", "Flame", "Chocolate", "Vanilla", "Sugar", "Spice", "Cake", "Pie", "Cookie", "Candy", "Caramel", "Spiral", "Round", "Jelly", "Square", "Narrow", "Long", "Short", "Small", "Tiny", "Big", "Giant", "Great", "Atom", "Peppermint", "Mint", "Butter", "Fringe", "Rag", "Quilt", "Truth", "Lie", "Holy", "Curse", "Noble", "Sly", "Brave", "Shy", "Lava", "Foul", "Leather", "Fantasy", "Keen", "Luminous", "Feather", "Sticky", "Gossamer", "Cotton", "Rattle", "Silk", "Satin", "Cord", "Denim", "Flannel", "Plaid", "Wool", "Linen", "Silent", "Flax", "Weak", "Valiant", "Fierce", "Gentle", "Rhinestone", "Splash", "North", "South", "East", "West", "Summer", "Winter", "Autumn", "Spring", "Season", "Equinox", "Solstice", "Paper", "Motley", "Torch", "Ballistic", "Rampant", "Shag", "Freckle", "Wild", "Free", "Chain", "Sheer", "Crazy", "Mad", "Candle", "Ribbon", "Lace", "Notch", "Wax", "Shine", "Shallow", "Deep", "Bubble", "Harvest", "Fluff", "Venom", "Boom", "Slash", "Rune", "Cold", "Quill", "Love", "Hate", "Garnet", "Zircon", "Power", "Bone", "Void", "Horn", "Glory", "Cyber", "Nova", "Hot", "Helix", "Cosmic", "Quark", "Quiver", "Holly", "Clover", "Polar", "Regal", "Ripple", "Ebony", "Wheat", "Phantom", "Dew", "Chisel", "Crack", "Chatter", "Laser", "Foil", "Tin", "Clever", "Treasure", "Maze", "Twisty", "Curly", "Fortune", "Fate", "Destiny", "Cute", "Slime", "Ink", "Disco", "Plume", "Time", "Psychadelic", "Relic", "Fossil", "Water", "Savage", "Ancient", "Rapid", "Road", "Trail", "Stitch", "Button", "Bow", "Nimble", "Zest", "Sour", "Bitter", "Phase", "Fan", "Frill", "Plump", "Pickle", "Mud", "Puddle", "Pond", "River", "Spring", "Stream", "Battle", "Arrow", "Plume", "Roan", "Pitch", "Tar", "Cat", "Dog", "Horse", "Lizard", "Bird", "Fish", "Saber", "Scythe", "Sharp", "Soft", "Razor", "Neon", "Dandy", "Weed", "Swamp", "Marsh", "Bog", "Peat", "Moor", "Muck", "Mire", "Grave", "Fair", "Just", "Brick", "Puzzle", "Skitter", "Prong", "Fork", "Dent", "Dour", "Warp", "Luck", "Coffee", "Split", "Chip", "Hollow", "Heavy", "Legend", "Hickory", "Mesquite", "Nettle", "Rogue", "Charm", "Prickle", "Bead", "Sponge", "Whip", "Bald", "Frost", "Fog", "Oil", "Veil", "Cliff", "Volcano", "Rift", "Maze", "Proud", "Dew", "Mirror", "Shard", "Salt", "Pepper", "Honey", "Thread", "Bristle", "Ripple", "Glow", "Zenith"];

var nouns = ["head", "crest", "crown", "tooth", "fang", "horn", "frill", "skull", "bone", "tongue", "throat", "voice", "nose", "snout", "chin", "eye", "sight", "seer", "speaker", "singer", "song", "chanter", "howler", "chatter", "shrieker", "shriek", "jaw", "bite", "biter", "neck", "shoulder", "fin", "wing", "arm", "lifter", "grasp", "grabber", "hand", "paw", "foot", "finger", "toe", "thumb", "talon", "palm", "touch", "racer", "runner", "hoof", "fly", "flier", "swoop", "roar", "hiss", "hisser", "snarl", "dive", "diver", "rib", "chest", "back", "ridge", "leg", "legs", "tail", "beak", "walker", "lasher", "swisher", "carver", "kicker", "roarer", "crusher", "spike", "shaker", "charger", "hunter", "weaver", "crafter", "binder", "scribe", "muse", "snap", "snapper", "slayer", "stalker", "track", "tracker", "scar", "scarer", "fright", "killer", "death", "doom", "healer", "saver", "friend", "foe", "guardian", "thunder", "lightning", "cloud", "storm", "forger", "scale", "hair", "braid", "nape", "belly", "thief", "stealer", "reaper", "giver", "taker", "dancer", "player", "gambler", "twister", "turner", "painter", "dart", "drifter", "sting", "stinger", "venom", "spur", "ripper", "swallow", "devourer", "knight", "lady", "lord", "queen", "king", "master", "mistress", "prince", "princess", "duke", "dutchess", "samurai", "ninja", "knave", "slave", "servant", "sage", "wizard", "witch", "warlock", "warrior", "jester", "paladin", "bard", "trader", "sword", "shield", "knife", "dagger", "arrow", "bow", "fighter", "bane", "follower", "leader", "scourge", "watcher", "cat", "panther", "tiger", "cougar", "puma", "jaguar", "ocelot", "lynx", "lion", "leopard", "ferret", "weasel", "wolverine", "bear", "raccoon", "dog", "wolf", "kitten", "puppy", "cub", "fox", "hound", "terrier", "coyote", "hyena", "jackal", "pig", "horse", "donkey", "stallion", "mare", "zebra", "antelope", "gazelle", "deer", "buffalo", "bison", "boar", "elk", "whale", "dolphin", "shark", "fish", "minnow", "salmon", "ray", "fisher", "otter", "gull", "duck", "goose", "crow", "raven", "bird", "eagle", "raptor", "hawk", "falcon", "moose", "heron", "owl", "stork", "crane", "sparrow", "robin", "parrot", "cockatoo", "carp", "lizard", "gecko", "iguana", "snake", "python", "viper", "boa", "condor", "vulture", "spider", "fly", "scorpion", "heron", "oriole", "toucan", "bee", "wasp", "hornet", "rabbit", "bunny", "hare", "brow", "mustang", "ox", "piper", "soarer", "flasher", "moth", "mask", "hide", "hero", "antler", "chill", "chiller", "gem", "ogre", "myth", "elf", "fairy", "pixie", "dragon", "griffin", "unicorn", "pegasus", "sprite", "fancier", "chopper", "slicer", "skinner", "butterfly", "legend", "wanderer", "rover", "raver", "loon", "lancer", "glass", "glazer", "flame", "crystal", "lantern", "lighter", "cloak", "bell", "ringer", "keeper", "centaur", "bolt", "catcher", "whimsey", "quester", "rat", "mouse", "serpent", "wyrm", "gargoyle", "thorn", "whip", "rider", "spirit", "sentry", "bat", "beetle", "burn", "cowl", "stone", "gem", "collar", "mark", "grin", "scowl", "spear", "razor", "edge", "seeker", "jay", "ape", "monkey", "gorilla", "koala", "kangaroo", "yak", "sloth", "ant", "roach", "weed", "seed", "eater", "razor", "shirt", "face", "goat", "mind", "shift", "rider", "face", "mole", "vole", "pirate", "llama", "stag", "bug", "cap", "boot", "drop", "hugger", "sargent", "snagglefoot", "carpet", "curtain"];

function generateLobbyPassword() {

  var adjective = adjectives[Math.floor(Math.random() * Math.floor(adjectives.length))];
  var noun = nouns[Math.floor(Math.random() * Math.floor(nouns.length))];
  return adjective.toLowerCase() + '-' + noun;
}


function clearLobbies() {
  let temp = [];
  jsonfile.writeFileSync(playerTrackerDB, temp, {
    spaces: 0
  });
}

function assignLobbies() {
  console.log(roundLobbyCounter[2]);
  clearLobbies();
  var players = jsonfile.readFileSync(playerDB);
  var temp = [];

  for (var i = 0; i < players.length; i++) {
    if (players[i].status == 'signed-up-subscriber') {
      temp = [...temp, players[i]];
    }
  }
  players = temp;
  players.sort(sortByLowestPriority);

  var playerTracker = [];
  var lobbyCounter = 1;
  var currentPassword = generateLobbyPassword();
  var playerCounter = players.length;
  var lobbyLeader = true;
  var currentLobbyLeader = null;
  
  while (playerCounter > 0) {
    if (playerCounter % 8 == 0) {
      players.sort(sortByLowestPriority);
      lobbyCounter++;
      currentPassword = generateLobbyPassword();
      lobbyLeader = true;
    }

    var currentPlayer = players.pop();
    var displayName = currentPlayer.displayName;
    var username = currentPlayer.username;
    var userID = currentPlayer.userID;
    var playerPriority = currentPlayer.playerPriority;
    var lobbyID = lobbyCounter;
    var lobbyPassword = currentPassword;
    var isLobbyLeader = lobbyLeader;

    if (isLobbyLeader) currentLobbyLeader = currentPlayer.displayName;
    var lobbyLeaderDisplayname = currentLobbyLeader;

    var round = 1;

    playerTracker = [...playerTracker, {
      displayName,
      username,
      userID,
      playerPriority,
      lobbyID,
      lobbyPassword,
      isLobbyLeader,
      lobbyLeaderDisplayname,
      round,
    }]
    
    playerCounter--;
    players.sort(sortByPriority);
    lobbyLeader = false;
  }
  jsonfile.writeFileSync(playerTrackerDB, playerTracker, {
    spaces: 2
  });
  roundLobbyCounter[1] = lobbyCounter;
}

function advancePlayers(newRound, advancedPlayerUsernames) {
  if (newRound <= 1) throw "Round number needs to be higher than 1.";
  var advancedPlayers = []; //Use slice, otherwise it is a reference not a copy

  var playerTracker = jsonfile.readFileSync(playerTrackerDB);
  for (var i = 0; i < playerTracker.length; i++) {
    for (var x = 0; x < advancedPlayerUsernames.length; x++) {
      if (playerTracker[i].displayName.toLowerCase() == advancedPlayerUsernames[x].toLowerCase()) {
        advancedPlayers.push(playerTracker[i]);
        advancedPlayerUsernames.splice(x, 1);
        x--;
      }
    }
  }

  console.log(advancedPlayerUsernames);
  if (advancedPlayerUsernames.length > 0) {
    var errorMessage = "Couldn't find these player(s) in the player list to advance: ";
    for (player in advancedPlayerUsernames) {
      errorMessage += advancedPlayerUsernames[player] + " ";
    }
    throw errorMessage;
  }
  roundLobbyCounter[newRound]++;
  advancedPlayers.sort(sortByPriority);
  var leaderDisplayname = advancedPlayers[0].displayName;

  var newPassword = generateLobbyPassword();
  for (var i = 0; i < playerTracker.length; i++) {
    for (var x = 0; x < advancedPlayers.length; x++) {
      if (playerTracker[i].displayName == advancedPlayers[x].displayName) {
        playerTracker[i].lobbyID = roundLobbyCounter[newRound];
        playerTracker[i].round = newRound;
        playerTracker[i].lobbyLeaderDisplayname = leaderDisplayname;
        if (playerTracker[i].displayName == leaderDisplayname) {
          playerTracker[i].isLobbyLeader = true;
        } else {
          playerTracker[i].isLobbyLeader = false;
        }
        playerTracker[i].lobbyPassword = newPassword;
        advancedPlayers[x] = playerTracker[i];
      }
    }
  }
  jsonfile.writeFileSync(playerTrackerDB, playerTracker, {
    spaces: 2
  });
  return advancedPlayers;
}

function sortByPriority(a, b) {
  // Actual process of sorting the file
  return b.playerPriority - a.playerPriority;

}

function sortByLowestPriority(a, b) {
  return a.playerPriority - b.playerPriority;
}

module.exports = methods;