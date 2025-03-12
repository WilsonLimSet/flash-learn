#!/usr/bin/env python3

import json
import os
import sys
import re
try:
    from pypinyin import pinyin, Style
    PYPINYIN_AVAILABLE = True
except ImportError:
    PYPINYIN_AVAILABLE = False
    print("Warning: pypinyin library not found. Will use fallback method.")
    print("To install: pip install pypinyin")

def generate_pinyin(chinese_text):
    """
    Generate pinyin from Chinese text using pypinyin library
    """
    if PYPINYIN_AVAILABLE:
        # Use pypinyin to generate pinyin with tone marks
        result = pinyin(chinese_text, style=Style.TONE)
        # Flatten the list and join with spaces
        return ' '.join([item[0] for item in result])
    else:
        # Fallback method - just fix the spacing in the existing pinyin
        return None

def fix_pinyin(pinyin_text):
    """
    Fix pinyin formatting by removing spaces and then adding spaces between syllables
    """
    # First, make everything lowercase
    pinyin_text = pinyin_text.lower()
    
    # Remove all spaces
    pinyin_text = re.sub(r'\s+', '', pinyin_text)
    
    # Add spaces between syllables using regex
    # This regex matches syllables with tone marks
    syllable_regex = r'([bcdfghjklmnpqrstwxyz]*[aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+[ngh]*)(?=[bcdfghjklmnpqrstwxyz]*[aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]|$)'
    
    # Replace with the same syllable plus a space
    spaced_pinyin = re.sub(syllable_regex, r'\1 ', pinyin_text).strip()
    
    return spaced_pinyin

def process_json_file(input_file, output_file):
    """
    Process the flashcards JSON file to fix pinyin formatting
    
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
            
            # Try to generate new pinyin from Chinese text
            new_pinyin = generate_pinyin(card['chinese'])
            
            if new_pinyin:
                # Use the generated pinyin
                card['pinyin'] = new_pinyin
            else:
                # Fall back to fixing the existing pinyin
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
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    else:
        input_file = input("Enter the path to your flashcards JSON file (e.g., temp/.json copy): ")
    
    if not os.path.exists(input_file):
        print(f"File not found: {input_file}")
        return
    
    # Default output file
    filename, ext = os.path.splitext(input_file)
    default_output = f"{filename}-fixed{ext}"
    
    # Get output file path
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    else:
        output_file = input(f"Enter the path for the fixed output file (default: {default_output}): ")
    
    if not output_file:
        output_file = default_output
    
    # Process the file
    process_json_file(input_file, output_file)

if __name__ == "__main__":
    main() 