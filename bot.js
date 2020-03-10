'use strict';
const bot_secret_token = require('./config.js');
const Discord = require('discord.js')
const client = new Discord.Client()
const ytdl = require('ytdl-core');
client.login(bot_secret_token)

var playList = []
//when bot is turned on, lists which channels it is in
client.on('ready', () => {
  console.log("Connected as " + client.user.tag)
  console.log("Servers:")
  client.guilds.forEach((guild) => {
    console.log(" - " + guild.name)
  })
})

/*
checks if user is in a voice channel and they have permissions to use the bot, 
then reads the message sent to see what command the user has used
*/
client.on('message', async function (message) {
  if (message.member.voiceChannel && message.member.roles.find(r => r.name === "Music")) {
    var splitedMessage = message.content.split(' ');
    if (splitedMessage[0].toLowerCase() === 'youtube') {
      playYoutube(message, splitedMessage[1])
    }

    if (splitedMessage[0].toLowerCase() === 'stop') {
      stop(message)
    }

    if (splitedMessage[0].toLowerCase() === 'play') {
      playlistFunc(message)
    }

    if (splitedMessage[0].toLowerCase() === 'add') {
      playList.push(splitedMessage[1])
    }
  }
})

//plays first song in the playList
function playlistFunc(message) {
  let p = new Promise((resolve) => {
    var voiceChannel = message.member.voiceChannel
    voiceChannel.join()
      .then(connection => {
        let dispatcher = connection.playStream(ytdl(playList[0], { filter: 'audioonly' }));
        dispatcher.on('end', () => {
          resolve('song finished')
          loopPlayList(message, connection)
          playList.splice(0, 1)
        });
      }).catch(console.error)
  })
}

//loops through every song of playlist then disconnects
async function loopPlayList(message, connection) {
  if (playList[1] != null) {
    playlistFunc(message)
  }
  else {
    connection.disconnect()
  }
}

//when send a url for a youtube video, bot joins voice channel and plays audio of said video then disconnects
function playYoutube(message, url ) {
  var voiceChannel = message.member.voiceChannel
  voiceChannel.join()
    .then(connection => {
      let dispatcher = connection.playStream(ytdl(url, { filter: 'audioonly' }));
      dispatcher.on('end', () => {
        connection.disconnect()
      });
    }).catch(console.error)
}

// when called, disconnects the bot from the channel
function stop(message) {
  var voiceChannel = message.member.voiceChannel
  voiceChannel.join()
    .then(connection => {
      connection.disconnect()
    }).catch(console.error)
}

