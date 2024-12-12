const db = require('../configs/db')

const router=require('express').Router()


router.post('/add-new/:id',async(req,res)=>{
    try {
        
        if(!req.session.user?.login)throw "You are not authenticated yet..."

        let {id}=req.params

        if(!id)throw "Please provide details"

        let data=await db.get().collection('fav').findOne({email:req.session.user.email})

        if(!data){
            data={
                email:req.session.user.email,
                fav:[id]
            }

            await db.get().collection('fav').insertOne(data)
            return res.json({sts:true,fav:data.fav})
        }

        data.fav.indexOf(id)==-1?await db.get().collection("fav").updateOne({email:req.session.user.email},{$push:{fav:id}}):null
        data.fav=data.fav.filter(x=>x!=id)
        data.fav.push(id)

        return res.json({sts:true,fav:data.fav})

    } catch (error) {
        console.log(error)
        if(typeof error==='string')return res.json({sts:false,msg:error})
        return res.json({sts:false,msg:'something went wrong...'})
    }
})

router.delete('/remove/:id',async(req,res)=>{
    try {
        if(!req.session.user?.login)throw "You are not authenticated yet..."

        let {id}=req.params

        if(!id)throw "Please provide details"

        let data=await db.get().collection('fav').findOneAndUpdate({email:req.session.user.email},{$pull:{fav:id}},{returnDocument:'after'})

        return res.json({sts:true,fav:data.fav})


    } catch (error) {
        console.log(error)
        if(typeof error==='string')return res.json({sts:false,msg:error})
        return res.json({sts:false,msg:'something went wrong...'})
    }
})


router.get('/get-data',async(req,res)=>{
    try {
        if(!req.session.user?.login)throw "You are not authenticated yet..."

        let data=await db.get().collection('fav').findOne({email:req.session.user.email})

        if(!data)throw 'Nothing on cart'

        return res.json({sts:true,fav:data.fav})
    } catch (error) {
        console.log(error)
        if(typeof error==='string')return res.json({sts:false,msg:error})
        return res.json({sts:false,msg:'something went wrong...'})
    }
})

module.exports=router