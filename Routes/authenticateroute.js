const express = require("express");
const router=express.Router();

const { signup, login,  authMiddleware, loginWithCookie, logout } = require("../controllers/userController");

router.post('/register',signup);
router.post('/login',login);


router.get('/login',authMiddleware,loginWithCookie);
router.get('/logout',logout);



router.all('/*',(req,res)=>{
    
    console.log(req.method,req.path);
    res.status(404);
    res.send("Invalid api endpoint");
})

module.exports = router;