import express from 'express'

const app = express()

const users = []

app.post('/users', (req, res) => {

    console.log(req)
    res.send('Seu resgistro foi concluido')


})

app.get('/users', (req, res) => {

    res.send('Funcionou!')


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


    app.post('/users')  Create new user
    app.put('/users')  To edit several user  
    app.patch('/users')  To edit one user  
    app.delete('/users')  Delet user 
    
*/ 