const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.TOKEN
const prefix = '!'

const commands = {
  roll: require('./commands/roll/index.js'),
  momentum: require('./commands/momentum/index.js')
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
