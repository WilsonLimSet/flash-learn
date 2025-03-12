#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chineseToPinyin = require('chinese-to-pinyin');

/**
 * Generate correct pinyin using the chinese-to-pinyin library
 * @param {string} chinese - The Chinese text to convert to pinyin
 * @returns {string} - The correctly formatted pinyin
 */
function generatePinyin(chinese) {
  try {
    // Use the chinese-to-pinyin library to generate pinyin with tone marks
    // Set spaces to true to add spaces between words
    const options = {
      toneToNumber: false, // Use tone marks (ā á ǎ à) instead of numbers
      removeNonZh: false,  // Keep non-Chinese characters
      spaces: true         // Add spaces between words
    };
    
    // Generate pinyin using the library
    const pinyin = chineseToPinyin(chinese, options);
    
    // Ensure the pinyin is all lowercase
    return pinyin.toLowerCase();
  } catch (error) {
    console.error(`Error generating pinyin for "${chinese}": ${error.message}`);
    return null;
  }
}

/**
 * Process a JSON file to fix pinyin formatting
 * @param {string} inputFile - Path to the input JSON file
 * @param {string} outputFile - Path to save the fixed JSON file
 */
function processJsonFile(inputFile, outputFile) {
  try {
    // Read the input file
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    // Process flashcards
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const card of data.flashcards) {
      // Store original pinyin for comparison
      const originalPinyin = card.pinyin;
      
      // Generate new pinyin from the Chinese text
      const newPinyin = generatePinyin(card.chinese);
      
      if (newPinyin) {
        // Update the card's pinyin
        card.pinyin = newPinyin;
        
        // Print the changes
        if (originalPinyin !== newPinyin) {
          console.log(`${card.chinese}: ${originalPinyin} → ${newPinyin}`);
          fixedCount++;
        }
      } else {
        errorCount++;
        console.error(`Failed to generate pinyin for: ${card.chinese}`);
      }
    }
    
    // Write the output file
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    
    console.log(`\nProcessing complete!`);
    console.log(`Fixed pinyin for ${fixedCount} out of ${data.flashcards.length} flashcards`);
    if (errorCount > 0) {
      console.log(`Failed to generate pinyin for ${errorCount} flashcards`);
    }
    console.log(`Saved fixed data to: ${outputFile}`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Main function that handles command line arguments or prompts for input
 */
async function main() {
  // Get input file path from command line arguments
  const args = process.argv.slice(2);
  let inputFile = '';
  let outputFile = '';
  
  if (args.length > 0) {
    // Use command line arguments
    inputFile = args[0];
    
    // Check if file exists
    if (!fs.existsSync(inputFile)) {
      console.error(`File not found: ${inputFile}`);
      process.exit(1);
    }
    
    // Default output file
    const parsedPath = path.parse(inputFile);
    const defaultOutput = `${parsedPath.dir}/${parsedPath.name}-fixed${parsedPath.ext}`;
    
    // Get output file path from command line arguments
    outputFile = args.length > 1 ? args[1] : defaultOutput;
    
    // Process the file
    processJsonFile(inputFile, outputFile);
  } else {
    // Interactive mode with prompts
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Prompt for input file
    const promptInput = () => {
      return new Promise((resolve) => {
        rl.question('Enter the path to your flashcards JSON file (e.g., temp/.json copy): ', (answer) => {
          resolve(answer);
        });
      });
    };
    
    // Prompt for output file
    const promptOutput = (defaultOutput) => {
      return new Promise((resolve) => {
        rl.question(`Enter the path for the fixed output file (default: ${defaultOutput}): `, (answer) => {
          resolve(answer || defaultOutput);
        });
      });
    };
    
    // Get input file
    while (!inputFile) {
      inputFile = await promptInput();
      if (!fs.existsSync(inputFile)) {
        console.error(`File not found: ${inputFile}`);
        inputFile = '';
      }
    }
    
    // Default output file
    const parsedPath = path.parse(inputFile);
    const defaultOutput = `${parsedPath.dir}/${parsedPath.name}-fixed${parsedPath.ext}`;
    
    // Get output file
    outputFile = await promptOutput(defaultOutput);
    
    // Close readline interface
    rl.close();
    
    // Process the file
    processJsonFile(inputFile, outputFile);
  }
}

// Run the main function
main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}); 