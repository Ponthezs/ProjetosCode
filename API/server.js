import express from 'express'
import { Prisma, PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()
const app = express()
app.use(express.json())


app.post('/users', async (req, res) => {

    await prisma.user.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            age: req.body.age
        }

    })
    
    res.status(201).json(req.body)

})

app.get('/users', async (req, res) => {

    const users = await prisma.user.findMany()


    res.status(200).json(users)

})


app.put('/users/:id', async (req, res) => {

    await prisma.user.update({
        whare: {
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