var dotenvResult = require('dotenv').config();
const config = require('./config.json');
const { Client, GatewayIntentBits, IntentsBitField, REST, Routes } = require('discord.js');
const fetch = require('node-fetch');
const express = require('express'); 
const app = express(); 
const port = process.env.PORT || 3000; 

const messageHistory = {}; 

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = ''; // Make sure to have your API key in an environment variable


const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
];


const rest = new REST({ version: '10' }).setToken(config.token);

// create a new client instance
const myIntents = new IntentsBitField();
myIntents.add(
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.DirectMessages
);

const client = new Client({ intents: myIntents });

async function fetchGPTResponse(channelId, currentMessage) {
    const historyMessages = messageHistory[channelId] || [];
    const characterReminder = "respond as concise as possible"; // Character reminder!

    // prepend character reminder to the history
    const prompt = [
        { role: "system", content: characterReminder },
        ...historyMessages,
        { role: "user", content: currentMessage }
    ];

    const data = {
        model: "gpt-3.5-turbo-16k",
        messages: prompt,
    };

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return result.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return "Sorry, I'm having trouble thinking of a response right now.";
    }
}

let lastReplyTime = {}; 


client.on('messageCreate', async message => {
    if (message.author.bot) return;

  // rate limiting
    const currentTime = Date.now();
    const timeSinceLastReply = currentTime - (lastReplyTime[message.channel.id] || 0);
    if (timeSinceLastReply < 5000) { // 5 seconds cooldown
        return;
    }

   
    if (!messageHistory[message.channel.id]) {
        messageHistory[message.channel.id] = [];
    }
    messageHistory[message.channel.id].push({ role: "user", content: message.content });
    if (messageHistory[message.channel.id].length > 2) {
        messageHistory[message.channel.id].shift();
    }

    const lowerCaseMessage = message.content.toLowerCase();

    // check for triggers and reply accordingly
    if (lowerCaseMessage === 'hello') {
        message.reply("Hey there, how's it goin'!");
    } else {
        // use the updated fetchGPTResponse function for other triggers
        const triggers = ['jim', 'who', 'what', 'where', 'when', 'why', 'give', 'make', 'tell' ,'can'];
        const trigger = triggers.find(t => lowerCaseMessage.includes(t));

        if (trigger) {
            const response = await fetchGPTResponse(message.channel.id, lowerCaseMessage);
            if (response.length > 2000) {
                // split and send long responses
                const maxCharacters = 2000;
                for (let i = 0; i < response.length; i += maxCharacters) {
                    const messageChunk = response.substring(i, Math.min(response.length, i + maxCharacters));
                    await message.reply(messageChunk);
                }
            } else {
                message.reply(response);
            }
        }
    }
});

// joke generator
const jokes = [
    "Why don't skeletons fight each other? They don't have the guts.",
    "What do you call an alligator in a vest? An investigator!",
    "I'm reading a book on anti-gravity. It's impossible to put down!"
];

client.on('messageCreate', message => {
    if (message.content.toLowerCase() === 'tell me a joke') {
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        message.reply(joke);
    }
});

// poll creation
client.on('messageCreate', async message => {
    
    if (message.content.toLowerCase().startsWith('create poll')) {
        const pollQuestion = message.content.split('"')[1]; // Assuming the format is: create poll "Question?"
        const pollMessage = await message.channel.send(`📊 **${pollQuestion}**\nReact with 👍 or 👎`);
        await pollMessage.react('👍');
        await pollMessage.react('👎');
    }
});

// register an interactionCreate event listener
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

// function to refresh application commands and login to Discord
async function startBot() {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, '1168457930278977566'),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }

    // login to discord
    await client.login(config.token);

    
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}


startBot();
