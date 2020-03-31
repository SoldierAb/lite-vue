export default class Dep{
    constructor(){
        this.subs=[];
    }

    //搜集观察者
    addSub(watcher){
        this.subs.push(watcher);
    }

    notify(){
        this.subs.forEach(watcher=>{
            watcher.update();
        })
    }
    
}

Dep.target = null;
const targetStack = []

export function pushTarget(watcher){
    targetStack.push(Dep.target);
    Dep.target = watcher;
}

export function popTarget(){
    targetStack.pop();
    Dep.target = targetStack[targetStack.length-1]
}

