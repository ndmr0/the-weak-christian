import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path


SOURCE = Path("verses-1769.json")
OUTPUT = Path("encouragements_kjv_1000.jsonl")
TOTAL = 1000


BOOK_CAPS = {
    "Genesis": 8,
    "Exodus": 10,
    "Leviticus": 1,
    "Numbers": 2,
    "Deuteronomy": 18,
    "Joshua": 6,
    "Judges": 1,
    "Ruth": 2,
    "1 Samuel": 4,
    "2 Samuel": 4,
    "1 Kings": 4,
    "2 Kings": 2,
    "1 Chronicles": 12,
    "2 Chronicles": 10,
    "Ezra": 2,
    "Nehemiah": 6,
    "Esther": 1,
    "Job": 20,
    "Psalms": 180,
    "Proverbs": 100,
    "Ecclesiastes": 12,
    "Song of Solomon": 2,
    "Isaiah": 120,
    "Jeremiah": 28,
    "Lamentations": 8,
    "Ezekiel": 16,
    "Daniel": 12,
    "Hosea": 8,
    "Joel": 7,
    "Amos": 5,
    "Obadiah": 2,
    "Jonah": 5,
    "Micah": 10,
    "Nahum": 4,
    "Habakkuk": 6,
    "Zephaniah": 5,
    "Haggai": 5,
    "Zechariah": 12,
    "Malachi": 6,
    "Matthew": 80,
    "Mark": 45,
    "Luke": 70,
    "John": 100,
    "Acts": 6,
    "Romans": 100,
    "1 Corinthians": 50,
    "2 Corinthians": 70,
    "Galatians": 45,
    "Ephesians": 60,
    "Philippians": 50,
    "Colossians": 45,
    "1 Thessalonians": 25,
    "2 Thessalonians": 14,
    "1 Timothy": 20,
    "2 Timothy": 8,
    "Titus": 12,
    "Philemon": 3,
    "Hebrews": 52,
    "James": 32,
    "1 Peter": 36,
    "2 Peter": 20,
    "1 John": 35,
    "2 John": 3,
    "3 John": 3,
    "Jude": 5,
    "Revelation": 22,
}


KEYWORDS = {
    "love": [
        "love",
        "loved",
        "loveth",
        "charity",
        "lovingkindness",
        "kindness",
        "dear",
        "beloved",
    ],
    "mercy": [
        "mercy",
        "merciful",
        "compassion",
        "compassions",
        "tender",
        "pity",
        "gracious",
        "goodness",
    ],
    "grace": [
        "grace",
        "forgive",
        "forgiven",
        "forgiveness",
        "pardon",
        "cleanse",
        "justified",
        "righteousness of god",
    ],
    "peace": [
        "peace",
        "rest",
        "quiet",
        "still",
        "comfort",
        "consolation",
        "safe",
        "safety",
    ],
    "strength": [
        "strength",
        "strong",
        "strengthen",
        "uphold",
        "help",
        "helper",
        "power",
        "might",
        "sustain",
        "deliver",
        "refuge",
        "fortress",
    ],
    "hope": [
        "hope",
        "wait",
        "promise",
        "promised",
        "glory",
        "expectation",
        "latter end",
        "inheritance",
    ],
    "faith": [
        "faith",
        "faithful",
        "believe",
        "believeth",
        "trust",
        "trusted",
        "confidence",
        "assurance",
    ],
    "guidance": [
        "guide",
        "lead",
        "led",
        "path",
        "paths",
        "way",
        "ways",
        "teach",
        "direct",
        "lamp",
        "light",
    ],
    "wisdom": [
        "wisdom",
        "wise",
        "understanding",
        "knowledge",
        "instruction",
        "counsel",
        "truth",
        "word",
        "commandment",
    ],
    "prayer": [
        "pray",
        "prayer",
        "supplication",
        "ask",
        "seek",
        "call",
        "cried",
        "hear",
        "heard",
    ],
    "joy": [
        "joy",
        "rejoice",
        "glad",
        "gladness",
        "delight",
        "blessed",
        "happy",
        "praise",
        "sing",
        "thanksgiving",
    ],
    "salvation": [
        "salvation",
        "save",
        "saved",
        "redeem",
        "redeemed",
        "saviour",
        "savior",
        "deliverer",
        "resurrection",
    ],
    "christ": [
        "jesus",
        "christ",
        "son of god",
        "son of man",
        "lord jesus",
        "messiah",
        "lamb",
        "word of life",
        "word was made flesh",
        "only begotten",
    ],
    "presence": [
        "with thee",
        "with you",
        "with him",
        "with me",
        "presence",
        "near",
        "nigh",
        "dwell",
        "abide",
        "among",
    ],
    "provision": [
        "provide",
        "provided",
        "supply",
        "bread",
        "shepherd",
        "pasture",
        "feed",
        "filled",
        "full",
        "want",
        "need",
    ],
    "renewal": [
        "renew",
        "restore",
        "revive",
        "heal",
        "healed",
        "new",
        "clean heart",
        "quicken",
        "refresh",
    ],
    "perseverance": [
        "endure",
        "patience",
        "patient",
        "overcome",
        "victory",
        "stand",
        "steadfast",
        "faint",
        "weary",
        "race",
        "temptation",
    ],
    "eternal_life": [
        "eternal",
        "everlasting",
        "life",
        "kingdom",
        "heaven",
        "crown",
        "incorruptible",
    ],
    "identity": [
        "children of god",
        "sons of god",
        "adoption",
        "chosen",
        "elect",
        "saints",
        "heirs",
        "new creature",
    ],
    "praise": [
        "praise",
        "thanks",
        "thank",
        "magnify",
        "worship",
        "bless the lord",
        "sing",
    ],
}


THEME_PRIORITY = [
    "salvation",
    "grace",
    "mercy",
    "love",
    "peace",
    "strength",
    "hope",
    "faith",
    "guidance",
    "wisdom",
    "prayer",
    "joy",
    "presence",
    "provision",
    "renewal",
    "perseverance",
    "eternal_life",
    "identity",
    "praise",
    "christ",
]


BAD_TERMS = [
    "abomination",
    "adultery",
    "adversary",
    "amalek",
    "ammon",
    "asia",
    "assyria",
    "babylon",
    "bowels",
    "bishop",
    "bishops",
    "curse",
    "cursed",
    "damnation",
    "deacon",
    "deacons",
    "antichrist",
    "circumcision",
    "darkness rather than light",
    "destroy",
    "destroyed",
    "destroyest",
    "destroyeth",
    "destruction",
    "devil",
    "devils",
    "drink his blood",
    "drunken",
    "edom",
    "egypt",
    "egyptians",
    "eat the flesh",
    "enmity",
    "evildoers",
    "fellowlabourers",
    "filthiness",
    "fleshly",
    "graven",
    "greeks",
    "harlot",
    "hath not life",
    "hate",
    "hated iniquity",
    "he that loveth not",
    "i charge thee",
    "idolater",
    "joab",
    "judge",
    "judged",
    "judges",
    "jews",
    "law of sin",
    "loved darkness",
    "husband",
    "husbands",
    "meat",
    "murder",
    "moab",
    "pestilence",
    "pit",
    "plague",
    "philistine",
    "philistines",
    "pollutions",
    "quick and the dead",
    "salute",
    "sidon",
    "sin unto death",
    "slaying",
    "slay",
    "slew",
    "smite",
    "spoiler",
    "syria",
    "sword",
    "tyre",
    "use lightness",
    "vengeance",
    "vomit",
    "war",
    "whore",
    "wicked",
    "wickedness",
    "wife",
    "wives",
    "woe",
    "worse",
    "yea yea",
    "yokefellow",
    "zoan",
    "wrath",
]


PREFIX_KEYWORDS = {
    "believ",
    "forgiv",
    "redeem",
    "sav",
}


