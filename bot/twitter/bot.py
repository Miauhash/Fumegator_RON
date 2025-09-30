import tweepy
import time
import schedule

# === CONFIGURAÇÃO DA API TWITTER ===
API_KEY = "iy5gXbATefPuFLzBB1KJ2KNop"
API_KEY_SECRET = "uVADnaouKDYLyhczVBqQba6JweZBL0GuNvrw2gL8wnxn3sAFmy"
ACCESS_TOKEN = "1961395098232532992-k1I19H177FlCbUecxFbAVO1lW6P31c"
ACCESS_TOKEN_SECRET = "3yIthE55uKK1A1yuITnnWADAqFNE7kmfnOzflvd4X6SuI"

auth = tweepy.OAuth1UserHandler(API_KEY, API_KEY_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
api = tweepy.API(auth)

# === LISTA DE FRASES SOBRE O JOGO ===
phrases = [
    # General Hype & Announcements (1-10)
    "FUMEGATOR is here! Manage your hospital and build it into an empire. #PlayToEarn #FUMEGATOR #Ronin",
    "The most insane hospital on the blockchain is now open. Are you ready to manage it? #GameFi #FUMEGATOR #Ronin",
    "Strategy, management, and true asset ownership. This is Hospital FUMEGATOR. #NFTGaming #FUMEGATOR #Ronin",
    "Your medical empire awaits on the Ronin network. The lab is open. #Web3Gaming #FUMEGATOR #Ronin",
    "The cure is in your hands. Can you handle the pressure of running the lab? #PlayToEarn #FUMEGATOR #Ronin",
    "Welcome to the Hospital. Operations begin now. #CryptoGaming #FUMEGATOR #Ronin",
    "This isn't just a game. It's a living, breathing economy. #PlayToEarn #FUMEGATOR #Ronin",
    "High-stakes biotech meets strategic P2E gaming. Welcome to FUMEGATOR. #GameFi #FUMEGATOR #Ronin",
    "A new era of tycoon gaming has arrived on Ronin. #NFTGaming #FUMEGATOR #Ronin",
    "Are you the next medical magnate? Prove it in Hospital FUMEGATOR. #PlayToEarn #FUMEGATOR #Ronin",

    # Core Gameplay Loop (11-25)
    "Assign your NFT Specialist, start production, and watch the resources flow. #PlayToEarn #FUMEGATOR #Ronin",
    "Every lab upgrade brings you closer to domination. What's your next move? #GameFi #FUMEGATOR #Ronin",
    "Collect INSULINE, produce ZOLGENSMA. Your path to wealth starts in the labs. #NFTGaming #FUMEGATOR #Ronin",
    "The production cycle never stops. Are you managing your shifts effectively? #PlayToEarn #FUMEGATOR #Ronin",
    "Level up your rooms to increase output and efficiency. Smarter work, bigger rewards. #Web3Gaming #FUMEGATOR #Ronin",
    "From a small clinic to a sprawling medical complex. The growth is real. #PlayToEarn #FUMEGATOR #Ronin",
    "Don't forget to collect your earnings! Idle resources are lost opportunities. #GameFi #FUMEGATOR #Ronin",
    "Your strategy for upgrading rooms will define your success. Plan carefully. #NFTGaming #FUMEGATOR #Ronin",
    "Master the production of all five token tiers to become a true hospital tycoon. #PlayToEarn #FUMEGATOR #Ronin",
    "Every decision matters, from the first room to the hundredth upgrade. #Strategy #FUMEGATOR #Ronin",
    "The EKG is pulsing... that's the sound of profit being made! #PlayToEarn #FUMEGATOR #Ronin",
    "Optimize your layout, manage your specialists, and conquer the game. #GameFi #FUMEGATOR #Ronin",
    "Balance is key. Are you producing enough resources for your next big upgrade? #NFTGaming #FUMEGATOR #Ronin",
    "The core of FUMEGATOR: Deploy, Produce, Collect, Evolve. Repeat. #PlayToEarn #FUMEGATOR #Ronin",
    "Your hospital is a living machine. Keep it running 24/7 to maximize your gains. #Web3Gaming #FUMEGATOR #Ronin",

    # NFTs & Specialists (26-35)
    "In FUMEGATOR, your NFTs aren't just collectibles; they're your elite workforce. #PlayToEarn #FUMEGATOR #Ronin",
    "A Specialist's rarity determines which Wing they can work in. Choose your team wisely. #NFTGaming #FUMEGATOR #Ronin",
    "Got a Specialist with a special production bonus? That's your ticket to the top. #GameFi #FUMEGATOR #Ronin",
    "Common, Uncommon, Rare, Epic, Legendary... Which Specialist will you command? #PlayToEarn #FUMEGATOR #Ronin",
    "Find the perfect NFT for each lab to maximize your production and profits. #Strategy #FUMEGATOR #Ronin",
    "Your collection of Specialists is your key to unlocking the entire hospital. #NFTGaming #FUMEGATOR #Ronin",
    "True Ownership: Your Specialists are your assets on the Ronin blockchain. #Web3Gaming #FUMEGATOR #Ronin",
    "The right Specialist in the right room can change everything. It's all about strategy. #PlayToEarn #FUMEGATOR #Ronin",
    "Each Specialist is unique. What hidden talents will you discover in yours? #NFT #FUMEGATOR #Ronin",
    "Your NFT collection finally has a purpose. Put them to work in the lab! #PlayToEarn #FUMEGATOR #Ronin",

    # Specific Features (Marketplace, Asylum, Crafting, etc.) (36-55)
    "The in-game Marketplace is LIVE! Buy and sell NFTs and resources with other players. #PlayToEarn #FUMEGATOR #Ronin",
    "Need a specific resource? Check the Marketplace. Have extra? Sell it for a profit. #GameFi #FUMEGATOR #Ronin",
    "A player-driven economy is a healthy economy. Trade wisely, profit greatly. #NFTGaming #FUMEGATOR #Ronin",
    "Welcome to the NFT Asylum: Sacrifice 3 Specialists for a chance at a new, potentially better one. #Web3Gaming #FUMEGATOR #Ronin",
    "Got some underperforming NFTs? The Asylum is your path to upgrading your team. #PlayToEarn #FUMEGATOR #Ronin",
    "The Asylum is a key deflationary mechanic. Use it to refine your collection. #GameFi #FUMEGATOR #Ronin",
    "The Crafting Lab is open! Combine resources to create powerful temporary buffs. #NFTGaming #FUMEGATOR #Ronin",
    "Need a production boost? Or a time accelerator? Craft it in the Lab. #PlayToEarn #FUMEGATOR #Ronin",
    "In FUMEGATOR, raw materials are just the beginning. Craft your advantage. #Strategy #FUMEGATOR #Ronin",
    "Send your idle Specialists on Expeditions to find rare rewards and exclusive items. #PlayToEarn #FUMEGATOR #Ronin",
    "Your NFTs can earn for you even when they're not in a lab. Start an Expedition today! #GameFi #FUMEGATOR #Ronin",
    "Expeditions offer unique items you can't find anywhere else. Don't miss out. #NFTGaming #FUMEGATOR #Ronin",
    "Reached max level in a room? It's time to Prestige! #PlayToEarn #FUMEGATOR #Ronin",
    "Prestige resets a room's level but grants a permanent production bonus. The ultimate long-term play. #Strategy #FUMEGATOR #Ronin",
    "True tycoons know the power of the Prestige system. Play for the long game. #Web3Gaming #FUMEGATOR #Ronin",
    "Check out the Daily Wheel! Get your free spin for a chance at amazing prizes. #PlayToEarn #FUMEGATOR #Ronin",
    "Who needs luck when you have the Daily Wheel? Spin to win valuable resources. #GameFi #FUMEGATOR #Ronin",
    "Don't forget to claim your Daily Bonus for a free spin! It's a gift. #NFTGaming #FUMEGATOR #Ronin",
    "Global events are coming. Prepare your hospital for the ultimate challenge and reap the rewards. #PlayToEarn #FUMEGATOR #Ronin",
    "A pandemic is coming! Will your hospital be ready to produce the cure? #ComingSoon #FUMEGATOR #Ronin",

    # Economy & P2E (56-65)
    "VIDA is the lifeblood of our ecosystem. How will you earn and spend it? #PlayToEarn #FUMEGATOR #Ronin",
    "From INSULINE to ZYNTEGLO, every token has its place in our deep, player-driven economy. #GameFi #FUMEGATOR #Ronin",
    "This is Play-to-Earn, redefined. Your strategy directly impacts your earnings. #NFTGaming #FUMEGATOR #Ronin",
    "Turn your gaming hours into tangible assets on the Ronin network. #Web3Gaming #FUMEGATOR #Ronin",
    "The economy is in your hands. Will you be a producer, a trader, or an industrialist? #PlayToEarn #FUMEGATOR #Ronin",
    "Master the market, maximize production, and build your fortune in Hospital FUMEGATOR. #GameFi #FUMEGATOR #Ronin",
    "A deep, sustainable economy built for real players and long-term growth. #NFTGaming #FUMEGATOR #Ronin",
    "Your in-game success translates to real-world value. That's the power of Web3. #PlayToEarn #FUMEGATOR #Ronin",
    "The Premium Pass unlocks global production boosts. A must-have for serious administrators. #GameFi #FUMEGATOR #Ronin",
    "Own a Mystic NFT? Enjoy permanent premium benefits and rule the hospital. #NFT #FUMEGATOR #Ronin",

    # Community & Call to Action (66-70)
    "Join our Discord community! Share strategies, trade NFTs, and chat directly with the team. #Community #FUMEGATOR #Ronin",
    "The lab is open. Your shift is starting now. Play FUMEGATOR today! #PlayToEarn #FUMEGATOR #Ronin",
    "Follow us for the latest updates, development news, and airdrop announcements! #GameFi #FUMEGATOR #Ronin",
    "What's your best strategy so far? Share it with us on Twitter using #FumegatorStrategy! #NFTGaming #FUMEGATOR #Ronin",
    "Ready to become a medical tycoon? Enter the Hospital now and start your empire. #PlayToEarn #FUMEGATOR #Ronin"
]

# === FUNÇÃO PARA POSTAR ===
index = 0  # começa na primeira frase

def postar():
    global index
    if index < len(frases):
        texto = frases[index]
        api.update_status(texto)
        print(f"Post enviado: {texto}")
        index += 1
    else:
        print("Todas as frases já foram postadas.")

# === AGENDAMENTO ===
# 3 postagens por dia: 09:00, 15:00, 21:00
schedule.every().day.at("09:00").do(postar)
schedule.every().day.at("15:00").do(postar)
schedule.every().day.at("21:00").do(postar)

print("Bot do Twitter iniciado. Aguardando horários de postagem...")

while True:
    schedule.run_pending()
    time.sleep(60)
