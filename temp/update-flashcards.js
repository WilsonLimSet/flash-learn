const fs = require('fs');

// Path to your JSON file
const filePath = '/Users/wilsonlimsetiawan/flash-learn/temp/flashlearn-export-2025-03-12.json';
const outputPath = '/Users/wilsonlimsetiawan/flash-learn/temp/flashlearn-export-updated.json';

// Function to update the flashcard data
function updateFlashcards(flashcardsData) {
  const today = "2025-03-12"; // Set the next review date
  
  // Map through each flashcard and update its structure
  return flashcardsData.map(card => {
    // Extract the old review level before removing it
    const oldReviewLevel = card.reviewLevel || 0;
    
    // Create a new object without the old review properties
    const { reviewLevel, nextReviewDate, ...restOfCard } = card;
    
    // Return the updated card with new fields
    return {
      ...restOfCard,
      // Add new reading review fields
      readingReviewLevel: oldReviewLevel,
      readingNextReviewDate: today,
      // Add new listening review fields
      listeningReviewLevel: oldReviewLevel,
      listeningNextReviewDate: today
    };
  });
}

// Main function to process the file
function processFile() {
  try {
    // Read the input file
    console.log(`Reading file: ${filePath}`);
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Check if the data has a flashcards property
    if (!jsonData.flashcards || !Array.isArray(jsonData.flashcards)) {
      console.error('Error: Input file does not contain a flashcards array');
      return;
    }
    
    console.log(`Found ${jsonData.flashcards.length} flashcards to update`);
    
    // Update the flashcards
    const updatedData = {
      ...jsonData,
      flashcards: updateFlashcards(jsonData.flashcards)
    };
    
    // Write the updated data to the output file
    fs.writeFileSync(outputPath, JSON.stringify(updatedData, null, 2));
    
    console.log(`Successfully updated ${jsonData.flashcards.length} flashcards`);
    console.log(`Output saved to ${outputPath}`);
  } catch (error) {
    console.error('Error processing file:', error);
  }
}

// Run the process
processFile(); 