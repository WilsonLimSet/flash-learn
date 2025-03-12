import json
import re
import os
from typing import Dict, List, Any

def format_pinyin(pinyin: str) -> str:
    """
    Format pinyin by lowercasing and properly spacing syllables.
    """
    # Convert to lowercase first
    pinyin = pinyin.lower()
    
    # General pattern for finding syllable boundaries:
    # 1. Split after a vowel with tone mark before a consonant
    pinyin = re.sub(r'([āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ])([bpmfdtnlgkhjqxzcsrwy])', r'\1 \2', pinyin)
    
    # 2. Split between vowel (with or without tone) and consonant
    pinyin = re.sub(r'([aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ])([bpmfdtnlgkhjqxzcsrwy])', r'\1 \2', pinyin)
    
    # 3. Handle special cases like "ng" ending
    pinyin = re.sub(r'(ng|n)([bpmfdtnlgkhjqxzcsrwy])', r'\1 \2', pinyin)
    
    # Clean up multiple spaces
    pinyin = re.sub(r'\s+', ' ', pinyin).strip()
    
    # Additional check for uppercase characters (verification)
    if any(c.isupper() for c in pinyin):
        print(f"Warning: Uppercase characters found in '{pinyin}' after processing")
        # Convert to lowercase again to be safe
        pinyin = pinyin.lower()
    
    return pinyin

def clean_flashcards(input_file: str, output_file: str):
    """
    Process the flashcards JSON file:
    1. Convert pinyin to lowercase with proper spacing
    2. Remove duplicate entries (based on Chinese characters)
    
    Args:
        input_file: Path to the input JSON file
        output_file: Path to save the cleaned JSON file
    """
    try:
        # Read the input file
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Process flashcards
        unique_chinese = {}
        
        for card in data['flashcards']:
            # Format pinyin
            original_pinyin = card['pinyin']
            card['pinyin'] = format_pinyin(card['pinyin'])
            
            # Optional: Uncomment to print the changes
            # if original_pinyin != card['pinyin']:
            #     print(f"{card['chinese']}: {original_pinyin} → {card['pinyin']}")
            
            # Add to unique dictionary
            if card['chinese'] not in unique_chinese:
                unique_chinese[card['chinese']] = card
        
        # Replace flashcards with unique entries
        original_count = len(data['flashcards'])
        data['flashcards'] = list(unique_chinese.values())
        new_count = len(data['flashcards'])
        
        # Write the output file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"Processing complete!")
        print(f"Original flashcard count: {original_count}")
        print(f"New flashcard count: {new_count}")
        print(f"Removed {original_count - new_count} duplicates")
        print(f"Saved cleaned data to: {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Get input file path
    while True:
        input_file = input("Enter the path to your flashcards JSON file: ")
        if os.path.exists(input_file):
            break
        print(f"File not found: {input_file}")
    
    # Default output file
    filename, ext = os.path.splitext(input_file)
    default_output = f"{filename}-cleaned{ext}"
    
    # Get output file path
    output_file = input(f"Enter the path for the cleaned output file (default: {default_output}): ")
    if not output_file:
        output_file = default_output
    
    # Option to print changes
    show_changes = input("Show pinyin changes during processing? (y/n): ").lower().startswith('y')
    
    # Uncomment the printing block in the function if user wants to see changes
    if show_changes:
        # This is a bit hacky, but it modifies the source code to enable printing
        with open(__file__, 'r') as f:
            code = f.read()
        
        code = code.replace("# if original_pinyin != card['pinyin']:", "if original_pinyin != card['pinyin']:")
        code = code.replace("#     print(f\"{card['chinese']}: {original_pinyin} → {card['pinyin']}\")", "    print(f\"{card['chinese']}: {original_pinyin} → {card['pinyin']}\")")
        
        # Execute the modified code
        exec(code)
    else:
        # Process the file
        clean_flashcards(input_file, output_file)