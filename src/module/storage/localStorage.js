// localStorage
let taskList = [];
window.addEventListener('storage',function(event){
    taskList.forEach(function(task){
        if(event.newValue){
            task(event.key,event.newValue);
        }
    });
});
export default {
    setItem:function(...param){
        localStorage.setItem(...param);
    },
    getItem:function(...param){
        return localStorage.getItem(...param);
    },
    removeItem:function(...param){
        localStorage.removeItem(...param);
    },
    getItems(){
        return Object.entries(localStorage);
    },
    onChange(task){
        taskList.push(task);
    }
};