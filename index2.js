
var dotenvResult = require('dotenv').config();
const config = require('./config.json');
const { Client, GatewayIntentBits, IntentsBitField, REST, Routes } = require('discord.js');
const fetch = require('node-fetch');
const messageHistory = {}; // Stores message history for each channel


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
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.DirectMessages
    
);


const client = new Client({ intents: myIntents });

// Register a message event listener

// client.on('messageCreate', message =>{ {
//     // Ignore messages from bots
//     if (message.author.bot) return;

//     // Update message history for the channel
//     if (!messageHistory[message.channel.id]) {
//         messageHistory[message.channel.id] = [];
//     }
//     messageHistory[message.channel.id].push({ role: "user", content: message.content });
//     if (messageHistory[message.channel.id].length > 10) {
//         messageHistory[message.channel.id].shift();
//     }

//     // Check for direct messages
//     if (!message.guild) {
//         // Replace 'your_dm_command' with the command you want to trigger the response
//         if (message.content.toLowerCase() === 'hello') {
//             message.reply('Response to DM command');
//         }
//         return; // Ensures that the rest of the code is not executed for DMs
//     }

//     // Below this point, the bot is handling messages from guilds
//     const lowerCaseMessage = message.content.toLowerCase(); // Convert message to lower case for case-insensitive matching

//     if (lowerCaseMessage === 'hello') {
//         message.reply("Hey there, how's it goin'!");
//     } else if (lowerCaseMessage.includes('weather')) {
//         message.reply("The clouds are conspiring, I tell ya! They've got a mind of their own, colluding with the sun to control the global thermostat!");
//     } else if (lowerCaseMessage.includes('news')) {
//         message.reply("Oh, the news? It's all a script, written by Shakespearean chimps on typewriters in Area 51!");
//     } else if (lowerCaseMessage.includes('music')) {
//         message.reply("Be careful with the tunes you tune into. There's a frequency they're sending to tune YOU instead!");
//     } else if (lowerCaseMessage.includes('aliens')) {
//         message.reply("Aliens aren’t just visiting, they’re throwing secret intergalactic parties in the Bermuda Triangle, and we’re NOT invited!");
//     } else if (lowerCaseMessage.includes('food')) {
//         message.reply("The food is a plot, I tell ya! There's an ingredient they're not listing: mind-control seasoning!");
//     } else if (lowerCaseMessage.includes('sports')) {
//         message.reply("Sports are a distraction designed by the elite! While you're cheering, they're scheming!");
//     } else if (lowerCaseMessage.includes('technology')) {
//         message.reply("Your phone isn’t just smart, it’s a super-spy in your pocket, siphoning your thoughts through the charging port!");
//     } else if (lowerCaseMessage.includes('government')) {
//         message.reply("The government? Oh, you mean the puppet show while the real masters are weaving the strings out of dark matter!");
//     } else if (lowerCaseMessage.includes('economy')) {
//         message.reply("The economy is just a giant game of Monopoly, but the dice are loaded and guess what? You're not the one rolling them!");
//     }
//     else if (lowerCaseMessage.includes('conspiracy')) {
//         message.reply("Every conspiracy you've heard is just a cover for the real truth. It's turtles all the way down!");
//     }
    // }
    

// });



