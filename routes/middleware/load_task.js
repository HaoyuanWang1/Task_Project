var Task = require('../../data/models/task');

function loadTask(req,res,next){

  Task.findOne({title: req.params.title})
    .populate('author')
    .exec(function(err, task) {
      if (err) {
        return next(err);
      }
      if (! task) {
        return res.send('Not found', 404);
      }
      req.task = task;
      next();
    });
}

module.exports = loadTask;