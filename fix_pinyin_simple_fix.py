import json
import os

def fix_pinyin(pinyin: str) -> str:
    """
    Fix pinyin by removing all spaces and then adding spaces between syllables.
    """
    # First, make everything lowercase
    pinyin = pinyin.lower()
    
    # Remove all spaces
    pinyin = pinyin.replace(" ", "")
    
    # Define common pinyin syllables (sorted by length to avoid partial matches)
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
        "cao", "can", "cai", "bin", "bie", "ben", "bei", "bao", "ban", "bai", "ang", "zu", 
        "zi", "ze", "za", "yu", "yo", "yi", "ye", "ya", "xu", "xi", "wu", "wo", "wa", "tu", 
        "ti", "te", "ta", "su", "si", "se", "sa", "ru", "ri", "re", "qu", "qi", "pu", "po", 
        "pi", "pa", "ou", "nu", "ni", "ne", "na", "mu", "mo", "mi", "me", "ma", "lu", "lo", 
        "li", "le", "la", "ku", "ke", "ka", "ju", "ji", "hu", "he", "ha", "gu", "ge", "ga", 
        "fu", "fo", "fa", "er", "en", "ei", "du", "di", "de", "da", "cu", "ci", "ce", "ca", 
        "bu", "bo", "bi", "ba", "ao", "an", "ai", "a", "e", "o"
    ]
    
    # Also include syllables with tone marks
    syllables_with_tones = []
    for syllable in syllables:
        # Add the original syllable
        syllables_with_tones.append(syllable)
        
        # Add versions with tone marks for each vowel
        for vowel in "aeiouü":
            if vowel in syllable:
                for tone_vowel in [vowel + "1", vowel + "2", vowel + "3", vowel + "4"]:
                    syllables_with_tones.append(syllable.replace(vowel, tone_vowel))
    
    # Sort syllables by length (longest first) to avoid partial matches
    syllables_with_tones.sort(key=len, reverse=True)
    
    # Replace tone numbers with actual tone marks
    tone_marks = {
        "a1": "ā", "a2": "á", "a3": "ǎ", "a4": "à",
        "e1": "ē", "e2": "é", "e3": "ě", "e4": "è",
        "i1": "ī", "i2": "í", "i3": "ǐ", "i4": "ì",
        "o1": "ō", "o2": "ó", "o3": "ǒ", "o4": "ò",
        "u1": "ū", "u2": "ú", "u3": "ǔ", "u4": "ù",
        "ü1": "ǖ", "ü2": "ǘ", "ü3": "ǚ", "ü4": "ǜ"
    }
    
    for num_vowel, tone_vowel in tone_marks.items():
        pinyin = pinyin.replace(num_vowel, tone_vowel)
    
    # Special case for "de" (的) which should be separated
    if "de" in pinyin:
        pinyin = pinyin.replace("de", " de ")
        
    # Add spaces between syllables
    result = ""
    remaining = pinyin
    
    while remaining:
        matched = False
        for syllable in syllables:
            if remaining.lower().startswith(syllable):
                if result and not result.endswith(" "):
                    result += " "
                result += remaining[:len(syllable)]
                remaining = remaining[len(syllable):]
                matched = True
                break
        
        if not matched:
            # If no syllable matches, just add the first character and continue
            if result and not result.endswith(" "):
                result += " "
            result += remaining[0]
            remaining = remaining[1:]
    
    # Clean up any double spaces
    while "  " in result:
        result = result.replace("  ", " ")
    
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