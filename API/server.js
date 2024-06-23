import express from 'express'


const app = express()
app.use(express.json())
const user = []


app.post('/users', (req, res) => {

    user.push(req.body)
    
    res.status(201).json(req.body)

})

app.get('/users', (req, res) => {

    res.status(200).json(user)

}) 

app.listen(3000)








/* 

    Goal: Create our user API

    - Creat new user
    - To list user
    - To edit user
    - Delet one user

    =======================================================

    1) Tipo de Rota / Método HTTP
    2) Endereço

    ======================================================

    app.post('/users')  Create new user
    app.put('/users')  To edit several user  
    app.patch('/users')  To edit one user  
    app.delete('/users')  Delet user 
    
    ======================================================

    HTTP Status

    2xx -> success
    4xx -> Error Client
    5xx -> Error Server

*/ 