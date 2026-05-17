import "dotenv/config";
import express from "express";
import wisielec, { gra, ile_slow, ile_slowplus } from "./models/wisi.js";
import session from "./models/session.js";
import auth from "./controllers/auth.js";
import cookieParser from "cookie-parser";
import user from "./models/user.js";
const port = process.env.PORT || 8000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_MONTH = 30 * ONE_DAY;
const SECRET = process.env.SECRET;
if (SECRET == null) {
  console.error(
    `SECRET environment variable missing.
     Please create an env file or provide SECRET via environment variables.`,
  );
  process.exit(1);
}

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());
app.use(cookieParser(SECRET));

app.use(session.sessionHandler);

const authRouter = express.Router();
authRouter.get("/signup", auth.signup_get);
authRouter.post("/signup", auth.signup_post);
authRouter.get("/login", auth.login_get);
authRouter.post("/login", auth.login_post);
authRouter.get("/logout", auth.logout);
app.use("/auth", authRouter);

app.get("/", (req, res) => {  
  res.render("kategorie", {
    title: "Kategorie wisielca",
    kategorie: wisielec.getCategorySummaries(),
    uzytkownik: res.locals.user
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

app.post("/:id_kategori/new",auth.login_required,(req, res) => {
  const id_kategori = req.params.id_kategori;
  if (!wisielec.hasCategory(id_kategori)) {
    res.sendStatus(404);
  } else {
    wisielec.addCard(id_kategori, {id: wisielec.ile_slow(id_kategori)+1,tekst: req.body.slowo},res.locals.user);
    ile_slowplus(id_kategori)
    res.redirect(`/${id_kategori}`);
  }
});
app.post("/:id_kategori/edit",auth.login_required, (req, res) => {
  const id_kategori = req.params.id_kategori;
  if (!wisielec.hasCategory(id_kategori)) {
    res.sendStatus(404);
  } else if(wisielec.cardEditableBy(req.body.stare_slowo,res.locals.user)){
    wisielec.editCard(id_kategori, {stare_slowo: req.body.stare_slowo,nowe_slowo: req.body.nowe_slowo});
    res.redirect(`/${id_kategori}`);
  }
  else{
    res.render("nie_twoja_fiszka");
  }
});
app.post("/:id_kategori/delete",auth.login_required, (req, res) => {
  const id_kategori = req.params.id_kategori;
  if (!wisielec.hasCategory(id_kategori)) {
    res.sendStatus(404);
  } else if(wisielec.cardEditableBy(req.body.usun_slowo,res.locals.user)){
    wisielec.deleteCard(id_kategori,  req.body.usun_slowo);
    res.redirect(`/${id_kategori}`);
  }
  else{
   res.render("nie_twoja_fiszka");
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
