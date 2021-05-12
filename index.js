"use strict";

// XSS filters module
const xssFilters = require('xss-filters');
const express = require("express");
const session = require('client-sessions');
const fs = require("fs");
const mysql = require('mysql');

const app = express();

const dbCredentials = {
    username: "db1",
    password: "Hfd%4g3hf&^FGH",
    host: "localhost",
    database: "bank"
};

const connection = mysql.createConnection({
    host: dbCredentials.host,
    user: dbCredentials.username,
    password: dbCredentials.password,
    database: dbCredentials.database,
    multipleStatements: true
});

// connection.query("", function (err, result) {
//     if (err) {
//         console.log(err);
//         req.info = `There was a problem with the query`;
//         req.show_results = ``;
//         return res.render('results', { info: `${req.info}`, show_results: `${req.show_results}` });
//     } else {
//         req.info = `Success`;
//         req.show_results = ``;
//         return res.render('results', { info: `${req.info}`, show_results: `${req.show_results}` });
//     }
// });


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

// use express static middleware to serve static files
app.use(express.static(__dirname));

// account - bank account
// customer - user account

app.get("/", requireLogin, function (req, res) {
    //TODO:
    // if user has session, redirect to /view_account
    // otherwise redirect to /login
    res.render("/");
});

app.get("/login", function (req, res) {
    let page = '<html>';
    page += '<head>'
    page += '<title>Login</title>'
    page += '<link rel="stylesheet" type ="text/css" href="style.css" />'
    page += '</head>'
    page += '<center>'
    page += '<h1>Welcome to Bank App</h1>'
    page += '</center>'
    page += '<body>'
    page += '<div class="form-container">'
    page += '<ul class="list">'
    page += '<li><h2>Member Login</h2></li>'
    //TODO FIX ERROR PASSING
    if (req.body.error) {
        page += `<h1>Error! Try again.<h1>`
    }
    page += '<li><form action="/login" method="POST">'
    page += '<label for="username">Username:</label>'
    page += '<input type="text" name="username" placeholder="username" /></li>'
    page += '<li><label for="password">Password:</label>'
    page += '<input type="password" name="password" placeholder="********" /></li>'
    page += '<li><input type="button" value="Submit" onclick ="submit()"> </li></form>'
    page += '</ul>'
    page += '</div>'
    page += '</body>'
    page += '</html>'
    res.send(page);
});

app.post("/login", function (req, res) {
    let sql = `SELECT password ` +
        `FROM customer WHERE username = "${req.body.username}"`
    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            req.body.error = true;
            return res.redirect("/login");
        } else {
            if (result[0] && result[0].password === req.body.password) {
                req.body.error = false;
                console.log("yes");
                req.show_results = `You have logged in`;
                res.redirect("/view_account");
            }
            else {
                //TODO FIX ERROR PASSING
                req.body.error = true;
                console.log("No")
                res.redirect("/login");
            }
        }
    });
});




app.get("/register_customer", function (req, res) {
    let sql = `INSERT INTO customer(username, last_name, first_name, password, address) ` +
        `VALUES ("${req.body.username}","${req.body.firstname}", "${req.body.lastname}", "${req.body.password}", "${req.body.address}")`


    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            req.error = ``;
            req.show_results = `Error creating user account. Please try again.`;
            return res.render();
        } else {
            req.show_results = ``;
            return res.render();
        }
    });
});

//TODO START HERE
app.get("/view_account", requireLogin, function (req, res) {
    let page = "<html>";
    page += `<title>Welcome Bobby Jones </title>`;
    page += `<h2>Welcome Bobby Jones</h2>`;

    let sql = `SELECT * FROM account WHERE username = "(${req.body.username})"`


    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            req.error = ``;
            req.show_results = `cant find accounts for shiet`;
            return res.render();
        } else {
            req.show_results = ``;
            return res.render();
        }
        res.render(page);
    });
});

app.get("/create_account", function (req, res) {
    let sql = `INSERT INTO account(account_number, account_name, account_type, balance, username) ` +
        `VALUES ('${req.body.account_name}', '${req.body.account_type}', '${req.body.balance}', "(SELECT username FROM customer WHERE username =${req.body.username})")`


    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            req.error = ``;
            req.show_results = `Error creating account. Please try again.`;
            return res.render();
        } else {
            req.show_results = ``;
            return res.render();
        }
    });
});

//Transfer (within own user accounts), deposit, withdraw 
app.get("/account_actions", function (req, res) {
    //TODO JS

    let sql = `UPDATE account WHERE balance = '${req.body.balance}'`

    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            req.error = ``;
            req.show_results = `Error updating balance. Please try again.`;
            return res.render();
        } else {
            req.show_results = ``;
            return res.render();
        }
    });
});


app.get('/logout', function (req, res) {

    alert("You have been logged out. Have a nice day!");
    req.session.reset();
    res.redirect('/');
});

app.listen(3000);