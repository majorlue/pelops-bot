# Pelops says hello!

Heya, this is the repo for the discord bot Pelops. The purpose of this project is to provide a helper bot for Orna's Towers of Olympia. It's meant to provide easy access to Tower encounters, Tower floors, current Tower layout (fights, chests, puzzles) and potentially more. Slowly, but surely, features are being completed. Thanks for bearing with me =)

### Core Features:

✅ `/floors`: displays the current height for each Tower theme<br>
✅ `/encounter`: displays Tower fight information (floor guardians, strays)<br>
✅ `/submit`: allows **community contribution** for the current week's Tower layout<br>
✅ `/tower`: displays the specified theme's current layout, including floor guardians, stray monsters, puzzle types/difficulty and chests.<br>
✅ `/keys`: displays the current week's Tower floors with key fights<br>

### How It Works

The expectation is for this bot to be a central source of community information regarding Towers. As such, it heavily relies on community contribution (more on that later). The most useful commands will be `/tower` and `/keys`, as it returns information about Towers in the current week. These commands won't work without players submitting information for the bot to display, though, so that's handled via `/submit`.

###### `/submit` command

Players can use this command to contribute information to the project, allowing **anyone else** to use it later that week. All servers share the same data, so someone can contribute from one server and, if approved, that information will be available in all other servers.

The command allows submitting **floor guardians**, **stray monsters**, **chest count** and **puzzles** information for a specified Tower theme and floor. This only allows singular inputs for simplicity sake, however. The bot does make the process easier by offering static choices or autocompletion (eg. for guardians/strays).

Submissions follow an approval process. This means that `/tower` or `/keys` will not reflect submissions immediately. Submissions must be **approved manually** by a moderator before floor information is publicly modified. This is to ensure information accuracy, and to prevent people who want to troll.

I will be marking select players as an 'Approved Contributor', to ease the process along. These players will **skip the approval process entirely**, so they can more quickly modify Tower information for others. Similar to the approval process, however, players will be added manually. It'll be a trust thing =)

If you'd like to help with moderating submissions, or to become an Approved Contributor feel free to reach out to Major#1005 on Discord. Help is very, very appreciated <3

### GitHub Issues

I'll be using GitHub Issues for bugs/requests/suggestions. All communication, orgnisation and progress reports will be over there. You can access **[GitHub Issues here](https://github.com/majorlue/pelops-bot/issues/new/choose)** (click).

###### Feature Requests

Feel free to make feature requests for the bot! Do keep in mind the scope of the bot, though. Currently it's just for Towers, so mostly anything related is fine.

###### Bug Reports

If you encounter a bug then please do report it. I'll do my best to fix issues as they crop up.

### Bot Access

As the project is new, the bot isn't in very many servers. If you have admin permissions, you can add Pelops to your own server using **[this link (click)](https://discord.com/api/oauth2/authorize?client_id=1082499786067935232&permissions=414464658496&scope=applications.commands%20bot)**. If not, you can contact a server mod/admin about it. I can't add the bot to individual servers, so don't contact me about it.

> Thanks for reading, have a great day!<br>- Major
