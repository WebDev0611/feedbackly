module.exports = function(fbevent){

var html = `
<div style="text-align: center;">
    <span style="font-family:tahoma,geneva,sans-serif;"><span style="font-size: 12px;">`
html+= `<div style="display: inline-block;background-color: gray;color: white;width: 45px;height: 45px;line-height: 45px;font-size: 16px;font-weight: bold;border-radius: 100%;text-align: center;">`
html+= fbevent.data[0]*10;
html+= "</div>"
html+=`</span></span>
</div>
`

return html

}
