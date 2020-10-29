const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.TOKEN
const prefix = '!'

const commands = {
  roll: require('./lib/roll-command.js'),
  momentum: require('./lib/momentum.js')
}

function help (command, msg) {
  if (command && command.usage) {
    msg.reply([
      `*${command.name}*`,
      command.description,
      command.usage
    ].join('\n'))
  } else {
    msg.reply(`I'm afraid I don't know how to \`${command}\`.
I know the following commands:
${Object.values(commands).map(cmd => `- ${cmd.name}`)}
Use \`!help [command]\` to learn more.`)
  }
}

client.on('ready', () => { console.log(`Logged in as ${client.user.tag}!`) })

client.on('message', (msg) => {
  if (msg.author.bot) return
  if (!msg.content.startsWith(prefix)) return

  const text = msg.content.slice(prefix.length)
  const [command, ...args] = text.split(' ')

  switch (command) {
    case 'roll': return commands.roll.handle(args, msg)
    case 'momentum': return commands.momentum.handle(args, msg)
    case 'help': return help(commands[args[0]], msg)
    default: return msg.reply(`I'm afraid I don't know how to \`${command}\``)
  }
})

client.login(token)
