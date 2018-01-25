module.exports.isValidDate = function (dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false; // Invalid format
    var d = new Date(dateString);
    if (!d.getTime() && d.getTime() !== 0) return false; // Invalid date
    return d.toISOString().slice(0, 10) === dateString;
}

module.exports.isValidTime = function (timeString) {
    var regEx = /^\d{2}:\d{2}(:\d{2})?$/;
    if (!timeString.match(regEx)) return false;
    var timeArr = timeString.split(':');
    var hour = parseInt(timeArr[0]);
    var minute = parseInt(timeArr[1]);
    if (timeArr[2]) var seconds = parseInt(timeString[2]);

    if (seconds)
        return (hour >= 0 && hour < 24) && (minute >= 0 && minute < 60) && (seconds >= 0 && seconds < 60);
    return (hour >= 0 && hour < 24) && (minute >= 0 && minute < 60);
}

module.exports.isValidInteger = function (number) {
    return typeof number !== 'string' && !isNaN(number);
}

module.exports.isValidEmail = function (email) {
    var regEx = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    return regEx.test(email);
}