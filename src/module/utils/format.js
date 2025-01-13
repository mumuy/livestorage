/*
 * 数据格式化
*/
import { isTypeOf } from "./type.js";

function toDataMap(value){
    let type = isTypeOf(value);
    let result;
    if(['Number','BigInt','Boolean','RegExp','Date','Symbol'].includes(type)){
        result = value.toString();
    }else if(['Map'].includes(type)){
        result = Array.from(value);
    }else if(['Undefined','Null'].includes(type)){
        result = type;
    }else if(type=='Object'){
        result = {};
        for(let key in value){
            result[key] = toDataMap(value[key]);
        }
    }else if(type=='Array'){
        result = value.map(item=>toDataMap(item));
    }else{
        result = value;
    }
    return {
        V:result,
        T:type
    };
}

function fromDataMap(hash){
    let {T:type,V:value} = hash;
    let result;
    if(type=='Number'){
        result = Number(value);
    }else if(type=='BigInt'){
        result = BigInt(value);
    }else if(type=='Boolean'){
        result = value==='true';
    }else if(type=='RegExp'){
        result = new RegExp(value.substring(1,value.length-1));
    }else if(type=='Date'){
        result = new Date(value);
    }else if(type=='Symbol'){
        result = Symbol.for(value);
    }else if(type=='Map'){
        result = new Map(value);
    }else if(type=='Undefined'){
        result = undefined;
    }else if(type=='Null'){
        result = null;
    }else if(type=='Object'){
        result = {};
        for(let key in value){
            result[key] = fromDataMap(value[key]);
        }
    }else if(type=='Array'){
        result = value.map(item=>fromDataMap(item));
    }else{
        result = value;
    }
    return result;
}

export function stringify(value){
    let hash = toDataMap(value);
    return JSON.stringify(hash);
}

export function parse(value){
    let data = JSON.parse(value);
    return fromDataMap(data);
}