from time import time

from selfcord import Message
from selfcord.ext import commands

from bot.core import Client as _Client
import datetime
class OnMessage(commands.Cog):

    def __init__(self, client: _Client) -> None:

        self.client = client

    @commands.Cog.listener()
    async def on_message(self, message: Message):
        blacklisted = self.client.db.get('blacklisted_channels') or []
        if message.channel.id in blacklisted: return

        if message.author.bot and message.author.id == 999736048596816014 and \
                "wild" in message.content.lower():
            start = datetime.datetime.now()
            self.client.balls_cache["job"] = start
            blacklisted = self.client.db.get('blacklisted_channels')
            if blacklisted and message.channel.id in blacklisted:
                return self.client.logger.info(f'Skipping a countryball that appeared in {message.guild.name}/{message.channel.name} - {message.guild.id}/{message.channel.id}. reason: blacklisted channel')
            self.client.logger.info(f'A wild countryball appeared in {message.guild.name}/{message.channel.name} - {message.guild.id}/{message.channel.id}')

            image = message.attachments[0]

            path = "./cache/{}-{}".format(
                time(),
                image.filename
            )

            await image.save(path)

            components = message.components
            firstButton = components[0].children[0]
            button = await firstButton.click(timeout=60)

            self.client.balls_cache[f"{button.id}"] = path

            

async def setup(c):
    await c.add_cog(OnMessage(c))
