const express = require('express');
const router = express.Router();

//register user
router.get('/',(req,res)=>{
    console.log(req.body)
    res.send('post router')});

module.exports= router;