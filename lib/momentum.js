const redis = require('redis').createClient(process.env.REDIS_URL)

module.exports = function (args = [], msg) {
  const [command, value] = args
  const int = parseInt(value)

  const key = [
    msg.guild.id,
    msg.guild.systemChannelID,
    'momentum'
  ].join(':')

  function reply (err, result) {
    if (err) {
      msg.reply(`ERROR: \`${err}\``)
    } else {
      msg.reply(result)
    }
  }

  if (!command) {
    redis.get(key, reply)
  } else if (command === 'set') {
    redis.set(key, int, reply)
  } else if (command === 'add') {
    redis.incrby(key, int, reply)
  } else if (['use', 'remove'].includes(command)) {
    redis.decrby(key, int, reply)
  }
}
