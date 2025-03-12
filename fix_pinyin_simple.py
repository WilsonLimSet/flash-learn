import json
import os
from typing import Dict, List, Any

def fix_pinyin(pinyin: str) -> str:
    """
    Fix pinyin by making it all lowercase and adding spaces between syllables.
    This is a simplified version that works for most common cases.
    """
    # First, make everything lowercase
    pinyin = pinyin.lower()
    
    # For pinyin that's already properly formatted (like "Dàngqìhuícháng"),
    # we need to add spaces between syllables
    
    # Common syllable boundaries in pinyin
    syllable_boundaries = [
        # Syllables ending with vowels followed by consonants
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
        
        ('ü', 'b'), ('ü', 'c'), ('ü', 'd'), ('ü', 'f'), ('ü', 'g'), ('ü', 'h'), ('ü', 'j'), ('ü', 'k'),
        ('ü', 'l'), ('ü', 'm'), ('ü', 'n'), ('ü', 'p'), ('ü', 'q'), ('ü', 'r'), ('ü', 's'), ('ü', 't'),
        ('ü', 'w'), ('ü', 'x'), ('ü', 'y'), ('ü', 'z'),
        
        # Syllables with tone marks
        ('ā', 'b'), ('ā', 'c'), ('ā', 'd'), ('ā', 'f'), ('ā', 'g'), ('ā', 'h'), ('ā', 'j'), ('ā', 'k'),
        ('á', 'b'), ('á', 'c'), ('á', 'd'), ('á', 'f'), ('á', 'g'), ('á', 'h'), ('á', 'j'), ('á', 'k'),
        ('ǎ', 'b'), ('ǎ', 'c'), ('ǎ', 'd'), ('ǎ', 'f'), ('ǎ', 'g'), ('ǎ', 'h'), ('ǎ', 'j'), ('ǎ', 'k'),
        ('à', 'b'), ('à', 'c'), ('à', 'd'), ('à', 'f'), ('à', 'g'), ('à', 'h'), ('à', 'j'), ('à', 'k'),
        
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
        
        # Special cases for 'n' and 'g' endings
        ('n', 'b'), ('n', 'c'), ('n', 'd'), ('n', 'f'), ('n', 'g'), ('n', 'h'), ('n', 'j'), ('n', 'k'),
        ('n', 'l'), ('n', 'm'), ('n', 'p'), ('n', 'q'), ('n', 'r'), ('n', 's'), ('n', 't'), ('n', 'w'),
        ('n', 'x'), ('n', 'y'), ('n', 'z'),
        
        ('g', 'b'), ('g', 'c'), ('g', 'd'), ('g', 'f'), ('g', 'h'), ('g', 'j'), ('g', 'k'), ('g', 'l'),
        ('g', 'm'), ('g', 'n'), ('g', 'p'), ('g', 'q'), ('g', 'r'), ('g', 's'), ('g', 't'), ('g', 'w'),
        ('g', 'x'), ('g', 'y'), ('g', 'z'),
    ]
    
    # Add spaces at syllable boundaries
    result = pinyin
    for vowel, consonant in syllable_boundaries:
        result = result.replace(vowel + consonant, vowel + ' ' + consonant)
    
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