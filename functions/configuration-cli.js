const { input, password, confirm, number } = require('@inquirer/prompts');
const fs = require('fs');
(async () => {
    const json = {}
    json.blacklistedServers = [];
    json.whitelistedServers = [];
    json.farmServers = [];
    json.blacklistedBalls = [];
    json.whitelistedBalls = [];
    json.timeout = [];
    json.farmCooldown = [];
    
    json.token = await password({ message:'Enter your discord account token:', mask: '*', required: true });
    const wantToBlacklist = await confirm({ message: 'Do you want to blacklist some servers?', default: false, required: true });
    if (wantToBlacklist) {
        while (true) {
            const server = await input({ message: 'Enter the server id or server name to blacklist:', required: true });
            json.blacklistedServers.push(server);
            const wantToBlacklistMore = await confirm({ message: 'Do you want to blacklist more servers?', default: true, required: true });
            if (!wantToBlacklistMore) break;
        }
    }
    const wantToWhiteList = await confirm({ message: 'Do you want to whitelist some servers?', default: false, required: true });
    if (wantToWhiteList) {
        while (true) {
            const server = await input({ message: 'Enter the server id or server name to whitelist:', required: true });
            json.whitelistedServers.push(server);
            const wantToWhiteListMore = await confirm({ message: 'Do you want to whitelist more servers?', default: true, required: true });
            if (!wantToWhiteListMore) break;
        }
    }
    const wantToAddFarmServers = await confirm({ message: 'Do you want to add farm servers?', default: false, required: true });
    if (wantToAddFarmServers) {
        while (true) {
            const server = await input({ message: 'Enter the server id or server name to add as farm server:', required: true });
            json.farmServers.push(server);
            const wantToAddFarmServersMore = await confirm({ message: 'Do you want to add more farm servers?', default: true, required: true });
            if (!wantToAddFarmServersMore) break;
        }

        json.farmChannelName = await input({ message: 'Enter the channel name for sending farm messages in the farm servers:', required: true });

        json.farmCooldown[0] = await number({ message: 'Enter the minimum cooldown time in milliseconds for sending farm messages in the farm servers:', required: true, default: 9000 });
        json.farmCooldown[1] = await number({ message: 'Enter the maximum cooldown time in milliseconds for sending farm messages in the farm servers:', required: true, default: 11000 });

        json.farmSleepTime = await number({ message: 'Enter the sleep time in milliseconds for sending farm messages:', required: true, default: 950000 });
    } else {
        json.farmChannelName = "name"
        json.farmCooldown[0] = 9000
        json.farmCooldown[1] = 11000
        json.farmSleepTime = 10
    }

    json.timeout[0] = await number({ message: 'Enter the minimum timeout time in milliseconds for clicking the ballsdex button:', required: true, default: 500 });
    json.timeout[1] = await number({ message: 'Enter the maximum timeout time in milliseconds for clicking the ballsdex button:', required: true, default: 1000 });

    const wantToSendMessagesAfterCatch = await confirm({ message: 'Do you want to send messages after catching a ball?', default: false, required: true });

    if (wantToSendMessagesAfterCatch) {
        json.messageCooldown[0] = await number({ message: 'Enter the minimum cooldown time in milliseconds for sending messages after catching a ball:', required: true, default: 1000 });
        json.messageCooldown[1] = await number({ message: 'Enter the maximum cooldown time in milliseconds for sending messages after catching a ball:', required: true, default: 3000 });
        
        const wantToUseCustomMessages = await confirm({ message: 'Do you want to use custom messages list?', default: false, required: true });

        if (wantToUseCustomMessages) {
            json.messages = [];
            while (true) {
                const message = await input({ message: 'Enter the message to send after catching a ball:', required: true });
                json.messages.push(message);
                const wantToAddMoreMessages = await confirm({ message: 'Do you want to add more messages?', default: true, required: true });
                if (!wantToAddMoreMessages) break;
            }
        } else {
            json.messages = [
                "GG",
                "lmao",
                "nice",
                "omg",
                "ez",
                "ez snipe",
                "haha",
                "real",
                "too easy",
                "baller",
                "AYY",
                "what",
                "Yaya",
                "LMAO",
                "ok",
                "snipe",
                "mobile ez",
                "Yay",
                "nahhh",
                "xd",
                "ez farm",
                "ez snipe lol",
                "ez farm lol",
                "ez ball",
                "mobile btw",
                "poop",
                "ezzz",
                "cracked af",
                "lol",
                "noob",
                "W",
                ":skull:",
                ":yawning_face:",
                "no way:skull:"
            ]
        }

    } else {
        json.messageCooldown = false;
    }

    const wantToBlacklistBallTypes = await confirm({ message: 'Do you want to blacklist some ball types?', default: false, required: true });

    if (wantToBlacklistBallTypes) {
        while (true) {
            const ballType = await input({ message: 'Enter the ball type to blacklist:', required: true });
            json.blacklistedBalls.push(ballType);
            const wantToBlacklistMoreBallTypes = await confirm({ message: 'Do you want to blacklist more ball types?', default: true, required: true });
            if (!wantToBlacklistMoreBallTypes) break;
        }
    }

    const wantToWhiteListBallTypes = await confirm({ message: 'Do you want to whitelist some ball types?', default: false, required: true });

    if (wantToWhiteListBallTypes) {
        while (true) {
            const ballType = await input({ message: 'Enter the ball type to whitelist:', required: true });
            json.whitelistedBalls.push(ballType);
            const wantToWhiteListMoreBallTypes = await confirm({ message: 'Do you want to whitelist more ball types?', default: true, required: true });
            if (!wantToWhiteListMoreBallTypes) break;
        }
    }

    const wantToUseDashboard = await confirm({ message: 'Do you want to use the dashboard?', default: false, required: true });

    if (wantToUseDashboard) {
        const dashboardToken = await password({ message: 'Enter the dashboard token:', mask: '*', required: true });
        json.dashboardToken = dashboardToken;
    } else {
        json.dashboardToken = '';
    }
    
    
    const configData = `module.exports = ${JSON.stringify(json, null, 4)}`
    console.log(configData)
    fs.writeFileSync('config.js', configData);
})();
