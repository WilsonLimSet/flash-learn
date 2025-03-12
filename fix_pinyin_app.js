#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');

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
    
    // Create a queue of promises for API calls
    const promises = data.flashcards.map(card => {
      return new Promise((resolve) => {
        // Call the application's pinyin API endpoint
        const apiUrl = 'http://localhost:3000/api/pinyin';
        
        // Use curl to make the API request
        const curlCommand = `curl -s -X POST -H "Content-Type: application/json" -d '{"text":"${card.chinese}"}' ${apiUrl}`;
        
        exec(curlCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error calling API for ${card.chinese}: ${error.message}`);
            errorCount++;
            resolve();
            return;
          }
          
          try {
            const response = JSON.parse(stdout);
            const originalPinyin = card.pinyin;
            
            if (response && response.pinyin) {
              // Update the card's pinyin
              card.pinyin = response.pinyin.toLowerCase();
              
              // Print the changes
              if (originalPinyin !== card.pinyin) {
                console.log(`${card.chinese}: ${originalPinyin} → ${card.pinyin}`);
                fixedCount++;
              }
            } else {
              console.error(`Failed to get pinyin for: ${card.chinese}`);
              errorCount++;
            }
          } catch (parseError) {
            console.error(`Error parsing API response for ${card.chinese}: ${parseError.message}`);
            errorCount++;
          }
          
          resolve();
        });
      });
    });
    
    // Wait for all API calls to complete
    Promise.all(promises).then(() => {
      // Write the output file
      fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
      
      console.log(`\nProcessing complete!`);
      console.log(`Fixed pinyin for ${fixedCount} out of ${data.flashcards.length} flashcards`);
      if (errorCount > 0) {
        console.log(`Failed to generate pinyin for ${errorCount} flashcards`);
      }
      console.log(`Saved fixed data to: ${outputFile}`);
    });
    
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