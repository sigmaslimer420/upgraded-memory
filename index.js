const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const commands = [
    {
        name: 'spam',
        description: 'Sends 5 messages with a 1-second cooldown'
    },
    {
        name: 'chat',
        description: 'Sends a single message'
    },
    {
        name: 'raid',
        description: 'Sends raid msg 5 times'
    }
];

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        console.log('Registering commands...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Commands registered!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'spam') {
        await interaction.reply({ content: 'Starting spam...', ephemeral: true });
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                interaction.channel.send('Your custom spam message');
            }, i * 1000);
        }
    }
    else if (interaction.commandName === 'chat') {
        await interaction.reply({ content: 'Your custom message', ephemeral: true });
        interaction.channel.send('Your custom message');
    }
    else if (interaction.commandName === 'raid') {
        await interaction.reply({ content: 'raiding ts,also join our server https://discord.gg/YKRbjcb2F9', ephemeral: true });
        for (let i = 0; i < 5; i++) {
            interaction.channel.send('raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! raided by rip family! https://discord.gg/YKRbjcb2F9 JOIN TODAY BLUDS ☠️ 🔥 🗿 🍷');
        }
    }
});

client.login(process.env.TOKEN);
