const Koa = require('koa');
// const Koa = require('my-koa');

const app = new Koa();

app.use((ctx, next) => {
    console.log(1);
    next();
    console.log(2);
}); 

app.use((ctx, next) => {
    console.log(3);
    next();
    console.log(4);
}); 

app.use((ctx, next) => {
    console.log(5);
    next();
    console.log(6);
});

app.use((ctx) => {
    console.log(ctx.query);
    ctx.body = 'hello, MyKoa';
}); 

app.listen(3000, () => {
    console.log('server is runing on 3000...');
});