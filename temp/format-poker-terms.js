const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// The poker terminology data
const pokerData = {
  "basic_terms": {
    "弃牌": {
      "pinyin": "qì pái",
      "english": "Fold",
      "short_form": "弃 (qì)",
      "description": "When a player gives up their hand"
    },
    "跟注": {
      "pinyin": "gēn zhù",
      "english": "Call",
      "short_form": "跟 (gēn)",
      "description": "Matching the current bet"
    },
    "加注": {
      "pinyin": "jiā zhù",
      "english": "Raise",
      "short_form": "加 (jiā)",
      "description": "Increasing the current bet"
    },
    "同花": {
      "pinyin": "tóng huā",
      "english": "Flush",
      "description": "Five cards of the same suit"
    },
    "顺子": {
      "pinyin": "shùn zi",
      "english": "Straight",
      "description": "Five consecutive cards"
    },
    "菜鸟": {
      "pinyin": "cài niǎo",
      "english": "Fish",
      "description": "A weak or inexperienced player"
    },
    "大鲸鱼": {
      "pinyin": "dà jīng yú",
      "english": "Whale",
      "description": "A high-roller who plays for large stakes"
    },
    "一对": {
      "pinyin": "yī duì",
      "english": "One pair",
      "description": "Basic hand with two cards of the same rank"
    },
    "两对": {
      "pinyin": "liǎng duì",
      "english": "Two pair",
      "description": "Hand with two different pairs"
    }
  },
  "game_structure": {
    "暗牌": {
      "pinyin": "àn pái",
      "english": "Hole cards",
      "description": "Your private cards in Texas Hold'em"
    },
    "翻牌": {
      "pinyin": "fān pái",
      "english": "Flop",
      "description": "The first three community cards"
    },
    "街头": {
      "pinyin": "jiē tóu",
      "english": "Turn",
      "description": "The fourth community card"
    },
    "河牌": {
      "pinyin": "hé pái",
      "english": "River",
      "description": "The final community card"
    },
    "全下": {
      "pinyin": "quán xià",
      "english": "All-in",
      "description": "Betting all remaining chips"
    },
    "底池": {
      "pinyin": "dǐ chí",
      "english": "Pot",
      "description": "Total amount being played for"
    },
    "位置": {
      "pinyin": "wèi zhi",
      "english": "Position",
      "short_form": "位 (wèi)",
      "description": "Seat relative to other players"
    },
    "大盲": {
      "pinyin": "dà máng",
      "english": "Big Blind",
      "description": "The larger of the two forced bets"
    },
    "小盲": {
      "pinyin": "xiǎo máng",
      "english": "Small Blind",
      "description": "The smaller of the two forced bets"
    },
    "死钱": {
      "pinyin": "sǐ qián",
      "english": "Dead money",
      "description": "Money in the pot that players have abandoned"
    }
  },
  "hand_rankings": {
    "三条": {
      "pinyin": "sān tiáo",
      "english": "Three of a Kind",
      "alternative": "套子 (tào zi)"
    },
    "葫芦": {
      "pinyin": "hú lu",
      "english": "Full House",
      "description": "Three of a kind plus a pair"
    },
    "四条": {
      "pinyin": "sì tiáo",
      "english": "Four of a Kind",
      "alternative": "铁支 (tiě zhī)"
    }
  },
  "table_phrases": {
    "看看就好": {
      "pinyin": "kàn kan jiù hǎo",
      "english": "Just looking",
      "usage": "Used when checking"
    },
    "打得好": {
      "pinyin": "dǎ de hǎo",
      "english": "Well played",
      "usage": "Complimenting someone's play"
    },
    "运气好": {
      "pinyin": "yùn qi hǎo",
      "english": "Good luck/Lucky",
      "usage": "After someone hits a lucky card"
    },
    "不好意思": {
      "pinyin": "bù hǎo yì si",
      "english": "Sorry",
      "usage": "After winning big pot or making mistake"
    },
    "开牌": {
      "pinyin": "kāi pái",
      "english": "Show cards",
      "usage": "Request to see someone's cards"
    },
    "提前祝贺": {
      "pinyin": "tí qián zhù hè",
      "english": "Early congratulations",
      "usage": "Sarcastically said when someone celebrates too early"
    }
  },
  "slang_and_expressions": {
    "故意是肉": {
      "pinyin": "gù yì shì ròu",
      "english": "Deliberately playing as meat",
      "description": "Pretending to be weak to trap others"
    },
    "我比你大": {
      "pinyin": "wǒ bǐ nǐ dà",
      "english": "Mine is bigger than yours",
      "usage": "Declaring better hand at showdown"
    },
    "打得松": {
      "pinyin": "dǎ de sōng",
      "english": "Playing loose",
      "description": "Someone who plays many hands"
    },
    "套路了": {
      "pinyin": "tào lù le",
      "english": "Got trapped",
      "description": "Falling into someone's strategic trap"
    },
    "读牌": {
      "pinyin": "dú pái",
      "english": "Reading cards",
      "description": "Figuring out opponent's hand"
    },
    "他在演戏": {
      "pinyin": "tā zài yǎn xì",
      "english": "He's acting",
      "description": "Someone is bluffing"
    },
    "打脸了": {
      "pinyin": "dǎ liǎn le",
      "english": "Slapped in the face",
      "description": "Embarrassing call against someone"
    },
    "天胡": {
      "pinyin": "tiān hú",
      "english": "Heaven's blessing",
      "description": "Perfect starting hand"
    },
    "狗屎运": {
      "pinyin": "gǒu shǐ yùn",
      "english": "Dog poop luck",
      "description": "Getting very lucky (crude)"
    },
    "飞刀": {
      "pinyin": "fēi dāo",
      "english": "Flying knife",
      "description": "Making an aggressive bluff"
    },
    "卡死了": {
      "pinyin": "kǎ sǐ le",
      "english": "Card dead",
      "description": "A period when you're not getting any playable hands"
    },
    "拖拉机": {
      "pinyin": "tuō lā jī",
      "english": "Tractor",
      "description": "Nickname for connected cards like 78 or JQ"
    },
    "走远": {
      "pinyin": "zǒu yuǎn",
      "english": "Gone far",
      "description": "When someone has lost a lot of money"
    }
  },
  "actions_and_betting": {
    "盖": {
      "pinyin": "gài",
      "english": "Cover/Bet over",
      "description": "To bet over someone, often used when raising aggressively",
      "example": "我盖你 (wǒ gài nǐ) - I'm betting over you"
    },
    "被盖": {
      "pinyin": "bèi gài",
      "english": "Got raised/covered",
      "description": "When someone bets over you",
      "example": "又被盖了 (yòu bèi gài le) - Got raised again"
    },
    "疯狂盖注": {
      "pinyin": "fēng kuáng gài zhù",
      "english": "Crazy raising",
      "description": "Aggressive repeated raising"
    },
    "过牌": {
      "pinyin": "guò pái",
      "english": "Check",
      "description": "Declining to bet but staying in hand"
    },
    "偷鸡": {
      "pinyin": "tōu jī",
      "english": "Steal",
      "description": "Attempting to win pot with weak hand"
    },
    "诈唬": {
      "pinyin": "zhà hǔ",
      "english": "Bluff",
      "description": "Betting with weak hand to make others fold"
    },
    "打光": {
      "pinyin": "dǎ guāng",
      "english": "Busted",
      "description": "Losing all chips"
    },
    "血拼": {
      "pinyin": "xuè pīn",
      "english": "Gamble",
      "description": "Playing aggressively"
    },
    "慢打": {
      "pinyin": "màn dǎ",
      "english": "Slow play",
      "description": "Playing a strong hand weakly to trap opponents"
    },
    "开枪": {
      "pinyin": "kāi qiāng",
      "english": "Firing a bullet",
      "description": "Making a significant bet or bluff"
    },
    "抓鸡": {
      "pinyin": "zhuā jī",
      "english": "Catch the chicken",
      "description": "Successfully stealing a pot"
    }
  },
  "player_types": {
    "石头牌": {
      "pinyin": "shí tou pái",
      "english": "Rock",
      "description": "Very tight/conservative player"
    },
    "老油条": {
      "pinyin": "lǎo yóu tiáo",
      "english": "Veteran/Shark",
      "description": "Experienced, crafty player"
    },
    "打得凶": {
      "pinyin": "dǎ de xiōng",
      "english": "Aggressive player",
      "description": "Someone who bets and raises frequently"
    },
    "机器人": {
      "pinyin": "jī qì rén",
      "english": "Robot",
      "description": "Player who plays very systematically"
    },
    "水鱼大会": {
      "pinyin": "shuǐ yú dà huì",
      "english": "Fish gathering",
      "description": "A very soft/easy game full of weak players"
    },
    "打崩": {
      "pinyin": "dǎ bēng",
      "english": "Tilt",
      "description": "Emotional state after losing that affects play"
    }
  },
  "strategic_concepts": {
    "抽薪": {
      "pinyin": "chōu xīn",
      "english": "Draw out",
      "description": "Extracting maximum value from hand"
    },
    "控制底池": {
      "pinyin": "kòng zhì dǐ chí",
      "english": "Pot control",
      "description": "Managing the size of the pot"
    },
    "保护手牌": {
      "pinyin": "bǎo hù shǒu pái",
      "english": "Protect hand",
      "description": "Betting to prevent others from seeing cheap cards"
    },
    "心理战": {
      "pinyin": "xīn lǐ zhàn",
      "english": "Mental warfare",
      "description": "Psychological aspects of the game"
    },
    "平衡范围": {
      "pinyin": "píng héng fàn wéi",
      "english": "Balanced range",
      "description": "Having mixed strong and weak hands in situation"
    },
    "夹击": {
      "pinyin": "jiá jī",
      "english": "Squeeze play",
      "description": "Raising after someone has called and there are still players to act behind"
    },
    "打肚子": {
      "pinyin": "dǎ dù zi",
      "english": "Hit the belly",
      "description": "Catching a card in the middle of a straight draw"
    }
  },
  "situational_phrases": {
    "等锤子": {
      "pinyin": "děng chuí zi",
      "english": "Waiting for hammer",
      "description": "Waiting for the perfect moment to strike"
    },
    "送钱": {
      "pinyin": "sòng qián",
      "english": "Giving away money",
      "description": "Making a bad call or play"
    },
    "神助攻": {
      "pinyin": "shén zhù gōng",
      "english": "Divine assist",
      "description": "Getting exactly the card needed"
    },
    "打得恶心": {
      "pinyin": "dǎ de ě xīn",
      "english": "Playing disgustingly",
      "description": "Making unconventional or tricky plays"
    },
    "打得漂亮": {
      "pinyin": "dǎ de piào liang",
      "english": "Beautiful play",
      "description": "Making an impressive move"
    }
  }
};

