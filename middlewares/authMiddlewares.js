import jwt, { decode } from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    try {

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "No token"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

export default verifyToken;
