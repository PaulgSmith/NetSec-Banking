"use strict";

// XSS filters module
const xssFilters = require('xss-filters');
const express = require("express");
const session = require('client-sessions');
const fs = require("fs");

const xml2js = require("xml2js")

// Needed to parse the request body
//Note that in version 4 of express, express.bodyParser() was
//deprecated in favor of a separate 'body-parser' module.
app.use(express.urlencoded({ extended: true }));

//Creates session cookie that lasts 3 min.
//Each user action will reset the cookie to 3min.
app.use(session({
    cookieName: 'session',
    secret: '~YGV"?k:xW$bW$A>H2(k>~{J:7xWAk',
    duration: 3 * 60 * 1000,
    activeDuration: 3 * 60 * 1000,
    httpOnly: true,
}));


function requireLogin(req, res, next) {
    if (!req.user) {
        res.redirect('/login');
    } else {
        next();
    }
}




app.use(function (req, res, next) {
    if (req.session && req.session.user) {
        User.findOne({ email: req.session.user.email }, function (err, user) {
            if (user) {
                req.user = user;
                delete req.user.password; // delete the password from the session
                req.session.user = user;  //refresh the session value
                res.locals.user = user;
            }
            // finishing processing the middleware and run the route
            next();
        });
    } else {
        next();
    }
});

// account - bank account
// customer - user account

app.get("/", requireLogin, function (req, res) {
    //TODO:
    // if user has session, redirect to /view_account
    // otherwise redirect to /login
    res.render("/");
});

app.get("/login", function (req, res) {
    res.render("");
});

app.post("/login", function (req, res) {

});


app.get("/register_customer", function (req, res) {
    res.render("");
});

app.get("/view_account", requireLogin, function (req, res) {
    let page = "<html>";
    page += `<title>Welcome ${userName} </title>`;
    page += `<h2>Welcome ${userName}</h2>`;

    res.render("");
});

app.get("/create_account", function (req, res) {
    res.render("");
});

//Transfer, deposit, withdraw
app.get("/account_actions", function (req, res) {
    //TODO JS
    res.render("");
});

app.get('/logout', function (req, res) {

    alert("You have been logged out. Have a nice day!")
    req.session.reset();
    res.redirect('/');
});
