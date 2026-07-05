/*
    统一各种适配器
    storage  - 存储器类型
    key      - 存储字段键名
    data     - 存储数据序列化
    type     - 存储数据类型
*/
import _cookie from './storage/cookie.js';
import _localStorage from './storage/localStorage.js';
import _sessionStorage from './storage/sessionStorage.js';
import { stringify,parse } from './utils/format.js';
import { encode,decode } from './utils/encrypt.js';

const prefix = '@_';  // 特殊标识，防止格式不兼容

// 映射所有存储器
const storageMap = {};
const keyCatch = {};
[
    ['cookie',_cookie],
    ['localStorage',_localStorage],
    ['sessionStorage',_sessionStorage]
].forEach(([name,storage])=>{
    storageMap[name] = {
        setItem(key,data,config){
            let dataStr = stringify(data);
            if(config.encode){
                dataStr = encode(dataStr);
            }
            if(!keyCatch[key]||keyCatch[key]!=dataStr){
                keyCatch[key] = dataStr;
                storage.setItem(prefix+key,dataStr,config);
            }
        },
        getItem(key){
            let dataStr = storage.getItem(prefix+key);
            keyCatch[key] = dataStr;
            if(dataStr){
                if(dataStr.indexOf('{"V":')==-1){
                    dataStr = decode(dataStr);
                }
                return parse(dataStr);
            }
            return null;
        },
        removeItem(key){
            storage.removeItem(prefix+key);
        },
        getItems(){
            let _ = this;
            return storage.getItems().filter(([key])=>key.includes(prefix)).map(([key])=>{
                let k = key.replace(prefix,'');
                return [k,_.getItem(k)];
            });
        },
        onChanged(task){
            let _ = this;
            storage.onChanged(function(key){
                if(key.includes(prefix)){
                    let k = key.replace(prefix,'');
                    task(k,_.getItem(k));
                }
            });
        }
    };
});

// 统一操作所有存储器
export default {
    setItem:function(key,data,config){
        storageMap[config.storage].setItem(key,data,config);
    },
    getItem:function(key){
        for(let storage of Object.values(storageMap)){
            const item = storage.getItem();
            if(item){
                return item;
            }
        }
        return null;
    },
    removeItem(key){
        for(let storage of Object.values(storageMap)){
            storage.removeItem(key);
        }
    },
    getItems:function(){
        return Object.values(storageMap).map(storage=>storage.getItems()).flat();
    },
    onChanged(task){
        for(let storage of Object.values(storageMap)){
            storage.onChanged(task);
        }
    }
};