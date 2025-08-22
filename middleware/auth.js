import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const token = req.cookies?.token; // get token from cookies
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded?.id; // attach user info from token
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
