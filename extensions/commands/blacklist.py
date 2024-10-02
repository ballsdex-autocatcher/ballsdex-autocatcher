from selfcord.ext import commands

from bot.core import Client as _Client

from typing import Optional
from selfcord import TextChannel


class Blacklist(commands.Cog):

    def __init__(self, client: _Client) -> None:

        self.client = client
    

    @commands.group(
        name="blacklist"
    )
    async def blacklist(
        self,
        ctx: commands.Context
    ): ...

    @blacklist.command(
        name="add"
    )
    async def add(
        self,
        ctx: commands.Context,
        channel: Optional[TextChannel] = None
    ):


        channel = channel if channel else ctx.channel
        if not isinstance(channel, TextChannel): 
            await ctx.message.edit("`❌` You can only add blacklist to TextChannels")
            await ctx.message.delete(delay=15)
            return
        
        await self.client.db.push('blacklisted_channels', channel.id)

        await ctx.message.edit(f'`✅` Added {channel.mention} to blacklisted channels')
        await ctx.message.delete(delay=15)

    @blacklist.command(
        name="remove"
    )
    async def remove(
        self,
        ctx: commands.Context,
        channel: Optional[TextChannel] = None
    ):

        
        data = self.client.db.get("blacklisted_channels")


        channel = channel if channel else ctx.channel
        if not isinstance(channel, TextChannel): 
            await ctx.message.edit("`❌` You can only remove blacklist from TextChannels")
            await ctx.message.delete(delay=15)
            return


        await self.client.db.pull('blacklisted_channels', channel.id)

        await ctx.message.edit(f'`✅` Removed {channel.mention} from blacklisted channels')
        await ctx.message.delete(delay=15)

async def setup(c):
    await c.add_cog(Blacklist(c))

# sigma skibidi gyat