/* ============================================================
   Garage Pontes — slider + ficha técnica
   ============================================================ */

let prevButton = document.getElementById('prev')
let nextButton = document.getElementById('next')
let container = document.querySelector('.container')
let items = container.querySelectorAll('.list .item')
let indicator = document.querySelector('.indicators')
let dots = indicator.querySelectorAll('ul li')
let list = container.querySelector('.list')

let active = 0
let firstPosition = 0
let lastPosition = items.length - 1

function pad(n){
    return n < 10 ? '0' + n : '' + n
}

function setSlider(){
    let itemOld = container.querySelector('.list .item.active')
    itemOld.classList.remove('active')

    let dotsOld = indicator.querySelector('ul li.active')
    dotsOld.classList.remove('active')
    dots[active].classList.add('active')

    indicator.querySelector('.number').innerHTML =
        pad(active + 1) + '<span class="number-total">/' + pad(items.length) + '</span>'
}

nextButton.onclick = () => {
    list.style.setProperty('--calculation', 1)
    active = active + 1 > lastPosition ? 0 : active + 1
    setSlider()
    items[active].classList.add('active')
}

prevButton.onclick = () => {
    list.style.setProperty('--calculation', -1)
    active = active - 1 < firstPosition ? lastPosition : active - 1
    setSlider()
    items[active].classList.add('active')
}

/* ------------------------------------------------------------
   Ficha técnica — dados dos carros
------------------------------------------------------------ */

const carData = {
    parati: {
        tag: 'Volkswagen',
        title: 'Parati G4',
        subtitle: '1.6 Total Flex · 2011',
        rows: [
            ['Motor', '1.6L 8V Total Flex (EA111)'],
            ['Potência', '101 cv (gasolina) / 103 cv (etanol) @ 5.250 rpm'],
            ['Torque', '14,2 kgfm (gasolina) / 14,5 kgfm (etanol)'],
            ['Câmbio', 'Manual de 5 marchas'],
            ['Tração', 'Dianteira'],
            ['0–100 km/h', '11,4 s (gasolina) / 11,2 s (etanol)'],
            ['Velocidade máxima', '182 km/h (gasolina) / 183 km/h (etanol)'],
            ['Dimensões (C×L×A)', '4.170 × 1.640 × 1.455 mm'],
            ['Entre-eixos', '2.468 mm'],
            ['Peso', '1.021 kg'],
            ['Porta-malas', '437 L'],
            ['Tanque', '51 L'],
        ]
    },
    golf: {
        tag: 'Volkswagen',
        title: 'Golf Variant',
        subtitle: 'Comfortline 1.4 TSI DSG · 2016',
        rows: [
            ['Motor', '1.4L Turbo 16V TSI (EA211)'],
            ['Potência', '140 cv @ 5.000–6.000 rpm'],
            ['Torque', '25,5 kgfm / 250 Nm @ 1.500–3.500 rpm'],
            ['Câmbio', 'Automático DSG de 7 marchas'],
            ['Tração', 'Dianteira'],
            ['0–100 km/h', '9,5 s'],
            ['Velocidade máxima', '205 km/h'],
            ['Dimensões (C×L×A)', '4.562 × 1.799 × 1.481 mm'],
            ['Entre-eixos', '2.635 mm'],
            ['Peso', '1.368 kg'],
            ['Porta-malas', '605 L'],
            ['Tanque', '50 L'],
        ]
    },
    porsche: {
        tag: 'Porsche',
        title: '911 Turbo S',
        subtitle: '992 · 2021',
        rows: [
            ['Motor', '3.7L Boxer-6 Biturbo'],
            ['Potência', '650 cv @ 6.750 rpm'],
            ['Torque', '81,6 kgfm / 800 Nm @ 2.500–4.000 rpm'],
            ['Câmbio', 'PDK automático de 8 marchas'],
            ['Tração', 'Integral (AWD)'],
            ['0–100 km/h', '2,7 s'],
            ['Velocidade máxima', '330 km/h'],
            ['Dimensões (C×L×A)', '4.535 × 1.900 × 1.303 mm'],
            ['Entre-eixos', '2.450 mm'],
            ['Peso', '1.640 kg'],
            ['Porta-malas', '128 L (dianteiro)'],
            ['Tanque', '67 L'],
        ]
    },
    polo: {
        tag: 'Volkswagen',
        title: 'Polo Sportline',
        subtitle: '1.6 MSI · 2015',
        rows: [
            ['Motor', '1.6L 16V MSI Flex'],
            ['Potência', '101 cv (gasolina) / 104 cv (etanol) @ 5.250 rpm'],
            ['Torque', '15,4 kgfm (gasolina) / 15,6 kgfm (etanol) @ 2.500 rpm'],
            ['Câmbio', 'Manual de 5 marchas'],
            ['Tração', 'Dianteira'],
            ['0–100 km/h', '11,2 s'],
            ['Velocidade máxima', '185 km/h'],
            ['Dimensões (C×L×A)', '3.890 × 1.651 × 1.489 mm'],
            ['Entre-eixos', '2.465 mm'],
            ['Peso', '1.117 kg'],
            ['Porta-malas', '250 L'],
            ['Tanque', '50 L'],
        ]
    }
}

/* ------------------------------------------------------------
   Modal
------------------------------------------------------------ */

const modal = document.getElementById('specModal')
const modalBody = document.getElementById('modalBody')
const modalClose = document.getElementById('modalClose')
const infoButtons = document.querySelectorAll('.information[data-car]')

function buildRows(rows){
    return rows.map(([label, value]) => (
        '<div class="spec-row">' +
            '<span class="label">' + label + '</span>' +
            '<span class="value">' + value + '</span>' +
        '</div>'
    )).join('')
}

function openModal(carId){
    const data = carData[carId]
    if (!data) return

    modalBody.innerHTML =
        '<p class="modal-tag">' + data.tag + '</p>' +
        '<h3>' + data.title + '</h3>' +
        '<p class="modal-subtitle">' + data.subtitle + '</p>' +
        '<div class="spec-table">' + buildRows(data.rows) + '</div>'

    modal.classList.add('open')
    document.body.style.overflow = 'hidden'
}

function closeModal(){
    modal.classList.remove('open')
    document.body.style.overflow = ''
}

infoButtons.forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.car))
})

modalClose.addEventListener('click', closeModal)

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal()
})

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal()
})
