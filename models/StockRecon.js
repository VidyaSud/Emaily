const mongoose = require('mongoose');

const {Schema} = mongoose; //const Schema = mongoose.Schema;

const stockReconSchema = new Schema ({ 
    stockType:String,
    stockName:String,
    price:Number
});

mongoose.model('stocks', stockReconSchema);