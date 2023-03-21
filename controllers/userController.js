const router=require("express").Router();
const Member=require("../Routes/Models/Member")
const bcrypt=require("bcrypt");
const { verifyPasswordHash, generatePasswordHash } = require("../utils/passwordUtil");
const { responseCreator, errorCreator } = require("../utils/responseHandler");
const { generateToken, verifyToken } = require("../utils/jwtUtil");


const signup =async (req,res)=>{

    try{
    const salt=await bcrypt.genSalt(10);
    const hashedpassword=await bcrypt.hash(req.body.password,salt)
    const member=await new Member({
        username:req.body.username,
        email:req.body.email,
        password:hashedpassword
    })
    await member.save();
    res.send("Register Success")
}catch(err)
{
    res.send(err);
}
}
const loginWithCredentials = async (req,res,next)=>{
    try{
        
    
    const {email}=req.body;
    const {password}=req.body;
    const {password:pwdHash,...userData}=await Member.findOne({email:email})
	
   if (await verifyPasswordHash(password, pwdHash)) {
            const token = generateToken(userData);
            console.log(token);
            res.cookie('token', token, { httpOnly: true, maxAge: 3600 * 1000 });

            res.status(200);
           
            res.send(responseCreator(` logged in successfully`, userData._doc));
        } else {
            errorCreator("Incorrect Password!!!", 401);
        }

    } catch (error) 
	{
        next(error);
    }
}

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const data = verifyToken(token);
        const {email}=data._doc;
        const {...userData } = await Member.findOne({email:email});
        console.log(userData)
        if (userData) {
            res.locals.userData = userData;
            next();
        }
    } catch (error) {
        next(error);
    }
};


const loginWithCookie = async (req, res, next) => {
    try {
        res.send(responseCreator("User authenticated with Cookie", res.locals.userData));
    } catch (error) {
        next(error);
    }
};



const logout = async (req,res,next)=>{
    res.clearCookie('token');
    res.send(responseCreator("User logged out successfully!!!"))
}

module.exports = { login: loginWithCredentials, signup,  loginWithCookie, authMiddleware, logout };