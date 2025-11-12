
const card_categories = {
  'zwierze': {
    name: "zwierze",
    slowo: [
      { num: 0, text: "pies" },
      { num: 1, text: "krowa" }
    ],
    ile:2
  },
  'owoce': {
    name: "owoce",
    slowo: [
      { num: 0, text: "pomidor" },
      { num: 1, text: "jagoda" }
    ]
    ,
    ile:2
  }
  
};

export function getCategorySummaries() {
  return Object.entries(card_categories).map(([id, category,i]) => (category.name))
}
export function hasCategory(categoryId) {
  return card_categories.hasOwnProperty(categoryId);
}

export function getCategory(categoryId) {
  if (hasCategory(categoryId))
    return { id: categoryId, ...card_categories[categoryId] };
  return null;
}

export function addCard(categoryId, card) {
  if (hasCategory(categoryId)) card_categories[categoryId].slowo.push(card);
}
export function ile(categoryId) {
    return card_categories[categoryId].ile;
}
export function ileplus(categoryId){
     card_categories[categoryId].ile= card_categories[categoryId].ile+1;
}
export function gra(id,numer){
    const kopia={...card_categories[id].slowo[numer]};
    const zwierze=kopia.text;
    return zwierze
}
export function validateCardData(card) {
  var errors = [];
    if (!card.hasOwnProperty(text)) errors.push(`Missing text '`);
    else {
      if (typeof card[text] != "string")
        errors.push(` expected to be string`);
      else {
        if (card[text].length < 1 || card[field].length > 50)
          errors.push(`'${field}' expected length: 1-50`);
    
    }
  }
  return errors;
}
export default {
  getCategorySummaries,
  hasCategory,
  getCategory,
  addCard,
  ile,
  gra,
};