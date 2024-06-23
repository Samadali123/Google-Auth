var express = require('express');
var router = express.Router();
const GoogleStrategy = require('passport-google-oidc');
const passport = require(`passport`)
require('dotenv').config();
const users = require(`./users`)



// google strategy code for passport js
passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: '/oauth2/redirect/google',
    scope: ['profile', 'email']
}, async function verify(issuer, profile, cb) {
    console.log(profile)
    let user = await users.findOne({ email: profile.emails[0].value });
    if (user) {
        return cb(null, user);
    }

    let newUser = await users.create({
        name: profile.displayName,
        email: profile.emails[0].value,
    });
    await newUser.save();
    return cb(null, newUser)
}));



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render(`index`)
});


router.get('/login', function(req, res, next) {
    res.render('login');
});


router.get('/login/federated/google', passport.authenticate(`google`));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}));



router.get(`/profile`, async(req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    return res.send("welcome to profile");
})



router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});



module.exports = router;