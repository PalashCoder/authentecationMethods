import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose, { Schema } from "mongoose";
import bcrypt, { hash } from 'bcrypt';

const app = express();
const saltRounds = 10;
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home")
})
app.get("/login", (req, res) => {
    res.render("login")
})
app.get("/register", (req, res) => {
    res.render("register")
})
app.get("/logout", (req, res) => {
    res.render("home");
});

app.post("/register", async (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            throw err;
        }
        else {
            try {
                const newUser = new User({
                    email: req.body.username,
                    password: hash
                })
                newUser.save();
                try {
                    res.render("secrets");
                } catch (error) {
                    throw error;
                }
            } catch (error) {
                throw error;
            };
        }
    })
});
app.post("/login", async (req, res) => {
    const name = req.body.username;
    const pass = req.body.password;
    try {
        const userFound = await User.findOne({ email: name });
        if (userFound) {
            bcrypt.compare(pass, userFound.password, (err, result) => {
                if (result == true) {
                    res.render("secrets");
                };
            });
        };
    } catch (error) {
        throw error;
    };
});

app.listen(3000, () => {
    console.log("Server in online on port 3000.");
});