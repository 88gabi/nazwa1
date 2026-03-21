import { DatabaseSync } from "node:sqlite";
const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);
console.log("Creating database tables");
db.exec(
  `CREATE TABLE IF NOT EXISTS kategorie (
    id_kategori   INTEGER PRIMARY KEY,
    nazwa          text UNIQUE NOT NULL
  ) STRICT;
  CREATE TABLE IF NOT EXISTS slowa (
    id            INTEGER PRIMARY KEY,
    id_kategori   INTEGER NOT NULL REFERENCES kategorie(id_kategori) ON DELETE NO ACTION,
    slowo          text NOT NULL
  ) STRICT;`
);

const kategorie_kart = {
  'zwierze': {
    nazwa_kategori: "zwierze",
    slowo: [
      { numer_karty: 0, tekst: "pies" },
      { numer_karty: 1, tekst: "krowa" }
    ],
    ile_slow:2
  },
  'owoce': {
    nazwa_kategori: "owoce",
    slowo: [
      { numer_karty: 0, tekst: "pomidor" },
      { numer_karty: 1, tekst: "jagoda" }
    ]
    ,
    ile_slow:2
  }
  
};

const db_ops = {
  insert_category: db.prepare(
    `INSERT INTO kategorie (nazwa)
        VALUES (?) RETURNING id_kategori, nazwa;`
  ),

  insert_card: db.prepare(
    `INSERT INTO slowa (id_kategori, slowo) 
        VALUES (?, ?) RETURNING id, slowo;`
  ),

  insert_card_by_id: db.prepare(
    `INSERT INTO slowa (id_kategori, slowo) VALUES (
      (SELECT id_kategori FROM kategorie WHERE nazwa = ?),
      ?
    )
    RETURNING id, slowo;`
  ),

  get_kategorie: db.prepare(
    "SELECT nazwa FROM kategorie;"
  ),

  get_category_by_id: db.prepare(
    "SELECT id_kategori, nazwa FROM kategorie WHERE nazwa = ?;"
  ),

  get_cards_by_id_kategori: db.prepare(
    "SELECT id, slowo FROM slowa WHERE id_kategori = ?;"
  ),
};

if (process.env.POPULATE_DB) {
  console.log("Populating db...");
  Object.entries(kategorie_kart).map(([id, data]) => {
    let category = db_ops.insert_category.get(id);
    console.log("Created category:", category);

    for (let card of data.slowo) {
      let c = db_ops.insert_card.get(
        category.id_kategori,
        card.tekst
      );

      console.log("Created card:", c);
    }
  });
}
export function getCategorySummaries() {
  let kategorie = db_ops.get_kategorie.all();
  return kategorie;
  
}
export function hasCategory(nazwa) {
  let category = db_ops.get_category_by_id.get(nazwa);
  return category != null;
}

export function getCategory(nazwa) {
  let category = db_ops.get_category_by_id.get(nazwa);
  if (category != null) {
    category.card = db_ops.get_cards_by_id_kategori.all(category.id_kategori);
    return category;
  }
  return null;
}
export function addCard(categoryId, card) {
  return db_ops.insert_card_by_id.get(categoryId, card.tekst);
}
export function ile_slow(categoryId) {
    return kategorie_kart[categoryId].ile_slow;
}
export function ile_slowplus(categoryId){
     kategorie_kart[categoryId].ile_slow= kategorie_kart[categoryId].ile_slow+1;
}
export function gra(id,numer_karty){
    const kopia={...kategorie_kart[id].slowo[numer_karty]};
    const zgadywane_slowo=kopia.tekst;
    return zgadywane_slowo
}
export function validateCardData(card) {
  var errors = [];
    if (!card.hasOwnProperty(tekst)) errors.push(`Missing tekst '`);
    else {
      if (typeof card[tekst] != "string")
        errors.push(` expected to be string`);
      else {
        if (card[tekst].length < 1 || card[field].length > 50)
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
  ile_slow,
  gra,
};