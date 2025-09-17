import _config from './runtime/config.js';
import _peroid from './runtime/period.js';
import {isTypeOf,isArray} from './utils/type.js';
import {mountElement} from './utils/mount.js';
import unitStorage from './unitStorage.js';

let structuredClone = window.structuredClone;
if (!structuredClone) {
    structuredClone = (obj, options) => {
        return JSON.parse(JSON.stringify(obj));
    };
}

// 记录的基础属性
class Record{
    #TaskList;
    constructor(key,data,param = {}){
        let _ = this;
        _.key = key;
        _.type = isTypeOf(data);
        _.data = {};
        _.config = {};
        _.#TaskList = [];
        _.trigger = null;
        _.triggerData('value',data,param);
    }
    // 数据更新
    triggerData(trigger,data,param){
        let _ = this;
        _.trigger = trigger;
        _.type = isTypeOf(data);
        // 修改数据
        let temp = ['Object','Array'].includes(this.type)?data:{value:data};
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
        if(trigger!='new'){
            _.#TaskList.forEach(function(task){
                task(trigger,_.toRaw());
            });
        }
    }
    // 事件队列
    onChanged(task){
        this.#TaskList.push(task);
    }
    // 获取原始数据
    toRaw(){
        if(['Object','Array'].includes(this.type)){
            return structuredClone(this.data);
        }else{
            return this.data.value;
        }
    }
};

export default class baseStorage{
    #config;
    #records;
    [Symbol.toStringTag] = 'baseStorage';
    constructor(){
        let _ = this;
        _.#config = Object.assign({},_config);
        // 读取记录
        _.#records = [];
        for(let name in unitStorage){
            let records = unitStorage[name].getItems().map(([key,data])=>{
                return new Record(key,data,{
                    storage:name
                });
            });
            _.#records = _.#records.concat(records);
        }
        // 获取存储数量
        Object.defineProperty(_,'length', {
            set: function(){
                return true;
            },
            get: function() {
                return _.#records.length;
            }
        });
        // 其他页面变化时，实时更新
        for(let name in unitStorage){
            unitStorage[name].onChanged(function(key,data){
                let record = _.#records.find(record=>record.key==key&&record.config.storage==name);
                if(record){
                    if(typeof data != undefined){
                        record.triggerData('storage',data);
                    }else{
                        _.removeItem(record.key);
                    }
                }
            });
        };
        // 数据映射
        _.#records.forEach(function(record){
            _[record.key] = _.getItem(record.key);
        });
        new Proxy(_,{
            get(target,key){
                return _.getItem(key);
            },
            set(target,key,data){
                _.setItem(key,structuredClone(data),_.#config);
                return true;
            }
        });
    }
    setConfig(param){
        Object.assign(this.#config,param);
    }
    watchItem(key,data,param={}){
        let _ = this;
        let record = _.#records.find(record=>record.key==key)||null;
        if(!record){
            record = _.setItem(key,data,param);
        }else{
            record.triggerData('value',record.toRaw(),param);
        }
        // 事件绑定
        let {mount} = record.config;
        let mounter = mountElement(mount,_.key);
        if(mounter){
            mounter.setValue(record.toRaw());
            mounter.onChanged(function(value){
                record.triggerData('element',value);
            });
        }
        // 事件处理
        record.onChanged(function(trigger,newData){
            if(trigger!=='new'&&trigger!=='value'){
                _.setItem(key,newData,param);
                if(mounter){
                    mounter.setValue(newData);
                }
                if(param.onChanged){
                    param.onChanged(newData);
                }
            }
        });
        return new Proxy(record.data,{
            get(target, property, receiver){
                // return target[property];
                return Reflect.get(target, property, receiver);
            },
            set(target, property, value, receiver){
                // target[property] = value;
                Reflect.set(target, property, value, receiver);
                _.setItem(key,record.toRaw(),param);
                return true;
            },
            deleteProperty(target, property){ 
                // delete target[property];
                Reflect.deleteProperty(target, property);
                _.setItem(key,record.toRaw(),param);
                return true;
            }
        });
    }
    key(index){
        return this.#records[index]?.key||null;
    }
    setItem(key,data,param){
        let _ = this;
        let record = _.#records.find(record=>record.key==key)||null;
        let config = Object.assign({},_.#config,param);
        if(record){
            if(config.storage!=record.config.storage){
                unitStorage[record.config['storage']].removeItem(record.key);
            }
            if(record.trigger!='value'){
                record.triggerData('value',data,config);
            }
        }else{
            record = new Record(key,data,config);
            _.#records.push(record);
        }
        unitStorage[record.config['storage']].setItem(record.key,record.toRaw(),record.config);
        // 附属效果
        _[key] = record.toRaw();
        return record;
    }
    getItem(key){
        let _ = this;
        let record = _.#records.find(record=>record.key==key)||null;
        if(record){
            return record.toRaw();
        }
        return null;
    }
    removeItem(key){
        let _ = this;
        let record = _.#records.find(record=>record.key==key)||null;
        if(record){
            unitStorage[record.config['storage']].removeItem(record.key);
        }
        let index = _.#records.map(record=>record.key).indexOf(key);
        if(index>-1){
            _.#records.splice(index,1);
        }
        delete _[key];
    }
    clear(){
        let _ = this;
        this.#records.forEach(record=>{
            unitStorage[record.config['storage']].removeItem(record.key);
            delete _[record.key];
        });
        _.#records = [];
    }
};