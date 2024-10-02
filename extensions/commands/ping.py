from selfcord.ext import commands

from bot.core import Client as _Client


class Ping(commands.Cog):

    def __init__(self, client: _Client) -> None:

        self.client = client
        
    @commands.command()
    async def ping(self, ctx: commands.Context):
        await ctx.send("pong")

async def setup(c):
    await c.add_cog(Ping(c))