IMPORTANT_REFERENCES = {
    "Genesis 1:1",
    "Genesis 1:3",
    "Genesis 22:14",
    "Exodus 14:14",
    "Exodus 15:2",
    "Exodus 33:14",
    "Deuteronomy 31:6",
    "Joshua 1:8",
    "Joshua 1:9",
    "Ruth 2:12",
    "1 Samuel 2:2",
    "2 Samuel 22:31",
    "1 Chronicles 16:11",
    "1 Chronicles 16:34",
    "2 Chronicles 7:14",
    "Nehemiah 8:10",
    "Job 19:25",
    "Psalm 1:1",
    "Psalm 4:8",
    "Psalm 16:11",
    "Psalm 18:2",
    "Psalm 23:1",
    "Psalm 23:4",
    "Psalm 27:1",
    "Psalm 27:14",
    "Psalm 34:4",
    "Psalm 34:8",
    "Psalm 37:4",
    "Psalm 37:5",
    "Psalm 46:1",
    "Psalm 51:10",
    "Psalm 55:22",
    "Psalm 73:26",
    "Psalm 84:11",
    "Psalm 91:1",
    "Psalm 100:5",
    "Psalm 103:8",
    "Psalm 107:1",
    "Psalm 118:24",
    "Psalm 119:105",
    "Psalm 121:1",
    "Psalm 121:2",
    "Psalm 139:14",
    "Psalm 145:18",
    "Psalm 147:3",
    "Proverbs 3:5",
    "Proverbs 3:6",
    "Proverbs 16:3",
    "Proverbs 18:10",
    "Proverbs 30:5",
    "Ecclesiastes 3:11",
    "Isaiah 26:3",
    "Isaiah 40:29",
    "Isaiah 40:31",
    "Isaiah 41:10",
    "Isaiah 43:2",
    "Isaiah 53:5",
    "Isaiah 54:10",
    "Isaiah 55:6",
    "Isaiah 55:11",
    "Isaiah 58:11",
    "Isaiah 61:1",
    "Jeremiah 29:11",
    "Jeremiah 31:3",
    "Jeremiah 33:3",
    "Lamentations 3:22",
    "Lamentations 3:23",
    "Ezekiel 36:26",
    "Daniel 3:17",
    "Daniel 6:26",
    "Joel 2:13",
    "Micah 6:8",
    "Micah 7:18",
    "Nahum 1:7",
    "Habakkuk 3:18",
    "Zephaniah 3:17",
    "Zechariah 4:6",
    "Matthew 5:4",
    "Matthew 5:6",
    "Matthew 6:33",
    "Matthew 7:7",
    "Matthew 11:28",
    "Matthew 11:29",
    "Matthew 19:26",
    "Matthew 28:20",
    "Mark 9:23",
    "Mark 10:27",
    "Luke 1:37",
    "Luke 6:36",
    "Luke 11:9",
    "Luke 12:32",
    "Luke 18:27",
    "John 1:12",
    "John 3:16",
    "John 6:35",
    "John 8:12",
    "John 10:10",
    "John 10:28",
    "John 11:25",
    "John 14:1",
    "John 14:6",
    "John 14:27",
    "John 15:5",
    "John 15:9",
    "John 16:33",
    "Acts 4:12",
    "Acts 16:31",
    "Acts 20:32",
    "Romans 1:17",
    "Romans 3:24",
    "Romans 5:1",
    "Romans 5:5",
    "Romans 5:8",
    "Romans 6:23",
    "Romans 8:1",
    "Romans 8:18",
    "Romans 8:28",
    "Romans 8:31",
    "Romans 8:37",
    "Romans 8:39",
    "Romans 10:9",
    "Romans 10:13",
    "Romans 12:12",
    "Romans 15:13",
    "1 Corinthians 2:9",
    "1 Corinthians 10:13",
    "1 Corinthians 13:13",
    "1 Corinthians 15:57",
    "2 Corinthians 1:3",
    "2 Corinthians 1:4",
    "2 Corinthians 4:16",
    "2 Corinthians 4:17",
    "2 Corinthians 5:17",
    "2 Corinthians 5:21",
    "2 Corinthians 9:8",
    "2 Corinthians 12:9",
    "Galatians 2:20",
    "Galatians 5:1",
    "Galatians 5:22",
    "Ephesians 1:7",
    "Ephesians 2:8",
    "Ephesians 2:10",
    "Ephesians 3:17",
    "Ephesians 3:20",
    "Ephesians 4:32",
    "Ephesians 6:10",
    "Philippians 1:6",
    "Philippians 2:13",
    "Philippians 3:14",
    "Philippians 4:4",
    "Philippians 4:6",
    "Philippians 4:7",
    "Philippians 4:13",
    "Philippians 4:19",
    "Colossians 1:13",
    "Colossians 1:14",
    "Colossians 3:2",
    "Colossians 3:15",
    "1 Thessalonians 5:16",
    "1 Thessalonians 5:17",
    "1 Thessalonians 5:18",
    "1 Thessalonians 5:24",
    "2 Thessalonians 3:3",
    "1 Timothy 1:15",
    "1 Timothy 2:5",
    "2 Timothy 1:7",
    "2 Timothy 1:12",
    "2 Timothy 2:13",
    "2 Timothy 4:7",
    "Titus 2:13",
    "Titus 3:5",
    "Hebrews 4:16",
    "Hebrews 6:19",
    "Hebrews 10:23",
    "Hebrews 11:1",
    "Hebrews 12:1",
    "Hebrews 12:2",
    "Hebrews 13:5",
    "Hebrews 13:8",
    "James 1:5",
    "James 1:17",
    "James 4:8",
    "1 Peter 1:3",
    "1 Peter 2:9",
    "1 Peter 5:7",
    "1 Peter 5:10",
    "2 Peter 1:3",
    "1 John 1:9",
    "1 John 3:1",
    "1 John 4:4",
    "1 John 4:9",
    "1 John 4:10",
    "1 John 4:19",
    "1 John 5:4",
    "Jude 1:24",
    "Revelation 21:4",
    "Revelation 22:17",
}


