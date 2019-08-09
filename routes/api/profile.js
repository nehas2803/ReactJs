const express = require('express');
const router = express.Router();
const auth = require('../../middlerware/auth');
const Profile = require('../../models/profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
//register user
router.get('/me',auth,async(req,res)=>{
   try{
       console.log(req.user)
    const profile = await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
     if(!profile){
         return res.status(400).json({msg:'There is no profile for this user'})
     } 
res.json(profile);
}
catch(err){
    console.log(err.message);
    res.status(500).send('server Error');
}});

//create post
router.post('/',[auth,
check('status','Status required').not().isEmpty(),
check('skills','Skills is required').not().isEmpty()
],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
 const {company,website,location,bio,status,
githubusername,skills,youtube,facebook,twitter,instagram,linkedin}= req.body;
//build profile object

const profilefields = {};
profilefields.user = req.user.id;
if(company) profilefields.company=company;
if(website) profilefields.website=website;
if(location) profilefields.location=location;
if(bio) profilefields.bio=bio;
if(status) profilefields.status=status;
if(githubusername) profilefields.githubusername=githubusername;
if(skills) {profilefields.skills=skills.split(',').map(skill=>skill.trim());}
// Build social object
profilefields.social ={}
if(youtube) profilefields.social.youtube=youtube;
if(facebook) profilefields.social.facebook=facebook;
if(twitter) profilefields.social.twitter=twitter;
if(instagram) profilefields.social.instagram=instagram;
if(youtube) profilefields.social.linkedin=linkedin;
try{
    console.log(profilefields.skills)
let profile = await Profile.findOne({user:req.user.id})
console.log(req.user.id)
console.log(profile+'old')
if(profile){
    profile = await Profile.findOneAndUpdate(
        {user:req.user.id},
        {$set:profilefields},
        {new:true})
    console.log('blovk')
    return res.json(profile); 
}

//Create profile
profile = new Profile(profilefields);
console.log(profile)
await profile.save();
return res.json(profile+'neha');
}catch(err){
    console.log(err.msg);
    res.status(500).send('Server Error')
}
res.send(skills)
}
);
//get all profile
router.get('/user/:user_id',async(req,res)=>{
try {

    const profiles = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
console.log(profiles)
    if(!profiles){
        return res.status(400).json({msg:'No profile found'})
    }
    res.json(profiles);
} catch (error) {
    if(error.kind=='ObjectID'){
        return res.status(400).json({msg:'No profile found'})
    }
    console.log(error.message);
    return res.status(500).send('Server Error');
}
})
//delete user
router.delete('/',auth,async(req,res)=>{
    try {
         console.log(req.user)
        await Profile.findOneAndRemove({user:req.user.id})
        await User.findOneAndRemove({_id:req.user.id})
        res.json({msg:'User deleted'});
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server Error');
    }
    })

//add experience
router.put('/experience',[auth,
check('title','Title cannot be empty').not().isEmpty(),
check('company','company cannot be empty').not().isEmpty(),
check('from','from cannot be empty').not().isEmpty(),

],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    
    const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
    } = req.body;
    const newxep = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

        try {
            console.log("hi")
        let profile = await Profile.findOne({user:req.user.id});
        profile.experience.unshift(newxep);
        await profile.save();
        return res.json({msg:"success"})
        } catch (error) {
            console.log(error.msg);
            res.status(500).send('Server error')
        }
})
//delete request experience
router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try {
        let profile = await Profile.findOne({user:req.user.id});
        //Get correct index to remove
        var removeIndex = profile.experience.map(item=>item.id).indexOf(
            req.params.exp_id
        )
        profile.experience.splice(removeIndex,1);

        await profile.save();
        return res.json(profile)

    } catch (error) {
        console.log(error.msg);
        res.status(500).send('Server error')
    }
})
// add education
router.put('/education',[auth,
    check('school','school cannot be empty').not().isEmpty(),
    check('degree','degree cannot be empty').not().isEmpty(),
    check('fieldofstudy','fieldofstudy cannot be empty').not().isEmpty(),
    
    ],async(req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
    
        } = req.body;
        const newxep = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }
    
            try {
            let profile = await Profile.findOne({user:req.user.id});
            profile.education.unshift(newxep);
            await profile.save();
            return res.json({msg:"success"})
            } catch (error) {
                console.log(error.msg);
                res.status(500).send('Server error')
            }
    })
    //delete request education
    router.delete('/education/:exp_id',auth,async(req,res)=>{
        try {
            let profile = await Profile.findOne({user:req.user.id});
            //Get correct index to remove
            var removeIndex = profile.education.map(item=>item.id).indexOf(
                req.params.exp_id
            )
            profile.education.splice(removeIndex,1);
    
            await profile.save();
            return res.json(profile)
    
        } catch (error) {
            console.log(error.msg);
            res.status(500).send('Server error')
        }
    })
module.exports= router;