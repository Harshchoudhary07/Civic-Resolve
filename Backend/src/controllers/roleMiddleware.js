const authorize = (...roles) => {
  return (req, res, next) => {
    // CRITICAL: Guard against this middleware running without the 'protect' middleware first.
    if (!req.user) {
      res.status(401);
      throw new Error('Not authenticated. User context is missing for authorization.');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403); // 403 Forbidden is the correct status code for authorization failure
      throw new Error(`Forbidden. Your role (${req.user.role}) is not authorized to access this resource.`);
    }
    
    next();
  };
};

module.exports = { authorize };