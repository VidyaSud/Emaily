
const mongoose =require('mongoose');
const StockRecon=mongoose.model('stocks');

module.exports = app => {

    app.post('/api/StockRecon', async(req,res) =>{

        const {stockType, stockName, price }= req.body ;

        const stockRecon = new StockRecon ({
            stockType, 
            stockName,
            price
        });
        try 
        {
            await stockRecon.save();
        }
        catch(error){
            res.status(422).send(error) ;
        }

    });

} 