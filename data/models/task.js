var mongoose = require('mongoose');
var TaskSchema = require('../schemas/task');

var User = mongoose.model('Task', TaskSchema);

module.exports = User;