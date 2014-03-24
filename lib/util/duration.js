module.exports = duration;

function duration(fn, next) {
    var started = new Date().getTime();
    fn(function(err) {
        var stopped = new Date().getTime();
        var duration = stopped - started;
        next(err, duration);
    })
}