const express=require('express')
const db = require('../configs/db')


const router=express.Router()

const deliveryCharges=[
    {
        type:"Standard Deliver",
        timeTake:"1-4",
        price:"4.5",
        id:1
    },
    {
        type:"Express Delivery",
        timeTake:'1',
        price:"10.0",
        id:2
    },
    {
        type:"Pickup in Store",
        timeTake:"1-3",
        price:"Free",
        id:3
    }
]

router.get('/delivery-charge',(req,res)=>{
    try {
        if(!req.session.user?.login)throw "You are not authenticated yet..."


        return res.json({sts:true,charges:deliveryCharges})

    } catch (e) {
        console.log(e);
        
        if(typeof e=='string'){
            return res.json({sts:false,msg:e})
        }
        return res.json({sts:false,msg:"something went wrong..."})
    }
})

router.post('/add-new',async(req,res)=>{
    try {
        if(!req.session.user?.login)throw "You are not authenticated yet..."

        let {qty,productId}=req.body

        console.log(req.body)

        if(!qty||!productId)throw 'please provide required data'

        let cart=await db.get().collection('cart').findOne({email:req.session.user.email})
        
        if(!cart){
            await db.get().collection('cart').insertOne({email:req.session.user?.email,cart:{
                [productId]:qty
            }})

            return res.json({sts:true,cart:{
                [productId]:qty
            }})
        }

        cart.cart[productId]=qty

        await db.get().collection('cart').updateOne({email:req.session.user?.email},{
            $set:{
                cart:cart.cart
            }
        })

        return res.json({sts:true,cart:cart.cart})

    } catch (error) {

        console.log(error)
        if(typeof error==='string')return res.json({sts:false,msg:error})
        return res.json({sts:false,msg:'something went wrong...'})
    }
})

router.delete('/remove/:id',async(req,res)=>{
    try {
        if(!req.session.user?.login)throw "You are not authenticated yet..."

        const {id}=req.params


        let cart=await db.get().collection('cart').findOneAndUpdate({email:req.session.user.email},{
            $unset:{
                [`cart.${id}`]:""
            }
            
        },{returnDocument:'after'})

        console.log(cart)

        return res.json({sts:true,cart:cart.cart})

    } catch (error) {
        console.log(error)
        if(typeof error==='string')return res.json({sts:false,msg:error})
        return res.json({sts:false,msg:'something went wrong...'})
    }
})

router.get('/get-data',async(req,res)=>{
    try {
        if(!req.session.user?.login)throw "You are not authenticated yet..."

        let data=await db.get().collection('cart').findOne({email:req.session.user.email})

        if(!data)throw 'Nothing on cart'

        return res.json({sts:true,cart:data.cart})
    } catch (error) {
        console.log(error)
        if(typeof error==='string')return res.json({sts:false,msg:error})
        return res.json({sts:false,msg:'something went wrong...'})
    }
})


module.exports=router