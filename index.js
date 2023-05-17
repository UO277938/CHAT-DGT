require('dotenv/config')

const fs = require('fs')
const path = require('path')

//const { token, channelId } = require('./config.json');

const token = process.env.TOKEN || '{{secrets.TOKEN}}'
const channelId = process.env.CHANNEL_ID || '{{secrets.CHANNEL_ID}}'
const openAi = process.env.OPENAI_KEY || '{{secrets.OPENAI_KEY}}'

const {Client, IntentsBitField, MessageActivityType, ActivityType, Collection, Events } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

//Load the commands
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const configuration = new Configuration({
    apiKey: openAi,
})
const openai = new OpenAIApi(configuration);

client.on(Events.ClientReady, () => {
    console.log("The bot is online!");
    client.user.setActivity('Cupid - FIFTY FIFTY', { type: ActivityType.Listening });
    
});


client.on(Events.MessageCreate, async (message) => {
    try{
        if(message.author.bot) return;
        if(message.channel.id !== channelId) return;
        if(message.content.startsWith('!')) return;

        const textoMinuscula = message.content.toLowerCase();

        //Create tutorial
        if(textoMinuscula.startsWith('help') || textoMinuscula.startsWith('ayuda')){
            await showHelp(message);
            return;
        }

        //Create image
        if(message.content.startsWith('.')){
            await createImage(message);
            return
        }

        //Crea respuesta de texto
        await createResponse(message);

    } catch (error) {
        console.log(error)
        message.reply("No se puede buscar esto pedazo de restrasado.")
    }

})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
    
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, openai);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

async function showHelp(message){
    await message.channel.sendTyping();
    message.reply("'.' Foto/Picture\n'!' Ignorar/Ignore bot").then(res => {
        res.react('🥵')
    });
}

async function createImage(message){

    await message.channel.sendTyping();
    const response = await openai.createImage({
        prompt: message.content.split('.')[1],
        n: 1,
        size: "1024x1024"
    });

    message.reply(response.data.data[0].url).then(res => {
        res.react('🎥')
    });
}

async function createResponse(message){

    let conversationLog = [{role:'system', content: "You are a troll."}]
        
    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({limit: 15});
    prevMessages.reverse()

    //Search the conversation
    prevMessages.forEach((msg) =>{
        if(msg.content.startsWith('!')) return
        if(msg.author.id !== client.user.id && message.author.bot) return
        //if(msg.author.id !== message.author.id) return

        conversationLog.push({
            role: 'user',
            content: msg.content
        })
    })
    
    //Crea texto
    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog
    })
    message.reply(result.data.choices[0].message).then(res => {
        res.react('🤓')
    });

}

client.login(token)

module.export = openai;


//https://discord.com/api/oauth2/authorize?client_id=1107690656660467785&permissions=116736&scope=bot