THEME_LINES = {
    "love": {
        "first": [
            "Christian, God's love for you is not fragile, temporary, or dependent on the mood of this day.",
            "Christian, the love of the Lord is a steady place for your heart to stand.",
            "Christian, you are not forgotten in the care of a distant God; you are loved by the Lord who sees you.",
            "Christian, let the love of God speak louder than the fear that tries to define your day.",
            "Christian, the affection of God toward His people is deeper than the trouble in front of you.",
            "Christian, your soul can rest in the love that God has already made known.",
            "Christian, the Lord's love is not measuring you by your weakest moment.",
            "Christian, the kindness of God reaches into ordinary days as surely as into urgent ones.",
        ],
        "middle": [
            "His care is not thin or reluctant; it is faithful, patient, and stronger than the burden you are carrying.",
            "He has set His heart on His people with a faithfulness that does not loosen when life feels uncertain.",
            "Nothing about your weakness surprises Him, and nothing about your need exhausts His compassion.",
            "The Lord does not love from a distance; He draws near with mercy, truth, and saving grace.",
            "You do not have to earn His attention before you bring Him the weight on your heart.",
            "His love has already moved toward you with purpose, mercy, and promise.",
            "The day may shift beneath your feet, but His covenant kindness remains firm.",
            "He knows how to hold both your faith and your frailty in His gracious hand.",
        ],
        "last": [
            "Walk forward as someone deeply loved, not as someone trying to earn a place in His kindness.",
            "Let that love steady your thoughts and give your obedience a quieter, stronger joy.",
            "You may come to Him honestly, knowing His welcome is rooted in His character.",
            "Receive this day as a place where His faithful care can meet you again.",
            "Your life is safer in His love than it feels in your own control.",
            "Let your heart breathe under the truth that God has not turned away from you.",
            "He is able to make His love the anchor beneath every step you take.",
            "The Lord who loves you is faithful enough for this moment too.",
        ],
    },
    "mercy": {
        "first": [
            "Christian, the mercy of God has not run out before you reached this day.",
            "Christian, the Lord is not harsh toward those who come to Him in need.",
            "Christian, mercy is not a rare exception in God's heart; it is part of His faithful way with His people.",
            "Christian, the compassion of the Lord is able to meet you in the very place you feel worn down.",
            "Christian, you may come before God with honesty because His mercy is greater than your need.",
            "Christian, the Lord's tender care reaches farther than your failure and deeper than your fear.",
            "Christian, mercy means you are not left to carry yesterday as though grace were unavailable today.",
            "Christian, the goodness of God is not exhausted by the weakness you bring to Him.",
        ],
        "middle": [
            "He knows how to restore the weary, pardon the repentant, and comfort the troubled.",
            "His compassion is not confused by your pain, and His patience is not shortened by your struggle.",
            "The Lord delights to show kindness where human strength has reached its edge.",
            "He can meet your confession with cleansing and your sorrow with hope.",
            "The mercy that has carried God's people for generations is sufficient for the weight you are holding.",
            "He sees the whole story and still invites you to draw near.",
            "His grace does not ask you to pretend you are unhurt before He comforts you.",
            "The Lord can turn a humbled heart into a place of renewed praise.",
        ],
        "last": [
            "Let His mercy lift your eyes and teach your heart to hope again.",
            "You are not beyond His reach, and this day is not beyond His kindness.",
            "Come to Him with the truth, and trust Him to answer with grace.",
            "The Lord who is merciful is also strong enough to renew you.",
            "Rest in the compassion that does not fail when you feel fragile.",
            "His mercy gives you room to rise and follow Him again.",
            "Let repentance and hope stand together under the care of your faithful God.",
            "The Lord's mercy is a safe place for a weary soul to begin again.",
        ],
    },
    "grace": {
        "first": [
            "Christian, grace means your standing with God is not built on your ability to perform perfectly today.",
            "Christian, the Lord has not invited you into a life where forgiveness is always out of reach.",
            "Christian, God's grace is stronger than the accusations that try to keep your heart low.",
            "Christian, you can breathe under the kindness of God because He knows how to cleanse and restore.",
            "Christian, the grace of God does not merely cover your past; it teaches your heart to walk forward.",
            "Christian, the mercy shown to you in Christ is enough for the places where you feel unworthy.",
            "Christian, forgiveness is not a small word when it comes from the God who saves.",
            "Christian, you do not have to hide from the Lord who gives grace to the needy.",
        ],
        "middle": [
            "He receives the repentant with truth, not denial, and with mercy, not despair.",
            "The work of God is able to cleanse what shame keeps rehearsing.",
            "His righteousness is a better foundation than your best day and a stronger hope than your worst one.",
            "The Lord can teach you to rise without pretending the fall did not matter.",
            "Grace does not make sin light; it makes the Saviour precious and the path of return open.",
            "God is able to make obedience grow from gratitude instead of fear.",
            "The Lord meets confession with faithfulness and gives weary hearts a clean beginning.",
            "Your need is not greater than the kindness He has revealed in the gospel.",
        ],
        "last": [
            "Let grace move you toward Him instead of letting shame drive you away.",
            "Today can be lived from acceptance in Christ, not from panic to prove yourself.",
            "The Lord who forgives also strengthens, teaches, and keeps His people.",
            "Stand again in the mercy that makes a new walk possible.",
            "Christ is a sure refuge for sinners who come to Him in faith.",
            "Receive the gift of grace with humble joy and keep following the Lord.",
            "Your hope is not in flawless strength but in a faithful Redeemer.",
            "The grace that saved you is able to sustain you in this very hour.",
        ],
    },
    "peace": {
        "first": [
            "Christian, the peace of God can hold your heart even before every question has an answer.",
            "Christian, the Lord is able to give rest in places where the world only gives noise.",
            "Christian, your anxious thoughts do not have to rule the whole room of your heart.",
            "Christian, God's peace is not fragile enough to disappear when circumstances remain unfinished.",
            "Christian, the Lord knows how to quiet His people without ignoring what they face.",
            "Christian, rest is not far from you when the Lord Himself is near.",
            "Christian, the peace Christ gives is deeper than the relief that comes from changed circumstances.",
            "Christian, the God who keeps His promises can also keep your heart.",
        ],
        "middle": [
            "He guards what you cannot guard and steadies what you cannot steady by yourself.",
            "The Lord can bring calm to your thoughts while He continues His work around you.",
            "You may bring Him the trouble plainly and receive His care patiently.",
            "His presence makes room for trust even when the path still feels narrow.",
            "The same God who rules the day can settle the soul that looks to Him.",
            "Peace from God does not deny the storm; it holds you while the storm passes.",
            "He can make your heart quiet enough to obey, pray, and endure.",
            "The Lord gives a rest that is not dependent on your ability to solve everything.",
        ],
        "last": [
            "Let His peace stand guard where worry has been standing watch.",
            "You can move through this day held by a calm that comes from Him.",
            "Bring the burden to the Lord and let your heart learn His rest again.",
            "The God of peace is faithful in both the waiting and the answer.",
            "You do not have to carry the whole future to walk faithfully in this moment.",
            "Let Christ's peace have the final word over the noise within you.",
            "Your soul is safest when it rests under the care of the Lord.",
            "Receive His peace as a gift, and take the next step with Him.",
        ],
    },
    "strength": {
        "first": [
            "Christian, your weakness is not the end of the story when the Lord is your strength.",
            "Christian, God is able to uphold you where your own resolve feels thin.",
            "Christian, the Lord does not ask you to face this day as though His help were unavailable.",
            "Christian, strength from God often meets us right where human strength has failed.",
            "Christian, the hand of the Lord is steadier than the pressure leaning against you.",
            "Christian, you can take the next faithful step without pretending you feel strong.",
            "Christian, the Lord is a refuge for the heart that knows it cannot stand alone.",
            "Christian, God has not left you to fight fear, weariness, or temptation in your own power.",
        ],
        "middle": [
            "His help is not imaginary comfort; it is the faithfulness of the One who holds His people.",
            "He knows how to sustain tired hands, strengthen trembling hearts, and guide uncertain steps.",
            "The burden may be real, but it is not stronger than the God who carries you.",
            "He can give courage for obedience and endurance for the work still before you.",
            "The Lord is not ashamed to be the strength of those who call upon Him.",
            "His power is not diminished by the size of what you are facing.",
            "When you have little to offer, His sufficiency becomes especially precious.",
            "God can steady the inner life even when the outer pressures remain heavy.",
        ],
        "last": [
            "Lean on Him today, and let His strength become enough for this step.",
            "You are held by a Helper who does not grow weary.",
            "Move forward with humble courage, trusting the Lord to sustain you.",
            "The God who strengthens His people is present in this moment too.",
            "Let dependence become courage rather than shame.",
            "Your weakness can become a place where His faithfulness is clearly seen.",
            "The Lord will not fail to be enough for what He calls you to do.",
            "Take heart; God is able to keep you standing.",
        ],
    },
    "hope": {
        "first": [
            "Christian, hope in God is not wishful thinking; it is confidence in the One who cannot lie.",
            "Christian, the Lord is still writing faithfulness into the parts of life that feel unfinished.",
            "Christian, your waiting is not wasted when it is held before the God of promise.",
            "Christian, hope has a firm place to stand because the Lord remains faithful.",
            "Christian, the future is not held by fear but by the God who keeps His word.",
            "Christian, the Lord can plant expectation in a heart that has grown tired.",
            "Christian, the promises of God are stronger than the delays that test your patience.",
            "Christian, you may lift your eyes because God has not surrendered your story to despair.",
        ],
        "middle": [
            "He sees beyond the present pressure and knows how to bring His purposes to pass.",
            "The Lord has never needed perfect circumstances to accomplish faithful work.",
            "Waiting may feel slow, but God is not careless with the hearts that trust Him.",
            "His promises give your soul something steadier than the mood of the moment.",
            "The same Lord who has carried you before can sustain you while you wait.",
            "Hope grows as your heart remembers who God is, not merely what you can see.",
            "The Lord's timing may stretch you, but His faithfulness will not abandon you.",
            "He knows how to turn endurance into testimony and sorrow into praise.",
        ],
        "last": [
            "Let hope rise again under the weight of His unchanging word.",
            "You can wait with trust because your God is not late, weak, or forgetful.",
            "Hold fast to Him; His promises are worthy of your confidence.",
            "The Lord is faithful in the middle, not only at the end.",
            "Today can be lived with expectation because God is still good.",
            "Do not let the delay erase what the Lord has spoken.",
            "Your hope is anchored in God Himself, and He will not fail.",
            "Look to Him again, and let His promise steady your heart.",
        ],
    },
    "faith": {
        "first": [
            "Christian, faith is able to rest where sight cannot yet reach.",
            "Christian, trusting God does not require you to understand every turn in the road.",
            "Christian, the Lord is worthy of your confidence even when the path is not fully clear.",
            "Christian, belief in God's word gives your heart a firmer place to stand than fear can offer.",
            "Christian, you can trust the Lord with more than the parts of life you can manage.",
            "Christian, faith does not make you fearless by pretending; it teaches you where to place your fear.",
            "Christian, the God who has spoken is faithful enough to be trusted today.",
            "Christian, your confidence can rest in the Lord rather than in the steadiness of your circumstances.",
        ],
        "middle": [
            "He knows the road ahead and has never been confused by what surprises you.",
            "The Lord receives the honest trust of those who come to Him with trembling hands.",
            "His word gives direction when feelings rise and fall.",
            "Faith looks to the character of God and finds Him true again.",
            "You do not have to carry tomorrow before you obey the Lord today.",
            "The promise of God can hold you while the visible answer is still forming.",
            "He is faithful in hidden work as surely as in visible rescue.",
            "Trust grows as your heart remembers His past faithfulness and present grace.",
        ],
        "last": [
            "Take the next step in faith, knowing the Lord walks before you.",
            "Let His truth be stronger in you than the uncertainty around you.",
            "You are not foolish to trust the God who has never failed.",
            "Rest your confidence in Him and keep walking with a quiet heart.",
            "The Lord is able to guide what you surrender to Him.",
            "Faith can breathe today because God is faithful today.",
            "Place the weight back into His hands and follow where He leads.",
            "Your trust is safest when it is anchored in the Lord Himself.",
        ],
    },
    "guidance": {
        "first": [
            "Christian, the Lord knows how to lead you when the way ahead feels hidden.",
            "Christian, you do not have to invent wisdom from an anxious heart.",
            "Christian, God's word can give light for the step in front of you.",
            "Christian, the Lord is able to direct paths that feel too tangled for you to untangle.",
            "Christian, guidance from God is a mercy for people who know they need Him.",
            "Christian, the Shepherd does not lose sight of His sheep on uncertain roads.",
            "Christian, the Lord can teach you to walk in truth one faithful step at a time.",
            "Christian, the path may feel narrow, but the Lord is not unsure of the way.",
        ],
        "middle": [
            "He gives counsel through His word, steadiness through prayer, and wisdom for obedience.",
            "The Lord is not limited by your confusion; He can make duty plain and courage possible.",
            "You may ask for direction without shame because dependence is part of faithful walking.",
            "His light may not show the whole road, but it is enough for the next obedient step.",
            "The God who commands also helps His people understand where to place their feet.",
            "He can quiet the rush inside you long enough for wisdom to take root.",
            "The Lord leads with truth, patience, and care for your soul.",
            "He is able to make His way clearer as you keep your heart near Him.",
        ],
        "last": [
            "Follow the light He gives today, and trust Him with what remains unseen.",
            "Your steps are not abandoned when they are surrendered to Him.",
            "Let His word be a lamp, not merely an idea.",
            "The Lord can guide both your decisions and the spirit in which you make them.",
            "Walk humbly with Him, and receive the mercy of His direction.",
            "He is faithful to lead those who seek Him.",
            "You can move without panic because God is not lost.",
            "Trust the Guide who sees the whole way.",
        ],
    },
    "wisdom": {
        "first": [
            "Christian, wisdom from God is a gift for the ordinary decisions and the heavy ones.",
            "Christian, the Lord does not leave His people without truth for the mind and light for the heart.",
            "Christian, God's word is able to shape your thoughts when the world pulls them in every direction.",
            "Christian, you can seek wisdom from the Lord without pretending you already know enough.",
            "Christian, truth is a kindness from God, not a burden meant to crush you.",
            "Christian, the counsel of the Lord is steadier than every anxious opinion competing for your attention.",
            "Christian, God can make your heart teachable without making you afraid.",
            "Christian, the fear of the Lord leads the soul toward life, clarity, and peace.",
        ],
        "middle": [
            "He teaches with patience and calls you into paths that preserve the soul.",
            "His instruction can correct, comfort, and strengthen you at the same time.",
            "The Lord's truth is not outdated by your circumstances or weakened by your questions.",
            "You may bring Him confusion and receive the humility to learn what is good.",
            "Wisdom grows as the heart listens to God more deeply than to panic.",
            "His word can become a settled center when everything else feels loud.",
            "The Lord gives understanding that serves love, obedience, and endurance.",
            "He can train your desires until the good path becomes beautiful to you.",
        ],
        "last": [
            "Let His wisdom order your steps and quiet your spirit today.",
            "A teachable heart is safe in the hands of a faithful God.",
            "Receive His truth as light for your way and strength for your obedience.",
            "The Lord is generous to those who seek Him for wisdom.",
            "Let the word of God become the place where your thoughts are steadied.",
            "Walk in the counsel that leads to life.",
            "God's wisdom will not waste the soul that listens.",
            "Trust His truth to form both your choices and your courage.",
        ],
    },
    "prayer": {
        "first": [
            "Christian, prayer is not a last resort; it is a real invitation into the care of God.",
            "Christian, the Lord hears more faithfully than you can explain yourself.",
            "Christian, you may call upon God with the whole weight of what is on your heart.",
            "Christian, the door of prayer is open because the Lord is merciful and near.",
            "Christian, God is not bothered by the need you bring to Him today.",
            "Christian, the Father receives the cries of His people with wisdom and compassion.",
            "Christian, you can bring both thanksgiving and trouble into the presence of God.",
            "Christian, the Lord knows how to answer, strengthen, and keep those who seek Him.",
        ],
        "middle": [
            "He does not require polished words before He gives faithful attention.",
            "The act of calling on Him is already a confession that you are not alone.",
            "He can meet your request with provision, patience, correction, or comfort as He knows best.",
            "Prayer places the burden where it belongs, in hands wiser and stronger than yours.",
            "The Lord is able to hear the sigh beneath the sentence.",
            "He welcomes the needy heart and teaches it to trust Him more deeply.",
            "You do not have to carry silently what God invites you to bring openly.",
            "The Lord's answer may take shape in ways you did not expect, but His care is faithful.",
        ],
        "last": [
            "Come to Him again, and let prayer become a place of peace.",
            "Your voice is not lost when it rises before the Lord.",
            "Ask, seek, and trust the Father who knows how to give what is good.",
            "Let your need draw you nearer instead of driving you inward.",
            "The Lord who hears is worthy of your honest prayer.",
            "Bring the burden to Him and leave room for His wisdom.",
            "Prayer can steady your heart while God works in His time.",
            "The God who listens is present with you now.",
        ],
    },
    "joy": {
        "first": [
            "Christian, joy in the Lord is not limited to easy days.",
            "Christian, the goodness of God gives your heart a song deeper than circumstances.",
            "Christian, rejoicing is possible because the Lord remains worthy in every season.",
            "Christian, gladness can rise again where the soul remembers the faithfulness of God.",
            "Christian, the Lord can teach your heart to delight in Him even while you wait.",
            "Christian, blessing from God is not measured only by what feels comfortable today.",
            "Christian, praise can lift your eyes without pretending your burdens are small.",
            "Christian, the joy God gives can become strength for the work in front of you.",
        ],
        "middle": [
            "He has given you reasons to bless His name that trouble cannot erase.",
            "The Lord's kindness can reach the inner life and awaken gratitude again.",
            "Joy grows when the heart looks past the gift and sees the Giver.",
            "God is able to mingle tears and praise until hope begins to breathe.",
            "The Lord has not stopped being good because the day is difficult.",
            "Praise turns the soul toward the One who is still faithful.",
            "There is grace in remembering what God has done and who He is.",
            "The Lord can make thanksgiving a pathway back to peace.",
        ],
        "last": [
            "Let His goodness give your heart a steady gladness today.",
            "You can rejoice in Him while trusting Him with what remains unresolved.",
            "Lift your heart toward the Lord, and let praise strengthen you.",
            "The joy of the Lord is a real mercy for weary people.",
            "Receive this day as another place to remember His goodness.",
            "Praise Him with the faith you have, and let joy grow there.",
            "The Lord is still worthy, still near, and still good.",
            "Let gratitude become a quiet act of faith.",
        ],
    },
    "salvation": {
        "first": [
            "Christian, salvation is the surest proof that God has dealt kindly with your soul.",
            "Christian, the Lord has not left you to rescue yourself from what only He can redeem.",
            "Christian, the saving work of God is stronger than the guilt, fear, and death Christ overcame.",
            "Christian, you can rest in the God who saves rather than in your own ability to secure yourself.",
            "Christian, redemption means your life is not owned by the darkness that once accused you.",
            "Christian, the Lord's salvation is not fragile; it is mighty, merciful, and complete.",
            "Christian, God has made a way of rescue that your weakness could never have opened.",
            "Christian, the good news of salvation is strong enough to comfort you in ordinary trouble too.",
        ],
        "middle": [
            "He has moved toward sinners with mercy and accomplished what human effort could not.",
            "The Saviour is not partial help; He is sufficient for the whole need of your soul.",
            "God's deliverance gives you a new name, a new hope, and a new future.",
            "The Lord who saves can also keep, guide, and strengthen His redeemed people.",
            "You are not trying to build your own way home; Christ is the way God has given.",
            "Salvation turns fear into worship because the Lord has done great things.",
            "The mercy that rescued you is able to sustain you today.",
            "God's saving grace reaches deeper than shame and stands higher than accusation.",
        ],
        "last": [
            "Let the joy of being redeemed steady your heart today.",
            "Your hope is secure in the Lord who saves.",
            "Walk as one who has been rescued by grace and kept by power.",
            "The Saviour who received you is faithful to carry you.",
            "You can face this day with the peace of a soul held by God.",
            "Let salvation become the song beneath your obedience.",
            "The Lord has not saved you halfway; trust Him fully.",
            "Rest in the mercy that has already brought you near.",
        ],
    },
    "christ": {
        "first": [
            "Christian, Christ is not merely part of your hope; He is the center of it.",
            "Christian, Jesus is sufficient for the need beneath every need you feel today.",
            "Christian, the Son of God has not dealt with you from a distance but has come near in saving mercy.",
            "Christian, your heart can look to Christ when every lesser comfort feels thin.",
            "Christian, the Lord Jesus is faithful enough to hold both your salvation and your day.",
            "Christian, the grace revealed in Christ is stronger than the fear pressing on your heart.",
            "Christian, Jesus gives a hope that is not built on changing circumstances.",
            "Christian, the Saviour knows how to meet weary souls with truth and tenderness.",
        ],
        "middle": [
            "He is the faithful Redeemer, the living Lord, and the sure foundation beneath your feet.",
            "In Him, God has shown mercy that reaches sinners and power that conquers death.",
            "Christ does not offer temporary comfort only; He gives Himself to His people.",
            "The Lord who called you is also able to keep you near.",
            "His words are life, His work is finished, and His presence is enough.",
            "You do not have to search for another foundation when Christ has already been given.",
            "He is gentle with the weary and mighty for the helpless.",
            "The Saviour's faithfulness is not weakened by the instability around you.",
        ],
        "last": [
            "Look to Him again, and let your hope settle where it cannot be shaken.",
            "Your soul is safe when Christ is its refuge.",
            "Walk today with your eyes fixed on the One who loved you and gave Himself for you.",
            "Let Jesus be the peace, strength, and confidence of this day.",
            "He is worthy of your trust and able to carry your heart.",
            "Christ is enough for the next step as surely as for eternity.",
            "Rest in the Saviour who knows you and keeps you.",
            "The Lord Jesus remains faithful, and that is strong ground for your heart.",
        ],
    },
    "presence": {
        "first": [
            "Christian, you are not walking through this day without the presence of the Lord.",
            "Christian, God is near enough to sustain what feels too heavy to carry alone.",
            "Christian, the Lord's presence is better than the illusion of having everything under control.",
            "Christian, you do not have to be fearless to be held by a faithful God.",
            "Christian, the Lord is with His people in valleys as surely as on clear paths.",
            "Christian, nearness to God is a mercy that can steady the most unsettled heart.",
            "Christian, God has not asked you to walk where His care cannot reach.",
            "Christian, the presence of the Lord gives courage for the step you could not take alone.",
        ],
        "middle": [
            "He sees what you face and remains faithful in the hidden places of the day.",
            "His nearness does not make every road easy, but it makes every road held.",
            "The Lord can be your companion, refuge, and strength in the same moment.",
            "You may feel small, but you are not unseen or unsupported.",
            "His presence brings courage that does not depend on perfect circumstances.",
            "God is able to make His nearness more real to you than the fear around you.",
            "He walks with His people through what they would never choose to face alone.",
            "The Lord's faithful presence is a stronger fact than your loneliness feels.",
        ],
        "last": [
            "Take heart, because the Lord is with you here.",
            "You can move forward knowing you are accompanied by faithful love.",
            "Let His nearness quiet the fear that says you have been abandoned.",
            "The God who is with you is enough for this moment.",
            "Rest in the promise that you are seen, known, and kept.",
            "You are not alone, and you are not outside His care.",
            "Let His presence become courage in you today.",
            "Walk with Him, and trust Him to keep you.",
        ],
    },
    "provision": {
        "first": [
            "Christian, the Lord knows what you need before you can arrange it for yourself.",
            "Christian, God's provision is not limited by the narrowness you can see.",
            "Christian, the Shepherd of your soul is not careless with the needs of His sheep.",
            "Christian, you may bring your daily needs to the Lord without shame.",
            "Christian, God is able to supply what He calls you to trust Him for.",
            "Christian, the Lord's care reaches both the soul and the ordinary needs of the day.",
            "Christian, your lack is not hidden from the God who gives with wisdom.",
            "Christian, the Lord can provide in ways that teach your heart to trust Him more deeply.",
        ],
        "middle": [
            "He gives enough for obedience, enough for endurance, and enough grace to keep seeking Him.",
            "The Father is not confused by your limitations or surprised by your dependence.",
            "His provision may come with simplicity, but it comes from faithful hands.",
            "The Lord knows how to feed, guide, and sustain His people.",
            "You do not have to panic over needs that are already known to God.",
            "He can turn scarcity into a place where trust becomes clear.",
            "The Lord is generous without being wasteful and wise without being distant.",
            "He provides not only resources, but also patience, counsel, and strength.",
        ],
        "last": [
            "Ask Him for what you need and trust Him with how He gives.",
            "The Shepherd who leads you will not forget you today.",
            "Let dependence become worship instead of fear.",
            "The Lord is faithful in daily bread and eternal hope.",
            "You can rest under the care of the God who knows.",
            "His provision is enough for the path He gives.",
            "Receive today's mercy and keep walking with Him.",
            "God's faithful care is a better refuge than anxious control.",
        ],
    },
    "renewal": {
        "first": [
            "Christian, God is able to renew what weariness has made dull in your heart.",
            "Christian, the Lord can restore places in you that feel bruised, dry, or tired.",
            "Christian, renewal is possible because God is not finished with His work in you.",
            "Christian, the Lord can breathe fresh life into obedience that has grown heavy.",
            "Christian, your soul is not beyond the restoring care of God.",
            "Christian, the One who makes all things new can begin with the hidden places of your heart.",
            "Christian, healing from the Lord can reach wounds you have learned to carry quietly.",
            "Christian, God can revive faith where discouragement has tried to settle in.",
        ],
        "middle": [
            "He knows how to cleanse, strengthen, and awaken love for Him again.",
            "The Lord does not despise the faint ember; He can tend it with mercy.",
            "His Spirit can renew your mind and reorient your desires toward life.",
            "Restoration may be gradual, but the hand doing the work is faithful.",
            "The Lord can bring beauty where shame expected only ruin.",
            "He can make repentance hopeful and obedience alive again.",
            "God is gentle enough to heal and strong enough to transform.",
            "The same grace that began the work can continue it today.",
        ],
        "last": [
            "Bring Him the tired places and trust Him to restore your soul.",
            "This day can become a beginning under His renewing mercy.",
            "Let the Lord make your heart willing, clean, and steady again.",
            "You are not stuck beyond the reach of His grace.",
            "Hope again in the God who restores.",
            "His renewing work is patient, holy, and full of mercy.",
            "Let Him revive what discouragement tried to silence.",
            "The Lord can make your inner life fruitful again.",
        ],
    },
    "perseverance": {
        "first": [
            "Christian, endurance is possible because the Lord is faithful while you keep walking.",
            "Christian, you do not have to finish the whole race in today's strength.",
            "Christian, the Lord can keep you steady when obedience feels costly.",
            "Christian, perseverance is not proof that you are never tired; it is grace helping you continue.",
            "Christian, God is able to hold you fast through pressure, delay, and trial.",
            "Christian, the path of faith may be difficult, but it is not empty of God's help.",
            "Christian, you can stand because the Lord stands with His people.",
            "Christian, the work before you may be heavy, but the faithfulness beneath you is stronger.",
        ],
        "middle": [
            "He gives strength for today, hope for tomorrow, and mercy when your steps feel slow.",
            "The Lord sees faithful endurance that others may never notice.",
            "Trials do not cancel His promises; they become places where His keeping power is known.",
            "You may feel pressed, but you are not abandoned to the pressure.",
            "God can make patience holy instead of hopeless.",
            "The Lord knows how to preserve His people until the work is complete.",
            "Faithfulness grows by returning to Him again and again.",
            "He can turn endurance into deeper trust and quieter courage.",
        ],
        "last": [
            "Keep going with your eyes on the Lord who keeps you.",
            "Take today's step, and leave the full distance in God's hands.",
            "The Lord is able to strengthen you to remain faithful.",
            "Your labor in Him is not forgotten.",
            "Do not despise the small obedient step.",
            "He will give grace for the road He calls you to walk.",
            "Stand firm in the mercy that sustains you.",
            "The faithful God is with you in the continuing.",
        ],
    },
    "eternal_life": {
        "first": [
            "Christian, eternal life gives your heart a horizon wider than today's trouble.",
            "Christian, the promises of God reach farther than the limits of this present life.",
            "Christian, heaven is not a vague comfort but a sure hope held by the living God.",
            "Christian, the life God gives is stronger than death and brighter than the shadows around you.",
            "Christian, your future in the Lord is not fragile or uncertain.",
            "Christian, the kingdom of God gives meaning to faithfulness in hidden places.",
            "Christian, everlasting hope can steady you when earthly hopes feel unstable.",
            "Christian, the Lord has set before His people a joy that cannot decay.",
        ],
        "middle": [
            "He has prepared promises that suffering cannot cancel and time cannot wear down.",
            "The present moment matters, but it is not the whole of your story.",
            "Christ has opened a hope that reaches beyond loss, fear, and death.",
            "Your life is held by God for more than what you can see now.",
            "The Lord's eternal promise gives courage for temporary pain.",
            "Hope becomes strong when it remembers the inheritance God keeps.",
            "The future God has promised can put today's weight into truer proportion.",
            "Eternal life is not merely later; it begins now in knowing the Lord.",
        ],
        "last": [
            "Let that hope lift your eyes and strengthen your faithfulness today.",
            "You can endure the temporary because the Lord has promised what lasts.",
            "Your hope is kept by God, and He does not fail.",
            "Live today in the light of the life Christ gives.",
            "The final word over your story belongs to the Lord.",
            "Let eternity make courage rise in the present.",
            "Hold fast to the promise that cannot fade.",
            "The life God gives is worth trusting Him for today.",
        ],
    },
    "identity": {
        "first": [
            "Christian, your identity is not defined by the loudest accusation or the weakest moment.",
            "Christian, God has named His people with grace that goes deeper than circumstance.",
            "Christian, belonging to the Lord gives your soul a security the world cannot supply.",
            "Christian, you are not merely trying to become accepted; in Christ you are brought near by grace.",
            "Christian, the Lord's claim upon you is stronger than the labels fear tries to place on you.",
            "Christian, God knows His own and does not misplace them in seasons of struggle.",
            "Christian, your life has dignity because the Lord has set His mercy upon you.",
            "Christian, the calling of God gives you a truer name than failure can give.",
        ],
        "middle": [
            "He forms His people with patience, holiness, and steadfast love.",
            "Your worth is not created by applause and is not destroyed by weakness.",
            "The Lord gathers His people to Himself and teaches them to walk as His own.",
            "Grace gives you a place to stand while God continues His work within you.",
            "You can resist shame by remembering the mercy that has made you His.",
            "The Father is not confused about the children He has received.",
            "Your life is hidden with hope, purpose, and the faithful care of God.",
            "He calls you to holiness from belonging, not from rejection.",
        ],
        "last": [
            "Walk today as someone known, loved, and kept by the Lord.",
            "Let His word about you speak louder than fear's verdict.",
            "You belong to God, and that truth can steady your heart.",
            "Receive the grace of being His and follow Him with courage.",
            "Your name is safest in the hands of the One who redeemed you.",
            "Live from the mercy that has brought you near.",
            "The Lord who calls you His is faithful to shape you.",
            "Rest in the identity grace has given you.",
        ],
    },
    "praise": {
        "first": [
            "Christian, praise turns your heart toward the Lord who remains good in every season.",
            "Christian, thanksgiving is a holy way to remember that God is still faithful.",
            "Christian, the Lord is worthy of praise before the answer arrives and after it comes.",
            "Christian, worship can steady your soul by lifting your eyes to the greatness of God.",
            "Christian, gratitude is not denial of hardship; it is remembrance of God's goodness within it.",
            "Christian, the name of the Lord is worthy to be blessed in ordinary moments too.",
            "Christian, praise can become a lamp when discouragement darkens your thoughts.",
            "Christian, your heart has reason to bless the Lord because His mercy endures.",
        ],
        "middle": [
            "He has carried you with mercies that are often quiet but never small.",
            "When you remember His works, your burdens return to their rightful size.",
            "The Lord's goodness gives your soul language stronger than complaint.",
            "Praise reminds the heart that God is present, powerful, and kind.",
            "You can honor Him with thanksgiving even while you wait for fuller understanding.",
            "The Lord receives the worship of weary people and strengthens them through it.",
            "Gratitude opens the windows of the soul toward grace already given.",
            "The faithfulness of God deserves a place in your thoughts today.",
        ],
        "last": [
            "Bless His name, and let remembrance become courage.",
            "Let praise lift your eyes and settle your heart.",
            "The Lord is good, and His goodness is enough reason to worship.",
            "Give thanks, and let your soul be strengthened by the truth.",
            "Praise Him in the middle, because He is faithful there too.",
            "Let worship become a quiet act of trust.",
            "Remember His mercy and let hope rise again.",
            "The God you praise is the God who keeps you.",
        ],
    },
}


