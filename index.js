
require("dotenv").config();
const { Mistral } = require('@mistralai/mistralai');


const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/sumi-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});


app.command("/sumi-sum", async ({ command, ack, respond }) => {
  await ack();
  const result = await app.client.conversations.history({
  channel: command.channel_id,
  limit: 50  // how many past messages to fetch
});

const messages = result.messages.map(msg => msg.text).join('\n');
const channelname = await app.client.conversations.info({channel: command.channel_id});
const summary = await sum(messages);
const printchannelname = await sum(channelname.channel.name);
await respond(`Summary of #${channelname.channel.name}:\n\n${summary}`);
  
});
app.command("/sumi-filter", async ({ command, ack, respond }) => {
  await ack();
  const result = await app.client.conversations.history({
  channel: command.channel_id,
  limit: 50
  
});

const messages = result.messages.map(msg => msg.text).join('\n');
const fil = await filter(messages);
const filterterm = command.text;
const prompt = `Filter the messages in the channel for the topic: ${filterterm} and provide a summary of the relevant messages.${messages}`;
const filteredSummary = await filter(prompt);
await respond(filteredSummary);
  

});

app.command("/sumi-chat", async ({ command, ack, respond }) => {
  await ack();
  const result = await app.client.conversations.history({
  channel: command.channel_id,
  limit: 50
  
});
const messages = result.messages.map(msg => msg.text).join('\n');
const chatterm = command.text;
const prompt = `Chat with the user about the topic: ${chatterm} and provide a helpful response you can also fileter through messages if needed for more information ${messages}.`;
const filteredchat = await chat(prompt);
await respond(filteredchat);
  

});

(async () => {
  await app.start();
  console.log("bot is running!");
})();


const client = new Mistral();

async function sum(userText) {
  const response = await client.chat.complete({
    model: 'mistral-large-latest', 
    messages: [
      { role: 'system', content: 'You Are a AI Bot Named Sumi you are a Slack Bot that is designed by Magic_X to summerize channels and messeges and provide it as nice friendly information to the user to help them know what the channel is about and if they need help you can easilly filter messages in the channel do not include any names for chanels because you do not know them you may only give the summary no other qurestions to the user if they want to chat with you more or filter messages they can type /sumi-filter {topic} or /sumi-chat {text}' },
      { role: 'user', content: userText }
    ],
  });
  return response.choices[0].message.content;
}


async function filter(userText) {
  const response = await client.chat.complete({
    model: 'mistral-large-latest', 
    messages: [
      { role: 'system', content: 'You Are a AI Bot Named Sumi you are a Slack Bot that is designed by Magic_X to summerize channels and messeges and provide it as nice friendly information to the user to help them know what the channel is about and if they need help you can easilly filter messages in the channel do not include any names for chanels because you do not know them you may only give the summary no other qurestions to the user if they want to chat with you more or filter messages they can type /sumi-filter {topic} or /sumi-chat {text}' },
      { role: 'user', content: userText }
    ],
  });
  return response.choices[0].message.content;
}

async function chat(userText) {
  const response = await client.chat.complete({
    model: 'mistral-large-latest', 
    messages: [
      { role: 'system', content: 'You Are a AI Bot Named Sumi you are a Slack Bot that is designed by Magic_X ' },
      { role: 'user', content: userText }
    ],
  });
  return response.choices[0].message.content;
}