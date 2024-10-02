from os import remove

from selfcord import Modal
from selfcord.ext import commands

from bot.core import Client as _Client
from bot.utils.image_compare import compare as _compare
from asyncio import sleep as _sleep
import datetime
class OnModal(commands.Cog):

    def __init__(self, client: _Client) -> None:

        self.client = client

    @commands.Cog.listener()
    async def on_modal(self, modal: Modal):
        loopruns = 0
        while self.client.balls_cache.get(f"{modal.id}") is None:
            await _sleep(0.02)
            loopruns+=1
            if self.client.balls_cache.get(f"{modal.id}") is not None: break
            if loopruns > 500: 
                return

        ball_image = self.client.balls_cache.get(f"{modal.id}")
        ball_name = _compare(
            folder_path="./balls",
            target_image_path=ball_image
        )

        modal.components[0].children[0].answer(ball_name.replace('.png', ''))
        await modal.submit()

        if ball_image:
            del self.client.balls_cache[f"{modal.id}"]
            remove(ball_image)
        
        endtime = datetime.datetime.now() - self.client.balls_cache["job"]

        self.client.logger.info(f"took: {endtime} to catch {ball_name.replace('.png', '')}")


async def setup(c):
    await c.add_cog(OnModal(c))
