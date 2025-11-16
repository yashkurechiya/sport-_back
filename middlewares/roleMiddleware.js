const authorizeRoles = (...allowedRoled) => {
    return (req, res,next) => {
        if(!allowedRoled.includes(req.user.role))
        {
            return res.status(403).json({ message: "Access Denied"});
        }
        next();
    }
}

export default authorizeRoles;