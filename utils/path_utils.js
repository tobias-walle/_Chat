function movePathUp(theUrl, sep="/") {
    var arr = theUrl.split(sep);
    arr.pop();
    return arr.join(sep);
}

module.exports.movePathUp = movePathUp;