CHRIST_CENTERED_LINES = {
    "love": [
        "The clearest proof of that love is Jesus Christ, who gave Himself so sinners could be brought near to God.",
        "Look to Christ and see that God's love is not an idea only, but mercy revealed in the Saviour.",
        "At the cross, Jesus showed that the love of God reaches farther than shame, fear, or loneliness.",
        "Christ has made the Father's heart known, and in Him you can see love that acts, saves, and keeps.",
        "The Lord Jesus is the living assurance that you are not being loved from a distance.",
        "Because Christ came for His people, you can receive this love as something proven, not something guessed.",
    ],
    "mercy": [
        "Jesus is the place where mercy becomes visible, because He receives sinners and restores weary souls.",
        "At the cross, Christ carried guilt so mercy could meet you with truth and hope.",
        "The compassion of God is seen most clearly in the Saviour who draws near to the broken.",
        "Christ does not turn away the humbled heart; He is gentle, holy, and full of mercy.",
        "The mercy you need today flows from the Lord Jesus, who knows how to forgive and renew.",
        "Come to Christ, because His mercy is strong enough for confession and tender enough for weakness.",
    ],
    "grace": [
        "Grace has a face and a name: Jesus Christ, who saves by His finished work and not by your performance.",
        "Christ has done what you could never do, so your hope can rest in Him instead of in yourself.",
        "The gospel frees you to come honestly, because Jesus has made forgiveness both righteous and real.",
        "At the cross, shame loses its throne because Christ has opened a better word over repentant sinners.",
        "Jesus is not a temporary encouragement; He is the Redeemer whose grace makes new obedience possible.",
        "Your confidence is not in how tightly you hold Him, but in how faithfully Christ holds His own.",
    ],
    "peace": [
        "Christ gives peace that is deeper than circumstances, because He has reconciled you to God.",
        "The peace your heart needs is found in Jesus, who speaks rest to troubled souls and stands over every storm.",
        "Look to Christ, because His finished work gives your soul a calm that worry cannot create.",
        "Jesus does not merely quiet the moment; He brings you near to the Father and guards your heart there.",
        "The Saviour who said peace to His disciples is still able to steady those who belong to Him.",
        "Rest in Christ today, because His presence is stronger than the noise that wants to rule you.",
    ],
    "strength": [
        "Christ is not asking you to be enough without Him; His strength is made precious where yours runs out.",
        "The risen Lord Jesus sustains His people with power that weakness cannot cancel.",
        "Look to Christ, who endured the cross and now strengthens weary hearts to keep walking.",
        "The Saviour who carried your sin is also able to carry you through this day's burden.",
        "Your courage can come from Jesus, whose grace is sufficient when your strength feels small.",
        "Christ stands with His people, and His keeping power is stronger than the pressure against you.",
    ],
    "hope": [
        "Your hope is not floating in the air; it is anchored in the risen Christ.",
        "Because Jesus lives, waiting is not empty and the future is not ruled by fear.",
        "Christ has gone before you through suffering into glory, so your present trouble is not the final word.",
        "The promises of God are sure in Jesus, and He is faithful while you wait.",
        "Look to the risen Saviour, because His empty tomb gives hope a foundation that cannot be shaken.",
        "Christ holds the end of the story, and He is worthy of your hope today.",
    ],
    "faith": [
        "Faith looks away from self and rests on Jesus, the faithful Saviour who cannot fail.",
        "Trust is safest when it is placed in Christ, who is both able to save and faithful to keep.",
        "Jesus is worthy of confidence when feelings rise and fall, because His word remains true.",
        "The Lord Jesus has already proved His faithfulness, so you can trust Him with the unseen road.",
        "Faith does not need to feel impressive when its object is Christ, strong and sufficient.",
        "Put the weight of this day on Jesus, because He is a better foundation than your understanding.",
    ],
    "guidance": [
        "Jesus is the Shepherd who leads His people with truth, patience, and saving care.",
        "Follow Christ, because He is not only the giver of direction but the way itself.",
        "The Lord Jesus guides without confusion, and His voice calls you toward life.",
        "Christ can make the next faithful step clear while keeping your heart near to Him.",
        "The Saviour who knows the whole road is gentle enough to lead you one step at a time.",
        "Let Jesus be your wisdom for the way, because He leads with both holiness and mercy.",
    ],
    "wisdom": [
        "All true wisdom finds its center in Christ, who teaches your heart what life with God looks like.",
        "Jesus is the wisdom of God for confused people, proud people, and weary people alike.",
        "Look to Christ, because He forms not only right choices but a heart that loves what is good.",
        "The words of Jesus can steady your thoughts when every other voice feels loud.",
        "Wisdom is not merely information; it is learning to walk with Christ in truth and humility.",
        "The Saviour teaches His people to choose what leads to life, love, and faithful obedience.",
    ],
    "prayer": [
        "You can pray because Jesus has opened the way to the Father and intercedes for His people.",
        "Christ makes prayer a place of welcome, not distance, because He has brought you near by grace.",
        "Bring your need to the Father through Jesus, trusting the Saviour who understands weakness.",
        "The Lord Jesus hears the cries of His people and carries them with compassion.",
        "Prayer is not lonely speech when Christ Himself is your Mediator and Advocate.",
        "Come in the name of Jesus, because He has made the throne of grace a place of help.",
    ],
    "joy": [
        "Joy becomes deeper when it is rooted in Christ, who remains good when circumstances shift.",
        "Jesus gives a gladness that sorrow cannot fully silence, because He is risen and near.",
        "Rejoice in Christ, not because life is easy, but because He is worthy and faithful.",
        "The Saviour turns praise into strength by reminding your heart that He has overcome.",
        "Look to Jesus, and let His grace give your heart a joy that trouble cannot own.",
        "Christ is the song beneath the song, the reason praise can rise even in weakness.",
    ],
    "salvation": [
        "Jesus is the Saviour, and His finished work is the sure ground beneath your soul.",
        "The rescue you needed has been accomplished in Christ, who gave Himself and rose again.",
        "Salvation is not an abstract promise; it is found in the Lord Jesus, mighty to save.",
        "Christ has brought you from guilt toward grace, from death toward life, and from distance toward God.",
        "Look to Jesus, because no other refuge can save, cleanse, and keep the soul.",
        "The gospel says your hope is in Christ's mercy, not in your ability to rescue yourself.",
    ],
    "christ": [
        "Everything your soul needs is gathered up in Him: mercy for sin, strength for weakness, and hope for tomorrow.",
        "Jesus is not only the subject of the verse; He is the refuge your heart is being invited to trust.",
        "In Christ, God has given more than advice; He has given Himself for your salvation and life.",
        "The Lord Jesus is sufficient for the whole weight of your need today.",
        "Keep your eyes on Christ, because He is gentle with the weary and mighty to save.",
        "The Saviour who died and rose again is worthy of your trust in this very moment.",
    ],
    "presence": [
        "Christ is with His people by His Spirit, and His nearness is stronger than loneliness.",
        "Jesus promised not to forsake His own, so you can face this moment as someone accompanied.",
        "The presence of God is not vague comfort; in Christ, the Shepherd has come near to His sheep.",
        "Look to Jesus, who entered our sorrow and remains faithful with His people.",
        "The risen Christ is not distant from your day; He is present to keep, guide, and comfort.",
        "You are not alone, because the Saviour who redeemed you also walks with you.",
    ],
    "provision": [
        "Christ Himself is the greatest provision of God, and every lesser need can be brought under His care.",
        "Jesus is the Bread of life, so your soul is not left hungry before the Father.",
        "The Father who gave Christ, His Son, can be trusted with the needs that trouble your heart today.",
        "Look to Christ, because He knows both your daily need and your deepest need for God.",
        "The Shepherd provides with wisdom, and Jesus is faithful to feed and sustain His own.",
        "Your Father has given Christ for you, and that gift teaches your heart to trust Him for today.",
    ],
    "renewal": [
        "Jesus makes renewal possible because He gives new life, not merely a better mood.",
        "Christ can restore what sin, sorrow, and weariness have left bruised in you.",
        "The risen Saviour is able to revive faith and make obedience alive again.",
        "Look to Jesus, because His grace does not leave His people unchanged.",
        "Christ saves and sanctifies, patiently forming your heart after His own.",
        "Christ is strong enough to make the tired places fruitful and the wounded places hopeful.",
    ],
    "perseverance": [
        "Keep your eyes on Jesus, who endured before you and now strengthens you to endure.",
        "Christ has not only begun the work in you; He is faithful to carry you through.",
        "The Saviour who walked the path of suffering can sustain you on the road of obedience.",
        "Perseverance is possible because Jesus holds His people when their steps feel weak.",
        "Look to Christ, whose grace gives strength for today's step and hope for the whole race.",
        "The risen Lord keeps weary saints moving toward the promise He has secured.",
    ],
    "eternal_life": [
        "Eternal life is found in Jesus, who conquered death and brings His people home to God.",
        "Christ is your living hope, and His resurrection makes the future bright with promise.",
        "The life ahead is secure because Jesus has gone through death and risen in victory.",
        "Look to the Saviour, because eternity is not an idea but life with Him.",
        "The promise that lasts forever is held by Christ, and He will not lose His own.",
        "Jesus gives life that begins now and reaches beyond every sorrow this world can name.",
    ],
    "identity": [
        "Your truest name is found in Christ, who brings you near and calls you His own.",
        "Jesus has not left you to be defined by shame, because He has made you belong to Him.",
        "In Christ, you are received by grace and shaped by the love of the Father.",
        "Look to the Saviour before you listen to accusation, because He has spoken mercy over His people.",
        "Your identity is not self-made; it is grace-given through union with Christ.",
        "The Lord Jesus gives you a place to stand as one redeemed, known, and kept.",
    ],
    "praise": [
        "Praise becomes Christ-centered when your heart remembers the Saviour who died, rose, and reigns.",
        "Bless the Lord for Jesus Christ, the clearest gift of mercy and the deepest reason for worship.",
        "Let worship lead you back to Christ, where every mercy of God shines most clearly.",
        "Jesus is worthy of praise in the waiting, because He is faithful before the answer is seen.",
        "The song of the Christian is anchored in Christ, who has overcome and will keep His own.",
        "Give thanks for the Saviour, because every lesser mercy is brighter in the light of Him.",
    ],
}


