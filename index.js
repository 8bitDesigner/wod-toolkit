const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.TOKEN
const prefix = '!'

const handleRoll = require('./lib/roll-command.js')
const handleMomentum = require('./lib/momentum.js')

client.on('ready', () => { console.log(`Logged in as ${client.user.tag}!`) })

client.on('message', (msg) => {
  if (msg.author.bot) return
  if (!msg.content.startsWith(prefix)) return

  const text = msg.content.slice(prefix.length)
  const [command, ...args] = text.split(' ')

  switch (command) {
    case 'roll': return handleRoll(args, msg)
    case 'momentum': return handleMomentum(args, msg)
    default: return msg.reply(`I'm afraid I don't know how to \`${command}\``)
  }
})

client.login(token)
