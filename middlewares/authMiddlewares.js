import jwt from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
    let token;
   const authHeader = req.headers["authorization"];
 if(authHeader && authHeader.startsWith("Bearer"))
    {
        token = authHeader.split(" ")[1];

        if(!token)
        {
            return res.status(401).json({ message:" NO Token"});
        }

        try {

            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
            console.log("The decoded user is : ", req.user);

            // res.status(200).json({})
            next();
            
        } catch (error) {
            res.status(400).json({ message : "Token is not valid "});
        }
    }
}

export default verifyToken;