def stable_index(ref, salt, size):
    value = hashlib.sha256(f"{ref}:{salt}".encode("utf-8")).hexdigest()
    return int(value[:12], 16) % size


def keyword_in_text(keyword, low):
    if " " in keyword:
        pattern = r"(?<!\w)" + r"\s+".join(re.escape(part) for part in keyword.split()) + r"(?!\w)"
        return re.search(pattern, low) is not None
    if keyword in PREFIX_KEYWORDS:
        return re.search(rf"\b{re.escape(keyword)}\w*\b", low) is not None
    return re.search(rf"\b{re.escape(keyword)}\b", low) is not None


def clean_text(text):
    text = re.sub(r"(^|\s)#\s*", r"\1", text).strip()
    text = re.sub(r"\[([^\]]+)\]", r"\1", text)
    return re.sub(r"\s+", " ", text).strip()


def parse_book(ref):
    match = re.match(r"(.+) \d+:\d+$", ref)
    if not match:
        raise ValueError(f"Could not parse reference: {ref}")
    return match.group(1)


def reference_sort_key(ref):
    # Source JSON is already canonical, but this makes sorting deterministic after scoring.
    book = parse_book(ref)
    chapter, verse = ref[len(book) + 1 :].split(":")
    return (book, int(chapter), int(verse))


