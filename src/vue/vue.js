import Compiler from './compiler'
import Observer from './observer'

export default class Vue {
    constructor($options) {
        this.$el = $options.el;
        this.$data = $options.data;
        this.$options = $options;
        if (this.$el) {
            // 初始化
            // 1. 实现监听器
            new Observer(this.$data);
            // 2. 实现解析器
            new Compiler(this.$el, this)

            // 3.设置代理
            this.proxyData();

        }
    }

    proxyData(){
        const {$data} = this;
        for(let key in $data){
            Object.defineProperty(this,key,{
                get(){
                    return $data[key]
                },
                set(newVal){
                    $data[key]=newVal;
                }
            })
        }
    }
}

