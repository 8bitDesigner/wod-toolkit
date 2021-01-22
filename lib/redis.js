const Redis = require('redis')
const client = Redis.createClient(process.env.REDIS_URL)
const promisify = require('util').promisify

const promisified = {}

// Helper message for storing data about a channel
promisified.keyFor = (msg, subkey) => {
  console.log()
  return [msg.guild.id, msg.channel.id, subkey].join(':')
}

// Super hacky = find all prototype methods that are in ALL CAPS, and create
// a bound, promisified copy on our export object to export a library of callable
// methods
Object.entries(client.constructor.prototype).filter(([name, func]) => {
  return name.toUpperCase() === name
}).forEach(([name, func]) => {
  promisified[name.toLowerCase()] = promisify(client[name].bind(client))
})

module.exports = promisified
