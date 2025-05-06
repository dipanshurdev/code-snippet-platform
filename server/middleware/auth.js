import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" })
  }

  const token = authHeader.split(" ")[1]

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")

    // Add user ID to request
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" })
  }
}

export const optionalAuth = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next()
  }

  const token = authHeader.split(" ")[1]

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")

    // Add user ID to request
    req.userId = decoded.userId
  } catch (error) {
    // Continue without setting userId
  }

  next()
}
