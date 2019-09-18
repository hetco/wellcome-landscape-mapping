
function initMap(){
	var map = L.map('map', { fadeAnimation: false }).setView([0, 0], 2);

	L.tileLayer.grayscale('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	        attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors',
	        maxZoom: 14, minZoom: 1
	    }).addTo(map);

	loadData(map);
}



function loadData(map){
	let url = 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1JnutJR1cnjRBpUNKqSMAS7D65BiJzXx8C814y_MTN34%2Fedit%23gid%3D0';
	console.log('loading data');
	var orgsCall = $.ajax({ 
	    type: 'GET', 
	    url: url,
	    dataType: 'json',
	});

    var paperCall = $.ajax({ 
        type: 'GET', 
        url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1JnutJR1cnjRBpUNKqSMAS7D65BiJzXx8C814y_MTN34%2Fedit%23gid%3D909970256', 
        dataType: 'json',
    });

    $.when(paperCall,orgsCall).then(function(paperArgs,orgsArgs){
        let paperData = hxlProxyToJSON(paperArgs[0],false);
        let orgsData = hxlProxyToJSON(orgsArgs[0],false);
        addDataToMap(map,paperData,orgsData)
    });

}

function addDataToMap(map,paperData,orgsData){

    let style = {
        className: 'circlepoint',
        fillOpacity: 0.75,
        radius: 8,
        color: '#EC69D7'
    }

    //let infoBox = false;
    //let circleOver = false;

	let info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info infohover');
        return this._div;
    };

    info.update = function (info) { 
        let text = (info ?
            info
            : 'Hover for value');
        this._div.innerHTML = '<p class="infohovertext">'+text+'</p>'
    };

    info.addTo(map);

    //$('.info').on('mouseover',function(){infoBox = true;});
    //$('.info').on('mouseout',function(){infoBox = false;info.update();});  

    let infoDetails = L.control({position: 'topleft'});

    infoDetails.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info infohoverdetails');
        return this._div;
    };

    infoDetails.update = function (org,papers) { 
        let paperText = paperToHTML(papers);
        let text = '<button id="closebutton" type="button" class="btn btn-default">X</button><p class="infohovertitle">'+org+'</p><p>Example papers:</p>'
        this._div.innerHTML = text+paperText;

        $('#closebutton').on('click',function(e){
            $('.infohoverdetails').hide();
        });
    };

    infoDetails.addTo(map);

    $('.infohoverdetails').on('click',function(event){
        event.stopPropagation();
    });

    $('.infohoverdetails').hide();

    $(window).click(function() {
        $('.infohoverdetails').hide();
    });

	orgsData.forEach(function(d,i){
		let circle = L.circleMarker([d['#geo+lat'],d['#geo+lon']],style).addTo(map);

		circle.on('mouseover',function(){
            console.log('mouseover');
            //circleOver = true;
            info.update(d['#org']);
        });

        circle.on('mouseout',function(){
            console.log('mouseout');
            //circleOver = false;
            info.update();
           /* setTimeout(function(){
                if(infoBox==false && circleOver==false){
                info.update();
                 }
            },100);*/
        });

        circle.on('click',function(event){
            event.originalEvent.stopPropagation();
        	$('.infohoverdetails').show();
            papers = []
            paperData.forEach(function(p){
                if(p['#meta+id']==i){
                    papers.push(p);
                }
            });
            infoDetails.update(d['#org'],papers);
        });
	});
}

function paperToHTML(papers){
    let html = '';
    papers.forEach(function(p){
        html+= '<p><a href="'+p['#meta+url']+'" target="blank">'+p['#meta+paper']+'</a></p>';
    });
    return html;
}

function hxlProxyToJSON(input,headers){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            keys = e;
        }
        if(headers==true && i>1){
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
        if(headers!=true && i>0){
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

initMap();