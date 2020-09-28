const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.TOKEN
const handleRoll = require('./lib/roll-command.js')

client.on('ready', () => { console.log(`Logged in as ${client.user.tag}!`) })
client.on('message', handleRoll)
client.login(token)
