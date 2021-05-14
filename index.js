"use strict";

// XSS filters module
const xssFilters = require('xss-filters');
const express = require("express");
const session = require('client-sessions');
const fs = require("fs");
const mysql = require('mysql');
const e = require('express');

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
    if (!req.session.user) {
        console.log("Redirect")
        res.redirect('/login');
    } else {
        next();
    }
}

// use express static middleware to serve static files
app.use(express.static(__dirname));

// account - bank account
// customer - user account

app.get("/", function (req, res) {
    if (req.session.user) {
        res.redirect('/view_account');
    }
    res.redirect("/login");
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
    if (req.query.error) {
        page += `<b>Error! Try again.</b><br><br>`
    }
    else if (req.query.error_register_customer) {
        page += `<b>There was a error with your user registration.</b><br><br>`
    }
    page += '<li><form action="/login" method="POST">'
    page += '<label for="username">Username:</label>'
    page += '<input type="text" name="username" placeholder="username" required /></li>'
    page += '<li><label for="password">Password:</label>'
    page += '<input type="password" name="password" placeholder="********" required/></li>'
    page += '<input type="submit" name= "b1" value="Submit" > </form><br><br>'
    page += '<form action="/register_customer" method="GET">'
    page += '<input type="submit" name = "b1" value="Register" ></form>'
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
            return res.redirect("/login");
        } else {
            if (result[0] && result[0].password === req.body.password) {
                req.user = req.body.username;
                delete req.user.password; // delete the password from the session
                req.session.user = req.body.username;  //refresh the session value
                res.locals.user = req.body.username;
                res.redirect("/view_account");
            }
            else {
                res.redirect("/login?error=true");
            }
        }
    });
});



app.get("/register_customer", function (req, res) {

    let page = '<html>';
    page += '<head>'
    page += '<title>Customer Resgistration</title>'
    page += '<link rel="stylesheet" type ="text/css" href="style.css" />'
    page += '</head>'
    page += '<center>'
    page += '<h1>New User Registration</h1>'
    page += '</center>'
    page += '<body>'
    page += '<div class="form-container">'
    page += '<ul class="list">'
    page += '<li><form action="/register_customer" method="POST"></li>'
    page += ' <li><label for="username">Username</label> <input type="text" id="username" name="username" required></li>'
    page += ' <li><label for="firstName">First Name</label>  <input type="text" id="firstName" name="firstName" required></li>'
    page += '<li><label for="lastName">Last Name</label> <input type="text" id="lastName" name="lastName "required></li>'
    page += '<li><label for="address">Address</label> <input type="text" id="address" name="address" required ></li>'
    page += '<li><label for="pass">Password</label><input type="password" id="pass" name="password" minlength="8" required maxlength="12" required></li>'
    page += ' <input type="submit" name= "b1" value="Create">'
    page += '</form>'
    page += '</ul>'
    page += '</div>'
    page += '</html>'
    res.send(page);
});

app.post("/register_customer", function (req, res) {
    let sql = `INSERT INTO customer(username, last_name, first_name, password, address) ` +
        `VALUES ("${req.body.username}","${req.body.firstname}", "${req.body.lastname}", "${req.body.password}", "${req.body.address}")`


    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            res.redirect("/login?error_register_customer=true")
        } else {
            req.user = req.body.username;
            delete req.user.password; // delete the password from the session
            req.session.user = req.body.username;  //refresh the session value
            res.locals.user = req.body.username;
            res.redirect('/view_account');
        }
    });
})

//TODO ADD NAME OF PERSON
app.get("/view_account", requireLogin, function (req, res) {
    let sql = `SELECT * FROM account WHERE username = "${req.session.user}"`
    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            return res.render();
        } else {
            let page = `<html>`
            page += `<head>`
            page += `<title>Bank of Murica</title>`
            page += `<link rel="stylesheet" type ="text/css" href="style.css">`
            page += `</head>`
            page += `<body bgcolor="white">`

            page += `<div class="form-container">`
            page += `<ul class="list">`
            page += `<li><h2>Welcome, ${req.session.user}</h2></li>`
            page += `<br/>`
            page += `<li><h3>All accounts:</h3></li>`

            // do a for loop to list all accounts:
            console.log(result);
            for (let account of result) {
                page += `<a href="/account_actions" style="text-decoration: none;?number=${account[`account_number`]}">${account[`account_number`]} - ${account[`account_name`]} ${account[`account_type`]} $${account[`balance`]} </a><br>`

            }
            page += '<br>'
            page += `<a href="/create_account" style="text-decoration: none;"><h3>Create a new account</h3></a>`
            page += `<a href="/logout" style="text-decoration: none;"><h3>Logout</h3></a>`
            page += `</ul>`
            page += `</div>`
            page += `</body>`
            page += `</html>`
            res.send(page);
        }
    });

});

app.get("/create_account", requireLogin, function (req, res) {
    let page = `<html>`;
    page += '<head>'
    page += '<title>Create Account</title>'
    page += '<link rel="stylesheet" type ="text/css" href="style.css" />'
    page += '</head>'
    page += '<center>'
    page += '<h1>Create a new account</h1>'
    page += '</center>'
    page += '<body>'
    page += '<div class="form-container">'
    page += '<ul class="list">'
    page += '<li><h2>Account creator</h2></li>'
    page += ' <li><form action="/create_account" method="POST">'
    page += '<label for="accountName">Account Name:</label> required'
    page += '<input type="text" name="accountName" placeholder="" required></li>'
    page += '<li><label for="accountType">Account Type:</label></li>'
    page += '<select name="accountType" id="accountType"> required'
    page += '<option value="Checking">Checking</option>'
    page += '<option value="Savings">Savings</option>'
    page += '</select> </li><br>'
    page += '<label for="balance">Initial Balance:</label>'
    page += '<input type = "number" name="balance" placeholder="0" required><br><br>'
    page += '<input type="submit" name ="b1" value="Submit" />'
    page += '</form>'
    page += '</ul>'
    page += '</div>'
    page += '</body>'
    page += '</html>'
    res.send(page);
});

//TODO FIX DUPE ACCOUT ERROR & make error page in get /create_account
app.post("/create_account", function (req, res) {
    console.log(req.body);
    let sql = `INSERT INTO account(account_name, account_type, balance, username) ` +
        `VALUES ("${req.body.accountName}", "${req.body.accountType}","${req.body.balance}", (SELECT username FROM customer WHERE username = "${req.session.user}"))`

    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            res.render();
        } else {
            res.redirect('/view_account');
        }
    });
});

//Transfer (within own user accounts), deposit, withdraw 
app.get("/account_actions", requireLogin, function (req, res) {
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

    // alert("You have been logged out. Have a nice day!");
    req.session.reset();
    res.redirect('/');
});

app.listen(3000);