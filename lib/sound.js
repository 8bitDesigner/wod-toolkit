const fs = require('fs')
const path = require('path')

const ext = '.opus'
const assetPath = path.join(__dirname, '..', 'assets', 'effects')

class Player {
  constructor (name, path) {
    this.name = name
    this.path = path
  }

  get readStream() {
    return fs.createReadStream(this.path)
  }

  playTo (member) {
    if (!member || !member.voice || !member.voice.channel) {
      return Promise.reject(
        new Error("You're not currently in a voice channel!")
      )
    }

    return member.voice.channel.join().then(connection => {
      const dispatcher = connection.play(this.readStream, {type: 'ogg/opus'})
      dispatcher.on('error', console.error)
    }).catch(err => {
      console.error(err)
    })
  }
}

fs.readdirSync(assetPath)
.filter(file => path.extname(file) === ext)
.forEach(file => {
  const name = path.basename(file, ext)
  const filePath = path.join(assetPath, file)

  module.exports[name] = new Player(name, filePath)
})
