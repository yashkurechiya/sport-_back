const authorizeRoles = (...allowedRoled) => {
    return (req, res,next) => {
        const effectiveRole = req.user.role === "me" ? "admin" : req.user.role;

        if(!allowedRoled.includes(effectiveRole))
        {
            return res.status(403).json({ message: "Access Denied"});
        }
        next();
    }
}

export default authorizeRoles;