const catchError = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });  // this function executes which is in the route & if it generate An error so it passed to next so the error is handle by middleWare
    }
}
module.exports = catchError;