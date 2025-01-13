/*
 * 数据类型判断
*/

export function isTypeOf(data){
    return Object.prototype.toString.call(data).slice(8,-1);
}

export function isNaN(value){
    return Number.isNaN(value);
}

export function isNumber(value){
    return !isNaN(value)&&isTypeOf(value)==='Number';
}

export function isBigInt(value){
    return isTypeOf(value)==='BigInt';
}

export function isString(value){
    return isTypeOf(value)==='String';
}

export function isRegExp(value){
    return isTypeOf(value)==='RegExp';
}

export function isBoolean(value){
    return isTypeOf(value)==='Boolean';
}

export function isNull(value){
    return isTypeOf(value)==='Null';
}

export function isUndefined(value){
    return isTypeOf(value)==='Undefined';
}

export function isObject(value){
    return isTypeOf(value)==='Object';
}

export function isArray(value){
    return isTypeOf(value)==='Array';
}

export function isMap(value){
    return isTypeOf(value)==='Map';
}

export function isSymbol(value){
    return isTypeOf(value)==='Symbol';
}