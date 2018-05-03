function logo(url){
var logoStr = `<table role="module" data-type="image" border="0" align="center" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" class="wrapper" data-attributes='%7B%22child%22%3Afalse%2C%22link%22%3A%22%22%2C%22width%22%3A200%2C%22height%22%3A39%2C%22imagebackground%22%3A%22%23FFFFFF%22%2C%22url%22%3A%22${encodeURIComponent(url)}%22%2C%22alt_text%22%3A%22%22%2C%22dropped%22%3Atrue%2C%22imagemargin%22%3A%220%2C0%2C0%2C0%22%2C%22alignment%22%3A%22center%22%2C%22responsive%22%3Atrue%7D'>
<tr>
  <td style="font-size:6px;line-height:10px;background-color:#FFFFFF;padding: 0px 0px 0px 0px;" valign="top" align="center" role="module-content"><!--[if mso]>
<center>
<table width="200" border="0" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
  <tr>
    <td width="200" valign="top">
<![endif]-->

  <img class="max-width"  width="200"   height=""  src="${url}" alt="" border="0" style="display: block; color: #000; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px;  max-width: 200px !important; width: 100% !important; height: auto !important; " />

<!--[if mso]>
</td></tr></table>
</center>
<![endif]--></td>
</tr>
</table>`
console.log("URL URL ", url)
if(!url || url === "") logoStr = ""

return logoStr;
}

module.exports = logo;
