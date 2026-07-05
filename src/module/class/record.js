/*
* 基础记录 - 订阅者模型
*/
import _config from '../runtime/config.js';
import {isTypeOf,isArray} from '../utils/type.js';

export default class Record{
    #events = {};
    constructor(key,data,param = {}){
        let _ = this;
        _.key = key;
        _.type = isTypeOf(data);
        _.data = {};
        _.config = {};
        _.emit('change',data,param);
    }
    // 保存数据
    set(data,param){
        const _ = this;
        _.type = isTypeOf(data);
        let temp = ['Object','Array'].includes(this.type)?Object.assign({},data):{value:data};
        if(_.type=='Array'){
            if(!isArray(_.data)){
                _.data = [];
            }
            _.data.length = 0;
            temp.forEach(value=>_.data.push(value));
        }else{
            for(let field in _.data){
                delete _.data[field];
            }
            for(let field in temp){
                _.data[field] = temp[field];
            }
        }
        let {storage,domain,path,period,expires,secure,encode,mount} = Object.assign({},_config,this.config,param);
        if(storage=='cookie'){
            Object.assign(_.config,{
                storage,
                domain,
                path,
                period,
                expires,
                secure,
                encode,
                mount
            });
        }else{
            Object.assign(_.config,{
                storage,
                encode,
                mount
            });
        }
    }
    // 获取数据
    get(){
        if(['Object','Array'].includes(this.type)){
            return structuredClone(this.data);
        }else{
            return this.data.value;
        }
    }
    // 订阅事件
    on(eventName, callback) {
        if (!this.#events[eventName]) {
            this.#events[eventName] = [];
        }
        this.#events[eventName].push(callback);
    }
    // 发布事件
    emit(eventName,...args){
        const _ = this;
        _.set(...args);
        if (_.#events[eventName]) {
            _.#events[eventName].forEach(callback => {
                callback(_.get());
            });
        }
    }
    // 取消订阅
    off(eventName, callback) {
        const _ = this;
        if (!_.#events[eventName]) return;
        _.#events[eventName] = _.events[eventName].filter(
            cb => cb !== callback
        );
    }
};
