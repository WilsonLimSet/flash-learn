import json
import os
import re

def fix_pinyin(pinyin: str) -> str:
    """
    Fix pinyin by making it all lowercase and fixing unusual spacing issues.
    """
    # First, make everything lowercase
    pinyin = pinyin.lower()
    
    # Remove any spaces that might be in the middle of syllables
    # For example, "ji éwěi" -> "jiéwěi"
    pinyin = pinyin.replace(' ', '')
    
    # Now add spaces between syllables based on common patterns
    
    # 1. Add space after vowels with tone marks before consonants
    # For example: "jiéwěi" -> "jié wěi"
    pinyin = re.sub(r'([āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ])([bpmfdtnlgkhjqxzcsryw])', r'\1 \2', pinyin)
    
    # 2. Add space after 'n' or 'ng' before consonants
    # For example: "fēnfēi" -> "fēn fēi"
    pinyin = re.sub(r'(ng|n)([bpmfdtnlgkhjqxzcsryw])', r'\1 \2', pinyin)
    
    # 3. Add space after 'r' before consonants
    # For example: "érzi" -> "ér zi"
    pinyin = re.sub(r'(r)([bpmfdtnlgkhjqxzcsryw])', r'\1 \2', pinyin)
    
    # 4. Add space after 'i', 'u', 'ü' before consonants
    # For example: "liúlàng" -> "liú làng"
    pinyin = re.sub(r'([iuü])([bpmfdtnlgkhjqxzcsryw])', r'\1 \2', pinyin)
    
    # 5. Add space after 'o', 'e', 'a' before consonants
    # For example: "guòfèn" -> "guò fèn"
    pinyin = re.sub(r'([oea])([bpmfdtnlgkhjqxzcsryw])', r'\1 \2', pinyin)
    
    # Clean up any double spaces
    while '  ' in pinyin:
        pinyin = pinyin.replace('  ', ' ')
    
    return pinyin.strip()

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