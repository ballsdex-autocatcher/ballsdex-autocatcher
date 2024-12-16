module.exports = async (client) => {
    for (const server of client.config.farmServers) {
        const guilds = [...client.guilds.cache.values()].filter(sv => sv.name === server || sv.id === server)
        for (const guild of guilds) {
            const channel = guild.channels.cache.find(channel => 
                channel.type === 'GUILD_TEXT' && 
                channel.permissionsFor(guild.members.me).has('SEND_MESSAGES') &&
                channel.name === client.config.farmChannelName
            ) || guild.channels.cache.find(channel => 
                channel.type === 'GUILD_TEXT' && 
                channel.permissionsFor(guild.members.me).has('SEND_MESSAGES')
            );
            const messageLength = Math.floor(Math.random() * 11) + 10;

            await channel.send(makeid(messageLength));
            await wait(Math.floor(Math.random() * (client.config.farmCooldown[1] - client.config.farmCooldown[0] + 1)) + client.config.farmCooldown[0] || 300000)
        }
    }
}


function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ضصثقفغعهخحشسیبلاتنمکگچجظطزرذدپو';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}


function wait(millisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, millisec);
    })
}
