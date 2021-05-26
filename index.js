import Discord from 'discord.js';
import { config } from './config.js'
import fs from 'fs';
import moment from 'moment';
import { CronJob } from 'cron'

const client = new Discord.Client();

const prefix = "!";
var job = new CronJob('10 * * * * *', async function () {
    const channel = client.channels.cache.find(channel => channel.name === 'day6-quote-of-the-day')
    const qotdData = JSON.parse(fs.readFileSync('./data.json', { encoding: 'utf8', flag: 'r' }));

    console.log('Send cron message')
    const unmarkedQotd = qotdData.filter(v => !v.marked);
    if (unmarkedQotd.length) {
        const qotd = unmarkedQotd[0]
        const response = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`DAY6's quote of the day (${moment(Date.now()).format('DD/MM/YYYY')})`)
            // .setURL('https://discord.js.org/')
            .setAuthor(qotd.from)
            .setDescription(qotd.content)
            .setThumbnail('https://i.pinimg.com/736x/97/fe/be/97febe187d4c8f368761db5ed815b939.jpg')
            .setTimestamp()
        channel.send(response);
        // channel.send(`

        // ${qotd.content}
        // --${qotd.from}
        //             `)
        const newData = qotdData.map(v => {
            if (v.id === qotd.id) {
                return { ...v, marked: true }
            } else return v
        })
        fs.writeFileSync("data.json", JSON.stringify(newData));
    } else {
        channel.send(`No question of the day found!`)
    }
}, null, true, 'Asia/Vientiane');
job.start();



client.on("message", async function (message) {
    const channel = client.channels.cache.find(channel => channel.name === 'day6-quote-of-the-day')
    const qotdData = JSON.parse(fs.readFileSync('./data.json', { encoding: 'utf8', flag: 'r' }));

    try {
        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;
        const commandBody = message.content.slice(prefix.length);
        const args = commandBody.split(' ');
        const command = args.shift().toLowerCase();
        switch (command) {
            case "ping":
                const timeTaken = Date.now() - message.createdTimestamp;
                message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
                break;
            case "test":
                const unmarkedQotd = qotdData.filter(v => !v.marked);
                if (unmarkedQotd.length) {
                    const qotd = unmarkedQotd[0]
                    const response = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`DAY6's quote of the day (${moment(Date.now()).format('DD/MM/YYYY')})`)
                        // .setURL('https://discord.js.org/')
                        .setAuthor(qotd.from)
                        .setDescription(qotd.content)
                        .setThumbnail('https://i.pinimg.com/736x/97/fe/be/97febe187d4c8f368761db5ed815b939.jpg')
                        .setTimestamp()
                    channel.send(response);
                    const newData = qotdData.map(v => {
                        if (v.id === qotd.id) {
                            return { ...v, marked: true }
                        } else return v
                    })
                    fs.writeFileSync("data.json", JSON.stringify(newData));
                } else {
                    channel.send(`No question of the day found!`)
                }
                break;
            case "reset-qotd":
                const newData = qotdData.map(v => {
                    return { ...v, marked: false }
                })
                fs.writeFileSync("data.json", JSON.stringify(newData));
                message.reply(`Done!`)

                break;
            case "import":
                const importArgs = commandBody.split('#');
                const parseArgsToMapArray = importArgs.map(v => {
                    return v.split('|')
                })
                const obj = Object.fromEntries(parseArgsToMapArray);
                if (obj && obj.content && obj.from) {
                    const newArr = [...qotdData, {
                        content: obj.content,
                        from: obj.from,
                        id: qotdData.length,
                        marked: false
                    }]
                    fs.writeFileSync("data.json", JSON.stringify(newArr));
                    message.reply(`Import successful!`)

                } else {
                    message.reply(`Wrong command!`)
                }
                break;
        }
    } catch (err) {
        console.log('err', err)
    }

});

client.login(config.BOT_TOKEN);