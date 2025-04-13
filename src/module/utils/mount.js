/*
 * DOM和数据绑定
*/
const operatorMap = {};       // 缓存操作对象
const stateMap = {};          // 缓存状态数据
const elementsMap = {};       // 缓存绑定节点
const taskListMap = {};       // 任务列表映射
import {isArray} from './type.js';

export function mountElement(selector,key){
    const $nodelist = selector?document.querySelectorAll(selector):[];
    if(!$nodelist.length){
        return null;
    }
    if(operatorMap[key]){
        return operatorMap[key];
    }
    operatorMap[key] = {};
    if(!stateMap[key]){
        stateMap[key] = {};
    }
    if(!elementsMap[key]){
        elementsMap[key] = [];
    }
    if(!taskListMap[key]){
        taskListMap[key] = [];
    }
    const operator = operatorMap[key];
    const state = stateMap[key];
    const elements = elementsMap[key];
    // 收集节点
    let isForm = false; // 是否是表单
    $nodelist.forEach(function(element){
        if(!['INPUT','SELECT'].includes(element.tagName)){   // 如果绑定的对象非是select或者input，则继续查找
            isForm = true;
            element.querySelectorAll('select,input').forEach(function(element){
                if(!elements.includes(element)){
                    elements.push(element);
                }
            });
        }else{
            if(!elements.includes(element)){
                elements.push(element);
            }
        }
    });
    // 关联数据状态
    elements.forEach(function(element){
        const name = element.getAttribute('name')||'default';
        if(!state[name]){
            state[name] = {
                method:'',
                type:'',
                value:null,
                elements:[]
            };
            const field = state[name];
            if(element.tagName=='INPUT'){
                if(element.type=='checkbox'){
                    field.method = 'checked';
                    field.type = 'array';
                    field.value = [];
                }else if(element.type=='radio'){
                    field.method = 'checked';
                    field.type = 'string';
                    field.value = '';
                }else{
                    field.method = 'value';
                    field.type = 'string';
                    field.value = '';
                }
            }else{
                field.method = 'value';
                field.type = 'string';
                field.value = '';
            }
        }
        state[name].elements.push(element);
    });
    // 方法定义
    operator.setValue = function(data){
        data = isForm?(data||{}):(data||'');
        Object.entries(state).forEach(function([name,field]){
            let value = (isForm?data[name]:data)||'';  // 兼容对象和单值
            field.elements.forEach(function(element){
                if(field.method=='checked'){
                    if(field.type=='array'){
                        if(!isArray(value)){  // 兼容单值
                            value = [value];
                        }
                        element.checked = value.includes(element.value);
                    }else{
                        element.checked = value==element.value;
                    }
                }else{
                    element.value = value;
                }
            });
        });
    };
    operator.getValue = function(){
        const data = {};
        Object.entries(state).forEach(function([name,field]){
            field.value = field.type=='array'?[]:'';
            field.elements.forEach(function(element){
                if(field.method=='checked'){
                    if(field.type=='array'){
                        if(element.checked){
                            field.value.push(element.value);
                        }
                    }else{
                        if(element.checked){
                            field.value = element.value;
                        }
                    }
                }else{
                    field.value = element.value;
                }
            });
            data[name] = field.value;
        });
        return Object.entries(state).length>1?data:data[Object.keys(state)[0]];
    };
    operator.onChanged = function(task){
        taskList.push(task);
    };
    // 事件绑定
    const taskList = taskListMap[key];
    let hander = null;
    const onChanged = function(){
        hander&&cancelAnimationFrame(hander);  // 避免重复执行
        hander = requestAnimationFrame(function(){
            let value = operator.getValue();
            taskList.forEach(function(task){
                task(value);
            });
        });
    };
    elements.forEach(function(element){
        element.addEventListener('change',onChanged);
        let lastValue = element.value;
        let lastChecked = element.checked;
        const doTask = function(){
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
    return operator;
};