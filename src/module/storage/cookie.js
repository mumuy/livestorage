import _peroid from "../runtime/period.js";
import { isObject } from "../utils/type.js";

// cookie
let taskList = [];
if(typeof cookieStore!='undefined'){
    cookieStore.addEventListener('change',function(event){
        if(event.changed.length){
            event.changed.forEach(function(item){
                taskList.forEach(function(task){
                    task(item.name,item.value);
                });
            });
        }
        if(event.deleted.length){
            event.deleted.forEach(function(item){
                taskList.forEach(function(task){
                    task(item.name,undefined);
                });
            });
        }
    });
}
export default {
    setItem(key,value,param){
        let {domain,path,period,expires} = param;
        let expires_timestamp = [];
        if(period>0){
            if(isObject(period)){
                let time = 0;
                for(let field in period){
                    time += _peroid[field]||0;
                }
                period = time;
            }
            expires_timestamp.push(Date.now()+period);
        }
        if(expires!=null){
            expires_timestamp.push(expires);
        }
        const expires_string = (new Date(Math.min(...expires_timestamp))).toUTCString();
        document.cookie = `${key}=${value}; domain=${domain}; path=${path}; expires=${expires_string}`;
    },
    getItem(key){
        let map =  Object.fromEntries(this.getItems());
        return map[key]||'';
    },
    removeItem(key){
        document.cookie = `${key}=; path=/; expires=${(new Date(0)).toUTCString()}`;
    },
    getItems(){
        return document.cookie.split(';').map(value=>{
            value = value.trim();
            let index = value.indexOf('=');
            return [value.slice(0,index),value.slice(index+1)];
        });
    },
    onChange(task){
        taskList.push(task);
    }
};