def theme_for(text):
    low = text.lower()
    best_theme = "faith"
    best_score = 0
    for theme in THEME_PRIORITY:
        score = 0
        for keyword in KEYWORDS[theme]:
            if keyword_in_text(keyword, low):
                score += 3 if " " in keyword else 1
        if score > best_score:
            best_score = score
            best_theme = theme
    return best_theme


def note_for(ref, theme):
    lines = THEME_LINES[theme]
    first = lines["first"][stable_index(ref, "first", len(lines["first"]))]
    middle = lines["middle"][stable_index(ref, "middle", len(lines["middle"]))]
    christ_line_options = CHRIST_CENTERED_LINES[theme]
    christ_line = christ_line_options[stable_index(ref, "christ", len(christ_line_options))]
    last = lines["last"][stable_index(ref, "last", len(lines["last"]))]
    return f"{first} {middle} {christ_line} {last}"


def candidate_score(ref, text):
    low = text.lower()
    book = parse_book(ref)
    score = 0

    for theme, keywords in KEYWORDS.items():
        for keyword in keywords:
            if keyword_in_text(keyword, low):
                score += 4 if " " in keyword else 2

    if ref in IMPORTANT_REFERENCES:
        score += 25

    if book in {"Psalms", "Isaiah", "John", "Romans", "2 Corinthians", "Ephesians", "Philippians", "Hebrews"}:
        score += 6
    elif book in {"Proverbs", "Matthew", "Luke", "1 Peter", "1 John"}:
        score += 4

    if 70 <= len(text) <= 230:
        score += 4
    elif len(text) < 45 or len(text) > 280:
        score -= 3

    return score


