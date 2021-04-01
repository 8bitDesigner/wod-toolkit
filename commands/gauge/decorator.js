module.exports = class Decorator {
  reactions = {
    '⬆️': this.handleReactionUp,
    '⬇️': this.handleReactionDown,
    '❌': this.handleReactionRemove,
  }

  decorate (message) {
    const emoji = Object.keys(this.reactions)
    return Promise.all(emoji.map(thing => message.react(thing)))
  }

  canHandle (emoji) {
    return Object.keys(this.reactions).includes(emoji)
  }

  handle (emoji, gauge, user) {
    if (!this.canHandle(emoji)) { return }
    return this.reactions[emoji].call(this, gauge, user)
  }

  handleReactionUp (gauge) {
    return gauge.add(1)
  }

  handleReactionDown (gauge) {
    return gauge.remove(1)
  }

  handleReactionRemove (gauge, user) {
    return gauge.delete().then(() => `<@${user.id}>, Deleted "${gauge.name}"`)
  }
}

