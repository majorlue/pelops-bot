import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {
  currentHeightsEmbed,
  missingChannelPerms,
  prisma,
  sleep,
} from '../handlers';
import {Command} from '../interfaces/command';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('display')
    .setDescription('Returns messages viewable by all users')
    .addSubcommand(subcommand =>
      subcommand
        .setName('floors')
        .setDescription('Display lively updated floor heights')
    ),
  run: async interaction => {
    const subcommand = interaction.options.data[0].name;

    if (interaction.guild) {
      const user = await interaction.guild.members.fetch(interaction.user.id);
      if (!user.permissions.has('ManageMessages')) {
        // respond with missing perms, then delete the response after 5s
        await interaction.editReply(missingChannelPerms(interaction));
        await sleep(5000);
        await interaction.deleteReply();
        return;
      }
    }

    await subcmds[subcommand](interaction);
  },
};

const subcmds: {[key: string]: (job: CommandInteraction) => Promise<void>} = {
  floors: floors,
};

async function floors(interaction: CommandInteraction) {
  const message = await interaction.editReply({
    embeds: [currentHeightsEmbed()],
  });
  await prisma.persistentMessage.create({
    data: {
      channelId: message.channelId,
      messageId: message.id,
      type: 'curr_floors',
    },
  });
}

export default command;
