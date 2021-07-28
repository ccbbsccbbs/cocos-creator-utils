if (!Object.entires) {
    Object.entires = function (obj) {
        return Object.getOwnPropertyNames(obj).map(k => [k, obj[k]]);
    }
}