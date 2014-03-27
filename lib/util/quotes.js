module.exports = quotes()

function quotes() {

    return {
        startup: startup,
        shutdown: shutdown
    };

    function startup() {
        return quote([
            'Protect the innocent, uphold the law.',
            'Come quietly or there will be... trouble.',
            'Stay out of trouble.',
            'Your move, creep.',
            'Dead or alive, you\'re coming with me.',
            'Looking for me?'
        ]);
    }

    function shutdown() {
        return quote([
            'Excuse me, I have to go. Somewhere there is a crime happening.',
            'Thank you for your cooperation.'
        ])
    }

    function quote(quotes) {
        return quotes[Math.floor((Math.random() * quotes.length))];
    }
}