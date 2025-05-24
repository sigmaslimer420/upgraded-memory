import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, Interaction, GuildMember } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) throw new Error('DISCORD_BOT_TOKEN not set in environment!');

const premiumFile = path.join(__dirname, '../premium_users.json');
let premium: string[] = [];
let botadmin: string[] = ['1369398821238472788', '222222222222222222']; // Replace with real admin IDs

function savePremiumUsers() {
  fs.writeFileSync(premiumFile, JSON.stringify(premium));
}
function loadPremiumUsers() {
  if (fs.existsSync(premiumFile)) {
    premium = JSON.parse(fs.readFileSync(premiumFile, 'utf8'));
  } else {
    premium = [];
  }
}
loadPremiumUsers();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const commands = [
  new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Send a spam message'),
  new SlashCommandBuilder()
    .setName('customraid')
    .setDescription('Send a message and generate a button to spam')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message you want to spam')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('addpremium')
    .setDescription('Adds a user to the premium list.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to add.')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('fakeadmin')
    .setDescription("Pretend someone bypassed Discord's API and became an admin.")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to fake admin.')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('fakeban')
    .setDescription('Pretend someone banned someone successfully.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to fake ban.')
        .setRequired(true)),
].map(cmd => cmd.toJSON());

client.once('ready', async () => {
  // Register slash commands on startup
  if (!client.user || !client.application) return;
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
  } catch (error) {
    // Only log errors
    console.error(error);
  }
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    const cmd = interaction.commandName;

    if (cmd === 'raid') {
      const message = '# RAIDED BY NUKECORD LABS! JOIN https://discord.gg/QQ9mv4Hq FUCKERS';
      const spamButton = new ButtonBuilder()
        .setCustomId('spam_raid')
        .setLabel('Spam')
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(spamButton);
      await interaction.reply({ content: `Nukecord Raider: ${message}`, components: [row], ephemeral: true });
    }

    if (cmd === 'customraid') {
      if (!premium.includes(interaction.user.id)) {
        await interaction.reply({ content: 'You need premium to use this command.', ephemeral: true });
        return;
      }
      const message = interaction.options.getString('message', true);
      const spamButton = new ButtonBuilder()
        .setCustomId(`spam_custom_${Date.now()}`)
        .setLabel('Spam')
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(spamButton);
      await interaction.reply({ content: `Nukecord Raider: ${message}`, components: [row], ephemeral: true });
    }

    if (cmd === 'addpremium') {
      if (!botadmin.includes(interaction.user.id)) {
        await interaction.reply({ content: 'You do not have permission to use this command. Ask an admin for assistance.', ephemeral: true });
        return;
      }
      const user = interaction.options.getUser('user', true);
      if (!premium.includes(user.id)) {
        premium.push(user.id);
        savePremiumUsers();
        await interaction.reply({ content: `${user} has been added to the premium list.` });
      } else {
        await interaction.reply({ content: `${user} is already in the premium list.` });
      }
    }

    if (cmd === 'fakeadmin') {
      const user = interaction.options.getUser('user', true);
      const fakeAdminButton = new ButtonBuilder()
        .setCustomId(`fake_admin_${user.id}_${Date.now()}`)
        .setLabel('Fake Admin')
        .setStyle(ButtonStyle.Success);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(fakeAdminButton);
      await interaction.reply({ content: `Press to fake admin for ${user}`, components: [row] });
    }

    if (cmd === 'fakeban') {
      const user = interaction.options.getUser('user', true);
      const fakeBanButton = new ButtonBuilder()
        .setCustomId(`fake_ban_${user.id}_${Date.now()}`)
        .setLabel('Fake Ban')
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(fakeBanButton);
      await interaction.reply({ content: `Press to fake ban ${user}`, components: [row] });
    }
  }

  // Handle button interactions
  if (interaction.isButton()) {
    // Spam for /raid
    if (interaction.customId === 'spam_raid') {
      const message = '# RAIDED BY NUKECORD LABS! JOIN https://discord.gg/QQ9mv4Hq FUCKERS';
      for (let i = 0; i < 5; i++) {
        await interaction.channel?.send(`Nukecord Raider: ${message}`);
      }
      await interaction.reply({ content: 'Spam sent!', ephemeral: true });
    }
    // Spam for /customraid
    if (interaction.customId.startsWith('spam_custom_')) {
      // Get the original message from the interaction (not stored, so just echo a generic message)
      const message = interaction.message.content.replace('Nukecord Raider: ', '');
      for (let i = 0; i < 5; i++) {
        await interaction.channel?.send(`Nukecord Raider: ${message}`);
      }
      await interaction.reply({ content: 'Spam sent!', ephemeral: true });
    }
    // Fake admin
    if (interaction.customId.startsWith('fake_admin_')) {
      const userId = interaction.customId.split('_')[2];
      await interaction.reply({ content: `<@${userId}> has bypassed Discord's API! He is now an admin!` });
    }
    // Fake ban
    if (interaction.customId.startsWith('fake_ban_')) {
      const userId = interaction.customId.split('_')[2];
      await interaction.reply({ content: `<@${userId}> has banned <@${userId}> successfully.` });
    }
  }
});

client.login(TOKEN);
