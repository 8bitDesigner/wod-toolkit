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
    msg.reply(`**${command.name}**: ${command.description}\n${command.usage}`)
  } else {
    const response = ['I know the following commands:\n']

    if (command) {
      response.unshift(`I'm afraid I don't know how to \`${command}\`.`)
    }

    Object.values(commands).forEach(cmd => {
      response.push(`- **${cmd.name}**: ${cmd.description}`)
    })

    msg.reply(response.concat('\nUse `!help [command]` to learn more.').join('\n'))
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
    default: return help(null, msg)
  }
})

client.login(token)
