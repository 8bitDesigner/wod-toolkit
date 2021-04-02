module.exports = class InteractionRespuest {
  constructor (client, interaction) {
    this.client = client
    this.interaction = interaction
  }

  get guild () {
    return this.client.guilds.cache.get(this.interaction.guild_id)
  }

  get member () {
    return this.guild.members.cache.get(this.interaction.member.user.id)
  }

  get data () {
    return (this.interaction.data.options || []).reduce((hash, obj) => {
      hash[obj.name] = obj.value
      return hash
    }, {})
  }
}