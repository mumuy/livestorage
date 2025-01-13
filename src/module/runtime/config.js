import _peroid from './period.js';

export default {
    storage:'localStorage',                     // 基于何种类型
    domain:'',                                  // 有效的域名
    path:'/',                                   // 有效的路径
    period:_peroid['day'],                      // 有效期
    secure:false,                               // 是否仅HTTPS传输
    encode:true,                                // 是否开启加密
    mount:'',                                   // 数据挂载节点
    onChanged:function(){},                     // 数据变化时触发
};