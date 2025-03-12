import json
import os

def fix_pinyin(pinyin: str) -> str:
    """
    Fix pinyin by making it all lowercase and adding spaces between syllables.
    This is a very simplified version that works for most common cases.
    """
    # First, make everything lowercase
    pinyin = pinyin.lower()
    
    # Define common pinyin syllables
    syllables = [
        "zhuang", "shuang", "chuang", "zhuan", "zhuai", "zhong", "zheng", "zhang", "xiong", "xiang", 
        "shuan", "shuai", "sheng", "shang", "qiong", "qiang", "niang", "liang", "kuang", "jiong", 
        "jiang", "huang", "guang", "chuan", "chuai", "chong", "cheng", "chang", "zuan", "zong", 
        "zhuo", "zhun", "zhui", "zhua", "zhou", "zhen", "zhao", "zhan", "zhai", "zeng", "zang", 
        "yuan", "yong", "ying", "yang", "xuan", "xing", "xiao", "xian", "weng", "wang", "tuan", 
        "tong", "ting", "tiao", "tian", "teng", "tang", "suan", "song", "shuo", "shun", "shui", 
        "shua", "shou", "shen", "shao", "shan", "shai", "seng", "sang", "ruan", "rong", "reng", 
        "rang", "quan", "qing", "qiao", "qian", "ping", "piao", "pian", "peng", "pang", "nuan", 
        "nong", "ning", "niao", "nian", "neng", "nang", "ming", "miao", "mian", "meng", "mang", 
        "luan", "long", "ling", "liao", "lian", "leng", "lang", "kuan", "kuai", "kong", "keng", 
        "kang", "juan", "jing", "jiao", "jian", "huan", "huai", "hong", "heng", "hang", "guan", 
        "guai", "gong", "geng", "gang", "feng", "fang", "duan", "dong", "ding", "diao", "dian", 
        "deng", "dang", "cuan", "cong", "chuo", "chun", "chui", "chua", "chou", "chen", "chao", 
        "chan", "chai", "ceng", "cang", "bing", "biao", "bian", "beng", "bang", "zuo", "zun", 
        "zui", "zou", "zhu", "zhi", "zhe", "zha", "zen", "zei", "zao", "zan", "zai", "yun", 
        "yue", "you", "yin", "yao", "yan", "yai", "xun", "xue", "xiu", "xin", "xie", "xia", 
        "wen", "wei", "wan", "wai", "tuo", "tun", "tui", "tou", "tie", "tao", "tan", "tai", 
        "suo", "sun", "sui", "sou", "shu", "shi", "she", "sha", "sen", "sao", "san", "sai", 
        "ruo", "run", "rui", "rua", "rou", "ren", "rao", "ran", "qun", "que", "qiu", "qin", 
        "qie", "qia", "pin", "pie", "pen", "pei", "pao", "pan", "pai", "nuo", "nue", "niu", 
        "nin", "nie", "nao", "nan", "nai", "mou", "miu", "min", "mie", "mao", "man", "mai", 
        "luo", "lun", "lue", "liu", "lin", "lie", "lia", "lei", "lao", "lan", "lai", "kuo", 
        "kun", "kui", "kua", "kou", "ken", "kei", "kao", "kan", "kai", "jun", "jue", "jiu", 
        "jin", "jie", "jia", "huo", "hun", "hui", "hua", "hou", "hen", "hei", "hao", "han", 
        "hai", "guo", "gun", "gui", "gua", "gou", "gen", "gei", "gao", "gan", "gai", "fou", 
        "fen", "fei", "fan", "duo", "dun", "dui", "dou", "diu", "die", "dia", "den", "dei", 
        "dao", "dan", "dai", "cuo", "cun", "cui", "cou", "chu", "chi", "che", "cha", "cen", 
        "cao", "can", "cai", "bin", "bie", "ben", "bei", "bao", "ban", "bai", "ang", "zan", 
        "zen", "zei", "zao", "zai", "yun", "yue", "you", "yin", "yao", "yan", "yai", "xun", 
        "xue", "xiu", "xin", "xie", "xia", "wen", "wei", "wan", "wai", "tuo", "tun", "tui", 
        "tou", "tie", "tao", "tan", "tai", "suo", "sun", "sui", "sou", "shu", "shi", "she", 
        "sha", "sen", "sao", "san", "sai", "ruo", "run", "rui", "rua", "rou", "ren", "rao", 
        "ran", "qun", "que", "qiu", "qin", "qie", "qia", "pin", "pie", "pen", "pei", "pao", 
        "pan", "pai", "nuo", "nue", "niu", "nin", "nie", "nao", "nan", "nai", "mou", "miu", 
        "min", "mie", "mao", "man", "mai", "luo", "lun", "lue", "liu", "lin", "lie", "lia", 
        "lei", "lao", "lan", "lai", "kuo", "kun", "kui", "kua", "kou", "ken", "kei", "kao", 
        "kan", "kai", "jun", "jue", "jiu", "jin", "jie", "jia", "huo", "hun", "hui", "hua", 
        "hou", "hen", "hei", "hao", "han", "hai", "guo", "gun", "gui", "gua", "gou", "gen", 
        "gei", "gao", "gan", "gai", "fou", "fen", "fei", "fan", "duo", "dun", "dui", "dou", 
        "diu", "die", "dia", "den", "dei", "dao", "dan", "dai", "cuo", "cun", "cui", "cou", 
        "chu", "chi", "che", "cha", "cen", "cao", "can", "cai", "bin", "bie", "ben", "bei", 
        "bao", "ban", "bai", "ang", "zu", "zi", "ze", "za", "yu", "yo", "yi", "ye", "ya", 
        "xu", "xi", "wu", "wo", "wa", "tu", "ti", "te", "ta", "su", "si", "se", "sa", "ru", 
        "ri", "re", "qu", "qi", "pu", "po", "pi", "pa", "ou", "nu", "ni", "ne", "na", "mu", 
        "mo", "mi", "me", "ma", "lu", "lo", "li", "le", "la", "ku", "ke", "ka", "ju", "ji", 
        "hu", "he", "ha", "gu", "ge", "ga", "fu", "fo", "fa", "er", "en", "ei", "du", "di", 
        "de", "da", "cu", "ci", "ce", "ca", "bu", "bo", "bi", "ba", "ao", "an", "ai", "a", 
        "e", "o"
    ]
    
    # Sort syllables by length (longest first) to avoid partial matches
    syllables.sort(key=len, reverse=True)
    
    # If the pinyin already has spaces, just return it lowercase
    if ' ' in pinyin:
        return pinyin
    
    # Otherwise, try to add spaces between syllables
    result = ''
    remaining = pinyin
    
    while remaining:
        found = False
        for syllable in syllables:
            if remaining.startswith(syllable):
                result += syllable + ' '
                remaining = remaining[len(syllable):]
                found = True
                break
        
        if not found:
            # If no syllable matches, just add the first character and continue
            result += remaining[0]
            remaining = remaining[1:]
    
    return result.strip()

