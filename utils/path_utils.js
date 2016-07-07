/**
 * Move one Level up
 * @param theUrl The url to move up
 * @returns {string} The url without the last element
 */
function movePathUp(theUrl) {
    var sep = "/";
    var arr = theUrl.split(sep);
    arr.pop();
    return arr.join(sep);
}

module.exports.movePathUp = movePathUp;