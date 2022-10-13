
import { subscribeToHellfireClube } from './data/hellfire-clube.js'


/* Creating a function called main and assigning the values of the inputs to the object. */
(function main() {
    const txtName = document.getElementById('txtName')
    const txtEmail = document.getElementById('txtEmail')
    const txtLevel = document.getElementById('txtLevel')
    const txtCharacter = document.getElementById('txtCharacter')

/* Creating an object called subscribe and assigning the values of the inputs to the object. */
    document.getElementById('btnSubscribe').addEventListener('click', async () => {
        const subscribe = {
            name: txtName.value,
            email: txtEmail.value,
            level: txtLevel.value,
            character: txtCharacter.value
        }

/* Calling the function subscribeToHellfireClube and passing the subscribe object as a parameter. */
        const id = await subscribeToHellfireClube(subscribe)
        alert(`Inscrição ${id} adicionada com sucesso!`)
    })
})()
