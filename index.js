const cookieParser = require("cookie-parser")
const express =require("express"),
mainRoute=require("./routes/main"),
cartRoute=require('./routes/cart'),
favoriteRoute=require('./routes/favourite')

cors=require("cors"),
bodyParser=require("body-parser"),
session=require("express-session")


const app=express()

app.set("trust proxy",1)

const domains=['http://localhost:3000','http://192.168.1.16:3000']
app.use(cors({
    
    origin:(origin,cb)=>{
        if(!origin ||domains.includes(origin))return cb(null,true)
        cb(new Error("not allowed request"))
    }, 
    credentials: true
}))

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
app.use(cookieParser())

app.use(session({
    secret:'zstore session',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:15*24*60*60*1000,
        
    }
}))



app.use('/',mainRoute)
app.use('/cart',cartRoute)
app.use('/fav',favoriteRoute)


app.listen(8080,()=>{
    console.log("server started")
})
