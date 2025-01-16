export const languages = [
  { code: 'zh', name: '中文', symbol: 'CN' },
  { code: 'en', name: 'English', symbol: 'EN' },
  { code: 'el', name: 'Ελληνικά', symbol: 'GR' }
];

export const translations = {
  zh: {
    title: 'AI图像捕手',
    selectObject: '选择对象',
    selectModel: '选择大语言模型',
    generateImage: '生成AI图像',
    generatingPrompt: 'AI正在识别图像，生成提示词...',
    generatingImage: '正在生成AI图像...',
    waitingForSelection: '请选择对象并生成AI图像',
    pleaseSelect: '请选择一个对象',
    guessPrompt: '请猜测哪个是AI生成的图片？',
    waiting: '大语言模型正在推理，请等待...',
    chooseThis: '选择这个',
    realImage: '真实图片',
    aiGenerated: 'AI生成',
    gameRecords: '游戏记录 (5轮)',
    round: '第 {n} 轮',
    correct: '✓ 答对了！',
    incorrect: '✗ 答错了',
    currentScore: '当前得分：',
    noRecords: '还没有游戏记录',
    resetGame: '重置游戏',
    gameOver: '游戏结束！\n最终得分：{score}分\n点击确定开始新一轮游戏！',
    imagePlaceholder: '等待图片...',
    textareaPlaceholder: '这里将显示生成的描述词...',
    textareaGenerating: 'AI正在识别图像，生成提示词...',
    chooseButton: '选择这张图片'
  },
  en: {
    title: 'AI Image Hunter',
    selectObject: 'Select Object',
    selectModel: 'Select Language Model',
    generateImage: 'Generate AI Image',
    generatingPrompt: 'AI is analyzing image and generating prompt...',
    generatingImage: 'Generating AI image...',
    waitingForSelection: 'Please select an object and generate AI image',
    pleaseSelect: 'Please select an object',
    guessPrompt: 'Can you guess which one is AI generated?',
    waiting: 'AI model is processing, please wait...',
    chooseThis: 'Choose This',
    realImage: 'Real Image',
    aiGenerated: 'AI Generated',
    gameRecords: 'Game Records (5 Rounds)',
    round: 'Round {n}',
    correct: '✓ Correct!',
    incorrect: '✗ Wrong!',
    currentScore: 'Current Score: ',
    noRecords: 'No game records yet',
    resetGame: 'Reset Game',
    gameOver: 'Game Over!\nFinal Score: {score}\nClick OK to start a new game!',
    imagePlaceholder: 'Waiting for image...',
    textareaPlaceholder: 'Generated description will appear here...',
    textareaGenerating: 'AI is analyzing image and generating prompts...',
    chooseButton: 'Choose This Image'
  },
  el: {
    title: 'Κυνηγός AI',
    selectObject: 'Επιλέξτε Αντικείμενο',
    selectModel: 'Επιλέξτε Μοντέλο Γλώσσας',
    generateImage: 'Δημιουργία Εικόνας AI',
    generatingPrompt: 'Η AI αναλύει την εικόνα και δημιουργεί προτροπή...',
    generatingImage: 'Δημιουργία εικόνας AI...',
    waitingForSelection: 'Επιλέξτε ένα αντικείμενο και δημιουργήστε εικόνα AI',
    pleaseSelect: 'Παρακαλώ επιλέξτε ένα αντικείμενο',
    guessPrompt: 'Μπορείτε να μαντέψετε ποια είναι η εικόνα AI;',
    waiting: 'Το μοντέλο AI επεξεργάζεται, παρακαλώ περιμένετε...',
    chooseThis: 'Επιλέξτε Αυτό',
    realImage: 'Πραγματική Εικόνα',
    aiGenerated: 'Δημιουργήθηκε από AI',
    gameRecords: 'Εγγραφές Παιχνιδιού (5 Γύροι)',
    round: 'Γύρος {n}',
    correct: '✓ Σωστά!',
    incorrect: '✗ Λάθος!',
    currentScore: 'Τρέχον Σκορ: ',
    noRecords: 'Δεν υπάρχουν εγγραφές παιχνιδιού',
    resetGame: 'Επαναφορά Παιχνιδιού',
    gameOver: 'Τέλος Παιχνιδιού!\nΤελικό Σκορ: {score}\nΚάντε κλικ στο OK για νέο παιχνίδι!',
    imagePlaceholder: 'Αναμονή για εικόνα...',
    textareaPlaceholder: 'Η περιγραφή θα εμφανιστεί εδώ...',
    textareaGenerating: 'Η AI αναλύει την εικόνα και δημιουργεί προτροπές...',
    chooseButton: 'Επιλέξτε Αυτή την Εικόνα'
  }
};

