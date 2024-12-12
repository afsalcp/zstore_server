const {MongoClient} =require("mongodb")

const mongo=new MongoClient(process.env.db_url)

let db=mongo.db("ztore");

module.exports={
    connect:async()=>{
        await mongo.connect()

        db=mongo.db("zstore");

        return true
    },

    get:()=>db
}