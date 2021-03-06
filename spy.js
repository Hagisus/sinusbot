registerPlugin({
    name: 'Spy',
    version: '0.1',
    description: 'The bot will spy the entire server actions - users and channels',
    author: 'Grzegorz Kupczyk <kupczykgrzeg@gmail.com>',
    vars: [],
    enableWeb: true
    /*vars: [{
        name: 'clientUids',
        title: 'Comma-separated list of client-ids that the bot should follow',
        type: 'string'
    }]*/
}, function (sinusbot, config) {

    var engine = require('engine'),
        backend = require('backend'),
        event = require('event')

    channels = backend.getChannels()
    clients = backend.getClients()

    event.on("api:testecho", function (ev) {
        engine.log('Echo CALL', JSON.stringify(ev))
        var res = "Returned: " + ev.data()

        return {
            success: true,
            data: res
        }
    })

    engine.log('Spy initialized...')
})