def process_json_file(input_file: str, output_file: str):
    """
    Process the flashcards JSON file to fix pinyin formatting.
    
    Args:
        input_file: Path to the input JSON file
        output_file: Path to save the fixed JSON file
    """
    try:
        # Read the input file
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Process flashcards
        fixed_count = 0
        for card in data['flashcards']:
            # Store original pinyin for comparison
            original_pinyin = card['pinyin']
            
            # Fix pinyin
            card['pinyin'] = fix_pinyin(card['pinyin'])
            
            # Print the changes
            if original_pinyin != card['pinyin']:
                print(f"{card['chinese']}: {original_pinyin} → {card['pinyin']}")
                fixed_count += 1
        
        # Write the output file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\nProcessing complete!")
        print(f"Fixed pinyin formatting in {fixed_count} out of {len(data['flashcards'])} flashcards")
        print(f"Saved fixed data to: {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")

def main():
    # Get input file path
    while True:
        input_file = input("Enter the path to your flashcards JSON file (e.g., temp/.json copy): ")
        if os.path.exists(input_file):
            break
        print(f"File not found: {input_file}")
    
    # Default output file
    filename, ext = os.path.splitext(input_file)
    default_output = f"{filename}-fixed{ext}"
    
    # Get output file path
    output_file = input(f"Enter the path for the fixed output file (default: {default_output}): ")
    if not output_file:
        output_file = default_output
    
    # Process the file
    process_json_file(input_file, output_file)

if __name__ == "__main__":
    main() 