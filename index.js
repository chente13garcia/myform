const express = require("express");
const mysql = require("mysql");
const port = 3000;
const app = express();
const path = require("path");
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL Connected");
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/login', (req,res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get('/login-error', (req,res) => {
  res.sendFile(path.join(__dirname, "login-error.html"));
});
app.get('/', (req,res) => {
  res.send('I am home')
});

app.post("/register", (req, res) => {
    let { username, password, email } = req.body;
    if (username === null || username.length === 0) {
        res.send("invalid username");
    }
    if (password === null || password.length === 0) {
        res.send("invalid pass");
    }
    if (email === null || email.length === 0) {
        res.send("invalid email");
    }
    console.log(username, password, email);
    
    const sql_select = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const values = [username, email]
   

    function fetchID(values, callback) {
      db.query(sql_select,        
             values, function(err, rows) {
          if (err) {
              callback(err, null);
          } else 
              callback(null, rows[0]);
      });
    }

    let user_id;
    fetchID(values, function(err, content) {
        if (err) {
          console.log(err);
          res.send(err);  
        } else {
          if (content === undefined){
            let sql_insert = 'INSERT INTO users (username, password, email) VALUES (?,?,?)'
            let values_insert = [username, encrypt(password), email]
            db.query(sql_insert, values_insert, (err) => {
              if (err)  throw err
              console.log('username created')
            })
            res.send('ready for inserting')
          } else {
            res.send('Invalid username or email') 
          } 
        }    
    });
});

app.post('/login', (req, res) => {
  let { usernameLogin, passwordLogin } = req.body;
    if (usernameLogin === null || usernameLogin.length === 0) {
        res.send("invalid username");
    }
    if (passwordLogin === null || passwordLogin.length === 0) {
        res.send("invalid pass");
    }
    console.log(usernameLogin, passwordLogin);

    const sql = 'SELECT * FROM users WHERE username = ? '
    const values = [usernameLogin, passwordLogin]

    /*function fetchUsername(values, callback){
      db.query(sql, 
            values, function(err, ))
    }*/

    db.query(sql, values[0], (err, results) => {
      if (err) {
        throw err
      }
      //console.log('results..: ', results.length)
      if (results.length === 0){
        res.redirect('/register')
        return
      } 
      if (bcrypt.compareSync(passwordLogin, results[0].password)) {
        res.redirect('/')
        return
      }
      res.redirect('/login-error')
    });
});

app.post("/user", (req, res) => {
  res.json(req, body);
});

app.listen(port, () => {
  console.log("Server on port", port);
});

function encrypt(password){
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash
}

/*const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync('hello', salt);
const mens = bcrypt.compareSync('hello', hash);
console.log('bcrypt.compareSync..: ',mens);
console.log('hash..: ',hash);
console.log('encrypt function 0..: ',encrypt('0'));
console.log('is the same..:', bcrypt.compareSync('hellO', encrypt('hello')));*/

