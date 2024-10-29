const jwt = require('jsonwebtoken')
const User = require('./userSchema')
const secret = 'Data@123';

const authMiddleware = (roles) => async (req, res, next) => {
    try{
       const token = req.headers['x-access-token'];
       
       if(!token){
        res.status(400).json({message: "Token not provided !!"})
       }

       jwt.verify(token, secret, async (err, decoded)=>{
        if(err){
            if(err.name == "TokenExpiredError"){
                return res.status(400).json({message: "Token expired !!"})
            }
            else if(err.name === 'JsonWebTokenError'){
                console.log("JsonWebTokenError")
                return res.status(400).json({message : "Token doesn't match"})
            }
            return res.status(500).json({message: err.message})
        }

        if(decoded){
            let userId = decoded.userId;
            console.log("userId===", userId)
            const user = await User.findById(userId)

            if(user) {
                if(roles.includes(user.role)){
                    next();
                }
                else{
                    res.status(400).json({message: "Not Authorized !!"})
                }
            }
        }
       })
    } catch(error){
        res.status(500).json({message: error.message})
    }
}

module.exports = authMiddleware