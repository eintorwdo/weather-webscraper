const request = require('request')
const jsdom = require('jsdom')
const {JSDOM} = jsdom
const fs = require('fs')

if(process.argv.length < 3){
    return console.log('Too few args')
}
else if(process.argv.length > 3){
    return console.log('Too many args')
}

var args = process.argv.slice(2)
var address = args[0]

request.post({url: 'https://geocode.xyz', form: {locate: address}}, (error, res, body) => {

    if(error){
        console.log(error)
        return error
    }

    if(res.statusCode >= 400 && res.statusCode < 500){
        var err = new Error('Client error')
        console.log(`Status code: ${res.statusCode}, ${res.statusMessage}`)
        return err
    }
    else if(res.statusCode >= 500){
        var err = new Error('Server error')
        console.log(`Status code: ${res.statusCode}, ${res.statusMessage}`)
        return err
    }

    const dom = new JSDOM(body)
    var location = dom.window.document.querySelector('title').textContent
    var reg = /[\d|.|,|-]+/
    var cords = location.match(reg)
    // console.log(cords)

    request({url: `https://darksky.net/forecast/${cords[0]}/ca12/en`}, (error, res, body) => {
        
        if(error){
            console.log(error)
            return error
        }

        if(res.statusCode >= 400 && res.statusCode < 500){
            var err = new Error('Client error')
            console.log(`Status code: ${res.statusCode}, ${res.statusMessage}`)
            return err
        }
        else if(res.statusCode >= 500){
            var err = new Error('Server error')
            console.log(`Status code: ${res.statusCode}, ${res.statusMessage}`)
            return err
        }

        const dom = new JSDOM(body)
        var forecast = dom.window.document.querySelector('.summary.swap').textContent.trim()
        forecast = forecast.replace(/\n/g, '')
        console.log('\n')
        console.log(`Current weather for ${args[0]}:`)
        console.log(forecast)
        var temps = dom.window.document.querySelector('.summary-high-low').textContent.trim()
        temps = temps.replace(/\t/g, '')
        temps = temps.replace(/\s/g, '')
        temps = temps.replace(/\u02DA/g, '\u02DA\n')
        console.log(temps)
        console.log('\n')
    })
})
