const express = require('express');
const router = express.Router();
const auth = require('../../middlerware/auth');
const User = require('../../models/User');
var jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');


//register user
router.get('/',auth,async(req,res)=>{
    try{ const user = await User.findById(req.user.id).select('-password');
    res.json(user);
    res.send('auth router')}
    catch(err){
        res.status(401).json({msg:'error occured'})
    }
});
router.post('/',[
    check('email','put valid email').isEmail(),
    check('password','password is required' ).exists()
],
async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
   const{email,password}=req.body;
   try{
       let user = await User.findOne({email});
   if(!user){
    return res.status(400).json({errors:[{msg:'invalid credentials'}]})
   }


   const isMatch = await bcrypt.compare(password,user.password)

   if(!isMatch){
    return res.status(400).json({errors:[{msg:'invalid credentials'}]})
   }
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