const asyncHandler = (fn) => (req, res, next) => {
    // Wrap the function in a Promise and catch any errors to pass to next()
    Promise.resolve(fn(req, res, next)).catch(next); 
};

export default asyncHandler;