// Function to format the data for the app
function formatForImport() {
  // Create a category for poker terms
  const pokerCategory = {
    id: uuidv4(),
    name: "Poker",
    color: "#4CAF50", // Green color for poker
    createdAt: new Date().toISOString()
  };
  
  // Array to hold all the formatted flashcards
  const flashcards = [];
  
  // Process each category in the poker data
  Object.keys(pokerData).forEach(category => {
    const terms = pokerData[category];
    
    // Process each term in the category
    Object.keys(terms).forEach(chinese => {
      const term = terms[chinese];
      
      // Combine English and description
      let english = term.english;
      
      // Add description if available
      if (term.description) {
        english = `${english} - ${term.description}`;
      }
      
      // Add usage if available
      if (term.usage) {
        english = `${english} (${term.usage})`;
      }
      
      // Add example if available
      if (term.example) {
        english = `${english}. Example: ${term.example}`;
      }
      
      // Add alternative if available
      if (term.alternative) {
        english = `${english}. Alternative: ${term.alternative}`;
      }
      
      // Create the flashcard
      const flashcard = {
        id: uuidv4(),
        chinese: chinese,
        pinyin: term.pinyin,
        english: english,
        readingReviewLevel: 0,
        readingNextReviewDate: new Date().toISOString().split('T')[0],
        listeningReviewLevel: 0,
        listeningNextReviewDate: new Date().toISOString().split('T')[0],
        speakingReviewLevel: 0,
        speakingNextReviewDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        categoryId: pokerCategory.id
      };
      
      flashcards.push(flashcard);
    });
  });
  
  // Create the final export object
  const exportData = {
    flashcards: flashcards,
    categories: [pokerCategory]
  };
  
  // Write to file
  fs.writeFileSync('poker-terms-import.json', JSON.stringify(exportData, null, 2));
  console.log(`Created ${flashcards.length} flashcards in the Poker category`);
}

// Run the function
formatForImport(); 