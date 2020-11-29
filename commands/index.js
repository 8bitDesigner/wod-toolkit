const commands = {
  roll: require('./roll/index.js'),
  momentum: require('./momentum/index.js')
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

module.exports = {
  commands,
  help
}
