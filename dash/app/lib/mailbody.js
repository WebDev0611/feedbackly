'use strict';
var moment = require('moment');
	moment.locale('fi');
	
var Mailbody = function() {

	var self = this;
	
	var formatTime = function(data){	
		return data ? data.hour + ':00' : '-';
	};
	
	var formatDate = function(date, format){			
		if (date){
			if (format === 'weekday'){
				return moment.unix(date/1000).format('dd');
			}
			if (format === 'date'){
				return moment.unix(date/1000).format('DD.MM.');
			}
		} else {
			return '-';
		}
	};
	
	this.render = function(data, user){
		return self.renderHTML(data, user);
	}
	
	this.renderHTML = function(data, user){
		var body = header;
		var week = moment(data.dates.from).week();
		
		if (data.periodFeedbackCount === 0){
			return 'No data';
		}
		
		body += '<h1>Tapin palautekatsaus, viikko '+week+'</h1>'+
		'<p>Tapin feedback is a quick and easy solution for collecting accurate customer feedback.</p>'+
		'<div style="width:33%;float:left;text-align:center;"><h3 style="margin:0 0 10px">Keskiarvo</h3><h2 style="margin:0 0 30px">'+(data.presentFullAverage.average*100).toFixed(0)+'%</h2></div>'+
		'<div style="width:33%;float:left;text-align:center;"><h3 style="margin:0 0 10px">Aikajakson palautteet</h3><h2 style="margin:0 0 30px">'+data.periodFeedbackCount+'</h2></div>'+
		'<div style="width:33%;float:left;text-align:center;"><h3 style="margin:0 0 10px">Palaute yhteensä</h3><h2 style="margin:0 0 30px">'+data.totalFeedbackCount+'</h2></div>'+
		'<div style="padding:0"><div style="width:50%;float:left;">'+
		 '<div class="clear:left;width:50%;float:left">Paras kellonaika: '+formatTime(data.hourStats.bestAverage)+'</div>'+
         '<div class="width:50%;float:left">Huonoin kellonaika: '+formatTime(data.hourStats.worstAverage)+'</div>'+
		 '<div class="width:50%;float:left">Vilkkain kellonaika: '+formatTime(data.hourStats.mostFeedback)+'</div>'+
		 '<div class="width:50%;float:left">Hiljaisin kellonaika: '+formatTime(data.hourStats.leastFeedback)+'</div>'+
		 '</div><div style="width:50%;float:left;">'+
		 '<div class="width:50%;float:left">Paras päivä: '+formatDate(data.dayStats.bestAverage.day, 'weekday')+' '+formatDate(data.dayStats.bestAverage.day, 'date')+'</div>'+
		 '<div class="width:50%;float:left">Huonoin päivä: '+formatDate(data.dayStats.worstAverage.day, 'weekday')+' '+formatDate(data.dayStats.worstAverage.day, 'date')+'</div>'+
		 '<div class="width:50%;float:left">Vilkkain päivä:'+formatDate(data.dayStats.mostFeedback.day, 'weekday')+' '+formatDate(data.dayStats.mostFeedback.day, 'date')+'</div>'+
		 '<div class="width:50%;float:left">Hiljaisin päivä: '+formatDate(data.dayStats.leastFeedback.day, 'weekday')+' '+formatDate(data.dayStats.leastFeedback.day, 'date')+'</div>'+
		 '</div></div><img src="cid:'+user.email+'" style="max-width: 100%;" />';
		 
		body += footer;
        
		return body;
	};
	
	var header = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml">'+
        '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'+
        '<title>Weekly digest</title>'+        
		'</head>'+
		'<body yahoo bgcolor="#f6f8f1" style="margin: 0; padding: 20px; min-width: 100%!important;background-color:#efefef;color:#333">'+
		'<div style="width: 100%; padding:20px; max-width: 600px; background-color:white;line-height:25px">';
	
	var footer = '</div></body></html>';
	
	return this;
};

module.exports = new Mailbody();