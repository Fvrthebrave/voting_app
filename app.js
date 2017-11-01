var express = require('express'),
    bodyParser = require('body-parser'),
    User = require('./models/user-schema'),
    Poll = require('./models/poll-schema'),
    flash = require('connect-flash'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    methodOverride = require('method-override'),
    middleware = require('./middleware/index'),
    app = express();
    

mongoose.connect(process.env.DATABASEURL);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(flash());

/**************Passport Config***************************/
app.use(require('express-session') ({
    secret: "Chewy is the best dog ever!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/*********************************************************/

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

/************CREATE*********************/
app.post('/polls', middleware.isLoggedIn, function(req, res) {
    console.log(req.body);
    User.findOne({username: req.user.username}, function(err, user) {
        if(err) {
            console.log(err);
        } else {
            Poll.create({}, function(err, newPoll) {
                if(err) {
                    console.log(err);
                } else {
                    newPoll.title = req.body.title;
                    newPoll.fields = Object.keys(req.body).map(function(field) {
                        return req.body[field];
                    });
                    newPoll.author = req.user;
                    newPoll.dateCreated = moment().format('MMMM DD, YYYY');
                    
                    newPoll.save();
                    
                    user.polls.push(newPoll);
                    user.save();
                    
                    res.redirect('/polls');
                }
            }); 
        }
    });

});    

// Register new account
app.post('/register', function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            req.flash("error", err.message + "!");
            return res.redirect('/register');
        } else {
            console.log('Account created!');
            passport.authenticate("local")(req, res, function() {
                req.flash("success", "You have successfully created an account for " + user.username);
                return res.redirect('/profile');
            });
        }
    });
});

/*************READ**********************/
app.get('/', function(req, res) {
    res.render('home'); 
});

app.get('/profile/:id', function(req, res) {
    User.findById(req.params.id).populate("polls").exec(function(err, user) {
        if(err) {
            console.log(err);
        } else {
            res.render('profile', { user : user });
        }
    });
});

app.post('/login', passport.authenticate("local",
    {
        successRedirect: "/profile",
        failureRedirect: "/login"
    }), function(req, res) {
       req.flash("success", "You have successfully logged in!"); 
});

// Logout
app.get('/logout', function(req, res) {
    req.logout();
    req.flash("success", "You have successfully logged out!");
    res.redirect('/');
});

// Login
app.get('/login', function(req, res) {
    res.render('login'); 
});

// Register
app.get('/register', function(req, res) {
    res.render('register');
});


app.get('/polls', function(req, res) {
    Poll.find({}, function(err, polls) {
        if(err) {
            console.log(err);
        } else {
            res.render('polls', { polls: polls });
        }
    });
});

app.get('/polls/:id', function(req, res) {
    Poll.findById(req.params.id, function(err, poll) {
        if(err) {
            console.log('Poll was not found!');
        } else {
            res.render('show', { poll : poll });
        }
    });
});

app.get('/new', function(req, res) {
    res.render('new-poll'); 
});

app.get('/results/:id', function(req, res) {
    Poll.findById(req.params.id, function(err, poll) {
        if(err) {
            console.log(err);
        } else {
            var fields = poll.fields;
            var votes = poll.votes;
            
            res.render('results', { poll : poll, fields: fields, votes: votes});
        }
    });
});

app.get("*", function(req, res) {
    res.redirect('/');
});

app.post('/:id/vote', middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate("hasVoted").exec(function(err, user) {
        
        console.log(checkIfVoted(user, req.params.id));
        
        if(err) {
            console.log(err);
        } else if(checkIfVoted(user, req.params.id)) {
            console.log(checkIfVoted(user, req.params.id));
            req.flash("error", "You have already voted on this poll!");
            res.redirect('back');
        } else {
            Poll.findById(req.params.id, function(err, poll) {
                if(err) {
                    console.log(err);
                } else if(Object.keys(req.body).length === 0) {
                    res.redirect('/polls/' + poll._id);
                } else {
                    poll.votes.push(Object.keys(req.body));
                    poll.save();
                    
                    user.hasVoted.push(poll);
                    user.save();
        
                    console.log('User has voted!', poll, user);
                    
                    res.redirect('/results/' + req.params.id);
                }
            });
        }
    });
});


/******************* DESTROY **************************/
app.delete('/profile/:id/:pollId/delete', function(req, res) {
    Poll.findByIdAndRemove(req.params.pollId, function(err, poll) {
        if(err) {
            req.flash("error", "An error occurred!");
            console.log(err);
        } else {
            req.flash("success", "Poll successfully removed!");
            res.redirect('/profile/' + req.params.id);
        }
    });
});



app.listen(process.env.PORT, process.env.IP, function() {
    console.log('Server is listening..'); 
});


function checkIfVoted(user, pollId) {
    var voted = false;
    for(var i = 0; i < user.hasVoted.length; i++) {
        if(user.hasVoted[i]._id.toString() === pollId) {
            voted = true;
            break;
        }
    }
    
    return voted;
}