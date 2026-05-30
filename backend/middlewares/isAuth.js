import jwt from 'jsonwebtoken';

const isAuth = async(req, res, next) => {
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(400).json({ message: 'Token does not found' });
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = verifyToken.userId;
        next();
    }
    catch(err){
        console.error(err);
        return res.status(400).json({ message: 'Invalid token isAuth error' });
    }
}

export default isAuth;