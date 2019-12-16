const mongoose = require('mongoose');
const mongopa = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
    userID : {type: Schema.Types.ObjectId, ref : 'User'},
    item : {type: Schema.Types.ObjectId, ref : 'Item' },
    content : {type : String, trim:true, required : true},
    starScore : {type : Number, default : 0},
    createdAt: {type:Date, default:Date.now}

},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

schema.plugin(mongopa);

var Comment = mongoose.model('Comment', schema);

module.exports = Comment;
