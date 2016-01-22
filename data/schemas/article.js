var Schema = require('mongoose').Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
        unique: true
    },
    body: String,
    author: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
            'default': Date.now
    }
});

ArticleSchema.statics.search = function (str, callback) {
    var regexp = new RegExp(str, 'i');
    return this.find({
        '$or': [{
            title: regexp
        }, {
            body: regexp
        }]
    }, callback);
};

module.exports = ArticleSchema;