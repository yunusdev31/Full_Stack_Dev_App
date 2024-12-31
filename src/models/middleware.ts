import jwt from 'jsonwebtoken'
import {Request, Response, NextFunction} from 'express'
import {User} from './userSchema'
const secret = 'Data@123';

interface decodedObj {
    userId: string
}

export const authMiddleware = (roles: string[]) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try{
       const token = req.headers['x-access-token'] as string;
       
       if(!token){
        res.status(400).json({message: "Token not provided !!"})
        return
       }

       const decoded = jwt.verify(token, secret) as  decodedObj

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
                    return
                }
            }
        }
       } catch(error: any){
        res.status(500).json({message: error.message})
        return
    }
}
