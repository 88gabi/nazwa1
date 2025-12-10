import express from "express";
import wisielec, { gra, ile, ileplus } from "./models/wisi.js";
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
app.get("/:category_id", (req, res) => {
  const kategoria = wisielec.getCategory(req.params.category_id);
  if (kategoria != null) {
    res.render("kategoria", {
      title: kategoria.name,
      kategoria,
    });
  } else {
    res.sendStatus(404);
  }
});
app.post("/:category_id/new", (req, res) => {
  const category_id = req.params.category_id;
  if (!wisielec.hasCategory(category_id)) {
    res.sendStatus(404);
  } else {
    wisielec.addCard(category_id, {id: wisielec.ile(category_id)+1,text: req.body.slowo});
    ileplus(category_id)
    res.redirect(`/${category_id}`);
  }
});
app.get("/:category_id/graj", (req, res) => {
  const kategoria = wisielec.getCategory(req.params.category_id);
  if (kategoria == null) {
    res.sendStatus(404);
  } else {
    var a=Math.floor(Math.random()*ile(kategoria.name));
    res.render("gra", {
      title: kategoria.name,
      num: a,
      naz:gra(kategoria.name,a)
    })
  
}});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});