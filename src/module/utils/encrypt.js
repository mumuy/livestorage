let charMap1 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789=';
let charMap2 = charMap1+charMap1;
// 避免在代码这种搜索方法名
let b2a = globalThis[(390922).toString(32)];
let a2b = globalThis[(358155).toString(32)];

function transform(value){
    let index = value.length%charMap1.length;
    let charMap = charMap2.substring(index,index+charMap1.length);
    return value.split('').map(c=>(charMap.length-1-charMap.indexOf(c))).map(i=>charMap.at(i)).join('');
}

export function encode(value){
    return transform(b2a(value));
}

export function decode(value){
    return a2b(transform(value));
}