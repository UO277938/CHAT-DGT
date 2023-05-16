require('dotenv/config')

const {Client, IntentsBitField, MessageActivityType, ActivityType } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const sdk = require('api')('@leonardoai/v1.0#28807z41owlgnis8jg');

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
    try{
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
            /*sdk.createGeneration({
                prompt: 'An oil painting of a cat',
                modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3',
                width: 512,
                height: 512,
                negative_prompt: 'gfsg'
              })
                .then(({ data }) => console.log(data))
                .catch(err => console.error(err));
            return*/
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
    } catch (error) {
        console.log(error)
        message.reply("No se puede buscar esto pedazo de restrasado.")
    }

})


client.login(process.env.TOKEN)


//https://discord.com/api/oauth2/authorize?client_id=1107690656660467785&permissions=116736&scope=bot