const express = require('express')
const fs = require('fs')

const client = express()
const port = 3000
client.get('/',(request,response) => {

    let url = request.url;
    console.log(url)
    response.writeHead(200,{'Content-Type':'text/html'})
    if (url === '/') {
        fs.readFile('./views/client.html',function (err,data) {
        if (err) {
            response.end('404');
            return;
        }
        response.end(data)
        })
    } else if (url.indexOf('/public/') !== -1) {
        //此处是关键，当发现请求路径中含有 /public/，我们把请求路径当作文件路径来直接进行读取
        fs.readFile('.' + url,function (err,data) {
        if (err) {
            response.end('404');
            return;
        }
        response.end(data);
        })
    }




    //res.setHeader('Content-Type','text/html')
    // res.writeHead(200,{'Content-Type':'text/html'})
    // fs.readFile('F:/Code/html/node/socket/client.html',(err,data)=>{
    //     if(err){
    //         throw err;
    //     }
    //     res.end(data)
    // })
    
})
client.listen(port)