// 添加对象和分类的翻译
export const objectTranslations = {
  zh: {
    categories: {
      landscape: '自然风景',
      architecture: '建筑',
      animals: '动物',
      plants: '植物',
      food: '食物'
    },
    objects: {
      mountain: '山脉',
      beach: '海滩',
      forest: '森林',
      desert: '沙漠',
      waterfall: '瀑布',
      lake: '湖泊',
      glacier: '冰川',
      volcano: '火山',
      canyon: '峡谷',
      island: '岛屿',
      skyscraper: '摩天大楼',
      castle: '城堡',
      temple: '寺庙',
      bridge: '桥梁',
      lighthouse: '灯塔',
      church: '教堂',
      museum: '博物馆',
      stadium: '体育场',
      palace: '宫殿',
      tower: '塔楼',
      lion: '狮子',
      elephant: '大象',
      penguin: '企鹅',
      dolphin: '海豚',
      butterfly: '蝴蝶',
      owl: '猫头鹰',
      panda: '熊猫',
      tiger: '老虎',
      koala: '考拉',
      peacock: '孔雀',
      cherry_blossom: '樱花',
      sunflower: '向日葵',
      cactus: '仙人掌',
      bamboo: '竹子',
      lotus: '莲花',
      lavender: '薰衣草',
      maple: '枫树',
      rose: '玫瑰',
      bonsai: '盆景',
      orchid: '兰花',
      sushi: '寿司',
      pizza: '披萨',
      burger: '汉堡',
      ice_cream: '冰淇淋',
      cake: '蛋糕',
      ramen: '拉面',
      dim_sum: '点心',
      pasta: '意大利面',
      chocolate: '巧克力',
      coffee: '咖啡'
    }
  },
  en: {
    categories: {
      landscape: 'Natural Landscapes',
      architecture: 'Architecture',
      animals: 'Animals',
      plants: 'Plants',
      food: 'Food'
    },
    objects: {
      mountain: 'Mountain',
      beach: 'Beach',
      forest: 'Forest',
      desert: 'Desert',
      waterfall: 'Waterfall',
      lake: 'Lake',
      glacier: 'Glacier',
      volcano: 'Volcano',
      canyon: 'Canyon',
      island: 'Island',
      skyscraper: 'Skyscraper',
      castle: 'Castle',
      temple: 'Temple',
      bridge: 'Bridge',
      lighthouse: 'Lighthouse',
      church: 'Church',
      museum: 'Museum',
      stadium: 'Stadium',
      palace: 'Palace',
      tower: 'Tower',
      lion: 'Lion',
      elephant: 'Elephant',
      penguin: 'Penguin',
      dolphin: 'Dolphin',
      butterfly: 'Butterfly',
      owl: 'Owl',
      panda: 'Panda',
      tiger: 'Tiger',
      koala: 'Koala',
      peacock: 'Peacock',
      cherry_blossom: 'Cherry Blossom',
      sunflower: 'Sunflower',
      cactus: 'Cactus',
      bamboo: 'Bamboo',
      lotus: 'Lotus',
      lavender: 'Lavender',
      maple: 'Maple',
      rose: 'Rose',
      bonsai: 'Bonsai',
      orchid: 'Orchid',
      sushi: 'Sushi',
      pizza: 'Pizza',
      burger: 'Burger',
      ice_cream: 'Ice Cream',
      cake: 'Cake',
      ramen: 'Ramen',
      dim_sum: 'Dim Sum',
      pasta: 'Pasta',
      chocolate: 'Chocolate',
      coffee: 'Coffee'
    }
  },
  el: {
    categories: {
      landscape: 'Φυσικά Τοπία',
      architecture: 'Αρχιτεκτονική',
      animals: 'Ζώα',
      plants: 'Φυτά',
      food: 'Φαγητό'
    },
    objects: {
      mountain: 'Βουνό',
      beach: 'Παραλία',
      forest: 'Δάσος',
      desert: 'Έρημος',
      waterfall: 'Καταρράκτης',
      lake: 'Λίμνη',
      glacier: 'Παγετώνας',
      volcano: 'Ηφαίστειο',
      canyon: 'Φαράγγι',
      island: 'Νησί',
      skyscraper: 'Ουρανοξύστης',
      castle: 'Κάστρο',
      temple: 'Ναός',
      bridge: 'Γέφυρα',
      lighthouse: 'Φάρος',
      church: 'Εκκλησία',
      museum: 'Μουσείο',
      stadium: 'Στάδιο',
      palace: 'Παλάτι',
      tower: 'Πύργος',
      lion: 'Λιοντάρι',
      elephant: 'Ελέφαντας',
      penguin: 'Πιγκουίνος',
      dolphin: 'Δελφίνι',
      butterfly: 'Πεταλούδα',
      owl: 'Κουκουβάγια',
      panda: 'Πάντα',
      tiger: 'Τίγρης',
      koala: 'Κοάλα',
      peacock: 'Παγώνι',
      cherry_blossom: 'Ανθισμένη Κερασιά',
      sunflower: 'Ηλιοτρόπιο',
      cactus: 'Κάκτος',
      bamboo: 'Μπαμπού',
      lotus: 'Λωτός',
      lavender: 'Λεβάντα',
      maple: 'Σφενδάμι',
      rose: 'Τριαντάφυλλο',
      bonsai: 'Μπονσάι',
      orchid: 'Ορχιδέα',
      sushi: 'Σούσι',
      pizza: 'Πίτσα',
      burger: 'Μπέργκερ',
      ice_cream: 'Παγωτό',
      cake: 'Κέικ',
      ramen: 'Ράμεν',
      dim_sum: 'Ντιμ Σαμ',
      pasta: 'Ζυμαρικά',
      chocolate: 'Σοκολάτα',
      coffee: 'Καφές'
    }
  }
};
