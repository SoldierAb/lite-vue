import {compileUtil} from './compiler'
import {pushTarget,popTarget} from './dep'

export default class Watcher{
    constructor(vm,expr,callback){
        this.vm= vm;
        this.expr = expr;
        this.cb = callback;
        this.oldVal = this.getOldValue();
    }

    getOldValue(){
        pushTarget(this) //添加依赖搜集
        const oldVal=compileUtil.filterExpr(this.expr,this.vm);
        popTarget();
        return oldVal;
    }

    update(){
        const newVal = compileUtil.filterExpr(this.expr,this.vm);
        if(newVal!==this.oldVal){
            this.cb(newVal);
        }
    }
}