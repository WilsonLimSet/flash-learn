"use client";

import { useState, useEffect } from "react";
import { 
  getFlashcards, 
  deleteFlashcard, 
  updateFlashcard, 
  getFlashcardsForReview,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getFlashcardsByCategory
} from "@/utils/localStorage";
import { Flashcard, Category } from "@/types";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import PwaWrapper from "@/app/components/PwaWrapper";

export default function ManagePage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [sortByLevel, setSortByLevel] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editValues, setEditValues] = useState<{
    chinese: string;
    pinyin: string;
    english: string;
    readingReviewLevel: number;
    listeningReviewLevel: number;
    categoryId?: string;
  }>({ 
    chinese: "", 
    pinyin: "", 
    english: "", 
    readingReviewLevel: 0,
    listeningReviewLevel: 0,
    categoryId: undefined
  });
  const [cardsForReview, setCardsForReview] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 10; // Show 10 cards per page

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null | undefined>(undefined);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryManageModal, setShowCategoryManageModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#FF5733");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<string | null>(null);

  // Add state for export modal
  const [showExportModal, setShowExportModal] = useState(false);
  // Add state for import modal and file
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    // Load flashcards from localStorage
    const cards = getFlashcards();
    setFlashcards(cards);
    
    // Load categories from localStorage
    const cats = getCategories();
    setCategories(cats);
    
    // Get review count
    const reviewCards = getFlashcardsForReview();
    setCardsForReview(reviewCards.length);
  }, []);

  useEffect(() => {
    // Reset to page 1 when search or sort or category changes
    setCurrentPage(1);
  }, [searchTerm, sortByLevel, sortDirection, selectedCategory]);

  // Filter cards by search term and selected category
  const filteredCards = flashcards.filter(card => {
    const matchesSearch = 
      card.chinese.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.english.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If no category is selected (undefined), show all cards
    if (selectedCategory === undefined) {
      return matchesSearch;
    }
    
    // If "No Category" is selected (null), show only cards without a category
    if (selectedCategory === null) {
      return matchesSearch && !card.categoryId;
    }
    
    // Otherwise, filter by the selected category
    return matchesSearch && card.categoryId === selectedCategory;
  });

  // Sort cards
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortByLevel) {
      // Get reading review levels, falling back to legacy review level if needed
      const aLevel = a.readingReviewLevel !== undefined ? a.readingReviewLevel : a.reviewLevel;
      const bLevel = b.readingReviewLevel !== undefined ? b.readingReviewLevel : b.reviewLevel;
      
      return sortDirection === "asc" 
        ? aLevel - bLevel
        : bLevel - aLevel;
    }
    
    // Default sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Get current cards for pagination
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = sortedCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(sortedCards.length / cardsPerPage);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteFlashcard(id);
      setFlashcards(flashcards.filter(card => card.id !== id));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card.id);
    setEditValues({
      chinese: card.chinese,
      pinyin: card.pinyin,
      english: card.english,
      readingReviewLevel: card.readingReviewLevel !== undefined ? card.readingReviewLevel : card.reviewLevel,
      listeningReviewLevel: card.listeningReviewLevel !== undefined ? card.listeningReviewLevel : card.reviewLevel,
      categoryId: card.categoryId
    });
  };

  const handleSaveEdit = (card: Flashcard) => {
    // Calculate next review date based on the level
    const today = new Date();
    const readingNextReview = new Date(today);
    const listeningNextReview = new Date(today);
    
    // Calculate days to add for reading review
    let readingDaysToAdd = 0;
    switch(editValues.readingReviewLevel) {
      case 0: readingDaysToAdd = 0; break;    // today
      case 1: readingDaysToAdd = 1; break;    // tomorrow
      case 2: readingDaysToAdd = 3; break;    // in 3 days
      case 3: readingDaysToAdd = 5; break;    // in 5 days
      case 4: readingDaysToAdd = 10; break;   // in 10 days
      case 5: readingDaysToAdd = 24; break;   // in 24 days
      default: readingDaysToAdd = editValues.readingReviewLevel; // fallback
    }
    
    // Calculate days to add for listening review
    let listeningDaysToAdd = 0;
    switch(editValues.listeningReviewLevel) {
      case 0: listeningDaysToAdd = 0; break;    // today
      case 1: listeningDaysToAdd = 1; break;    // tomorrow
      case 2: listeningDaysToAdd = 3; break;    // in 3 days
      case 3: listeningDaysToAdd = 5; break;    // in 5 days
      case 4: listeningDaysToAdd = 10; break;   // in 10 days
      case 5: listeningDaysToAdd = 24; break;   // in 24 days
      default: listeningDaysToAdd = editValues.listeningReviewLevel; // fallback
    }
    
    readingNextReview.setDate(today.getDate() + readingDaysToAdd);
    listeningNextReview.setDate(today.getDate() + listeningDaysToAdd);
    
    const updatedCard: Flashcard = {
      ...card,
      chinese: editValues.chinese,
      pinyin: editValues.pinyin,
      english: editValues.english,
      // Legacy fields (kept for backward compatibility)
      reviewLevel: editValues.readingReviewLevel, // Use reading level for legacy compatibility
      nextReviewDate: readingNextReview.toISOString().split('T')[0], // Use reading date for legacy compatibility
      // Reading fields
      readingReviewLevel: editValues.readingReviewLevel,
      readingNextReviewDate: readingNextReview.toISOString().split('T')[0],
      // Listening fields
      listeningReviewLevel: editValues.listeningReviewLevel,
      listeningNextReviewDate: listeningNextReview.toISOString().split('T')[0],
      categoryId: editValues.categoryId
    };
    
    updateFlashcard(updatedCard);
    
    // Update the state
    setFlashcards(flashcards.map(c => 
      c.id === card.id ? updatedCard : c
    ));
    
    // Exit edit mode
    setEditingCard(null);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  const toggleLevelSort = () => {
    if (sortByLevel) {
      if (sortDirection === "desc") {
        // If already sorting by level descending, turn off sorting
        setSortByLevel(false);
      } else {
        // If sorting by level ascending, switch to descending
        setSortDirection("desc");
      }
    } else {
      // Start sorting by level in ascending order
      setSortByLevel(true);
      setSortDirection("asc");
    }
  };

  const getLevelLabel = (level: number): string => {
    switch(level) {
      case 0: return "New";
      case 1: return "Beginner";
      case 2: return "Basic";
      case 3: return "Intermediate";
      case 4: return "Advanced";
      case 5: return "Master";
      default: return `Level ${level}`;
    }
  };

  const getLevelDays = (level: number): string => {
    switch(level) {
      case 0: return "today";
      case 1: return "tomorrow";
      case 2: return "in 2 days";
      case 3: return "in 4 days";
      case 4: return "in 8 days";
      case 5: return "in 14 days";
      default: return `in ${level} days`;
    }
  };

  // Category management functions
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: Category = {
      id: uuidv4(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
      createdAt: new Date().toISOString()
    };
    
    addCategory(newCategory);
    setCategories([...categories, newCategory]);
    setNewCategoryName("");
    setShowCategoryModal(false);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    
    const updatedCategory: Category = {
      id: editingCategory,
      name: newCategoryName.trim(),
      color: newCategoryColor,
      createdAt: categories.find(c => c.id === editingCategory)?.createdAt || new Date().toISOString()
    };
    
    updateCategory(updatedCategory);
    setCategories(categories.map(c => 
      c.id === editingCategory ? updatedCategory : c
    ));
    
    setEditingCategory(null);
    setNewCategoryName("");
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirmDeleteCategory === id) {
      deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      
      // If the deleted category was selected, reset the selection
      if (selectedCategory === id) {
        setSelectedCategory(undefined);
      }
      
      // Update flashcards state to reflect category removal
      setFlashcards(flashcards.map(card => {
        if (card.categoryId === id) {
          return { ...card, categoryId: undefined };
        }
        return card;
      }));
      
      setConfirmDeleteCategory(null);
    } else {
      setConfirmDeleteCategory(id);
    }
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category.id);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setShowCategoryModal(true);
    setShowCategoryManageModal(false);
  };

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Add this to your JSX, after the card list
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    // Logic to show limited page numbers with ellipses
    const getPageNumbers = () => {
      const maxPagesToShow = 5; // Show at most 5 page numbers at once
      
      if (totalPages <= maxPagesToShow) {
        // If we have fewer pages than the max, show all pages
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      
      // Always include first page, last page, current page, and pages adjacent to current
      const pageNumbers: (number | string)[] = [];
      
      // Always add page 1
      pageNumbers.push(1);
      
      // Add ellipsis if needed
      if (currentPage > 3) {
        pageNumbers.push('...');
      }
      
      // Add pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) { // Avoid duplicates
          pageNumbers.push(i);
        }
      }
      
      // Add ellipsis if needed
      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }
      
      // Always add last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
      
      return pageNumbers;
    };
    
    return (
      <div className="mt-10 mb-6">
        <nav className="flex justify-center">
          <ul className="flex space-x-2">
            {currentPage > 1 && (
              <li>
                <PwaWrapper 
                  onClick={() => paginate(currentPage - 1)}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  &laquo;
                </PwaWrapper>
              </li>
            )}
            
            {getPageNumbers().map((number, index) => (
              <li key={index}>
                {typeof number === 'number' ? (
                  <PwaWrapper
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === number
                        ? 'bg-fl-red text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {number}
                  </PwaWrapper>
                ) : (
                  <span className="px-2 py-1">
                    {number}
                  </span>
                )}
              </li>
            ))}
            
            {currentPage < totalPages && (
              <li>
                <PwaWrapper 
                  onClick={() => paginate(currentPage + 1)}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  &raquo;
                </PwaWrapper>
              </li>
            )}
          </ul>
        </nav>
      </div>
    );
  };

  // Category modal
  const renderCategoryModal = () => {
    if (!showCategoryModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-black">
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-1">Category Name</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full p-2 border rounded-md text-black"
              placeholder="Enter category name"
              autoFocus
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-1">Color</label>
            <div className="flex items-center">
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="w-10 h-10 mr-2 border rounded"
              />
              <span className="text-black">{newCategoryColor}</span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <PwaWrapper
              onClick={() => {
                setShowCategoryModal(false);
                setEditingCategory(null);
                setNewCategoryName("");
                setConfirmDeleteCategory(null);
              }}
              className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
            >
              Cancel
            </PwaWrapper>
            <PwaWrapper
              onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
              className="px-4 py-2 bg-fl-salmon text-white rounded-md hover:bg-fl-salmon/90"
              disabled={!newCategoryName.trim()}
            >
              {editingCategory ? "Update" : "Add"}
            </PwaWrapper>
          </div>
        </div>
      </div>
    );
  };

  // Category management modal
  const renderCategoryManageModal = () => {
    if (!showCategoryManageModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">Manage Categories</h2>
            <PwaWrapper
              onClick={() => {
                setEditingCategory(null);
                setNewCategoryName("");
                setNewCategoryColor("#FF5733");
                setShowCategoryModal(true);
                setShowCategoryManageModal(false);
              }}
              className="text-sm px-3 py-1 bg-fl-yellow-DEFAULT text-black rounded-md hover:bg-fl-yellow-DEFAULT/90"
            >
              Add New
            </PwaWrapper>
          </div>
          
          {categories.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No categories yet. Create your first category.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto border rounded-md mb-4">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="flex items-center">
                    <span 
                      className="w-5 h-5 rounded-full mr-3 flex-shrink-0" 
                      style={{ backgroundColor: category.color }}
                    ></span>
                    <span className="text-black font-medium">{category.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <PwaWrapper
                      onClick={() => openEditCategoryModal(category)}
                      className="text-sm px-3 py-1 bg-fl-yellow-DEFAULT text-black rounded-md hover:bg-fl-yellow-DEFAULT/90"
                    >
                      Edit
                    </PwaWrapper>
                    <PwaWrapper
                      onClick={() => handleDeleteCategory(category.id)}
                      className={`text-sm px-3 py-1 ${
                        confirmDeleteCategory === category.id 
                          ? "bg-red-700 text-white" 
                          : "bg-red-500 text-white"
                      } rounded-md hover:bg-red-600`}
                    >
                      {confirmDeleteCategory === category.id ? "Confirm" : "Delete"}
                    </PwaWrapper>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end">
            <PwaWrapper
              onClick={() => {
                setShowCategoryManageModal(false);
                setConfirmDeleteCategory(null);
              }}
              className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
            >
              Close
            </PwaWrapper>
          </div>
        </div>
      </div>
    );
  };

  // Function to handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check if it's a JSON file
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setImportError('Please select a valid JSON file.');
        setImportFile(null);
        return;
      }
      
      setImportFile(file);
    } else {
      setImportFile(null);
    }
  };

  // Function to import flashcards and categories
  const handleImport = async () => {
    if (!importFile) {
      setImportError('Please select a file to import.');
      return;
    }
    
    try {
      // Read the file
      const text = await importFile.text();
      const data = JSON.parse(text);
      
      // Validate the data structure
      if (!data.flashcards || !Array.isArray(data.flashcards)) {
        setImportError('Invalid file format. The file does not contain valid flashcards data.');
        return;
      }
      
      // Check for categories array (optional in some exports)
      const hasCategories = data.categories && Array.isArray(data.categories);
      
      // Confirm with the user
      const message = `This will import ${data.flashcards.length} flashcards${
        hasCategories ? ` and ${data.categories.length} categories` : ''
      }. Your existing data will be merged with the imported data. Continue?`;
      
      if (window.confirm(message)) {
        // Process categories first if they exist
        if (hasCategories) {
          data.categories.forEach((category: Category) => {
            // Validate category structure
            if (!category.id || !category.name || !category.color) {
              console.warn('Skipping invalid category:', category);
              return;
            }
            
            // Check if category already exists
            const existingCategories = getCategories();
            const exists = existingCategories.some(c => c.id === category.id);
            
            if (!exists) {
              // Add new category
              const newCategory: Category = {
                id: category.id,
                name: category.name,
                color: category.color,
                createdAt: category.createdAt || new Date().toISOString()
              };
              addCategory(newCategory);
            } else {
              // Update existing category
              updateCategory({
                id: category.id,
                name: category.name,
                color: category.color,
                createdAt: category.createdAt || new Date().toISOString()
              });
            }
          });
        }
        
        // Process flashcards
        let importedCount = 0;
        let skippedCount = 0;
        
        data.flashcards.forEach((flashcard: any) => {
          // Validate flashcard structure
          if (!flashcard.id || !flashcard.chinese || !flashcard.pinyin || !flashcard.english) {
            console.warn('Skipping invalid flashcard:', flashcard);
            skippedCount++;
            return;
          }
          
          // Check if flashcard already exists
          const existingFlashcards = getFlashcards();
          const existingIndex = existingFlashcards.findIndex(f => f.id === flashcard.id);
          
          if (existingIndex === -1) {
            // Add new flashcard (using localStorage utility)
            const today = new Date().toISOString().split('T')[0];
            
            const newCard: Flashcard = {
              id: flashcard.id,
              chinese: flashcard.chinese,
              pinyin: flashcard.pinyin,
              english: flashcard.english,
              categoryId: flashcard.categoryId,
              
              // Legacy fields (for backward compatibility)
              reviewLevel: typeof flashcard.reviewLevel === 'number' ? flashcard.reviewLevel : 0,
              nextReviewDate: flashcard.nextReviewDate || today,
              
              // Reading review fields
              readingReviewLevel: typeof flashcard.readingReviewLevel === 'number' 
                ? flashcard.readingReviewLevel 
                : (typeof flashcard.reviewLevel === 'number' ? flashcard.reviewLevel : 0),
              readingNextReviewDate: flashcard.readingNextReviewDate || flashcard.nextReviewDate || today,
              
              // Listening review fields
              listeningReviewLevel: typeof flashcard.listeningReviewLevel === 'number' 
                ? flashcard.listeningReviewLevel 
                : (typeof flashcard.reviewLevel === 'number' ? flashcard.reviewLevel : 0),
              listeningNextReviewDate: flashcard.listeningNextReviewDate || flashcard.nextReviewDate || today,
              
              createdAt: flashcard.createdAt || new Date().toISOString()
            };
            
            // We need to manually add it to localStorage since our utility functions
            // generate new IDs
            const allFlashcards = getFlashcards();
            allFlashcards.push(newCard);
            localStorage.setItem('flashcards', JSON.stringify(allFlashcards));
            importedCount++;
          } else {
            // Update existing flashcard
            const existingCard = existingFlashcards[existingIndex];
            const today = new Date().toISOString().split('T')[0];
            
            // Update the card with imported data, preserving existing fields if not in import
            existingFlashcards[existingIndex] = {
              ...existingCard,
              chinese: flashcard.chinese || existingCard.chinese,
              pinyin: flashcard.pinyin || existingCard.pinyin,
              english: flashcard.english || existingCard.english,
              categoryId: flashcard.categoryId !== undefined ? flashcard.categoryId : existingCard.categoryId,
              
              // Legacy fields (for backward compatibility)
              reviewLevel: typeof flashcard.reviewLevel === 'number' ? flashcard.reviewLevel : existingCard.reviewLevel,
              nextReviewDate: flashcard.nextReviewDate || existingCard.nextReviewDate,
              
              // Reading review fields
              readingReviewLevel: typeof flashcard.readingReviewLevel === 'number' 
                ? flashcard.readingReviewLevel 
                : (existingCard.readingReviewLevel !== undefined 
                    ? existingCard.readingReviewLevel 
                    : existingCard.reviewLevel),
              readingNextReviewDate: flashcard.readingNextReviewDate 
                || existingCard.readingNextReviewDate 
                || existingCard.nextReviewDate,
              
              // Listening review fields
              listeningReviewLevel: typeof flashcard.listeningReviewLevel === 'number' 
                ? flashcard.listeningReviewLevel 
                : (existingCard.listeningReviewLevel !== undefined 
                    ? existingCard.listeningReviewLevel 
                    : existingCard.reviewLevel),
              listeningNextReviewDate: flashcard.listeningNextReviewDate 
                || existingCard.listeningNextReviewDate 
                || existingCard.nextReviewDate,
              
              createdAt: existingCard.createdAt // Preserve original creation date
            };
            
            localStorage.setItem('flashcards', JSON.stringify(existingFlashcards));
            importedCount++;
          }
        });
        
        // Refresh the data
        setFlashcards(getFlashcards());
        setCategories(getCategories());
        setCardsForReview(getFlashcardsForReview().length);
        
        // Show success message with counts
        setImportSuccess(true);
        setImportError(`Successfully imported ${importedCount} flashcards. ${skippedCount > 0 ? `${skippedCount} duplicates were skipped.` : ''}`);
        
        // Reset file input
        setImportFile(null);
        
        // Close modal after a delay
        setTimeout(() => {
          setShowImportModal(false);
          setImportSuccess(false);
          setImportError(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      setImportError('Failed to import data. The file may be corrupted or in an invalid format.');
    }
  };

  // Render import modal
  const renderImportModal = () => {
    if (!showImportModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-black">Import Your Data</h2>
          
          <div className="mb-6 text-black">
            <p className="mb-4">Select a previously exported JSON file to restore your flashcards and categories.</p>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-fl-salmon file:text-white
                  hover:file:bg-fl-salmon/90"
              />
              {importFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {importFile.name}
                </p>
              )}
              {importError && (
                <p className="mt-2 text-sm text-red-600">
                  {importError}
                </p>
              )}
              {importSuccess && (
                <p className="mt-2 text-sm text-green-600 font-medium">
                  Import successful! Your data has been restored.
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <PwaWrapper>
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </PwaWrapper>
            <PwaWrapper>
              <button
                onClick={handleImport}
                disabled={!importFile || importSuccess}
                className={`px-4 py-2 rounded-md ${
                  !importFile || importSuccess
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-fl-salmon text-white hover:bg-fl-salmon/90'
                }`}
              >
                Import Data
              </button>
            </PwaWrapper>
          </div>
        </div>
      </div>
    );
  };

  // Function to export flashcards and categories
  const handleExport = () => {
    try {
      // Get all flashcards and categories
      const allFlashcards = getFlashcards();
      const allCategories = getCategories();
      
      // Create export data object
      const exportData = {
        flashcards: allFlashcards,
        categories: allCategories,
        exportDate: new Date().toISOString(),
        version: "1.0"
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create a blob with the data
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `flashlearn-export-${new Date().toISOString().split('T')[0]}.json`;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
      
      // Close the modal
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Render export modal
  const renderExportModal = () => {
    if (!showExportModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-black">Export Your Data</h2>
          
          <div className="mb-6 text-black">
            <p className="mb-4">This will export all your flashcards and categories as a JSON file that you can save as a backup.</p>
            <p className="text-sm text-gray-600 mb-2">The export includes:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
              <li>All your flashcards ({flashcards.length} cards)</li>
              <li>All your categories ({categories.length} categories)</li>
              <li>Review levels and next review dates</li>
            </ul>
            <p className="text-sm text-gray-600">You can use this file to restore your data in the future.</p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <PwaWrapper>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </PwaWrapper>
            <PwaWrapper>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-fl-salmon text-white rounded-md hover:bg-fl-salmon/90"
              >
                Export Data
              </button>
            </PwaWrapper>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md bg-white min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-6 text-black">Manage Flashcards</h1>
      
      <div className="bg-white rounded-lg shadow-md p-3 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-center p-2 bg-fl-salmon/10 rounded-lg flex-1 mr-2">
            <p className="text-xs sm:text-sm text-black font-medium mb-1">To Review</p>
            <p className="text-xl sm:text-2xl font-bold text-fl-red">{cardsForReview}</p>
          </div>
          <div className="text-center p-2 bg-fl-yellow/10 rounded-lg flex-1 ml-2">
            <p className="text-xs sm:text-sm text-black font-medium mb-1">Total Cards</p>
            <p className="text-xl sm:text-2xl font-bold text-fl-yellow-DEFAULT">{flashcards.length}</p>
          </div>
        </div>
      </div>
      
      {/* Export/Backup Button */}
      <div className="mb-6 flex space-x-2">
        <PwaWrapper>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md transition-all duration-300 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export Data
          </button>
        </PwaWrapper>
        
        <PwaWrapper>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 shadow-md transition-all duration-300 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm7.707-10.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V17a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
            </svg>
            Import Data
          </button>
        </PwaWrapper>
      </div>
      
      {/* Category Management */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black">Categories</h2>
          <div className="flex space-x-2">
            <PwaWrapper
              onClick={() => {
                setShowCategoryManageModal(true);
                setShowCategoryModal(false);
                setEditingCategory(null);
                setNewCategoryName("");
                setNewCategoryColor("#FF5733");
                setConfirmDeleteCategory(null);
              }}
              className="text-sm px-3 py-1 bg-gray-200 text-black rounded-md hover:bg-gray-300"
            >
              Manage Categories
            </PwaWrapper>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <PwaWrapper
            onClick={() => setSelectedCategory(undefined)}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedCategory === undefined
                ? 'bg-fl-red text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            All Cards
          </PwaWrapper>
          
          <PwaWrapper
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedCategory === null
                ? 'bg-fl-red text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Uncategorized Cards
          </PwaWrapper>
          
          {categories.map(category => (
            <div key={category.id} className="relative group">
              <PwaWrapper
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-md text-sm flex items-center ${
                  selectedCategory === category.id
                    ? 'bg-fl-red text-white'
                    : `text-black hover:bg-gray-300`
                }`}
                style={{
                  backgroundColor: selectedCategory === category.id 
                    ? undefined 
                    : `${category.color}40` // 40 is for 25% opacity in hex
                }}
              >
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: category.color }}></span>
                {category.name}
              </PwaWrapper>
            </div>
          ))}
          
          <PwaWrapper
            onClick={() => {
              setEditingCategory(null);
              setNewCategoryName("");
              setNewCategoryColor("#FF5733");
              setShowCategoryModal(true);
              setShowCategoryManageModal(false);
            }}
            className="px-3 py-1 rounded-md text-sm bg-fl-yellow-DEFAULT/20 text-fl-yellow-DEFAULT hover:bg-fl-yellow-DEFAULT/30 flex items-center"
          >
            <span className="text-lg mr-1">+</span> Add Category
          </PwaWrapper>
        </div>
      </div>
      
      {/* Search and Sort Controls */}
      {flashcards.length > 0 && (
        <div className="mb-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search flashcards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md text-black"
            />
          </div>
          
          <div className="flex items-center mb-2">
            <PwaWrapper 
              onClick={toggleLevelSort}
              className={`text-sm px-3 py-2 rounded-md ${
                sortByLevel 
                  ? 'bg-fl-salmon text-white' 
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              {!sortByLevel 
                ? "Sort by Reading Level" 
                : `Reading Level: ${sortDirection === "asc" ? "Low to High" : "High to Low"}`}
            </PwaWrapper>
          </div>
        </div>
      )}
      
      {flashcards.length === 0 ? (
        <div className="text-center py-8 text-black">
          <p className="mb-4 text-black">You don't have any flashcards yet.</p>
          <Link href="/create" className="text-blue-500 hover:underline">
            Create your first flashcard
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {currentCards.map(card => (
            <div key={card.id} className={`border-2 ${editingCard === card.id ? 'border-fl-red' : 'border-gray-200'} rounded-md p-4 shadow-md bg-white`}>
              {editingCard === card.id && (
                <div className="bg-fl-red text-white text-xs font-bold px-2 py-1 rounded-sm mb-2 inline-block">
                  Editing
                </div>
              )}
              
              {/* Category badge */}
              {card.categoryId && !editingCard && (
                <div 
                  className="inline-block px-2 py-1 rounded-sm mb-2 text-xs font-medium"
                  style={{ 
                    backgroundColor: `${categories.find(c => c.id === card.categoryId)?.color}40`,
                    color: categories.find(c => c.id === card.categoryId)?.color
                  }}
                >
                  {categories.find(c => c.id === card.categoryId)?.name || 'Unknown Category'}
                </div>
              )}
              
              {editingCard === card.id ? (
                // Edit mode
                <div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-black mb-1">Chinese</label>
                    <input
                      type="text"
                      value={editValues.chinese}
                      onChange={(e) => setEditValues({...editValues, chinese: e.target.value})}
                      className="w-full p-2 border rounded-md text-black text-base"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-black mb-1">Pinyin</label>
                    <input
                      type="text"
                      value={editValues.pinyin}
                      onChange={(e) => setEditValues({...editValues, pinyin: e.target.value})}
                      className="w-full p-2 border rounded-md text-black text-base"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-black mb-1">English</label>
                    <input
                      type="text"
                      value={editValues.english}
                      onChange={(e) => setEditValues({...editValues, english: e.target.value})}
                      className="w-full p-2 border rounded-md text-black text-base"
                    />
                  </div>
                  
                  {/* Category selection */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-black mb-1">Category</label>
                    <select
                      value={editValues.categoryId || ""}
                      onChange={(e) => setEditValues({
                        ...editValues, 
                        categoryId: e.target.value === "" ? undefined : e.target.value
                      })}
                      className="w-full p-2 border rounded-md text-black text-base"
                    >
                      <option value="">No Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">Reading Review Level</label>
                    <div className="grid grid-cols-6 gap-1">
                      {[0, 1, 2, 3, 4, 5].map(level => (
                        <PwaWrapper
                          key={level}
                          onClick={() => setEditValues({...editValues, readingReviewLevel: level})}
                          className={`px-2 py-1 rounded-md text-sm ${
                            editValues.readingReviewLevel === level 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-black hover:bg-gray-300'
                          }`}
                        >
                          {level}
                        </PwaWrapper>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {getLevelLabel(editValues.readingReviewLevel)} - Reading review {getLevelDays(editValues.readingReviewLevel)}
                    </p>
                  </div>

                  {/* Listening Review Level */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">Listening Review Level</label>
                    <div className="grid grid-cols-6 gap-1">
                      {[0, 1, 2, 3, 4, 5].map(level => (
                        <PwaWrapper
                          key={level}
                          onClick={() => setEditValues({...editValues, listeningReviewLevel: level})}
                          className={`px-2 py-1 rounded-md text-sm ${
                            editValues.listeningReviewLevel === level 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-black hover:bg-gray-300'
                          }`}
                        >
                          {level}
                        </PwaWrapper>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {getLevelLabel(editValues.listeningReviewLevel)} - Listening review {getLevelDays(editValues.listeningReviewLevel)}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <PwaWrapper
                      onClick={() => handleSaveEdit(card)}
                      className="flex-1 bg-fl-salmon text-white py-1 px-3 rounded-md hover:bg-fl-salmon/90 text-sm"
                    >
                      Save
                    </PwaWrapper>
                    <PwaWrapper
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-200 text-black py-1 px-3 rounded-md hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </PwaWrapper>
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-black">{card.chinese}</h3>
                    <p className="text-black">{card.pinyin}</p>
                    <p className="text-black">{card.english}</p>
                  </div>
                  
                  <div className="text-sm text-black mb-3">
                    {/* Reading review level */}
                    <div className="flex flex-wrap items-center mb-1">
                      <span className="inline-flex items-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        Reading Level {card.readingReviewLevel !== undefined ? card.readingReviewLevel : card.reviewLevel}: 
                        {getLevelLabel(card.readingReviewLevel !== undefined ? card.readingReviewLevel : card.reviewLevel)}
                      </span>
                      <span className="text-gray-600">
                        (Next: {card.readingNextReviewDate || card.nextReviewDate})
                      </span>
                    </div>
                    
                    {/* Listening review level */}
                    <div className="flex flex-wrap items-center mb-1">
                      <span className="inline-flex items-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Listening Level {card.listeningReviewLevel !== undefined ? card.listeningReviewLevel : card.reviewLevel}: 
                        {getLevelLabel(card.listeningReviewLevel !== undefined ? card.listeningReviewLevel : card.reviewLevel)}
                      </span>
                      <span className="text-gray-600">
                        (Next: {card.listeningNextReviewDate || card.nextReviewDate})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <PwaWrapper
                      onClick={() => handleEdit(card)}
                      className="flex-1 bg-fl-yellow-DEFAULT text-black py-1 px-3 rounded-md hover:bg-fl-yellow-DEFAULT/90 text-sm"
                    >
                      Edit
                    </PwaWrapper>
                    <PwaWrapper
                      onClick={() => handleDelete(card.id)}
                      className={`flex-1 ${
                        confirmDelete === card.id 
                          ? "bg-red-600 text-white" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      } py-1 px-3 rounded-md text-sm`}
                    >
                      {confirmDelete === card.id ? "Confirm" : "Delete"}
                    </PwaWrapper>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {renderPagination()}
      {renderCategoryModal()}
      {renderCategoryManageModal()}
      {renderExportModal()}
      {renderImportModal()}
    </div>
  );
} 