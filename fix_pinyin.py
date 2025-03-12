import json
import re
import os
from typing import Dict, List, Any

def fix_pinyin(pinyin: str) -> str:
    """
    Fix pinyin by making it all lowercase and adding spaces between syllables.
    """
    # First, make everything lowercase
    pinyin = pinyin.lower()
    
    # Remove all existing spaces
    pinyin = pinyin.replace(" ", "")
    
    # Define a pattern to match syllables in pinyin
    # This pattern looks for syllable boundaries in pinyin
    pattern = r'([bcdfghjklmnpqrstwxyz]*[aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+[ngh]*)(?=[bcdfghjklmnpqrstwxyz]*[aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]|$)'
    
    # Add spaces between syllables
    result = re.sub(pattern, r'\1 ', pinyin).strip()
    
    return result

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