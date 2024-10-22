module.exports = async (client) => {
    for (const server of client.config.farmServers) {
        const guild = client.guilds.cache.get(server) || client.guilds.cache.find(guild => guild.name === server)

        const channel = guild.channels.cache.find(channel => 
            channel.type === 'GUILD_TEXT' && 
            channel.permissionsFor(guild.members.me).has('SEND_MESSAGES') &&
            channel.name === client.config.farmChannelName
        ) || guild.channels.cache.find(channel => 
            channel.type === 'GUILD_TEXT' && 
            channel.permissionsFor(guild.members.me).has('SEND_MESSAGES')
        );

        await channel.send(client.config.farmMessage);
        await wait(client.config.farmCooldown)
    }
}

function wait(millisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, millisec);
    })
}
