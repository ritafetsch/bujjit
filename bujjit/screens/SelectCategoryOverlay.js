// Import required dependencies 
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, ScrollView} from 'react-native';

const CategorySelectorModal = ({isVisible,categories,onClose, setCategories, onCategorySelect}) => {

  // Define and initialize state variables
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(isVisible);
  const [showNewCategoryBubble, setShowNewCategoryBubble] = useState(false);
  const [newCategoryAdded, setNewCategoryAdded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Initialize pastelColors variable with a variety of pastel hex color values 
  const pastelColors = ['#f2b5d4','#b5d4f2','#b5f2e9','#b5f2b8','#f2d4b5','#f2e9b5','#f2b5b5','#f2c1b5','#d1f2b5','#b5f2c9','#b5c9f2','#f2b5e0','#e0b5f2','#b5f2f0','#f2dcb5','#b5d4e9','#b5f2d1','#f2b5c4','#b5c4f2'];
  // Define variables for distinguish between colours that are either used or available 
  const usedColors = categories.map((category) => category.color.trim()); 
  const availableColors = pastelColors.filter((color) => !usedColors.includes(color));

  // Function for handling category selection
  const handleCategorySelect = (category) => {
    // If show new category bubble is true, set selected category with properties
    if (showNewCategoryBubble) {
      setSelectedCategory({ id: 'new', name: newCategoryName, color: selectedColor });
    } else {
      setSelectedCategory(category);
    }
  };
  // Function for handling color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  // Function for adding a new category 
  const handleAddCategory = async () => {
    // If there's a new category name and a selected color
    if (newCategoryName.trim() !== '' && selectedColor) {
      // Create a new cateogry object with the data stored in them
      const newCategory = {
        name: newCategoryName.trim(),
        color: selectedColor,
      };
    
      try {
        // POST request for adding new category to database 
        const response = await fetch('http://192.168.0.6:3000/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCategory),
        });
        const data = await response.json();
        // Update 'categories' with the newly added category
        setCategories([...categories, data]);
        // Reset states and set selectedCategory to id of new category 
        setSelectedCategory(data.id);
        setNewCategoryName('');
        setSelectedColor(null);
        setShowNewCategoryBubble(false);
        setNewCategoryAdded(true);
      } catch (error) {
        console.error('Error adding category:', error);
      }
    }
  };
  // Function for handling category deletion
  const handleDeleteCategory = async (categoryId) => {
    try {
      // API call to backend to remove category from database 
      await fetch(`http://192.168.0.6:3000/categories/${categoryId}`, {
        method: 'DELETE',
      });
      // Update categories by removing deleted category 
      setCategories(categories.filter((category) => category.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };
  
  // Function for handling closing modal
  const handleCloseModal = () => {
    onCategorySelect(selectedCategory);
    onClose();
  };

  // Component for creating a category bubble 
  const CategoryBubble = ({ category, isSelected, onPress, onDelete, editMode }) => {
    // Check if the category is already stored in the database, if not it is a new category 
    const isNewCategory = !category || Object.keys(category).length === 0;
    // Set background Color based on whether category is new or existing
    const bubbleStyle = isNewCategory ? { backgroundColor: selectedColor } : { backgroundColor: category.color };
    // Get set bubble text - if its a new category, give it the newCategoryName, else get the category name for the existing one
    const bubbleText = isNewCategory ? newCategoryName : category.name;
    // Get category id if it exists, else set it to an empty string
    const categoryId = category?.id || '';
    
    return (
    <TouchableOpacity
      // Define bubble styles 
      style={[
        styles.categoryBubble,
        isSelected ? styles.selectedCategory : null,
        bubbleStyle,
      ]}
      onPress={() => {
        // Handle selection of new category 
        if (isNewCategory) {
          handleCategorySelect();
        // Handles selection of existing category 
        } else {
          onPress(category);
        }
      }}
    >
      <View style={styles.categoryContent}>
        {/* Render category name */}
        <Text style={styles.categoryText}>{bubbleText}</Text>
        {/* If it edit mode and a category id exists, give the bubble a delete button (-) */}
        {editMode && categoryId && ( 
          <TouchableOpacity style={styles.editButton} onPress={() => onDelete(categoryId)}>
            <Text style={styles.editButtonText}>-</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};
  
  // Handle changes modal visibility and reset state when new category is added 
  useEffect(() => {
    setModalVisible(isVisible);
    if (newCategoryAdded) {
      setNewCategoryName('');
      setSelectedColor(null);
      setShowNewCategoryBubble(false);
      setNewCategoryAdded(false);
    }
  }, [isVisible, newCategoryAdded]);

  return (
    // Render category modal
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.topChooseCat}>

              {/* Title / edit button */}
              <View style={styles.catTopContainer}>
                <Text style={styles.title}>Choose Category</Text>
                <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                  <View style={styles.editButtonContainer}>
                    <Text style={styles.editButtonText}>{editMode ? 'Done' : 'Edit'}</Text>
                    </View>
                </TouchableOpacity>
              </View>
               {/* Render bubbles */}
              <View style={styles.categoryBubblesContainer}>
              {categories.map((category) => (
                <CategoryBubble
                  key={category.id}
                  category={category}
                  // Check if category is selected by comparing id 
                  isSelected={category.id === selectedCategory?.id}
                  onPress={() => handleCategorySelect(category)}
                  onDelete={handleDeleteCategory}
                  editMode={editMode} 
                />
              ))}
              {/* Render new category bubble when applicable */}
              {(showNewCategoryBubble || newCategoryAdded) && (
                <CategoryBubble
                  // Set new category object with id, name, and colour
                  category={{ id: 'new', name: newCategoryName, color: selectedColor }}
                  isSelected={false}
                  onPress={() => handleCategorySelect()}
                />
              )}
              </View>
              {/* New category input */}
              <View style={styles.newCategoryContainer}>
                <TextInput
                  style={styles.newCategoryInput}
                  placeholder="Enter new category name..."
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />

                {/* Color selection */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.colorSelectionContainer}
                >
                  {availableColors.map((color) => (
                    // Loop through each available color 
                    <TouchableOpacity
                      // Set color as unique key 
                      key={color}
                      style={[
                        styles.colorOption,
                        // Apply styles to the color option 
                        { backgroundColor: color, borderWidth: color === selectedColor ? 2 : 0 },
                      ]}
                      onPress={() => handleColorSelect(color)}
                    />
                  ))}
                </ScrollView>
                {/* Add category button */}
                <TouchableOpacity style={styles.addCategoryButton} onPress={() => {
                  // Update state for show new category bubble
                  setShowNewCategoryBubble(true);
                  // Call function to handle add category 
                  handleAddCategory();
                }}>
                  <Text style={styles.addCategoryButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.bottomChooseCat}>
              <TouchableOpacity
                style={styles.okButton}
                onPress={() => {
                  // If a category is selected, call handleCategorySelect passing in the selected category
                  if (selectedCategory) {
                    handleCategorySelect(selectedCategory);
                  }
                  // Close modal when ok is pressed
                  handleCloseModal();
                }}
              >
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
              </View>
            </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
// SelectCategoryOverlay component styles 
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    height: '80%',
    justifyContent: 'space-between', 
  },
  catTopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryBubblesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginTop: 20,
  },
  newCategoryInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  colorSelectionContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  addCategoryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCategoryButtonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  okButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10, 
  },
  okButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: 'blue',
  },
  categoryText: {
    fontSize: 16,
    color: 'black',
  },
  colorSelectionContainer: {
    flexDirection: 'row',
    marginVertical: 20
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  topChooseCat:{
  },
  bottomChooseCat:{
    justifyContent: 'flex-end'
  },
  categoryContent: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
  },
  categoryBubble: {
    padding: 8,
    borderRadius: 20,
    margin: 8,
    position: 'relative', 
  },
  editButtonContainer:{
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryBubble: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 8,
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'black'
  },
  categoryTextContainer: {
    flex: 1,
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    backgroundColor: 'black'
  },
  editButton: {
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', 
    top: -20, 
    right: -18, 
  },
  editButtonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },

});

export default CategorySelectorModal;
