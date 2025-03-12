import json
import os
from typing import Dict, List, Any

def fix_pinyin(pinyin: str) -> str:
    """
    Fix pinyin by removing unnecessary spaces and properly formatting tone marks.
    """
    # Remove all spaces first
    pinyin = pinyin.replace(" ", "")
    
    # Convert first letter to uppercase for consistency with your format
    if pinyin and len(pinyin) > 0:
        pinyin = pinyin[0].upper() + pinyin[1:]
    
    return pinyin

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
        for card in data['flashcards']:
            # Store original pinyin for comparison
            original_pinyin = card['pinyin']
            
            # Fix pinyin
            card['pinyin'] = fix_pinyin(card['pinyin'])
            
            # Print the changes
            if original_pinyin != card['pinyin']:
                print(f"{card['chinese']}: {original_pinyin} → {card['pinyin']}")
        
        # Write the output file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\nProcessing complete for {input_file}!")
        print(f"Fixed pinyin formatting in {len(data['flashcards'])} flashcards")
        print(f"Saved fixed data to: {output_file}")
        
    except Exception as e:
        print(f"Error processing {input_file}: {e}")

def main():
    # Files to process
    files = [
        "temp/song_vocabulary.json",
        "temp/song_vocabulary_part2.json",
        "temp/song_vocabulary_part3.json"
    ]
    
    # Process each file
    for file_path in files:
        if os.path.exists(file_path):
            # Create output file path
            filename, ext = os.path.splitext(file_path)
            output_file = f"{filename}-fixed{ext}"
            
            print(f"\nProcessing {file_path}...")
            process_json_file(file_path, output_file)
        else:
            print(f"File not found: {file_path}")

if __name__ == "__main__":
    main() 