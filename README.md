# Discord Music Bot
Bu bot, Discord sunucuları için müzik oynatma yetenekleri sağlar. YouTube'dan doğrudan ses akışı yaparak, herhangi bir ses kanalında müzik çalabilir.

**

## Başlangıç

**

**Önkoşullar**

Botu çalıştırmadan önce aşağıdaki araçların yüklü olduğundan emin olun:
 - Node.js (v12 veya daha yüksek)
 - npm (Node.js ile birlikte geliyor)
 - Bir Discord Bot Tokeni (Discord Developer Portal üzerinden alınabilir)

**Kurulum**
Projeyi yerel makinenize klonlayın veya indirin:

    git clone https://github.com/yourusername/discord-music-bot.git

    cd discord-music-bot

Bağımlılıkları yükleyin:

    npm install

**Yapılandırma**

config.json dosyasını projenizin kök dizinine oluşturun ve Discord bot tokeninizi buraya ekleyin:

    {
    
    "DISCORD_TOKEN": "Buraya_Bot_Tokeninizi_Yazın"
    
    }

**Botu Çalıştırma**

Botu başlatmak için aşağıdaki komutu kullanın:

    node index.js

**Kullanım**
Bot, aşağıdaki komutları destekler:
**!play < URL >**: Belirtilen URL'den müzik oynatır (şu anda yalnızca YouTube URL'leri desteklenmektedir).

**!skip**: Çalan müziği atlar ve kuyruktaki sonraki parçaya geçer.

**!stop**: Müziği durdurur ve ses kanalından çıkar.

**Ses Kanalına Katılma**
Botun bir komutu işleyebilmesi için önce bir ses kanalına katılmanız gerekir. Ardından, !play komutu ile müzik çalmaya başlayabilirsiniz.

**Özellikler**
 - YouTube üzerinden doğrudan ses akışı.
 - Oynatma, atlama ve durdurma komutları.
 - Otomatik olarak duraklatıldığında ve ses kanalında kullanıcılar varken otomatik olarak devam etme.
