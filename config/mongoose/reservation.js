let mongoose = require('mongoose');

let entrySchema = mongoose.Schema({
    TABLE_ID: String,
    SEAT_ID: String,
    USER_ID: String,
    STATUS: String,
    UNTIL: Number
});

// create the model and expose it to our app
module.exports = mongoose.model('Reservation', entrySchema);