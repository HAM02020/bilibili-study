const express = require('express')
const client = require('./client')
const moment = require('moment')
var mysql  = require('mysql');  
 
var connection = mysql.createConnection({     
  host     : 'localhost',       
  user     : 'root',              
  password : '123456',       
  port: '3306',                   
  database: 'danmu' 
}); 
//app.get('/',(req,res) => res.send('hello'))

//app.listen(port,()=> console.log(`server is Listening on port ${port}`))
const app = express()
var server = app.listen(8082)
var io = require('socket.io')(server,{cors: true})



io.on('connection',(socket) => {
    console.log('socket 连接成功!')
    socket.on('msg', data => {
        console.log(data)
        //socket.emit('danmu',data)
        var text = JSON.stringify(data['text'])
        if(text.indexOf('学习打卡') != -1){
            updateOrInsert(data,msg=>{
                io.sockets.emit('gmsg',msg)
            })
        }
        if(text.indexOf('查询')!= -1){
            var msg = ''
            query(data,(rows,length)=>{
                if(length <= 0){
                    msg = `${data['name']} 还未签到，刚快签到吧!`
                }else{
                    msg = `${data['name']} 当前有${rows[0].point}积分`
                }
                console.log(msg)
                io.sockets.emit('gmsg',msg)
            })
        }
        
    }) 
    socket.on('query',()=>{
        var data = {
            'uid':123,
            'name':"如如子",
            'text':"这是一段弹幕",
        }
       //query(data)
       updateOrInsert(data,msg=>{
        console.log("插入或更新成功")
        io.sockets.emit('gmsg',msg)
       })
    })
})

//记录签到时间
function record(uid,newpoint){
    const sql = `INSERT INTO record(uid,newpoint) VALUES(?,?)`
     
    connection.query(sql,[uid,newpoint])
}

//查询
function query(data,callback){
    const sql = `SELECT * FROM user where uid = ${data['uid']}`
    connection.query(sql,(err,rows)=>{
        if(err){
            console.log('[query error] - ',err.message)
        }
        callback(rows,rows.length)
    });
    
}

//插入
function insert(data){
    const sql = 'INSERT INTO user(uid,name,point) VALUES(?,?,20)'
    const params = [data['uid'],data['name']]
    //connection.query(sql,params);
    connection.query(sql,params,(err,rows)=>{
        if(err){
            console.log('[query error] - ',err.message)
        }
        
        return rows
    });
}

//更新
function update(data){
    const sql = `UPDATE user SET point=point+20 WHERE uid = ${data['uid']}`
    connection.query(sql,(err,rows)=>{
        if(err){
            console.log('[update error] - ',err.message)
        }
        
        console.log(rows)
        return rows
    });
}

//插入或更新
function updateOrInsert(data,callback){
    var msg = ''
    const q = query(data,(rows,length)=>{
        
        
        if(length <= 0){
            insert(data)
            msg = `${data['name']} 签到成功，当前有20积分`
            record(data['uid'],20)
        }else{
            
            //console.log(obj[0].last)
            var mo = moment(rows[0].last,`yyyy-MM-dd T HH:mm:ss.SSS Z`)
            var isNotToday = moment().isAfter(mo) && !moment().isSame(mo,'day')
            if(isNotToday){
                update(data)
                record(data['uid'],rows[0].point + 20)
                msg = `${data['name']} 签到成功，当前有${rows[0].point + 20}积分`
            }else{
                msg = `${data['name']} 今日已签到，再接再厉!`
                
            }

        }
        console.log(msg)
        callback(msg)
        
    })
   
}