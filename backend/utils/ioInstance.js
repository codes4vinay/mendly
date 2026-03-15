/**
 * Global IO instance holder
 * Allows controllers and other modules to access Socket.IO instance
 */

let ioInstance = null;

/**
 * Set the global IO instance
 * @param {Object} io - Socket.IO instance
 */
export const setIO = (io) => {
    ioInstance = io;
};

/**
 * Get the global IO instance
 * @returns {Object|null} Socket.IO instance or null if not initialized
 */
export const getIO = () => {
    return ioInstance;
};

export default { setIO, getIO };
