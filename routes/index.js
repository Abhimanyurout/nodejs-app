var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");

// app.use(cookieParser());


mongoose
  .connect('mongodb://127.0.0.1:27017/backend')
  .then(() => console.log('Connected!'));

const userSchema=new mongoose.Schema({
  name:String,
  email:String,
  password:String,
});

const User=mongoose.model("User",userSchema);

const isAuthenticated=async (req, res, next)=> {
  const {token}=req.cookies;
  if(token){
    const decoded=jwt.verify(token,"abhirout");

    req.user=await User.findById(decoded._id);

    next();
  }else{
    res.redirect("/login");
  }
};
/* GET home page. */
router.get('/', isAuthenticated , (req,res)=>{
  // console.log(req.user);
  res.render("logout",{name:req.user.name});
}); 

router.get('/login', (req,res)=>{
  res.render("login");
}); 

router.get('/register', (req,res)=>{
  res.render("register");
}); 

router.post('/login',async (req,res)=>{
  const{email,password}=req.body;

  let user=await User.findOne({email});

  if(!user){
    return res.redirect("/register");
  }

  const isMatch= await bcrypt.compare(password , user.password);

  if(!isMatch) return res.render("login", {email ,message:"Incorrect password"});

  const token=jwt.sign({_id:user._id},"abhirout");

  res.cookie("token", token,{
    httpOnly:true,
    expires:new Date(Date.now()+60*1000),
  });
  res.redirect("/");
});

router.post('/register',async (req, res)=>{
const{name ,email,password}=req.body;

let user=await User.findOne({email});
if(user){
  return res.redirect("/login");
}
const hashedPassword= await bcrypt.hash(password, 10);

user=await User.create({
  name,
  email,
  password :hashedPassword,
});
const token=jwt.sign({_id:user._id},"abhirout");

  res.cookie("token", token,{
    httpOnly:true,
    expires:new Date(Date.now()+60*1000),
  })
  res.redirect("/");
});

router.get('/logout', (req, res)=>{
  res.cookie("token",null,{
    httpOnly:true,
    expires:new Date(Date.now()),
  });
  res.redirect("/");
});

module.exports = router;
