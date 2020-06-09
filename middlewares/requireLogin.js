module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).send({ error: " You must log in" });
  }
  next();
};

//https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
