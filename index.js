const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.TOKEN
const prefix = '!'

const { commands, help } = require('./commands/index.js')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (msg) => {
  if (msg.author.bot) return
  if (!msg.content.startsWith(prefix)) return

  const text = msg.content.slice(prefix.length)
  const [command, ...args] = text.split(' ')

  if (command === 'help') {
    return help(commands[args[0]], msg)
  } else if (command && commands[command]) {
    return commands[command].handle(args.join(' '), msg)
  } else {
    return help(command, msg)
  }
})

client.login(token)
