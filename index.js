const fs = require('fs')
const path = require('path')
const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.TOKEN

const commandDir = path.join(__dirname, 'commands')
const CommandRouter = require('./lib/command-router.js')
const { Request, Response } = require('./lib/interaction')
const router = new CommandRouter({
  prefix: process.env.PREFIX || '!',
  client: client
})

fs.readdirSync(commandDir).forEach(folder => {
  const Klass = require(path.join(commandDir, folder, 'index.js'))
  router.addCommand(Klass)
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)

  const userId = client.user.id
  const commands = Object.values(router.commands)
  const slashable = commands.filter(c => c.options).map(command => command.toSlashCommand())

  slashable.forEach(data => {
    client.api.applications(userId).guilds('760006991828484096').commands.post({data})
      .catch(err => console.error(err))
  })
})

client.on('message', (msg) => {
  if (router.shouldHandle(msg)) {
    router.route(msg)
  }
})

client.on('messageReactionAdd', (reaction, user) => {
  const promise = reaction.partial ? reaction.fetch() : Promise.resolve(reaction)

  promise.then(reaction => {
    if (router.shouldHandleReaction(reaction, user)) {
      router.routeReaction(reaction, user)
    }
  }).catch(err => {
    console.error('Could not hydrate reaction', err)
  })
})

client.ws.on('INTERACTION_CREATE', interaction => {
  const request = new Request(client, interaction)
  const response = new Response(client, interaction)
  const handler = router.commands[interaction.data.name]

  try {
    if (handler) {
      handler.handleSlash(request, response)
        .catch(err => console.error(err))
    } else {
      response.setContent(`I don't know how to handle slash commands for "${data.name}"`)
        .setEphemeral()
        .send()
        .catch(err => console.error(err))
    }
  } catch (e) {
    console.error(err)
  }
})

client.login(token)
