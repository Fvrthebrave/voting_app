var express = require('express'),
    bodyParser = require('body-parser'),
    Poll = require('./models/poll-schema'),
    mongoose = require('mongoose'),
    app = express();
    

mongoose.connect('mongodb://localhost/voting_app');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// CREATE
app.post('/polls', function(req, res) {
    Poll.create({}, function(err, newPoll) {
        if(err) {
            console.log(err);
        } else {
            newPoll.title = req.body.title;
            newPoll.fields = Object.values(req.body);
            
            newPoll.save();
            res.redirect('/polls');
        }
    });
});    


// READ
app.get('/', function(req, res) {
    res.render('home'); 
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

app.post('/:id/vote', function(req, res) {
    Poll.findById(req.params.id, function(err, poll) {
        if(err) {
            console.log(err);
        } else if(Object.keys(req.body).length === 0) {
            res.redirect('/polls/' + poll._id);
        } else {
            poll.votes.push(Object.keys(req.body));
            poll.save();
            
            console.log('User has voted!', poll);
            res.redirect('/results/' + req.params.id);
        }
    });
});



app.listen(process.env.PORT, process.env.IP, function() {
    console.log('Server is listening..'); 
});