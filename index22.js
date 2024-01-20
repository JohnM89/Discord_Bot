// Import the required packages and configuration
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import fetch from 'node-fetch';
import config from './config.json';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Create a new REST instance
const rest = new REST({ version: '10' }).setToken(config.token);

// Create a new client instance with necessary intents
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
] });

// Function to call the OpenAI API
async function fetchGPTResponse(message) {
    const data = {
        model: "gpt-3.5-turbo",
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
                'Authorization': `Bearer ${config.openai_api_key}`
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

// ... (the rest of the event listeners go here, unchanged)
const client = new Client({ intents: myIntents });
// Register a message event listener
client.on('messageCreate', message => {
    // Ignore messages from bots and non-guild messages
    if (message.author.bot || !message.guild) return;

    const lowerCaseMessage = message.content.toLowerCase(); // Convert message to lower case for case-insensitive matching

    if (lowerCaseMessage === 'hello') {
        message.reply("Hey there, how's it goin'!");
    } else if (lowerCaseMessage.includes('weather')) {
        message.reply("The clouds are conspiring, I tell ya! They've got a mind of their own, colluding with the sun to control the global thermostat!");
    } else if (lowerCaseMessage.includes('news')) {
        message.reply("Oh, the news? It's all a script, written by Shakespearean chimps on typewriters in Area 51!");
    } else if (lowerCaseMessage.includes('music')) {
        message.reply("Be careful with the tunes you tune into. There's a frequency they're sending to tune YOU instead!");
    } else if (lowerCaseMessage.includes('aliens')) {
        message.reply("Aliens aren’t just visiting, they’re throwing secret intergalactic parties in the Bermuda Triangle, and we’re NOT invited!");
    } else if (lowerCaseMessage.includes('food')) {
        message.reply("The food is a plot, I tell ya! There's an ingredient they're not listing: mind-control seasoning!");
    } else if (lowerCaseMessage.includes('sports')) {
        message.reply("Sports are a distraction designed by the elite! While you're cheering, they're scheming!");
    } else if (lowerCaseMessage.includes('technology')) {
        message.reply("Your phone isn’t just smart, it’s a super-spy in your pocket, siphoning your thoughts through the charging port!");
    } else if (lowerCaseMessage.includes('government')) {
        message.reply("The government? Oh, you mean the puppet show while the real masters are weaving the strings out of dark matter!");
    } else if (lowerCaseMessage.includes('economy')) {
        message.reply("The economy is just a giant game of Monopoly, but the dice are loaded and guess what? You're not the one rolling them!");
    }
    else if (lowerCaseMessage.includes('conspiracy')) {
        message.reply("Every conspiracy you've heard is just a cover for the real truth. It's turtles all the way down!");
    }
    else if (lowerCaseMessage.includes('moon landing')) {
        message.reply("The moon landing? Sure, it happened, but the moon? That's a hologram made of cheese!");
    }
    else if (lowerCaseMessage.includes('flat earth')) {
        message.reply("The Earth is flat, but only on days ending in 'Y'. Otherwise, it's shaped like a dinosaur!");
    }
    else if (lowerCaseMessage.includes('illuminati')) {
        message.reply("The Illuminati are yesterday's news. The real players? They're the ones hiding in plain sight as baristas!");
    }
    else if (lowerCaseMessage.includes('ghosts')) {
        message.reply("Ghosts are real! They're just shy, so they only appear when you're not looking.");
    }
    else if (lowerCaseMessage.includes('matrix')) {
        message.reply("Oh, you think this is the Matrix? No, no, this is Matrix 2.0 – the upgrade is that you don't even know you're in it!");
    }
    else if (lowerCaseMessage.includes('simulation')) {
        message.reply("This simulation we're in is so advanced, the developers are playing it from their retirement homes on Mars.");
    }
    else if (lowerCaseMessage.includes('mind control')) {
        message.reply("Mind control is out of fashion. Now, it's all about heart control – get ready for the feels!");
    }
    else if (lowerCaseMessage.includes('chemtrails')) {
        message.reply("Chemtrails are just the government's way of adding a little sparkle to the sky. Who doesn't love glitter?");
    }
    else if (lowerCaseMessage.includes('bigfoot')) {
        message.reply("Bigfoot is the ultimate hide-and-seek champion. Rumor has it, he's got invisibility socks!");
    }
    else if (lowerCaseMessage.includes('how are you')) {
        message.reply("When I can't stop fiddling I just take me Ritalin. I'm popping and sailing, man!!");
    }
    else if (lowerCaseMessage.includes('i hate cats')) {
        message.reply("understandable.");
    }

});
// When the client is ready, run this code (only once)
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: [] }, // You can define your commands here
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

// Login to Discord with your app's token
client.login(config.token);

// Handle process shutdown gracefully
process.on('SIGINT', () => {
    console.log('Shutting down from SIGINT (Ctrl-C)');
    client.destroy();
    process.exit();
});

process.on('SIGTERM', () => {
    console.log('Shutting down from SIGTERM');
    client.destroy();
    process.exit();
});
