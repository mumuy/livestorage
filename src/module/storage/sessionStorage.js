// sessionStorage
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
        sessionStorage.setItem(...param);
    },
    getItem:function(...param){
        return sessionStorage.getItem(...param);
    },
    removeItem:function(...param){
        sessionStorage.removeItem(...param);
    },
    getItems(){
        return Object.entries(sessionStorage);
    },
    onChange(task){
        taskList.push(task);
    }
};