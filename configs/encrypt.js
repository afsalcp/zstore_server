const bcrypt=require("bcrypt")

const salt=bcrypt.genSaltSync();

module.exports=salt