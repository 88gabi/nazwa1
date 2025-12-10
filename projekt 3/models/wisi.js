import { DatabaseSync } from "node:sqlite";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);

console.log("Creating database tables");
db.exec(
  `CREATE TABLE IF NOT EXISTS categories (
    category_id   INTEGER PRIMARY KEY,
    id            TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL
  ) STRICT;
  CREATE TABLE IF NOT EXISTS words (
    id            INTEGER PRIMARY KEY,
    cat_id   INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE NO ACTION,
    word          TEXT NOT NULL
  ) STRICT;`
);

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

const db_ops = {
  insert_category: db.prepare(
    `INSERT INTO categories (id, name)
        VALUES (?, ?) RETURNING category_id, id, name;`
  ),

  insert_card: db.prepare(
    `INSERT INTO words (cat_id, word) 
        VALUES (?, ?) RETURNING id, word;`
  ),

  insert_card_by_id: db.prepare(
    `INSERT INTO words (cat_id, word) VALUES (
      (SELECT category_id FROM categories WHERE id = ?),
      ?
    )
    RETURNING id, word;`
  ),

  get_categories: db.prepare(
    "SELECT id, name FROM categories;"
  ),

  get_category_by_id: db.prepare(
    "SELECT category_id, id, name FROM categories WHERE id = ?;"
  ),

  get_cards_by_category_id: db.prepare(
    "SELECT id, word FROM words WHERE cat_id = ?;"
  ),
};

if (process.env.POPULATE_DB) {
  console.log("Populating db...");
  Object.entries(card_categories).map(([id, data]) => {

    let category = db_ops.insert_category.get(id, data.name);
    console.log("Created category:", category);

    for (let card of data.slowo) {
      let c = db_ops.insert_card.get(
        category.category_id,
        card.text
      );

      console.log("Created card:", c);
    }
  });
}
export function getCategorySummaries() {
  var categories = db_ops.get_categories.all();
  return categories;
  
}
export function hasCategory(categoryId) {
  let category = db_ops.get_category_by_id.get(categoryId);
  return category != null;
}

export function getCategory(categoryId) {
  let category = db_ops.get_category_by_id.get(categoryId);
  if (category != null) {
    category.card = db_ops.get_cards_by_category_id.all(category.category_id);
    return category;
  }
  return null;
}

export function addCard(categoryId, card) {
  return db_ops.insert_card_by_id.get(categoryId, card.text);
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