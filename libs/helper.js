const generateNumber = (it) => {
    let id = '';
    for(i=0; i < it; ++i) {
        id += Math.floor(Math.random() * 10);
    }
    let x = new Date();
    id = x.valueOf() + id;
    return id;
}


module.exports = {
    generateNumber
}