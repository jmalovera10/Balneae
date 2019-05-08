let mongoose = require('mongoose');

let entrySchema = mongoose.Schema({
    TABLE_ID: String,
    NAME: String,
    SEATS: Array,
    AVAILABLE_SEATS: Number,
});

// create the model and expose it to our app
module.exports = mongoose.model('Table', entrySchema);