def is_candidate(ref, text):
    low = text.lower()
    if len(text) < 35 or len(text) > 320:
        return False
    if text.endswith((",", ":")):
        return False
    if low.startswith(
        (
            "paul,",
            "paul and",
            "james,",
            "peter,",
            "simon peter,",
            "john to",
            "the elder unto",
            "jude,",
        )
    ):
        return False
    if any(keyword_in_text(term, low) for term in BAD_TERMS):
        return False
    return any(keyword_in_text(keyword, low) for keywords in KEYWORDS.values() for keyword in keywords)


def select_references(verses):
    candidates = []
    for ref, raw_text in verses.items():
        text = clean_text(raw_text)
        if is_candidate(ref, text):
            candidates.append((candidate_score(ref, text), ref, text))

    candidates.sort(key=lambda item: (-item[0], reference_sort_key(item[1])))

    selected = []
    selected_refs = set()
    by_book = defaultdict(int)

    # Seed important references first when they pass the quality filters.
    for ref in sorted(IMPORTANT_REFERENCES, key=reference_sort_key):
        if ref not in verses:
            continue
        text = clean_text(verses[ref])
        book = parse_book(ref)
        if ref in selected_refs:
            continue
        if not is_candidate(ref, text):
            continue
        if by_book[book] >= BOOK_CAPS.get(book, 8):
            continue
        selected.append((ref, text))
        selected_refs.add(ref)
        by_book[book] += 1

    for _, ref, text in candidates:
        if len(selected) >= TOTAL:
            break
        book = parse_book(ref)
        if ref in selected_refs:
            continue
        if by_book[book] >= BOOK_CAPS.get(book, 8):
            continue
        selected.append((ref, text))
        selected_refs.add(ref)
        by_book[book] += 1

    if len(selected) < TOTAL:
        raise RuntimeError(f"Only selected {len(selected)} references; need {TOTAL}.")

    return selected[:TOTAL]


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(f"Missing {SOURCE}; download the KJV JSON source first.")

    verses = json.loads(SOURCE.read_text(encoding="utf-8"))
    selected = select_references(verses)

    with OUTPUT.open("w", encoding="utf-8") as handle:
        for idx, (ref, verse_text) in enumerate(selected, start=1):
            theme = theme_for(verse_text)
            item = {
                "id": idx,
                "encouragement_template": note_for(ref, theme).replace("Christian,", "{name},", 1),
                "fallback_name": "Christian",
                "verse_text": verse_text,
                "verse_reference": ref,
                "translation": "KJV",
            }
            handle.write(json.dumps(item, ensure_ascii=False) + "\n")

    print(f"Wrote {len(selected)} records to {OUTPUT}")


if __name__ == "__main__":
    main()
