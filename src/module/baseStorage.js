import _config from './runtime/config.js';
import _peroid from './runtime/period.js';
import {isTypeOf,isArray} from './utils/type.js';
import {mountElement} from './utils/mount.js';
import Record from './class/record.js';
import unitStorage from './unitStorage.js';

let structuredClone = window.structuredClone;
if (!structuredClone) {
    structuredClone = (obj, options) => {
        return JSON.parse(JSON.stringify(obj));
    };
}

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
                        record.emit('change',data);
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
            record.emit('change',record.get(),param);
        }
        // 表单事件绑定
        let {mount} = record.config;
        let mounter = mountElement(mount,_.key);
        if(mounter){
            mounter.setValue(record.get());
            mounter.onChanged(function(value){
                record.emit('change',value);
            });
        }
        // 事件处理
        record.on('change',function(newData){
            if(mounter){
                mounter.setValue(newData);
            }
            _.setItem(key,newData,param);
            if(param.onChanged){
                param.onChanged(newData);
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
                record.emit('change',target,param);
                return true;
            },
            deleteProperty(target, property){ 
                // delete target[property];
                Reflect.deleteProperty(target, property);
                record.emit('change',target,param);
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
        }else{
            record = new Record(key,data,config);
            _.#records.push(record);
        }
        unitStorage[record.config['storage']].setItem(record.key,record.get(),record.config);
        // 附属效果
        _[key] = record.get();
        return record;
    }
    getItem(key){
        let _ = this;
        let record = _.#records.find(record=>record.key==key)||null;
        if(record){
            return record.get();
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