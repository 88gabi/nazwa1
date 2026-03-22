import express from "express";
import wisielec, { gra, ile_slow, ile_slowplus } from "./models/wisi.js";
const port = 8000;
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());
app.get("/", (req, res) => {  
  res.render("kategorie", {
    title: "Kategorie wisielca",
    kategorie: wisielec.getCategorySummaries()
  });
});

app.get("/:id_kategori", (req, res) => {
  const kategoria = wisielec.getCategory(req.params.id_kategori);
  if (kategoria != null) {
    res.render("kategoria", {
      title: kategoria.nazwa,
      kategoria,
    });
  } else {
    res.sendStatus(404);
  }
});

app.post("/:id_kategori/new", (req, res) => {
  const id_kategori = req.params.id_kategori;
  if (!wisielec.hasCategory(id_kategori)) {
    res.sendStatus(404);
  } else {
    wisielec.addCard(id_kategori, {id: wisielec.ile_slow(id_kategori)+1,tekst: req.body.slowo});
    ile_slowplus(id_kategori)
    res.redirect(`/${id_kategori}`);
  }
});
app.post("/:id_kategori/edit", (req, res) => {
  const id_kategori = req.params.id_kategori;
  if (!wisielec.hasCategory(id_kategori)) {
    res.sendStatus(404);
  } else {
    wisielec.editCard(id_kategori, {stare_slowo: req.body.stare_slowo,nowe_slowo: req.body.nowe_slowo});
    res.redirect(`/${id_kategori}`);
  }
});
app.post("/:id_kategori/delete", (req, res) => {
  const id_kategori = req.params.id_kategori;
  if (!wisielec.hasCategory(id_kategori)) {
    res.sendStatus(404);
  } else {
    wisielec.deleteCard(id_kategori,  req.body.usun_slowo);
    res.redirect(`/${id_kategori}`);
  }
});
app.get("/:id_kategori/graj", (req, res) => {
  const kategoria = wisielec.getCategory(req.params.id_kategori);
  if (kategoria == null) {
    res.sendStatus(404);
  } else {
    
    let losowe_id=Math.floor(Math.random()*ile_slow(kategoria.nazwa));
    res.render("gra", {
      title: kategoria.nazwa,
      num: losowe_id,
      naz:gra(kategoria.nazwa,losowe_id)
    })
  
}});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
