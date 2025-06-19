import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();
const app = express();
const port = 3000;


app.use(express.static('public')); // to have access to the files inside public folder
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

let reviews = [];

app.get("/", (req, res) => {
  res.render("index.ejs");
})

app.get('/get-review', (req, res) => {
  res.render('form.ejs')
});

app.post('/post-review', async(req, res) => {
  const {title, author, review, rating, name, category} = req.body;
  const date = new Date().toISOString().split("T")[0];

  let coverUrl = "";

      try{
   const result = await axios.get(`https://openlibrary.org/search.json?title=${title}&author=${author}`,);

   const data = result.data;


   if (data.docs && data.docs.length > 0) {
    const book = data.docs[0];

    if (book.isbn?.[0]) {
    coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
    } else if (book.cover_edition_key) {
      coverUrl = `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`;
    } else if (book.cover_i) {
      coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    }

  }

    if (!coverUrl) {
    const gbResponse = await axios(`https://www.googleapis.com/books/v1/volumes?q=intitle=${title}+inauthor=${author}`);
    const gbData =  gbResponse.data;
    if (gbData.items?.length > 0) {
      const gbBook = gbData.items[0].volumeInfo;
      coverUrl = gbBook.imageLinks?.thumbnail;
    } else {
  // Default image
  coverUrl = "/images/default-book.jpg";
 }
  }
  res.redirect('/reviews')
    
  }catch (error) {
    console.error("Error fetching book data:", error);
    res.status(500).send("Error fetching book data");
  }

  try {
    await db.query ('INSERT INTO reviews (title, author, review, rating, date, name, category, book_cover) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [title, author, review, rating, date, name, category, coverUrl]
    );
    console.log("Review saved successfully");

  }catch (error) {
    console.error("Error saving review:", error);
    res.status(500).send("Error saving review");
  }  
});

app.get("/reviews", async (req, res) => {
  
  try {
    const result = await db.query('SELECT * FROM reviews ORDER BY date DESC');
    reviews = result.rows;
    res.render("reviews.ejs", { reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send("Error fetching reviews");
  }
});

app.post('/delete-review', async(req, res) =>{
  const id = req.body.deleteId

  try {
      await db.query('DELETE FROM reviews WHERE id = $1', [id]);
      alert("Review deleted successfully");
      res.redirect('/reviews')
  }catch(error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send("Error fetching reviews");
  }
})
  
app.get('/edit-review/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query('SELECT * FROM reviews WHERE id = $1', [id]);
      const review = result.rows[0];
    if (!review) {
      return res.status(404).send("Review not found");
    }
    res.render('edit.ejs', { review });

  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).send("Error fetching review");
  }
});

app.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const { title, author, review, rating, name, category } = req.body;
  const date = new Date().toISOString().split("T")[0];

  try {
    await db.query('UPDATE reviews SET title = $1, author = $2, review = $3, rating = $4, date = $5, name = $6, category = $7 WHERE id = $8',
      [title, author, review, rating, date, name, category, id]
    );
    res.redirect('/reviews');
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).send("Error updating review");
  }
}); 

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
 