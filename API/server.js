import express from 'express'
import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()
const app = express()
app.use(express.json())


app.post('/users', async (req, res) => {

    await prisma.user.create ({
        data: {
            email: req.body.email,
            name: req.body.name,
            age: req.body.age
        }

    })
    
    res.status(201).json(req.body)

})

app.get('/users', async (req, res) => {

    let users = []

    if(req.query){

        users = await prisma.user.findMany({

            where: {
                name: req.query.name,
                email: req.query.email,
                age: req.query.age
            }
        })
    } else {
        users = await prisma.user.findMany()
    }

    res.status(200).json(users)

})


app.put('/users/:id', async (req, res) => {

    await prisma.user.update({
        where: {
            id: req.params.id

        },
        data: {
            email: req.body.email,
            name: req.body.name,
            age: req.body.age
        }

    })
    
    res.status(201).json(req.body)

})

app.delete('/users/:id', async (req, res) => {

    await prisma.user.delete({
        where: {
            id: req.params.id,
        },
    })
    
    res.status(200).json({ message : 'Usuário deletado com sucesso!'})
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


    Marquinhos
    i3cGm6OUJ0icvGx9
*/ 