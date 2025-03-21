/*
 * DOM和数据绑定
*/
let operatorMap = {};       // 缓存操作对象
let stateMap = {};          // 缓存状态数据
let elementsMap = {};       // 缓存绑定节点
let taskListMap = {};       // 任务列表映射
import {isArray} from './type.js';

export function mountElement(selector,key){
    const $nodelist = selector?document.querySelectorAll(selector):[];
    if(!$nodelist.length){
        return null;
    }else if(operatorMap[key]){
        return operatorMap[key];
    }
    if(!operatorMap[key]){
        operatorMap[key] = {};
    }
    if(!stateMap[key]){
        stateMap[key] = {
            method:'',
            type:'',
            value:null
        };
    }
    if(!elementsMap[key]){
        elementsMap[key] = [];
    }
    if(!taskListMap[key]){
        taskListMap[key] = [];
    }

    let operator = operatorMap[key];
    let state = stateMap[key];
    let elements = elementsMap[key];
    $nodelist.forEach(function(element){
        if(!elements.includes(element)){
            elements.push(element);
        }
        if(state.value==null){   // 根据第一个节点判断数据类型
            if(element.tagName=='INPUT'){
                if(element.type=='checkbox'){
                    state.method = 'checked';
                    state.type = 'array';
                    state.value = [];
                }else if(element.type=='radio'){
                    state.method = 'checked';
                    state.type = 'string';
                    state.value = '';
                }else{
                    state.method = 'value';
                    state.type = 'string';
                    state.value = '';
                }
            }else{
                state.method = 'value';
                state.type = 'string';
                state.value = '';
            }
        }
    });

    // 事件绑定
    let taskList = taskListMap[key];
    const onChanged = function(){
        let value = operator.getValue();
        taskList.forEach(function(task){
            task(value);
        });
    };
    elements.forEach(function(element){
        element.addEventListener('change',onChanged);
        let lastValue = element.value;
        let lastChecked = element.checked;
        let doTask = function(){
            if(lastValue!=element.value){
                lastValue = element.value;
                onChanged();
            }else if(lastChecked!=element.checked){
                lastChecked = element.checked;
                onChanged();
            }
            requestAnimationFrame(doTask);
        };
        requestAnimationFrame(doTask);
    });

    // 方法定义
    operator.setValue = function(value){
        elements.forEach(function(element){
            if(state.method=='checked'){
                if(state.type=='array'){
                    if(!isArray(value)){  // 兼容单值
                        value = [value];
                    }
                    if(value.includes(element.value)){
                        element.checked = true;
                    }else{
                        element.checked = false;
                    }
                }else{
                    if(value==element.value){
                        element.checked = true;
                    }else{
                        element.checked = false;
                    }
                }
            }else{
                element.value = value;
            }
        });
    };
    operator.getValue = function(){
        state.value = state.type=='array'?[]:'';
        elements.forEach(function(element){
            if(state.method=='checked'){
                if(state.type=='array'){
                    if(element.checked){
                        state.value.push(element.value);
                    }
                }else{
                    if(element.checked){
                        state.value = element.value;
                    }
                }
            }else{
                state.value = element.value;
            }
        });
        return state.value;
    };
    operator.onChanged = function(task){
        taskList.push(task);
    };
    return operator;
};