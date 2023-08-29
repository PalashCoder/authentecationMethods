import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose, { Schema } from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import findOrCreate from "mongoose-findorcreate";

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ],
    state: true
},
    async function (accessToken, refreshToken, profile, cb) {
        const foundOne = await User.findOne({ username: profile.emails[0].value });
        if (foundOne === null) {
            console.log("creating new profile...")
            // console.log(profile)

            // Registers a new user if the email is not found in the database
            User.register({ username: profile.emails[0].value }, profile.id, function (err, user) {
                if (err) { console.log(err); }
            });

            // searches the database for the _id so it can be accessed with req.user.id
            // this allows dual use for the code for users that used Oauth and standard users
            const dbId = await User.findOne({ username: profile.emails[0].value });

            var user = {
                id: dbId.id,
                username: profile.emails[0].value
            }
            return cb(null, user);

        } else {
            const dbId = await User.findOne({ username: profile.emails[0].value });
            var user = {
                id: dbId.id,
                username: profile.emails[0].value
            }
            return cb(null, user);
        }
    }
));

app.get("/", (req, res) => {
    res.render("home")
});
app.get("/auth/google", (req, res) => {
    passport.authenticate("google", { scope: ["profile"] })
})
app.get("/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
        res.redirect("secrets");
    });
app.get("/login", (req, res) => {
    res.render("login")
});
app.get("/register", (req, res) => {
    res.render("register")
});
app.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
});
app.get("/secrets", (req, res) => {
    try {
        const foundd = User.find({ "secret": { $ne: null } })
        if (foundd) {
            res.render("secrets", { usersWithSecrets: foundd })
        }
    } catch (error) {
        throw error;
    }
});
app.get("/submit", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("submit");
    } else {
        res.redirect("/");
    };
});

app.post("/submit", (req, res) => {
    const secrets = req.body.secret;
    try {
        const foundUser = User.findById(req.user.id);
        if (foundUser) {
            foundUser.secret = secrets;
            foundUser.save();
            if (!error) {
                res.redirect("/secrets");
            } else {
                throw error;
            };
        };
    } catch (error) {
        throw error;
    };
});
app.post("/register", async (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        };
    });
});
app.post("/login", async (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, (error) => {
        if (error) {
            console.log(error);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        };
    });
});

app.listen(3000, () => {
    console.log("Server in online on port 3000.");
});