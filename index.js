const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('youtube-dl-exec');
const fs = require('fs');

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const queueMap = new Map();

function getQueue(guildId) {
    if (!queueMap.has(guildId)) {
        queueMap.set(guildId, {
            songs: [],
            currentSong: -1,
            connection: null,
            player: createAudioPlayer(),
        });
    }
    return queueMap.get(guildId);
}

client.once('ready', () => {
    console.log('Bot is ready! 🚀');
});

client.on('messageCreate', async message => {
    if (!message.guild) return;
    const queue = getQueue(message.guild.id);

    if (message.content.startsWith('!play')) {
        const args = message.content.split(' ');
        if (args.length < 2) {
            return message.reply('📢 Lütfen bir URL ekleyin. Örnek kullanım: `!play <URL>`');
        }
        const url = args[1];
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('🔇 Önce bir ses kanalına katılmanız gerekiyor!');
        }

        queue.songs.push(url);
        message.reply(`🎶 Şarkı kuyruğa eklendi: ${url}`);
        if (queue.currentSong === -1) {
            playNextSong(message, queue);
        }
    } else if (message.content === '!skip') {
        if (queue.currentSong >= 0 && queue.currentSong < queue.songs.length && queue.player && queue.connection && queue.connection.state.status === VoiceConnectionStatus.Ready) {
            playNextSong(message, queue);
            message.reply('⏭️ Şarkı atlandı.');
        } else {
            message.reply('🚫 Atlanacak aktif bir şarkı yok veya bağlantı sorunu var.');
        }
    } else if (message.content === '!stop') {
        if (queue.player) {
            queue.player.stop();
        }
        if (queue.connection) {
            queue.connection.destroy();
        }
        queueMap.delete(message.guild.id);
        message.reply('🛑 Müzik durduruldu ve kuyruk temizlendi.');
    }
});

async function playNextSong(message, queue) {
    queue.currentSong++;
    if (queue.currentSong >= queue.songs.length) {
        message.channel.send('🏁 Kuyruk sona erdi.');
        if (queue.connection && queue.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            queue.connection.destroy();
        }
        queue.currentSong = -1;
        return;
    }

    const songUrl = queue.songs[queue.currentSong];
    if (!queue.connection || queue.connection.state.status === VoiceConnectionStatus.Disconnected) {
        try {
            queue.connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
    
            queue.connection.on('stateChange', async (oldState, newState) => {
                console.log(`Connection state changed from ${oldState.status} to ${newState.status}`);
                if (newState.status === VoiceConnectionStatus.Ready) {
                    console.log("Connection is ready to play audio.");
                    if (queue.currentSong !== -1) {
                        playNextSong(message, queue);
                    }
                }
            });
        } catch (error) {
            console.error('Voice connection error:', error);
            message.channel.send('🔇 Ses kanalına bağlanılamıyor.');
        }
    }

    try {
        const stream = ytdl.exec(songUrl, {
            o: '-',
            q: '',
            f: 'bestaudio',
            r: '100K'
        }, { stdio: ['ignore', 'pipe', 'ignore'] });

        if (!stream.stdout) {
            throw new Error('YouTube stream could not be created.');
        }

        queue.resource = createAudioResource(stream.stdout);
        queue.player.play(queue.resource);

        queue.player.on('stateChange', (oldState, newState) => {
            console.log(`Player state changed from ${oldState.status} to ${newState.status}`);
            if (newState.status === AudioPlayerStatus.AutoPaused) {
                console.log("Player is auto-paused. Checking channel state...");
                const channel = client.channels.cache.get(message.member.voice.channel.id);
                if (channel.members.size > 1) {
                    console.log("Users are present in the channel. Resuming playback...");
                    queue.player.unpause();
                } else {
                    console.log("No users in channel. Playback will remain paused.");
                }
            }
        });        

        queue.player.on('error', error => {
            console.error(`Player Error: ${error.message}`);
            playNextSong(message, queue);
        });

        queue.player.once(AudioPlayerStatus.Idle, () => {
            playNextSong(message, queue);
        });

        message.channel.send(`🎵 Şu an çalıyor: ${songUrl}`);
    } catch (error) {
        console.error('YT-DLP command failed:', error);
        message.reply('🚫 Müzik çalma sırasında bir hata oluştu.');
        playNextSong(message, queue);
    }
}

client.login(config.DISCORD_TOKEN);
