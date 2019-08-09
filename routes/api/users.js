const express = require('express');
const router = express.Router();
var gravatar = require('gravatar');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
var jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
//register user
router.post('/',[
    check('name','Name required').not().isEmpty(),
    check('email','put valid email').isEmail(),
    check('password','password should be more than 6 digits').isLength(6)
],
async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
   const{name,email,password}=req.body;
   try{
       console.log(email)
       let user = await User.findOne({email});
   if(user){
    return res.status(400).json({errors:[{msg:'User already exists'}]})
   }
   const avatar = gravatar.url(email,{
       s:'200',
       r:'pg',
       d:'mm'
   })
     user = new User({
         name,
         email,
         avatar,
         password
     })
     //encypt password
     const salt = await bcrypt.genSalt(10);
     user.password = await bcrypt.hash(password,salt);
     await user.save();
     //token
     const payload={
         user:{
             id:user.id
         }
     }
     jwt.sign(payload,config.get('jwtsecret'),
     {expiresIn:3600},
     (err,token)=>{
         if(err) throw err;
         console.log(token)
         res.json({token})
     })
   }
   catch(err){
       console.log(err.message);
       res.status(500).send('server error')
   }
    });

module.exports= router;