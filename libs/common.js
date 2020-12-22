
module.exports = {
    truncateString: (str, n, useWordBoundary) => {
        if (str.length <= n) {
            return str;
        }
        var subString = str.substr(0, n - 1);
        return useWordBoundary
            ? subString.substr(0, subString.lastIndexOf(' '))
            : subString;
    },
    randomElement: (array) => {
        return item = array[Math.floor(Math.random() * array.length)];
    },
    waitFor: (s) => new Promise(r => setTimeout(r, 1000*s ))
}