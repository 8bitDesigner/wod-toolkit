const fs = require('fs')
const path = require('path')
const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.TOKEN

const commandDir = path.join(__dirname, 'commands')
const CommandRouter = require('./lib/command-router.js') 
const router = new CommandRouter({ prefix: process.env.PREFIX || '!' })

fs.readdirSync(commandDir).forEach(folder => {
  const Klass = require(path.join(commandDir, folder, 'index.js'))
  router.addCommand(Klass)
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
