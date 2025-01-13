import _peroid from "../runtime/period.js";
import { isObject } from "../utils/type.js";

// cookie
let taskList = [];
if(typeof cookieStore=='undifined'){
    cookieStore.addEventListener('change',function(event){
        let change = event.changed[0];
        taskList.forEach(function(task){
            task(change.name,change.value);
        });
    });
}
export default {
    setItem(key,value,param){
        let {domain,path,period} = param;
        if(isObject(period)){
            let time = 0;
            for(let field in period){
                time += _peroid[field]||0;
            }
            period = time;
        }
        let expires = (new Date(Date.now()+period)).toUTCString();
        document.cookie = `${key}=${value}; domain=${domain}; path=${path}; expires=${expires}`;
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
            return [value.substring(0,index),value.substring(index+1)];
        });
    },
    onChange(task){
        taskList.push(task);
    }
};