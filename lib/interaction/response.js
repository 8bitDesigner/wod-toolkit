module.exports = class InteractionResponse {
  constructor (client, interaction) {
    this.client = client
    this.interaction = interaction
    this.embeds = []
    this.content = null
    this.ephemeral = false
  }

  addEmbed (embed) {
    this.embeds.push(embed)
    return this
  }

  setEphemeral (value = true) {
    this.ephemeral = value
    return this
  }

  setContent (content) {
    this.content = content
    return this
  }

  send () {
    return this.client.api
      .interactions(this.interaction.id, this.interaction.token)
      .callback
      .post(this.toJSON())
  }

  toJSON () {
    const body = {}

    if (this.ephemeral) {
      body.flags = 64
    }

    if (this.embeds.length) {
      body.embeds = this.embeds
    } else {
      body.content = this.content
    }

    return {
      data: {
        type: 4,
        data: body
      }
    }
  }
}
