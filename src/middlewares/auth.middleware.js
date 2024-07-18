import jwt from 'jsonwebtoken';
import User from '../../DB/models/user.model.js';

export const auth = (accessRoles = 'user') =>{
    return async (req, res, next) => {
        try{
            const {accesstoken} = req.headers;
            if(!accesstoken){
                return next(new Error(`please signIn first`,{cause:400}));
            }

            if(!accesstoken.startsWith(process.env.TOKEN_PRIFEX)){
                return next(new Error(`invalid token prefix`,{cause:400}));
            }

            const token = accesstoken.split(process.env.TOKEN_PRIFEX)[1];
            const decodedData = jwt.verify(token,process.env.JWT_SECRET_LOGIN);
            if(!decodedData || !decodedData.id){
                return next(new Error('invalid token payload',{cause:400}));
            }

            const findUser = await User.findById(decodedData.id);
            if(!findUser){
                return next(new Error('please signUp first',{cause:404}));
            }
            // authorization check
            if(!accessRoles.includes(findUser.role)){
                return next(new Error('you are not allowed to access this route',{cause:401}));
            }
            req.authUser = findUser;
            next();
        }catch(err){
            console.log(err);
            return next(new Error('catch error in auth middleware',{cause:500}));
        }
    }
}