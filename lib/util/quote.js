module.exports = quote;

function quote() {
    var quotes = [
        'Protect the innocent, uphold the law',
        'Come quietly or there will be... trouble.',
        'Stay out of trouble.',
        'Your move, creep.',
        'Dead or alive, you\'re coming with me'
    ];

    return quotes[Math.floor((Math.random() * quotes.length))];
}
