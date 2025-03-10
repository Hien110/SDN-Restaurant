const mongoose = require('mongoose');
const { Schema } = mongoose;

const TakeCareSchema = new Schema({
    table: {type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true},
    staff: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    date:  {type: Date, required: true},
    startTime: {type: String, required: true},
    endTime: {type: String, required: true},
});

module.exports = mongoose.model('TakeCare', TakeCareSchema);