const {MongoClient} =require("mongodb")

const mongo=new MongoClient("mongodb+srv://cpafsal66:TBNY5M6422gI5t63@zstore.fnj8x.mongodb.net/?retryWrites=true&w=majority&appName=zstore")

let db=mongo.db("ztore");

module.exports={
    connect:async()=>{
        await mongo.connect()

        db=mongo.db("zstore");

        return true
    },

    get:()=>db
}