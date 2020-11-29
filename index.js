const path = require('path')
const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.TOKEN

const CommandRouter = require('./lib/command-router.js') 
const router = new CommandRouter({
  prefix: '!',
  directory: path.join(__dirname, 'commands')
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (msg) => {
  if (router.shouldHandle(msg)) {
    router.route(msg)
  }
})

client.login(token)
