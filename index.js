require('dotenv/config')

const {Client, IntentsBitField, MessageActivityType, ActivityType } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', () => {
    console.log("The bot is online!");
    client.user.setActivity('Cupid - FIFTY FIFTY', { type: ActivityType.Listening });
    
});

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
})
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
    
    if(message.author.bot) return;
    if(message.channel.id !== process.env.CHANNEL_ID) return;
    if(message.content.startsWith('!')) return;

    const textoMinuscula = message.content.toLowerCase();

    //Crea tutorial
    if(textoMinuscula.startsWith('help') || textoMinuscula.startsWith('ayuda')){
        message.reply("':' Foto/Picture\n'!' Ignorar/Ignore bot").then(res => {
            res.react('🥵')
        });;
        return
    }

    //Crea imagen
    if(message.content.startsWith(':')){
        const response = await openai.createImage({
            prompt: message.content.split(':')[1],
            n: 1,
            size: "1024x1024"
        });

        message.reply(response.data.data[0].url).then(res => {
            res.react('🎥')
        });;
        return
    }

    let conversationLog = [{role:'system', content: "You are a troll."}]
    
    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({limit: 15});
    prevMessages.reverse()

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

})


client.login(process.env.TOKEN)


//https://discord.com/api/oauth2/authorize?client_id=1107690656660467785&permissions=116736&scope=bot