async function fetchGPTResponse(channelId, currentMessage) {
    const historyMessages = messageHistory[channelId] || [];
    const data = {
        model: "gpt-3.5-turbo-16k",
        messages: [
            ...historyMessages,
            { role: "system", content: "You are a helpful Discord bot." },
            { role: "user", content: currentMessage }
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

let lastReplyTime = {}; // Stores the last reply time for each channel

// Modify the message event listener to use fetchGPTResponse
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // Rate limiting - only respond if sufficient time has passed
    const currentTime = Date.now();
    const timeSinceLastReply = currentTime - (lastReplyTime[message.channel.id] || 0);
    if (timeSinceLastReply < 5000) { // 5 seconds cooldown
        return;
    }

    // Update message history for the channel
    if (!messageHistory[message.channel.id]) {
        messageHistory[message.channel.id] = [];
    }
    messageHistory[message.channel.id].push({ role: "user", content: message.content });
    if (messageHistory[message.channel.id].length > 10) {
        messageHistory[message.channel.id].shift();
    }

    const lowerCaseMessage = message.content.toLowerCase();

     if (lowerCaseMessage.includes('jim')) {
        const response = await fetchGPTResponse(message.channel.id, lowerCaseMessage);
        if (response.length > 2000) {
            // ... (your existing response chunking logic)
        } else {
            message.reply(response);
        }
    }

    // Check for specific triggers and reply accordingly
    if (lowerCaseMessage === 'hello') {
        message.reply("Hey there, how's it goin'!");
    // } else if (lowerCaseMessage.includes('weather')) {
    //     // ... other predefined responses ...
    // }
    // Add other predefined triggers here using else if statements

    // Check for triggers that need context-aware responses
    const triggers = ['jim', 'who', 'what', 'where', 'when', 'why', 'give', 'make', 'tell'];
    const trigger = triggers.find(t => lowerCaseMessage.includes(t));

    if (trigger) {
        const response = await fetchGPTResponse(message.channel.id, lowerCaseMessage);
        if (response.length > 2000) {
            // Split and send long responses
            const maxCharacters = 2000;
            for (let i = 0; i < response.length; i += maxCharacters) {
                const messageChunk = response.substring(i, Math.min(response.length, i + maxCharacters));
                await message.reply(messageChunk);
            }
        } else {
            message.reply(response);
        }
    }
     if (lowerCaseMessage.includes('jim')) {
        const response = await fetchGPTResponse(message.channel.id, lowerCaseMessage);
        if (response.length > 2000) {
            // ... (your existing response chunking logic)
        } else {
            message.reply(response);
        }
    }
}});

// client.on('messageCreate', async message => {
//     if (message.author.bot || !message.guild) return;

//     const triggers = ['hello', 'Jim', 'jim', 'who','what','where','when','why' , 'give' ,'make' ,'tell'];
//     const lowerCaseMessage = message.content.toLowerCase(); // Convert message to lower case for case-insensitive matching
//     const trigger = triggers.find(t => lowerCaseMessage.includes(t));

//     if (trigger) {
//         const response = await fetchGPTResponse(message.channel.id, lowerCaseMessage);
//         // Split response into multiple messages if it's over 2000 characters
//         if (response.length > 2000) {
//             const maxCharacters = 2000;
//             for (let i = 0; i < response.length; i += maxCharacters) {
//                 const messageChunk = response.substring(i, Math.min(response.length, i + maxCharacters));
//                 await message.reply(messageChunk);
//             }
//         } else {
//             message.reply(response);
//         }
//     }
// });


// ... keep the rest of your bot code here



// const messageHistory = {};

// function updateMessageHistory(channelId, message) {
//     if (!messageHistory[channelId]) {
//         messageHistory[channelId] = [];
//     }
//     messageHistory[channelId].push(message);
//     if (messageHistory[channelId].length > 10) { // Keep only the last 10 messages
//         messageHistory[channelId].shift();
//     }
// }

// Modify this function to use message history
// async function fetchGPTResponse(channelId, message) {
//     const historyMessages = messageHistory[channelId] || [];
//     const data = {
//         model: "gpt-3.5-turbo-16k",
//         messages: historyMessages.concat([{ role: "user", content: message }]),
//         // ... rest of your function
//     };

//     // ... rest of your function
// }

// Update message history in the message event listener
// client.on('messageCreate', async message => {
//     if (message.author.bot || !message.guild) return;

//     updateMessageHistory(message.channel.id, { role: "user", content: message.content });

//     // ... rest of your event listener
// });


//Random compliments

const compliments = [
    "You're awesome!",
    "You're a smart cookie!",
    "I like your style!",
    "You have the best laugh.",
    "I appreciate you."
];

// client.on('messageCreate', message => {
//     if (message.content.toLowerCase() === 'compliment me') {
//         const compliment = compliments[Math.floor(Math.random() * compliments.length)];
//         message.reply(compliment);
//     }
// });

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

// client.on('messageCreate', message => {
//     if (message.content.toLowerCase().startsWith('magic 8-ball')) {
//         const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
//         message.reply(response);
//     }
// });


//Joke Generator 
const jokes = [
    "Why don't skeletons fight each other? They don't have the guts.",
    "What do you call an alligator in a vest? An investigator!",
    "I'm reading a book on anti-gravity. It's impossible to put down!"
];

// client.on('messageCreate', message => {
//     if (message.content.toLowerCase() === 'tell me a joke') {
//         const joke = jokes[Math.floor(Math.random() * jokes.length)];
//         message.reply(joke);
//     }
// });

//cat facts

const catFacts = [
    "Cats have five toes on their front paws, but only four toes on their back paws.",
    "Cats can rotate their ears 180 degrees.",
    "A group of cats is called a clowder."
];

// client.on('messageCreate', message => {
//     if (message.content.toLowerCase() === 'cat fact') {
//         const catFact = catFacts[Math.floor(Math.random() * catFacts.length)];
//         message.reply(catFact);
//     }
// });

//poll creation
// client.on('messageCreate', async message => {
    
//     if (message.content.toLowerCase().startsWith('create poll')) {
//         const pollQuestion = message.content.split('"')[1]; // Assuming the format is: create poll "Question?"
//         const pollMessage = await message.channel.send(`📊 **${pollQuestion}**\nReact with 👍 or 👎`);
//         await pollMessage.react('👍');
//         await pollMessage.react('👎');
//     }
// });

// custom arguments

// client.on('messageCreate', message => {
//     if (message.content.startsWith('!custom')) {
//         const args = message.content.slice('!custom'.length).trim().split(/ +/);
//         const command = args.shift().toLowerCase();

//         // Handle different custom commands
//         switch (command) {
//             case 'echo':
//                 message.channel.send(args.join(' ')); // Echoes the rest of the message
//                 break;
//             case 'add':
//                 const sum = args.reduce((acc, curr) => acc + parseFloat(curr), 0);
//                 message.reply(`The sum is ${sum}`);
//                 break;
//             // Add more custom command cases as needed
//         }
//     }
// });

// 


var dotenvResult = require('dotenv').config();
const config = require('./config.json');
const { Client, GatewayIntentBits, IntentsBitField, REST, Routes } = require('discord.js');
const fetch = require('node-fetch');
const messageHistory = {}; // Stores message history for each channel


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
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.DirectMessages
    
);


