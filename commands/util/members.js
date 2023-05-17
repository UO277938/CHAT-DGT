const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('members')
		.setDescription('Replies with the number of members in the guild/server'),
	async execute(interaction) {
        const memberCount = interaction.guild.memberCount;
		await interaction.reply('El numero de miembros en el servidor es ' + memberCount + '.');
	},
};