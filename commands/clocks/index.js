const Command = require('../../lib/command.js')
const { Clock } = require('./model.js')
const { MessageEmbed } = require('discord.js')
const key = msg => [msg.guild.id, msg.guild.systemChannelID, 'clocks'].join(':')

module.exports = class ClockCommand extends Command {
  name = 'Clocks'
  description = 'Track progress with a clock'
  usage = `
Usage:
  \`/clocks new [name] [number of segments]\` creates a new clock and post it in the current channel
  \`/clocks set [name] [completed segments]\` changes the filled in segments on the clock
  \`/clocks tick [name]\` advance this clock by one
  \`/clocks delete [name]\` will delete a clock'
  \`/clocks\` list out all clocks in the channel
`

  handle (input, msg) {
    const words = input.split(' ')
    const command = words.shift()
    let segmentCount = words.pop()
    let name = words.join(' ')

    if (!isNaN(parseInt(segmentCount, 10))) {
      segmentCount = parseInt(segmentCount, 10)
    } else {
      words.push(segmentCount)
      name = words.join(' ')
      segmentCount = null
    }

    if (command === '') {
      this.handleAll(msg)
    } else if (command === 'tick') {
      this.handleTick(name, msg)
    } else if (command === 'set') {
      this.handleUpdate(name, segmentCount, msg)
    } else if (command === 'delete' || command === 'del') {
      this.handleDelete(name, msg)
    } else if (command === 'new' || command === 'create') {
      this.handleCreate(name, segmentCount, msg) 
    } else {
      throw new Error(`I don't know how to ${command}`)
    }
  }

  handleAll (msg) {
    Clock.all(key(msg)).then(clocks => {
      if (clocks.length === 0) {
        msg.reply('There are no clocks defined in this channel')
      } else {
        clocks.forEach(clock => msg.reply(this.clockToEmbed(clock)))
      }
    })
  }

  handleTick (name, msg) {
    Clock.find(key(msg), name)
      .then(clock => clock.setCompleted(clock.attributes.completed + 1).save())
      .then(clock => msg.reply(this.clockToEmbed(clock)))
      .catch(err => msg.reply(err.message))
  }

  handleUpdate (name, segmentCount, msg) {
    const usage = `**Usage**: \`${this.router.prefix}clocks set [name] [number of segments]`
    segmentCount = parseInt(segmentCount, 10)

    if (!name || isNaN(segmentCount)) {
      msg.reply(`You\'re missing either a name or new value.\n${usage}`)
    } else {
      Clock
        .find(key(msg), name)
        .then(clock => clock.setCompleted(segmentCount).save())
        .then(clock => msg.reply(this.clockToEmbed(clock)))
        .catch(err => msg.reply(err.message))
    }
  }

  handleDelete (name, msg) {
    if (!name) {
      msg.reply('Missing the name of the clock you want to delete')
    } else {
      Clock.find(key(msg), name)
        .then(clock => clock.delete())
        .then(clock => msg.reply(`Deleted "${name}"`))
        .catch(err => msg.reply(err.message))
    }
  }

  handleCreate (name, segmentCount, msg) {
    const usage = `**Usage**: \`${this.router.prefix}clocks new [name] [number of segments]`
    segmentCount = parseInt(segmentCount, 10)

    if (!name) {
      msg.reply(`Missing the name of the clock you want to delete\n${usage}`)
    } else if (isNaN(segmentCount)) {
      msg.reply(`Missing the number of segments the clock should have\n${usage}`)
    } else {
      Clock.create(key(msg), name, segmentCount)
        .then(clock => msg.reply(this.clockToEmbed(clock)))
        .catch(err => msg.reply(err.message))
    }
  }

  clockToEmbed (clock) {
    const reply = new MessageEmbed()
    reply.setTitle(clock.name)
    reply.setColor('#007bff')
    reply.setDescription(clock.toString())
    reply.setFooter(`${clock.attributes.completed} out of ${clock.attributes.segments}`)

    return reply
  }
}
