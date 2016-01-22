/*
 * Task Routes
 */

var async = require('async');

var Task = require('../data/models/task');
var notLoggedIn = require('./middleware/not_logged_in');
var loadArticle = require('./middleware/load_task');
var loggedIn = require('./middleware/logged_in');

var maxArticlesPerPage = 10;

var taskEdit;
module.exports = function (app) {

    app.get('/tasks', function (req, res, next) {
        var page = req.query.page && parseInt(req.query.page, 10) || 0;
        async.parallel([

        function (next) {
            Task.count(next);
        },

        function (next) {
            Task.find({})
                .sort('title')
                .skip(page * maxArticlesPerPage)
                .limit(maxArticlesPerPage)
                .exec(next);
        }],

        // final callback
        function (err, results) {

            if (err) {
                return next(err);
            }

            var count = results[0];
            var tasks = results[1];

            var lastPage = (page + 1) * maxArticlesPerPage >= count;

            res.render('note', {
                title: 'Tasks',
                tasks: tasks,
                page: page,
                lastPage: lastPage
            });

        });
    });

    app.get('/tasks/new', loggedIn, function (req, res) {
        res.render('tasks/new', {
            title: "New Task"
        });
    });

    app.get('/tasks/:title', loadArticle, function (req, res, next) {
        res.render('tasks/task', {
            layout: false,
            title: req.task.title,
            task: req.task
        });
    });

    app.post('/tasks', loggedIn, function (req, res, next) {
        var task = req.body;
        task.author = req.session.user._id;
        Task.create(task, function (err) {
            if (err) {
                if (err.code === 11000) {
                    res.send('Conflict', 409);
                } else {
                    if (err.name === 'ValidationError') {
                        return res.send(Object.keys(err.errors).map(function (errField) {
                            return err.errors[errField].message;
                        }).join('. '), 406);
                    } else {
                        next(err);
                    }

                }
                return;
            }
            res.redirect('/tasks');
        });
    });

    app.del('/tasks/:title', loggedIn, loadArticle, function (req, res, next) {
        req.task.remove(function (err) {
            if (err) {
                return next(err);
            }
            res.redirect('/tasks');
        });

    });

    app.get('/tasks/edit/:title', loadArticle, function (req, res, next) {
        res.render('tasks/edit', {
            title: req.task.title,
            task: req.task
        });
    });

//below is for edit. T
    app.post('/tasks/edit/:title',loggedIn,loadArticle, function(req,res,next){
        var userToUpdate = req.task.id;
        Task.update({
             _id: userToUpdate},
              req.body, 
              function (err, result) {
               res.redirect('/tasks');
           }
        );
    });

    app.get('/tasks/search', function (req, res, next) {
        console.log('searching for', req.query.q);
        Task.search(req.query.q, function (err, tasks) {
            if (err) {
                return next(err);
            }
            res.render('tasks/index', {
                title: 'Task search results',
                Tasks: tasks,
                page: 0,
                lastPage: true
            });
        });
    });

};