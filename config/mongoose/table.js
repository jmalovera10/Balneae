var mongoose = require('mongoose');

var entrySchema = mongoose.Schema({
    TABLE_ID: Number,
    NAME: String,
    SEATS: Object,
    AVAILABLE_SEATS: Number,
});

// create the model and expose it to our app
module.exports = mongoose.model('Table', entrySchema);