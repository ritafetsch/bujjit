// Import required dependencies 
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const CategoryBubble = ({ category, onPress, onDelete, editMode, isNewCategory, selectedColor, newCategoryName, setNewCategoryName }) => {
  // Get category id or set to new if its a new category
  const categoryId = category?.id || 'new';
  // Check if a specific bubble is currently selected 
  const isSelected = categoryId === selectedCategory;
  
  return (
    <TouchableOpacity
      
      style={[
        styles.categoryBubble,
        // Apply selected category style if selected category is true 
        isSelected ? styles.selectedCategory : null,
        // Set background colour based on whether its a new or exisitng category 
        { backgroundColor: isNewCategory ? selectedColor : category.color },
      ]}
      onPress={() => {
        // handle press event for new categories 
        if (isNewCategory) {
         
          handleCategorySelect();
        // Handle press event for existing categories 
        } else {
          onPress(category);
        }
      }}
      >

      <View style={styles.categoryContent}>
        {/* If new category, create text input field */}
        {isNewCategory ? (
          <TextInput
            style={styles.newCategoryInput}
            placeholder="Enter new category name..."
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />
        ) : (
          // Render category name for existing categories 
          <Text style={styles.categoryText}>{category.name}</Text>
        )}
        {/* If edit mode and category is not hte new one, render - button for deleting categories  */}
        {editMode && categoryId !== 'new' && (
          <TouchableOpacity style={styles.editButton} onPress={() => onDelete(categoryId)}>
            <Text style={styles.editButtonText}>-</Text>
          </TouchableOpacity>
        )}
      </View>

    </TouchableOpacity>
  );
};

export default CategoryBubble;
