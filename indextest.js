
var dotenvResult = require('dotenv').config();
const config = require('./config.json');
const { Client, GatewayIntentBits, IntentsBitField, REST, Routes } = require('discord.js');
const fetch = require('node-fetch');

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = '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'; // Make sure to have your API key in an environment variable


// Define commands array
const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
];


// Create a new REST instance
const rest = new REST({ version: '10' }).setToken(config.token);

// Create a new client instance
const myIntents = new IntentsBitField();
myIntents.add(
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers
);

const client = new Client({ intents: myIntents });

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // Define triggers for calling the GPT function
    const triggers = ['weather', 'news', 'music', 'aliens', 'food', 'sports', 'technology', 'government', 'economy', 'conspiracy', 'moon landing', 'flat earth', 'illuminati', 'ghosts', 'matrix', 'simulation', 'mind control', 'chemtrails', 'bigfoot', 'hello', 'compliment me', 'magic 8-ball', 'tell me a joke', 'cat fact', 'create poll', '!custom'];

    const lowerCaseMessage = message.content.toLowerCase(); // Convert message to lower case

    // Check if the message includes any of the triggers
    if (triggers.some(trigger => lowerCaseMessage.includes(trigger))) {
        const response = await fetchGPTResponse(lowerCaseMessage);
        message.reply(response);
    }
});

const client = new Client({ intents: myIntents });
// Register a message event listener

// Function to call the OpenAI API

async function fetchGPTResponse(message) {
    const data = {
        model: "gpt-3.5-turbo", // You can specify the model you want to use
        messages: [
            { role: "system", content: "You are a helpful Discord bot." },
            { role: "user", content: message }
        ],
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

// Modify the message event listener to use fetchGPTResponse
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;



    const triggers = ['weather', 'news', 'music', 'aliens', 'food', 'sports', 'technology', 'government', 'economy', 'conspiracy', 'moon landing', 'flat earth', 'illuminati', 'ghosts', 'matrix', 'simulation', 'mind control', 'chemtrails', 'bigfoot', 'hello'];

    const lowerCaseMessage = message.content.toLowerCase(); // Convert message to lower case for case-insensitive matching

    const trigger = triggers.find(t => lowerCaseMessage.includes(t));

    if (trigger) {
        const response = await fetchGPTResponse(lowerCaseMessage);
        message.reply(response);
    }
});

// ... keep the rest of your bot code here


//Random compliments

const compliments = [
    "You're awesome!",
    "You're a smart cookie!",
    "I like your style!",
    "You have the best laugh.",
    "I appreciate you."
];

client.on('messageCreate', message => {
    if (message.content.toLowerCase() === 'compliment me') {
        const compliment = compliments[Math.floor(Math.random() * compliments.length)];
        message.reply(compliment);
    }
});

// Magic 8-ball

const eightBallResponses = [
    "It is certain.",
    "It is decidedly so.",
    "Without a doubt.",
    "Yes - definitely.",
    "You may rely on it.",
    "As I see it, yes.",
    "Most likely.",
    "Outlook good.",
    "Yes.",
    "Signs point to yes.",
    "Reply hazy, try again.",
    "Ask again later.",
    "Better not tell you now.",
    "Cannot predict now.",
    "Concentrate and ask again.",
    "Don't count on it.",
    "My reply is no.",
    "My sources say no.",
    "Outlook not so good.",
    "Very doubtful."
];

client.on('messageCreate', message => {
    if (message.content.toLowerCase().startsWith('magic 8-ball')) {
        const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
        message.reply(response);
    }
});


//Joke Generator 
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

//cat facts

const catFacts = [
    "Cats have five toes on their front paws, but only four toes on their back paws.",
    "Cats can rotate their ears 180 degrees.",
    "A group of cats is called a clowder."
];

client.on('messageCreate', message => {
    if (message.content.toLowerCase() === 'cat fact') {
        const catFact = catFacts[Math.floor(Math.random() * catFacts.length)];
        message.reply(catFact);
    }
});

//poll creation
client.on('messageCreate', async message => {
    if (message.content.toLowerCase().startsWith('create poll')) {
        const pollQuestion = message.content.split('"')[1]; // Assuming the format is: create poll "Question?"
        const pollMessage = await message.channel.send(`📊 **${pollQuestion}**\nReact with 👍 or 👎`);
        await pollMessage.react('👍');
        await pollMessage.react('👎');
    }
});

// custom arguments

client.on('messageCreate', message => {
    if (message.content.startsWith('!custom')) {
        const args = message.content.slice('!custom'.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // Handle different custom commands
        switch (command) {
            case 'echo':
                message.channel.send(args.join(' ')); // Echoes the rest of the message
                break;
            case 'add':
                const sum = args.reduce((acc, curr) => acc + parseFloat(curr), 0);
                message.reply(`The sum is ${sum}`);
                break;
            // Add more custom command cases as needed
        }
    }
});

// 

// Register an interactionCreate event listener
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

// Function to refresh application commands and login to Discord
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

    // Log in to Discord with your bot's token
    await client.login(config.token);
}

// Start the bot
startBot();
