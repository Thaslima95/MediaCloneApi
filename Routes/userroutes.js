const router=require("express").Router();
const Member=require("./Models/Member")
const bcrypt=require("bcrypt")





//update

router.put("/:id",async (req,res)=>{
    try{
    const userId=req.body.userId;
    if(userId===req.params.id || req.body.isAdmin)
    {
        if(req.body.password)
        {
            try{
                const salt=await bcrypt.genSalt(10)
                req.body.password=await bcrypt.hash(req.body.password,salt)
                res.send("Your password has been updated succesfully")

            }catch(err)
            {
res.send(err)
            }
        }
const updatemember=await Member.findByIdAndUpdate(userId,{$set:req.body})
res.send("Your profile has been updated successfully")
    }
    else{
        res.send("Oops! you are trying to update someone's account")
    }
}catch(err)
{
    res.send("Oops! you are trying to update someone's account")
}
})

//Delete a user

router.delete("/:id",async (req,res)=>{
    try{
const id=req.body.userId;
if(id===req.params.id)
{
    const deleted=await Member.findByIdAndDelete(req.params.id)
    res.send("Your account has been deleted successfully!")
}
else{
    res.send("you can delete your account only")
}


    }catch(err)
    {
        res.send("you cannot delete someone account")
    }
})
// router.get("/:id",async (req,res)=>{
//     try{
//     const user=await Member.findById(req.params.id)
//     const {password,updatedAt,...objs}=user._doc;
//     !user && res.send("User Not found")
//     res.status(200).send(objs)
//     }catch(error)
//     {
//         res.json(error)
//     }
// })
router.get("/",async (req,res)=>{
    try{
        const userId=req.query.userId;
        const username=req.query.username;
        const user=userId ? await Member.findById(userId) : await Member.findOne({username:username})
 const {password,updatedAt,...objs}=user._doc;
    !user && res.send("User Not found")
    res.status(200).send(objs)
    }
    catch(err)
    {res.json(err)

    }
})

//get friends list
router.get("/friends/:userId",async (req,res)=>{
    try{
        const user= await Member.findById(req.params.userId);
        const friends=await Promise.all(user.following.map((friendId)=>{
            return Member.findById(friendId)
        })
        )
        let friendList=[];
        friends.map((friend)=>{
            const {_id,username,profilePicture}=friend;
            friendList.push({_id,username,profilePicture})
        })
        res.status(200).json(friendList)

    }
    catch(err)
    {
        console.log(err)
    }
})

//follow a user
router.put("/:id/follow",async (req,res)=>{
    try{
        if(req.body.userId !== req.params.id)
        {
            const followuser=await Member.findById(req.params.id)
            const followinguser=await Member.findById(req.body.userId)
            if(!followuser.followers.includes(req.body.userId))
            {
               await  followuser.updateOne({$push : {followers:req.body.userId}})
               await followinguser.updateOne({$push:{following:req.params.id}})
               res.send("You have now sucessfully followed with user")
            }
            else{
                res.send("you have already following this user")
            }

        }else{
            res.send("You cannot follow yourself")
        }

    }catch(err)
    {
        res.send(err)
    }
})

//unfollow a user

router.put("/:id/unfollow",async (req,res)=>{
    try{
        const followuser=await Member.findById(req.params.id)
        const followinguser=await Member.findById(req.body.userId)
        if(followuser.followers.includes(req.body.userId))
        {
            await followuser.updateOne({$pull:{followers:req.body.userId}})
            await followinguser.updateOne({$pull:{following:req.params.id}})
            res.status(200).send("You have unfollow this user successfully")
        }
        else{
            res.send("You have not followed this user")
        }

    }catch(err)
    {
        res.send(err)
    }
})

module.exports=router;
