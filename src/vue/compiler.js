import Watcher from './watcher'

export class compileUtil {
    static getValue(expr, vm) {
        const value= expr.split('.').reduce((current, prop) => {
            return current[prop]
        }, vm.$data)
        return value;
    }


    static setValue(expr,vm,newVal){
        expr.split(',').reduce((current,prop)=>{
            current[prop] = newVal;
        },vm.$data)
    }

    static filterExpr(expr,vm){
        let value;
        if(/\{\{(.+?)\}\}/g.test(expr)){
            value= expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
                const res= this.getValue(args[1],vm);
                return res;
            })
        }else{
            value = this.getValue(expr,vm);
        }
        return value;
    }

    static text(node, expr, vm) {
        const value = this.filterExpr(expr, vm);
        new Watcher(vm,expr,newVal=>{
            console.log(newVal);
            this.textUpdater(node,newVal);
        })
        this.textUpdater(node, value);
    }
    static html(node, expr, vm) {
        const value = this.getValue(expr, vm);
        new Watcher(vm,expr,newVal=>{
            this.htmlUpdater(node,newVal);
        })
        this.htmlUpdater(node,value);
    }
    static model(node, expr, vm) { 
        const value = this.getValue(expr,vm);
        new Watcher(vm,expr,newVal=>{
            this.modelUpdater(node,newVal);
        })

        node.addEventListener("input",({target:{value}})=>{
            this.setValue(expr,vm,value);
        })

        this.modelUpdater(node,value);
    }
    static on(node, expr, vm, event) { 
        const {methods} = vm.$options;
        let fn;
        if(/\((.+?)\)/g.test(expr)){
            const [,func,paramsExpr]=expr.match(/(\w+)\((.+?)\)/),
            params = paramsExpr.split(",").map(item=>{
                return this.getValue(item,vm);
            })
            fn = methods[func].bind(vm,...params);
        }else{
            fn =  methods[expr].bind(vm)
        }
        node.addEventListener(event,fn,false);
    }

    static modelUpdater(node,value){
        node.value = value;
    }

    static textUpdater(node, value) {
        node.textContent = value;
    }
    static htmlUpdater(node,value) {
        node.innerHTML = value;
    }

}

export default class Compiler {
    constructor(el, vm) {
        this.el = this.isNode(el) ? el : document.querySelector(`${el}`);
        this.vm = vm;
        //获取文档碎片
        const fragment = this.nodeToFragment(this.el);

        //编译文档碎片
        this.compile(fragment);

        this.el.appendChild(fragment);
    }


    compile(fragment) {
        // 1.获取子节点
        const childNodes = fragment.childNodes;
        [...childNodes].forEach(node => {
            if (this.isNode(node)) {
                //编译元素节点
                this.compileElement(node);
            } else {
                //文本节点
                this.compileText(node);
            }
            if (node.childNodes && node.childNodes.length) this.compile(node);
        })
    }


    compileElement(node) {
        const { attributes } = node;
        [...attributes].forEach(attr => {
            const { name, value } = attr;
            if (this.isDirective(name)) {
                const [, directive] = name.split("-");
                const [atName, eventName] = directive.split(":");
                compileUtil[atName](node, value, this.vm, eventName);
                node.removeAttribute(`v-${directive}`);
            }else if(this.isAtEventName(name)){
                const [,event] = name.split("@");
                compileUtil["on"](node,value,this.vm,event);
            }
        })
    }


    isAtEventName(attrName){
        return attrName.startsWith("@");
    }


    isDirective(attrName) {
        return attrName.startsWith("v-");
    }

    compileText(node) {
        const {textContent} = node;
        if(/\{\{(.+?)\}\}/g.test(textContent)){
            compileUtil['text'](node,textContent,this.vm)
        }
    }

    nodeToFragment(el) {
        const f = document.createDocumentFragment();
        let fragment
        while ((fragment = el.firstChild)) {
            f.appendChild(fragment);
        }
        return f;
    }

    isNode(node) {
        return node.nodeType === 1;
    }
}

