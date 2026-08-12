// Simple keyword-based category guesser.
// Looks at the expense description and tries to match it against
// known keywords for each category.

const CATEGORY_KEYWORDS = {
  Food: ['restaurant', 'grocery', 'groceries', 'coffee', 'lunch', 'dinner', 'breakfast', 'zomato', 'swiggy', 'cafe'],
  Transport: ['uber', 'ola', 'taxi', 'fuel', 'petrol', 'diesel', 'bus', 'train', 'metro', 'parking'],
  Shopping: ['amazon', 'flipkart', 'mall', 'clothes', 'shoes', 'myntra'],
  Bills: ['electricity', 'water bill', 'internet', 'wifi', 'rent', 'phone bill', 'recharge'],
  Entertainment: ['movie', 'netflix', 'spotify', 'concert', 'game', 'prime video'],
  Health: ['pharmacy', 'doctor', 'hospital', 'medicine', 'gym'],
};

function guessCategory(description = '') {
  const text = description.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'Other'; // fallback if nothing matches
}

module.exports = guessCategory;