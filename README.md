# liveStorage 文档说明

【接口文档】[https://passer-by.com/livestorage/](https://passer-by.com/livestorage/)

【效果演示】[https://passer-by.com/livestorage/test.html](https://passer-by.com/livestorage/test.html)

# liveStorage方法说明

## 监听数据 livestorage.watchItem(key,initialValue,config)

```js
// 和input进行数据双向绑定，同时同步到本地存储（localStorage）中
let data = liveStorage.watchItem('username','Michael',{
    'mount':'input[name="username"]'
});
// 改变数据的值，即可实时更新本地存储（localStorage）
data.value = 'Jafferson';
```

## 设置数据 setItem(key,value,config)

```js
// 字符串设置
liveStorage.setItem('name','Michael');
// 数字设置
liveStorage.setItem('age',18);
// 对象设置
liveStorage.setItem('user',{
    'name':'Li Lei',
    'age':24,
    'interest':['basketball','football']
});
// 时间设置
liveStorage.setItem('starttime',new Date());
// 正则设置
liveStorage.setItem('match',/\d{6}/);
// 数组设置
liveStorage.setItem('list',[2,4,6,8,10]);
```

## 获取数据 getItem(key)

```js
let name = liveStorage.getItem('name');
```

## 移除数据 remove(key)

```js
livestorage.removeItem('username');
```

## 清空数据 clear();

```js
liveStorage.clear();
```

## 获取数据条数 length;

```js
console.log('[当前存储数据条数]',liveStorage.length);
```