const moment = require('moment')
function formatMessage(username, text) {
    return{
        username,
        text,
        time: moment(). format('h:mm a'),
        date: moment(). format('dd' +'/'+ 'mm' +'/'+ 'yyyy')
    }
}

module.exports = formatMessage;