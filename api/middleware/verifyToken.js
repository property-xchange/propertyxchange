import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  console.log(token);

  if (!token) return res.status(401).json({ message: 'Not Authenticated!' });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.status(403).json({ message: 'Token is not Valid!' });

    console.log(payload);

    req.userId = payload.id;

    console.log(req.userId);
    console.log(token);

    next();
  });
};
