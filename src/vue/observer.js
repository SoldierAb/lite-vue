import Dep from './dep'

export default class Observer{
    constructor(data){
        this.observe(data);
    }

    observe(data){
        if(data&& typeof data==='object'){
            Object.keys(data).forEach(key=>{
                this.defineReactive(data,key,data[key]);
            })
        }
    }

    defineReactive(data,key,value){
        const _this = this;
        const dep  = new Dep();
        _this.observe(value);
        
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:true,
            get:function reactiveGetter(){
                //订阅数据变化，添加观察者
                Dep.target && dep.addSub(Dep.target);
                return value
            },
            set:function (newVal){
                _this.observe(newVal);
                if(newVal!==value){
                    value=newVal
                }
                dep.notify();
            }
        })
    }


}