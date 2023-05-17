const { SlashCommandBuilder } = require('discord.js');
let pjson = require('../../package.json')

let version = pjson.version.toString()
let uptime
let memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Replies with version and usage'),
	async execute(interaction) {
        uptime = secondsToString(process.uptime()).toString()
        await interaction.reply("Version: " + version + ", Time-Alive: " + uptime + ", Memory: " + memory + "MB");
	},
};

function secondsToString(seconds) {
	seconds = Math.trunc(seconds)
	let numdays = Math.floor((seconds % 31536000) / 86400)
	let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600)
	let numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60)
	let numseconds = (((seconds % 31536000) % 86400) % 3600) % 60
	return `${numdays} days ${numhours} hours ${numminutes} minutes ${numseconds} seconds`
}