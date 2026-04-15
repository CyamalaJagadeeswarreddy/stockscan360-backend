// This is a temporary mock authentication to let the server start
module.exports = function(req, res, next) {
    // For now, we just let every request pass through
    // You will add your real JWT/Token logic here later
    next();
};