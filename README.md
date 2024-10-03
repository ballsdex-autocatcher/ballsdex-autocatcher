<h1 align='center'>Ballsdex autocatcher 🎉</h1>
<div align="center">
  <img src="https://curefras.sirv.com/9263564.jpg" style="width: 65%;">
</div>
<hr>
<div align="center">
  <a herf="https://python.org"><img src="https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue"></a>
  <a herf="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white"></a>
  <a herf="https://discord.com/"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white"></a>
  <a herf="https://github.com/"><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"></a>
</div>
<div align="center">
  <a herf="https://github.com/mohammad87115/ballsdex-autocatcher/"><img src="https://img.shields.io/github/stars/ballsdex-autocatcher/autocatcher.svg?style=for-the-badge"></a>
  <a herf="https://github.com/mohammad87115/ballsdex-autocatcher/"><img src="https://img.shields.io/github/forks/ballsdex-autocatcher/autocatcher.svg?style=for-the-badge"></https://img.shields.io/github/license/ballsdex-autocatcher/autocatcher.svg?style=for-the-badgea>
  <a herf="https://github.com/mohammad87115/ballsdex-autocatcher/"><img src="https://img.shields.io/github/issues/ballsdex-autocatcher/autocatcher.svg?style=for-the-badge"></a>
  <a herf="https://github.com/mohammad87115/ballsdex-autocatcher/"><img src="https://img.shields.io/github/license/ballsdex-autocatcher/autocatcher.svg?style=for-the-badge"></a>
</div>

Ballsdex autocatcher selfbot. written in **[Python](https://python.org)** using **[discord.py-self](https://pypi.org/project/discord.py-self/)** a library made to make it easier to make a selfbot


<h2 align="center">💀 Important Warning</h2>
Discord prohibits selfbots so if you want to use this project you will use it at your own risk.<br>
I'm not responsible for any ban or ... from Discord, Ballsdex or your hosting provider.
<h2 align="center" >💉 Requirements</h2>

```
1. A working brain 🧠
2. Your account token [(Video Tutorial)](https://www.youtube.com/watch?v=YEgFvgg7ZPI)
   - never commit or share your discord token in public, anyone who has it has access to your discord account
3. Python 3.10 or higher [(Click for downloading it)](https://python.org)
```

<h2 align="center">🚀 Let's dive into it</h2>

So, I think now we have all the requirements installed and ready. Lets start our journey with the codes.<br>

<h3>🔧 Installation (with docker):</h3>

for running the selfbot with docker type this commands in your terminal:

```bash
git clone https://github.com/ballsdex-autocatcher/ballsdex-autocatcher/
cd ballsdex-autocatcher
cp .env.example .env
```
Now edit .env with your favorite text editor<br>
Now do `docker compose up` and make sure there is no problem or error in the selfbot execution<br>
then stop the selfbot with `Ctrl+C` and run it again with `docker compose up -d` so after logging out or closing the terminal the selfbot stays alive
<br><br>
Now wait for the text `Discord Client Logged in as {username}` and your selfbot is online and catching countryballs<br>
You can do {prefix}help in discord to get the help menu

<h3>🔧 Installation (without docker):</h3>

for running the selfbot without docker type this commands in your terminal:

```bash
git clone https://github.com/ballsdex-autocatcher/ballsdex-autocatcher/
cd ballsdex-autocatcher
cp .env.example .env
```
Now edit .env with your favorite text editor<br>
Then run the following commands:

```bash
python3 -m venv ./venv
./venv/bin/python3 -m pip3 install -r requirements.txt
./venv/bin/python3 main.py
```
<br>

Now wait for the text `Discord Client Logged in as {username}` and your selfbot is online and catching countryballs<br>
You can do {prefix}help in discord to get the help menu