const client = new Client({ intents: myIntents });



async function fetchGPTResponse(channelId, currentMessage) {
    const historyMessages = messageHistory[channelId] || [];
    const data = {
        model: "gpt-3.5-turbo-16k",
        messages: [
            ...historyMessages,
            { role: "system", content: "You are a helpful Discord bot." },
            { role: "user", content: currentMessage }
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

let lastReplyTime = {}; // Stores the last reply time for each channel

// Modify the message event listener to use fetchGPTResponse
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // Rate limiting - only respond if sufficient time has passed
    const currentTime = Date.now();
    const timeSinceLastReply = currentTime - (lastReplyTime[message.channel.id] || 0);
    if (timeSinceLastReply < 5000) { // 5 seconds cooldown
        return;
    }

    // Update message history for the channel
    if (!messageHistory[message.channel.id]) {
        messageHistory[message.channel.id] = [];
    }
    messageHistory[message.channel.id].push({ role: "user", content: message.content });
    if (messageHistory[message.channel.id].length > 10) {
        messageHistory[message.channel.id].shift();
    }

    const lowerCaseMessage = message.content.toLowerCase();

     if (lowerCaseMessage.includes('jim')) {
        const response = await fetchGPTResponse(message.channel.id, lowerCaseMessage);
        if (response.length > 2000) {
            // ... (your existing response chunking logic)
        } else {
            message.reply(response);
        }
    }

    // Check for specific triggers and reply accordingly
    if (lowerCaseMessage === 'hello') {
        message.reply("Hey there, how's it goin'!");
    // } else if (lowerCaseMessage.includes('weather')) {
    //     // ... other predefined responses ...
    // }
    // Add other predefined triggers here using else if statements

    // Check for triggers that need context-aware responses
    const triggers = ['jim', 'who', 'what', 'where', 'when', 'why', 'give', 'make', 'tell'];
    const trigger = triggers.find(t => lowerCaseMessage.includes(t));

    if (trigger) {
        const response = await fetchGPTResponse(message.channel.id, lowerCaseMessage);
        if (response.length > 2000) {
            // Split and send long responses
            const maxCharacters = 2000;
            for (let i = 0; i < response.length; i += maxCharacters) {
                const messageChunk = response.substring(i, Math.min(response.length, i + maxCharacters));
                await message.reply(messageChunk);
            }
        } else {
            message.reply(response);
        }
    }
     if (lowerCaseMessage.includes('jim')) {
        const response = await fetchGPTResponse(message.channel.id, lowerCaseMessage);
        if (response.length > 2000) {
            // ... (your existing response chunking logic)
        } else {
            message.reply(response);
        }
    }
}});





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





//poll creation
client.on('messageCreate', async message => {
    
    if (message.content.toLowerCase().startsWith('create poll')) {
        const pollQuestion = message.content.split('"')[1]; // Assuming the format is: create poll "Question?"
        const pollMessage = await message.channel.send(`📊 **${pollQuestion}**\nReact with 👍 or 👎`);
        await pollMessage.react('👍');
        await pollMessage.react('👎');
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

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.channel.type === 'dm') {
        // Handle DM messages separately
        const lowerCaseMessage = message.content.toLowerCase();

        // Check for specific triggers and reply accordingly
        if (lowerCaseMessage === 'hello') {
            message.reply("Hey there, how's it goin'!");
        } else {
            // Use the updated fetchGPTResponse function for other triggers
            const triggers = ['jim', 'who', 'what', 'where', 'when', 'why', 'give', 'make', 'tell', 'can'];
            const trigger = triggers.find(t => lowerCaseMessage.includes(t));

            if (trigger) {
                const response = await fetchGPTResponse("dm", lowerCaseMessage);
                if (response.length > 2000) {
                    // Split and send long responses
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
    } else {
        // Handle messages in guild channels

        // Rate limiting - only respond if sufficient time has passed
        const currentTime = Date.now();
        const timeSinceLastReply = currentTime - (lastReplyTime[message.channel.id] || 0);
        if (timeSinceLastReply < 5000) { // 5 seconds cooldown
            return;
        }

        // Update message history for the channel
        if (!messageHistory[message.channel.id]) {
            messageHistory[message.channel.id] = [];
        }
        messageHistory[message.channel.id].push({ role: 'user', content: message.content });
        if (messageHistory[message.channel.id].length > 2) {
            messageHistory[message.channel.id].shift();
        }

        const lowerCaseMessage = message.content.toLowerCase();

        // Check for specific triggers and reply accordingly
        if (lowerCaseMessage === 'hello') {
            message.reply("Hey there, how's it goin'!");
        } else {
            // Use the updated fetchGPTResponse function for other triggers
            const triggers = ['jim', 'who', 'what', 'where', 'when', 'why', 'give', 'make', 'tell', 'can'];
            const trigger = triggers.find(t => lowerCaseMessage.includes(t));

            if (trigger) {
                const response = await fetchGPTResponse(message.channel.id, lowerCaseMessage);
                if (response.length > 2000) {
                    // Split and send long responses
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
    }
});

// Start the bot
startBot();

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
