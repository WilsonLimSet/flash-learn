import json
import os
import re

def fix_pinyin(pinyin: str) -> str:
    """
    Fix pinyin by removing spaces within syllables and ensuring proper spacing between syllables.
    """
    # First, remove all spaces
    pinyin = pinyin.replace(" ", "")
    
    # Fix specific issues with tone marks
    # Replace any instances where tone marks might be separated from their vowels
    pinyin = pinyin.replace("ú n", "ún")
    pinyin = pinyin.replace("ù n", "ùn")
    pinyin = pinyin.replace("ǔ n", "ǔn")
    pinyin = pinyin.replace("ū n", "ūn")
    
    pinyin = pinyin.replace("í n", "ín")
    pinyin = pinyin.replace("ì n", "ìn")
    pinyin = pinyin.replace("ǐ n", "ǐn")
    pinyin = pinyin.replace("ī n", "īn")
    
    pinyin = pinyin.replace("á n", "án")
    pinyin = pinyin.replace("à n", "àn")
    pinyin = pinyin.replace("ǎ n", "ǎn")
    pinyin = pinyin.replace("ā n", "ān")
    
    pinyin = pinyin.replace("é n", "én")
    pinyin = pinyin.replace("è n", "èn")
    pinyin = pinyin.replace("ě n", "ěn")
    pinyin = pinyin.replace("ē n", "ēn")
    
    pinyin = pinyin.replace("ó n", "ón")
    pinyin = pinyin.replace("ò n", "òn")
    pinyin = pinyin.replace("ǒ n", "ǒn")
    pinyin = pinyin.replace("ō n", "ōn")
    
    # Fix other common issues
    pinyin = pinyin.replace("lià n", "liàn")
    pinyin = pinyin.replace("jiā n", "jiān")
    pinyin = pinyin.replace("xiā n", "xiān")
    
    # Now add spaces between syllables
    # This is a simplified approach that works for most common cases
    
    # Common syllable boundaries in pinyin
    syllable_boundaries = [
        # After vowels with tone marks before consonants
        ('ā', 'b'), ('ā', 'c'), ('ā', 'd'), ('ā', 'f'), ('ā', 'g'), ('ā', 'h'), ('ā', 'j'), ('ā', 'k'),
        ('ā', 'l'), ('ā', 'm'), ('ā', 'n'), ('ā', 'p'), ('ā', 'q'), ('ā', 'r'), ('ā', 's'), ('ā', 't'),
        ('ā', 'w'), ('ā', 'x'), ('ā', 'y'), ('ā', 'z'),
        
        ('á', 'b'), ('á', 'c'), ('á', 'd'), ('á', 'f'), ('á', 'g'), ('á', 'h'), ('á', 'j'), ('á', 'k'),
        ('á', 'l'), ('á', 'm'), ('á', 'n'), ('á', 'p'), ('á', 'q'), ('á', 'r'), ('á', 's'), ('á', 't'),
        ('á', 'w'), ('á', 'x'), ('á', 'y'), ('á', 'z'),
        
        ('ǎ', 'b'), ('ǎ', 'c'), ('ǎ', 'd'), ('ǎ', 'f'), ('ǎ', 'g'), ('ǎ', 'h'), ('ǎ', 'j'), ('ǎ', 'k'),
        ('ǎ', 'l'), ('ǎ', 'm'), ('ǎ', 'n'), ('ǎ', 'p'), ('ǎ', 'q'), ('ǎ', 'r'), ('ǎ', 's'), ('ǎ', 't'),
        ('ǎ', 'w'), ('ǎ', 'x'), ('ǎ', 'y'), ('ǎ', 'z'),
        
        ('à', 'b'), ('à', 'c'), ('à', 'd'), ('à', 'f'), ('à', 'g'), ('à', 'h'), ('à', 'j'), ('à', 'k'),
        ('à', 'l'), ('à', 'm'), ('à', 'n'), ('à', 'p'), ('à', 'q'), ('à', 'r'), ('à', 's'), ('à', 't'),
        ('à', 'w'), ('à', 'x'), ('à', 'y'), ('à', 'z'),
        
        # Similar patterns for other vowels with tone marks
        ('ē', 'b'), ('ē', 'c'), ('ē', 'd'), ('ē', 'f'), ('ē', 'g'), ('ē', 'h'), ('ē', 'j'), ('ē', 'k'),
        ('é', 'b'), ('é', 'c'), ('é', 'd'), ('é', 'f'), ('é', 'g'), ('é', 'h'), ('é', 'j'), ('é', 'k'),
        ('ě', 'b'), ('ě', 'c'), ('ě', 'd'), ('ě', 'f'), ('ě', 'g'), ('ě', 'h'), ('ě', 'j'), ('ě', 'k'),
        ('è', 'b'), ('è', 'c'), ('è', 'd'), ('è', 'f'), ('è', 'g'), ('è', 'h'), ('è', 'j'), ('è', 'k'),
        
        ('ī', 'b'), ('ī', 'c'), ('ī', 'd'), ('ī', 'f'), ('ī', 'g'), ('ī', 'h'), ('ī', 'j'), ('ī', 'k'),
        ('í', 'b'), ('í', 'c'), ('í', 'd'), ('í', 'f'), ('í', 'g'), ('í', 'h'), ('í', 'j'), ('í', 'k'),
        ('ǐ', 'b'), ('ǐ', 'c'), ('ǐ', 'd'), ('ǐ', 'f'), ('ǐ', 'g'), ('ǐ', 'h'), ('ǐ', 'j'), ('ǐ', 'k'),
        ('ì', 'b'), ('ì', 'c'), ('ì', 'd'), ('ì', 'f'), ('ì', 'g'), ('ì', 'h'), ('ì', 'j'), ('ì', 'k'),
        
        ('ō', 'b'), ('ō', 'c'), ('ō', 'd'), ('ō', 'f'), ('ō', 'g'), ('ō', 'h'), ('ō', 'j'), ('ō', 'k'),
        ('ó', 'b'), ('ó', 'c'), ('ó', 'd'), ('ó', 'f'), ('ó', 'g'), ('ó', 'h'), ('ó', 'j'), ('ó', 'k'),
        ('ǒ', 'b'), ('ǒ', 'c'), ('ǒ', 'd'), ('ǒ', 'f'), ('ǒ', 'g'), ('ǒ', 'h'), ('ǒ', 'j'), ('ǒ', 'k'),
        ('ò', 'b'), ('ò', 'c'), ('ò', 'd'), ('ò', 'f'), ('ò', 'g'), ('ò', 'h'), ('ò', 'j'), ('ò', 'k'),
        
        ('ū', 'b'), ('ū', 'c'), ('ū', 'd'), ('ū', 'f'), ('ū', 'g'), ('ū', 'h'), ('ū', 'j'), ('ū', 'k'),
        ('ú', 'b'), ('ú', 'c'), ('ú', 'd'), ('ú', 'f'), ('ú', 'g'), ('ú', 'h'), ('ú', 'j'), ('ú', 'k'),
        ('ǔ', 'b'), ('ǔ', 'c'), ('ǔ', 'd'), ('ǔ', 'f'), ('ǔ', 'g'), ('ǔ', 'h'), ('ǔ', 'j'), ('ǔ', 'k'),
        ('ù', 'b'), ('ù', 'c'), ('ù', 'd'), ('ù', 'f'), ('ù', 'g'), ('ù', 'h'), ('ù', 'j'), ('ù', 'k'),
        
        # After 'n' or 'ng' before consonants
        ('n', 'b'), ('n', 'c'), ('n', 'd'), ('n', 'f'), ('n', 'g'), ('n', 'h'), ('n', 'j'), ('n', 'k'),
        ('n', 'l'), ('n', 'm'), ('n', 'p'), ('n', 'q'), ('n', 'r'), ('n', 's'), ('n', 't'), ('n', 'w'),
        ('n', 'x'), ('n', 'y'), ('n', 'z'),
        
        ('g', 'b'), ('g', 'c'), ('g', 'd'), ('g', 'f'), ('g', 'h'), ('g', 'j'), ('g', 'k'), ('g', 'l'),
        ('g', 'm'), ('g', 'n'), ('g', 'p'), ('g', 'q'), ('g', 'r'), ('g', 's'), ('g', 't'), ('g', 'w'),
        ('g', 'x'), ('g', 'y'), ('g', 'z'),
        
        # After regular vowels before consonants
        ('a', 'b'), ('a', 'c'), ('a', 'd'), ('a', 'f'), ('a', 'g'), ('a', 'h'), ('a', 'j'), ('a', 'k'),
        ('a', 'l'), ('a', 'm'), ('a', 'n'), ('a', 'p'), ('a', 'q'), ('a', 'r'), ('a', 's'), ('a', 't'),
        ('a', 'w'), ('a', 'x'), ('a', 'y'), ('a', 'z'),
        
        ('e', 'b'), ('e', 'c'), ('e', 'd'), ('e', 'f'), ('e', 'g'), ('e', 'h'), ('e', 'j'), ('e', 'k'),
        ('e', 'l'), ('e', 'm'), ('e', 'n'), ('e', 'p'), ('e', 'q'), ('e', 'r'), ('e', 's'), ('e', 't'),
        ('e', 'w'), ('e', 'x'), ('e', 'y'), ('e', 'z'),
        
        ('i', 'b'), ('i', 'c'), ('i', 'd'), ('i', 'f'), ('i', 'g'), ('i', 'h'), ('i', 'j'), ('i', 'k'),
        ('i', 'l'), ('i', 'm'), ('i', 'n'), ('i', 'p'), ('i', 'q'), ('i', 'r'), ('i', 's'), ('i', 't'),
        ('i', 'w'), ('i', 'x'), ('i', 'y'), ('i', 'z'),
        
        ('o', 'b'), ('o', 'c'), ('o', 'd'), ('o', 'f'), ('o', 'g'), ('o', 'h'), ('o', 'j'), ('o', 'k'),
        ('o', 'l'), ('o', 'm'), ('o', 'n'), ('o', 'p'), ('o', 'q'), ('o', 'r'), ('o', 's'), ('o', 't'),
        ('o', 'w'), ('o', 'x'), ('o', 'y'), ('o', 'z'),
        
        ('u', 'b'), ('u', 'c'), ('u', 'd'), ('u', 'f'), ('u', 'g'), ('u', 'h'), ('u', 'j'), ('u', 'k'),
        ('u', 'l'), ('u', 'm'), ('u', 'n'), ('u', 'p'), ('u', 'q'), ('u', 'r'), ('u', 's'), ('u', 't'),
        ('u', 'w'), ('u', 'x'), ('u', 'y'), ('u', 'z'),
    ]
    
    # Add spaces at syllable boundaries
    result = pinyin
    for vowel, consonant in syllable_boundaries:
        result = result.replace(vowel + consonant, vowel + ' ' + consonant)
    
    # Special case for "de" (的) which should be separated
    result = result.replace('de', 'de ')
    
    # Clean up any double spaces
    while '  ' in result:
        result = result.replace('  ', ' ')
    
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