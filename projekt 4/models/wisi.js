import user from "../models/user.js";
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
    slowo          text UNIQUE NOT NULL,
    author_id     INTEGER NOT NULL REFERENCES fc_users(user_id) ON DELETE NO ACTION
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
    `INSERT INTO slowa (id_kategori, slowo,author_id) 
        VALUES (?, ?,?) RETURNING id, slowo,author_id;`
  ),

  insert_card_by_id: db.prepare(
    `INSERT INTO slowa (id_kategori ,slowo,author_id) VALUES (
      (SELECT id_kategori FROM kategorie WHERE nazwa = ?),
      ?,?
    )
    RETURNING id,  slowo,author_id;`
  ),

  get_kategorie: db.prepare(
    "SELECT nazwa FROM kategorie;"
  ),

  get_category_by_id: db.prepare(
    "SELECT id_kategori, nazwa FROM kategorie WHERE nazwa = ?;"
  ),
  get_slowo_by_id: db.prepare(
    "SELECT id,slowo FROM slowa WHERE slowo = ? and id_kategori = ?"
  ),
  get_id_by_slowo: db.prepare(
    "SELECT id FROM slowa WHERE slowo = ?;"
  ),
  get_cards_by_id_kategori: db.prepare(
    "SELECT id, slowo FROM slowa WHERE id_kategori = ?;"
  ),
  edit_cards_by_slowo: db.prepare(
    "UPDATE slowa SET slowo = ? WHERE id = ? and id_kategori = ? RETURNING id, slowo;"
  ),
  delete_cards_by_slowo: db.prepare(
    "DELETE FROM slowa WHERE id = ? and id_kategori = ? RETURNING id, slowo;"
  ),
  get_author_id_by_slowo :db.prepare(
    "select author_id from slowa WHERE slowo = ?;"),
    get_random_card_by_category: db.prepare(`
  SELECT slowo
  FROM slowa
  WHERE id_kategori = ?
  ORDER BY RANDOM()
  LIMIT 1;
`),
count_slowo:db.prepare(`
  SELECT count(slowo) as 'ile'
  FROM slowa
  WHERE id_kategori = ?;
`)
};
let admin = await user.createUser("admin", "changeme");
if (admin) {
  let errMsg = user.addAttribute(admin.user_id, "is_admin", true);
  if (errMsg) {
    console.error(errMsg);
  }
}

let student = await user.createUser("student", "changeme");
if (process.env.POPULATE_DB) {
  console.log("Populating db...");
  Object.entries(kategorie_kart).map(([id, data]) => {
    let category = db_ops.insert_category.get(id);
    console.log("Created category:", category);

    for (let card of data.slowo) {
      let c = db_ops.insert_card.get(
        category.id_kategori,
        card.tekst,
        student.user_id
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
export function hasSlowo(nazwa,id) {
  let category = db_ops.get_slowo_by_id.get(nazwa,db_ops.get_category_by_id.get(id).id_kategori);
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
export function addCard(categoryId, card,uzytkownik) {
  return db_ops.insert_card_by_id.get(categoryId, card.tekst,uzytkownik.id);
}
export function addCategory(new_category) {
  return db_ops.insert_category.get(new_category);
}
export function editCard(categoryId, card) {
   let id=db_ops.get_id_by_slowo.get(card.stare_slowo);
  let category = db_ops.get_category_by_id.get(categoryId);
   if (id==null) return null; 
  return db_ops.edit_cards_by_slowo.get(card.nowe_slowo,id.id, category.id_kategori);
}
export function deleteCard(categoryId,slowo) {
   let id=db_ops.get_id_by_slowo.get(slowo);
  let category = db_ops.get_category_by_id.get(categoryId);
   if (id==null) return null; 
  return db_ops.delete_cards_by_slowo.get(id.id,category.id_kategori);
}
export function ile_slow(categoryId) {
    return db_ops.count_slowo.get(categoryId).ile;
}

export function gra(categoryName) {
  let category = db_ops.get_category_by_id.get(categoryName);
  if (!category) return null;
  let card = db_ops.get_random_card_by_category.get(category.id_kategori);
  if (!card) return null;
  return card.slowo;
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
function cardEditableBy(stare_slowo,uzytkownik) {
  return uzytkownik != null && ( db_ops.get_author_id_by_slowo.get(stare_slowo).author_id === uzytkownik.id || uzytkownik.is_admin);
}
export default {
  getCategorySummaries,
  hasCategory,
  hasSlowo,
  getCategory,
  addCard,
  editCard,
  deleteCard,
  ile_slow,
  gra,
  cardEditableBy,
};