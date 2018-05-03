var encryption = require('../../../utils/encryption')
module.exports = function(fbevent){

var DATA = fbevent.crypted ? encryption.decrypt(fbevent.data[0]) : fbevent.data[0]

var html = `
<div style="text-align: center;">
    <span style="font-family:tahoma,geneva,sans-serif; font-style:italic;"><span style="font-size: 13px;">
    ${DATA}
    </span></span>
</div>
`


return html

}
