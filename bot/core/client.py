from selfcord.ext import commands as _commands

from ..config import _settings
from ..utils.functions import list_all_dirs, search_directory
from .logger import Logger as _Logger
from ..utils.database import Database


class Client(_commands.Bot):
    def __init__(self, **options):

        self.logger = _Logger("core.client")

        self.db = Database('main.sqlite')
        self.db._setup()

        self.balls_cache = {}

        prefix = _settings.PREFIX

        super().__init__(
            command_prefix=_commands.when_mentioned_or(*prefix), 
            self_bot=True, 
            **options
        )


    async def on_ready(self):
        if self.cogs != {}: return self.logger.warning("Skipped loading cogs: Reconnecting")

        self.logger.success(f"Discord Client Logged in as {self.user.name}")

        self.logger.info("Started Loading Cogs")
    
        for dir in list_all_dirs("./extensions"):
            await self.load_extensions(dir)


        self.logger.info("Finished loading cogs")
        
    def run(self): return super().run(token=_settings.DISCORD_TOKEN)

    async def load_extensions(self, path: str) -> None:
        for extension in search_directory(path):
            try:

                await self.load_extension(extension)
                self.logger.success("loaded {}".format(extension))
            except Exception as err:

                self.logger.error("There was an error loading {}, Error: {}".format(extension, err))
