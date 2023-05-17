require('dotenv/config')
const { SlashCommandBuilder } = require('discord.js');
const request = require('request');

let url = 'http://api.openweathermap.org/data/2.5/weather?q=';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Replies with the weather of Oviedo')
        .addStringOption(option => option.setName('city')
            .setDescription('Name of the city to search weather.')
            .setRequired(true)
        ),

	async execute(interaction) {
        let nurl = url + interaction.options.getString('city') + '&units=metric&lang=es&APPID=' + process.env.OPENWEATHER_API + '&units=metric';
        await request(nurl,async function (err, response, body) {
            if (err) {
              console.log('Error:', err);
            } else {
              const weather = JSON.parse(body);
              const message = `El clima en ${weather.name} es ${weather.main.temp} grados Celsius, con ${weather.weather[0].description}.`;
              await interaction.reply(message);
            }
        })
    
	},
};