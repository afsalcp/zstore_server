const db = require("../configs/db");
const salt = require("../configs/encrypt");

const router = require("express").Router(),
  bcrypt = require("bcrypt");

router.post("/create-account", async (req, res) => {
  try {
    let {
      lname,
      fname,
      pincode,
      building,
      area,
      city,
      state,
      phone,
      email,
      password,
    } = req.body;

    try {
      if (!fname || fname.length < 4 || fname.length > 20) throw 0;
      if (lname.length < 4 || lname.length > 20) throw 1;
      if (!/^(.+)@(.+)\.(.+)$/.test(email)) throw 2;
      if (!/^([0-9]){10}$/.test(phone)) throw 3;
      if (!/^(.+){3,20}$/.test(state)) throw 4;
      if (!/^(.+){3,20}$/.test(city)) throw 5;
      if (!/^(.+){3,20}$/.test(area)) throw 6;
      if (!/^(.+){3,20}$/.test(building)) throw 7;
      if (!/^(\d){6}$/.test(pincode)) throw 8;
      if (
        !/\d/.test(password) ||
        !/[a-zA-Z]/.test(password) ||
        !/^[a-zA-Z0-9@#$%^&*!~]{8,20}$/.test(password)
      )
        throw 9;

      if(await db.get().collection('user').countDocuments({$or:[{email},{phone}]})!=0)return res.json({error:true,msg:"email or phone number is already in use"})

      let pass_crypt = await bcrypt.hash(password, salt);

      await db.get().collection("user").insertOne({
        fname,
        lname,
        email,
        password: pass_crypt,
        pincode,
        building,
        area,
        city,
        state,
        phone,
      });

      res.json({ error: false });
    } catch (e) {
      console.log(e);
      return res.json({ error: true, msg: "Please fill data correctly" });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: true, msg: "something went wrong" });
    return;
  }
});

router.post("/login",async(req,res)=>{
  try {
    let {email,password,phone}=req.body

    let data=await db.get().collection("user").findOne({$or:[{email},{phone}]})
    if(!data) return res.json({error:true,msg:"Can't find an account associated with this email"})

    let match=bcrypt.compareSync(password,data.password)
    if(!match)return res.json({error:true,msg:"Invalid Email/Password"})

    req.session.user={
      login:true,
      email:email
    }
    return res.json({error:false,msg:"successfully logged",})
  } catch (error) {
    return res.json({error:true,msg:"Something went wrong "})
  }
})

router.get('/getData',async(req,res)=>{
  if(!req.session?.user?.login)return res.json({sts:false,msg:"Please login to your account"})
  let data=await db.get().collection('user').findOne({email:req.session.user.email})
  if(!data)return res.json({sts:false,msg:"Something went wrong"})
  
  delete data._id
  delete data.password

  return res.json({sts:true,...data})
  
})

router.get("/trending-items",async(req,res)=>{
  try{
    if(!req.session.user?.login)return res.json({sts:false,msg:"You are not authenticated yet "})
    
    let all_prods=await (await fetch("https://dummyjson.com/products")).json()

    let sortedByCategory={}

    all_prods.products.forEach(prod => {
      if(sortedByCategory[prod.category])sortedByCategory[prod.category].push(prod)
      else sortedByCategory[prod.category]=[prod]
    });

    let all_category=Object.keys(sortedByCategory)

    all_category.forEach(category=>{
      sortedByCategory[category].sort(()=>.5-Math.random())

      sortedByCategory[category]=sortedByCategory[category].map(prod=>{
        return {
          title:prod.title,
          price:prod.price,
          category:prod.category,
          image:prod.thumbnail,
          rating:prod.rating,
          id:prod.id
        }
      })
    })

    

    return res.json({
      sts:true,
      products:sortedByCategory
    })
    
    
  }catch(e){
    console.log(e)

    return res.json({sts:false,msg:"Something went wrong.."})
  }
})

router.get('/get-product',async(req,res)=>{
  try{

    if(!req.session.user?.login)throw "You are not authenticated yet..."

    if(!req.query?.product_id)throw "Please specify the product id"

    let data=await (await fetch(`https://dummyjson.com/products/${req.query.product_id}`,{method:"get"})).json()

    return res.json({sts:true,product:data})
    


  }catch(e){
    console.log(e);

    if(typeof e =='string')return res.json({sts:false,msg:e})
    return res.json({sts:false,msg:"Something went wrong..."})
    
  }
})



module.exports = router;
