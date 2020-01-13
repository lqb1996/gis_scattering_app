
/*----------------查询条件转变使用的参数-----------*/
//临时保存切换参数
var A_interim="4";
var B_interim="1";
//确定后执行的参数
var A_id="4";
var B_id="1";
//根据用户选择的不同条件、显示不同的标题（查询范围、类型、监测因子，单位）
var purview="全国";
var motorVehicle="机动车";
var conditionUnit="institutions";
var unit="个";
var listTitle="生产企业";

/*---------------------参数---------------------------*/
//ajax发送的查询参数
var searchText="";

var vehicletype="";
var pollutetype="";

//专题图类型  1-区域分布  2-随车清单  3-新注册  4-企业分布
var specialType="4";


//查询各省结果
var enterpriseinfo;
//查询点位列表
var pointinfo;
//总数(通用)
var currFactorCount=0;

var graecolor=null;
//保存点击的省份内包含的数据
var grattributes=null;
//0  全局搜索功能、不做任何限制（后面的参数都传""空值）、模糊关键字查全国范围内数据
//1  点击省进入使用、所有参数有效、传省市
//2  初始化、给企业分布功能使用 
//3  新注册
var isall=1;

var enterprise="";
//各个分类数组-暂未用
var yieldList={};
var institutionsList={};
//新车注册的年份
var registerYear="";
 

var pictureSymbol =  new esri.symbol.PictureMarkerSymbol({
    //"url": urlpath + "/res/images/homepage/point_green.png",
	"url": urlpath + "/res/images/baiduIMG/markers.png",
	"height":15,
    "width":15,
    "angle": 0,
    "xoffset":0,
    "yoffset":0
  });

function doreadymap(){
	//省市边界图
	polluteLayer = new esri.layers.GraphicsLayer();
	polluteLayer.id = "polluteLayer";
	polluteLayer.visible = true;
	map.addLayer(polluteLayer);

	pollSizeLayer = new esri.layers.GraphicsLayer();
	pollSizeLayer.id = "pollSizeLayer";
	pollSizeLayer.visible = true;
	map.addLayer(pollSizeLayer);
	//点位图
	pointsLayer = new esri.layers.GraphicsLayer();
	pointsLayer.id = "pointsLayer";
	pointsLayer.visible = true;
	map.addLayer(pointsLayer);
	
	dojo.connect(pointsLayer, 'onMouseOver', orgLayerOver);
	dojo.connect(pointsLayer, 'onMouseOut', orgLayerOut);
	
	dojo.connect(polluteLayer, 'onMouseOver',polluteLayerOver);
	dojo.connect(pollSizeLayer, 'onMouseOut',polluteLayerOut);
	dojo.connect(pollSizeLayer, 'onClick',polluteLayerClick);
	//esriConfig.defaults.io.proxyUrl = urlpath+"/proxy.jsp";
	//esriConfig.defaults.io.alwaysUseProxy = true;

	//页面初始化查询数据 
	//queryInterfaceData();
	selectCityCount(2);
};	  

//确定按钮
function queryCriteria(jdc){
	unit="个";
	pollSizeLayer.clear(); 
	map.infoWindow.hide();
	if(polluteLayer){polluteLayer.clear();}
	if(pointsLayer){pointsLayer.clear();}
	
	 A_id=A_interim;  B_id=B_interim;
	 var a= document.getElementById("A"+A_id);
	 var b= document.getElementById("B"+B_id);
	 specialType=a.name;
	 vehicletype=b.name;  motorVehicle=b.value;
	 //企业分布
	 if(specialType=="4"){
		 selectCityCount(2);
	 }else {
		 document.getElementById("aplegend").style.display = "none";
		 if(specialType=="4"){
			 purview="全国";
			 document.getElementById("jdc_btn03").style.display="none";
		 }
		 if(purview==""){
			 purview="全国";
		  }
	     if(purview=="全国"){
	    	 map.setExtent(initent);
	    	 if(!jdc){
	    		 coverit();
	    	 }
	    	 //selectCityCount(a){
	    	 queryInterfaceData();
	     }else{
	       if(specialType=="3"){
	    	     unit="万辆";
	    	     selectCityCount(3);
	    	  }else{
	    		 selectCityCount(1);
	    	  }
	       
	     } 
	 }   
}
//返回按钮
function jdc_btn(){
	purview="全国";
    queryCriteria(true);
    document.getElementById("jdc_btn03").style.display="none";
    //document.getElementById("jdc_main12").style.display="none";
    document.getElementById("aplegend").style.display = "block";	 
    //document.getElementById("jdc_main145").style.display = "block";	
    if(pointsLayer){pointsLayer.clear();}
 
}
//查询功能
function queryInterfaceData() {
	pollSizeLayer.clear(); 
	map.infoWindow.hide();
	if(polluteLayer){polluteLayer.clear();}
	
	var productValue = "";
	if(specialType=="1"){
		var checkIds = document.getElementsByName("producttype");
		for(var i=0;i<checkIds.length;i++){
			if (checkIds[i].checked) {
				if(productValue.length>0){
					productValue +=",";
				}
				productValue += checkIds[i].value;
			}
		}
		conditionUnit="institutions";
	    listTitle="生产企业";
	    document.getElementById("titleSpan").innerHTML = year+"全国"+ motorVehicle + "企业区域分布情况";
	}else if(specialType=="2"){
		conditionUnit="yield";
		listTitle="随车清单";
		document.getElementById("titleSpan").innerHTML = year+"全国"+ motorVehicle + "随车清单情况";
	} else if(specialType=="3"){
		unit="万辆";
        conditionUnit="changecount";
        listTitle="新注册车辆";
		document.getElementById("titleSpan").innerHTML = registerYear +"全国"+ motorVehicle + "新注册车辆情况";
	}
    document.getElementById("jdc_li02_02").innerHTML=year+" "+purview +" "+ motorVehicle;
	$.ajax({
		type:"post",
		url:urlpath+"/homepage/newcarregular/RankingSituation.hz",
		data:{"vehicleType":vehicletype,"year":year,"product":productValue,"conditionUnit":conditionUnit},
		dataType:"json",
		async:false,
		contentType:"application/x-www-form-urlencoded; charset=utf-8",
		success:function(data){
			 var info = eval(data);
			 console.log(vehicletype+"_"+year+"_"+productValue+"_"+info.length);
			 enterpriseinfo=info;
			 if(conditionUnit=="changecount"&&specialType=="3"){
				 enterpriseinfo=setNewcar(enterpriseinfo);
				 if(enterpriseinfo&&enterpriseinfo.length>0){
					 registerYear=enterpriseinfo[0].year;
				 }
				 document.getElementById("jdc_li02_02").innerHTML=registerYear +" "+purview +" "+ motorVehicle;
				 document.getElementById("titleSpan").innerHTML = registerYear +"全国"+ motorVehicle + "新注册车辆情况";
			 }
			
			 calcBreaks(enterpriseinfo);
			 getNonroad();
		},error:function(e){
			alert("服务器没有返回数据，可能服务器忙，请重试");  
		}
	});
}
function setNewcar(data){
	for(var i=0;i<data.length;i++){
		data[i]["changecount"]=(data[i]["changecount"])/10000;
	} 
	return data;
}
//全国查询结果渲染
function getNonroad() {
	var index=1;
	var where ="1=1";
	if(purview!="全国"&&(specialType=="1"||specialType=="2"||specialType=="3")){
	     where="NAME like '"+ purview +"%'";
	     if(specialType=="3"&&isall=="3"){
	    	 where="PROVINCE like '"+ purview +"%'";
	    	 index=4;
	     }
	  }
  var queryTask = new esri.tasks.QueryTask(mapRegionUrl+"/"+index);
  var query = new esri.tasks.Query();
  query.returnGeometry = true;
  query.outFields = ["NAME"];
  query.where = where;
  if(purview=="全国"&&(specialType=="1"||specialType=="2"||specialType=="3")){
	  queryTask.execute(query, showResults);
  }else{
	  if(specialType=="3"&&isall=="3"){
		  queryTask.execute(query, showResults);
	  }else{
		  queryTask.execute(query, showCityResults);
	  }
	 
  }
}
function showResults(queryResults) {
	 for(var i=0;i<queryResults.features.length;i++){
		    var gra=queryResults.features[i];
		    var attribute=getAttribute(gra.attributes.NAME,enterpriseinfo);
		    var color=nolevelColor ;
		    if(attribute){
		    	if(attribute[conditionUnit]=="0"){
		    		  color=nolevelColor;
		    	  }else{
		    		  color=calcsetColor(attribute[conditionUnit]);
		    		  if(color){
		    			  color=color.replace(/rgb/, "rgba");
				    	  color=color.replace(/\)/, ",1)");
		    		  }else{
		    			  color=nolevelColor;
		    		  }
			    	 
		    	  } 
		      }else{
		    	gra.attributes["institutions"]=0;
		    	gra.attributes["yield"]=0;
		    	gra.attributes["changecount"]=0;
		    	
		    	attribute=gra.attributes;
		    }
		    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,255,0.8]),0.5), new dojo.colorFromRgb(color));
		    var graphic = new esri.Graphic(gra.geometry,symbol,attribute);
		    polluteLayer.add(graphic);
		    
	   }
	 
	  setRanking();
	 
	  var graphics=polluteLayer.graphics;
	  var len=graphics.length;
	  for(var i=0;i<len;i++){
	    	var gra=graphics[i];
	       // var text = new esri.symbol.TextSymbol(gra.attributes.NAME+" "+gra.attributes[conditionUnit]);  
	        var text = new esri.symbol.TextSymbol(gra.attributes.NAME);  
			text.setAlign(esri.symbol.TextSymbol.ALIGN_START);  
		    text.setFont(pollfont);  
		    text.setColor(new dojo.Color([0,0,0,0.9])); 
		    var pt;
		    if(purview=="全国"){
		       pt=new esri.geometry.Point(geoCoordArray[gra.attributes.NAME][0],geoCoordArray[gra.attributes.NAME][1],new esri.SpatialReference({ wkid: 4326 }));
		     }else{
		       pt=gra.geometry;
		     }
	        var labelGraphic = new esri.Graphic(pt,text);  
		    polluteLayer.add(labelGraphic);
		    
		   // yieldList.push([gra.attributes.NAME,gra.attributes.yield]);
		   // institutionsList.push([gra.attributes.NAME,gra.attributes.institutions]);
	  } 
	  // yieldList= repolData(yieldList);
	  // institutionsList= repolData(institutionsList);
	  setTimeout(quitcover,500);
}
function polluteLayerOver(e) {
	if(!e.graphic.attributes){return;}
	if((specialType=="1"||specialType=="2")&&isall=="1"&&purview!="全国"&&purview!=""){
		//如果（区域分布、随车清单功能） 点击进入各省后、（鼠标悬浮面、不显示任何窗体文字）、 
	}
	else{
	 var att=e.graphic.attributes;
	 pollSizeLayer.clear();
	 graecolor=e.graphic.symbol.color;
	 var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
			      new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, 
				  new dojo.Color([0,0,0,0.9]),1), new dojo.Color([graecolor.r,graecolor.g,graecolor.b,0.9]));
	 var graphic = new esri.Graphic(e.graphic.geometry,symbol,att);
	 pollSizeLayer.add(graphic); 
	
//     var text = new esri.symbol.TextSymbol(att.NAME+" "+att[conditionUnit]);  
//	    text.setAlign(esri.symbol.TextSymbol.ALIGN_START);  
//	    text.setFont(pollfont);  
//	    text.setColor(new dojo.Color([255,0,0,1])); 
//	    var pt;
//	    if(purview=="全国"){
//	       pt=new esri.geometry.Point(geoCoordArray[att.NAME][0],geoCoordArray[att.NAME][1],new esri.SpatialReference({ wkid: 4326 }));
//	     }else{
//	       pt=e.graphic.geometry;
//	     
//	     }
//     var labelGraphic = new esri.Graphic(pt,text);  
//     pollSizeLayer.add(labelGraphic); 
	     map.infoWindow.resize(160,160);
		 map.infoWindow.setTitle(att.NAME);
	     map.infoWindow.setContent(getInfoContent(att));
	     map.infoWindow.anchor = "top";
	     if(purview=="全国"){
	    	   map.infoWindow.show(new esri.geometry.Point(geoCoordArray[e.graphic.attributes.NAME][0],geoCoordArray[e.graphic.attributes.NAME][1]));
	    	 }else{
		       map.infoWindow.show(e.screenPoint);
	      } 
	 }    
}
function getInfoContent(attribute) {
	  var html="<div>";
	  if(specialType=="3"){
		  html+="<div style=\"padding-left:3px;\">新注册："+ (attribute.changecount).toFixed(2)+"万辆</div>";
	  }else{
		 html+="<div style=\"padding-left:3px;\">生产企业："+ attribute.institutions+"个</div>";
	     html+="<div style=\"padding-left:3px;\">随车清单："+ attribute.yield+"辆</div>";
	  }
	 html+="</div>";
	 return html;
}
function polluteLayerOut(e) {
	 pollSizeLayer.clear(); 
	 map.infoWindow.hide();
}
function polluteLayerClick(e) {
	var grap=e.graphic;
	if(!grap.attributes){return;}
	if(purview=="全国"){
		    var name=grap.attributes.NAME;
		    grattributes=grap.attributes;
		    currFactorCount=grap.attributes[conditionUnit];
		    purview=name;
		    //定位省----------------------------------------------------------
		    var x1=mercatorToLonLatX(grap._extent.xmax);
		    var x2=mercatorToLonLatX(grap._extent.xmin);
		    var y1=mercatorToLonLatY(grap._extent.ymax);
		    var y2=mercatorToLonLatY(grap._extent.ymin);
		    var mapextent= new esri.geometry.Extent(x2,y2,x1,y1,new esri.SpatialReference({ wkid:4326 }));
			map.setExtent(mapextent, true);
			//向下执行
			if(specialType=="3"){
				 selectCityCount(3);
			}else{
			     selectCityCount(1);
			}
			document.getElementById("jdc_btn03").style.display="block";
		    //document.getElementById("jdc_main12").style.display="block";	 
		    document.getElementById("aplegend").style.display = "none";	    
		    //document.getElementById("jdc_main145").style.display = "none";	
	 
	 }
}

//传入名称和数据返回对应的属性数据集合
function getAttribute(name,clist) {
    var ss = true;
    for (var i = 0; i < clist.length; i++) {
    	var arn = decodeURI(clist[i].areaname,'UTF-8'); 
    	if(arn){
    		if (arn.indexOf(name) > -1) {
            ss = false;
            clist[i].NAME=name;
            return clist[i];
          }
    	}
      }
    if (ss) {
        return null;
    }
}
/** 获取单值专题图区间范围 */
function calcBreaks(arr) {
	jmultiple=1;
    var max = 0;
    var min = 0;
    //if(!maxNum){
    //console.log("没有最大值数据"+maxNum);
    for (var j =0; j < arr.length; j++) {
        if (j == 0) {
            max = parseFloat(arr[j][conditionUnit]);
            min = parseFloat(arr[j][conditionUnit]);
            if(!max){ max=0;  }
            if(!min){ min=0;  }
        }
        if (max < parseFloat(arr[j][conditionUnit])) {
            max = parseFloat(arr[j][conditionUnit]);
        }
        if (min > parseFloat(arr[j][conditionUnit])) {
        	if(parseFloat(arr[j][conditionUnit])>0)
            min = parseFloat(arr[j][conditionUnit]);
        }
    }
 
	if(max>1){
	   	 var interimSize=parseFloat(max);
		 var j=1;
		 for(var i=1;i<10;i++){
			 if(interimSize<10){
				 max=Math.ceil(interimSize)*j;
				 break;
			 }
			 interimSize=interimSize.div(10);
			 j=j*10;
		 }
     }
    if(min>1){
		min=1;
	}else{
//		if(min<0.01){
//			min=0.01;
//		} 
	}
    colorFormula(max,min);   
    var htmls="";
    htmls += "<span style=\"position: absolute;left:50px;top:0px;font-size: 16px;\">"+max+"</span>";
    var ss=300/(gradient.length);
    for (var i=gradient.length-1; i >=0 ; i--) {
        htmls += '<div style="margin-left: 0;width:45px;height:'+ss+'px;background-color:' + gradient[i] + '"> </div>';
      }
    htmls += "<span style=\"position: absolute;left:55px;bottom:0px;font-size: 16px;\">"+min.toFixed(2)+"</span>";
    document.getElementById("aplegend").innerHTML = htmls;
    document.getElementById("aplegend").style.display = "block";  
}

function setRanking() {
	var graphics=polluteLayer.graphics;
    graphics=retserData(graphics,conditionUnit);
	var t=false;
	//if(purview=="全国"){
		currFactorCount=0;
		t=true;
	// }
	
    var htmlcontent="";
    for(var i=0;i<graphics.length;i++){
    	var graphic=graphics[i].attributes;
    	if(!graphic["institutions"]){
    		graphic["institutions"] =0;
    	}
    	if(!graphic["yield"]){
    		graphic["yield"] =0;
    	}
    	if(!graphic["changecount"]){
    		graphic["changecount"] =0;
    	}
    	htmlcontent += "<tr>";
    	htmlcontent += "<td style=\"text-align:right;\">"+(i+1)+"</td>";
    	htmlcontent += "<td>" +  graphic.NAME + "</td>";
        if(specialType=="3"){
        	htmlcontent += "<td>" +  (graphic[conditionUnit]).toFixed(2) +unit+"</td>";
        }else{
        	htmlcontent += "<td>" +  graphic[conditionUnit] +unit+"</td>";
        }
        htmlcontent+="</tr>";
        if(t){
    		currFactorCount=(currFactorCount).add(parseFloat(graphic[conditionUnit]));
         }
        if(!currFactorCount){
        	currFactorCount=0;
        }
 
     }
    htmlcontent+="</table></div>";
  

    var html="";
    html += "<h3>全国各省"+listTitle+"排名</h3>";
    html+="<div id=\"overflow\"  style=\"height:100%;overflow-x:hidden;overflow-y:hidden\" onMouseOver=\"overflowOver()\" onMouseOut=\"overflowOut()\">";
    html+="<table border=\"0\">";
    html+="<tr class=\"jdc_trth01\">";
    html+="<th></th><th>"+listTitle+"</th><th>数量</th>";
	html+="</tr>";
    html += "<tr>";
    html += "<td width=\"25px\" style=\"text-align:right;\">";
    html += "<td>"+ purview +"</td>";
    html += "<td>" + (parseFloat(currFactorCount).toFixed(2)) +unit+"</td>";
    html+="</tr>";
    html+=htmlcontent;
    document.getElementById('vshow').innerHTML = html; 
}
//排序
function retserData(arr,value){
	var i = arr.length, j;
	var tempExchangVal;
	while (i > 0) {
	    for (j = 0; j < i - 1; j++) {
	        if (Number(arr[j]["attributes"][value]) < Number(arr[j + 1]["attributes"][value])) {
	            tempExchangVal = arr[j];
	            arr[j] = arr[j + 1];
	            arr[j + 1] = tempExchangVal;
	        }
	    }
	    i--;
	}
	 return arr;
}
function overflowOver(){
    document.getElementById("overflow").style.overflowY="auto";
}
function overflowOut(){
   document.getElementById("overflow").style.overflowY="hidden";
}
function selectCityCount(a){
	  isall=a;
	//1是点击省进来的（包括随车清单和企业功能）
	//3是新注册企业进来的
	//显示面状图层
	if(isall==1||isall==3){
		switch(specialType)
		{
		   case "1":
			    conditionUnit="institutions";
			break;
		   case "2":
			    conditionUnit="yield";
				break;
		   case "3":
			   conditionUnit="changecount";
				break;
		}
	}else{
		//这个是全局搜索和企业分布
		//显示点位
		 conditionUnit="institutions";
	}
	
	
	coverit();
	var productValue = "";
	if(specialType=="1"||specialType=="4"){
		var checkIds = document.getElementsByName("producttype");
		for(var i=0;i<checkIds.length;i++){
			if (checkIds[i].checked) {
				if(productValue.length>0){
					productValue +=",";
				}
				productValue += checkIds[i].value;
			}
		}
	}
    var c="";
    if(isall==0){
    	map.setExtent(initent);
		document.getElementById("jdc_btn03").style.display="none";
		document.getElementById("aplegend").style.display = "none";	  
		document.getElementById("titleSpan").innerHTML="全国生产企业分布情况";
		vehicletype="";
		purview="";
		enterprise = document.getElementById("searchtext").value.replace(/(^\s*)|(\s*$)/g, ""); 
	    if(!enterprise){
	    	enterprise="";
	    }
	}else if(isall==1){
		// 生产企业    随车清单 点击进去也是生产企业 
		document.getElementById("titleSpan").innerHTML=year+ purview + motorVehicle + "企业位置分布情况";
	    document.getElementById("jdc_li02_02").innerHTML=year+" "+purview +" "+ motorVehicle;
	    c=codeList[purview][0];  
	    if(!enterprise){
	    	enterprise="";
	    }
	    enterprise="";
	    
	}else if(isall==2){
	    document.getElementById("jdc_btn03").style.display="none";
		document.getElementById("aplegend").style.display = "none";	  
		document.getElementById("titleSpan").innerHTML="全国生产企业分布情况";
		purview="全国";
	    enterprise=""; 
	    document.getElementById("jdc_li02_02").innerHTML=year+" "+purview +" "+ motorVehicle;
	}
	else if(isall==3){
		document.getElementById("titleSpan").innerHTML=registerYear+ purview + motorVehicle + "新注册情况";
	    document.getElementById("jdc_li02_02").innerHTML=year+" "+purview +" "+ motorVehicle;
	    c=codeList[purview][0];  
	    if(!enterprise){
	    	enterprise="";
	    }
	    enterprise="";
	    productValue="";
	   // vehicletype="";
	}
    
	pollSizeLayer.clear(); 
	map.infoWindow.hide();
	if(polluteLayer){polluteLayer.clear();}
	if(pointsLayer){pointsLayer.clear();}
 
	$.ajax({
		type:"post",
		url:urlpath+"/homepage/newcarregular/ProvinceAgenciesList.hz",
		data:{"province":c,"cllb":vehicletype,"enterprise":enterprise,"product":productValue,"conditionUnit":conditionUnit},
		dataType:"json",
		async:false,
		contentType:"application/x-www-form-urlencoded; charset=utf-8",
		success:function(data){
					 var info = eval(data);
					 if(isall==3){
						 enterpriseinfo=info;
						 if(conditionUnit=="changecount"&&specialType=="3"){
							 enterpriseinfo=setNewcar(enterpriseinfo);
							 document.getElementById("jdc_li02_02").innerHTML=registerYear+" "+purview +" "+ motorVehicle;
							 document.getElementById("titleSpan").innerHTML = registerYear +"全国"+ motorVehicle + "新注册车辆情况";
						 }
						 calcBreaks(enterpriseinfo);
					  }else{
						 pointinfo=info;
					 }
		 			 getNonroad();
		},error:function(e){
			alert("服务器没有返回数据，可能服务器忙，请重试");  
		}
	});
}

function showCityResults(queryResults) {
	 var html="";
	 var sp=new esri.SpatialReference({ wkid: 4326 });
	 if(isall==1){
	     for(var i=0;i<queryResults.features.length;i++){
			    var gra=queryResults.features[i];
			    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
			    		     new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, 
			    		     new dojo.Color([102,51,153,1]),1), 
			    		     new dojo.Color([graecolor.r,graecolor.g,graecolor.b,0.2]));
			    var graphic = new esri.Graphic(gra.geometry,symbol,grattributes);
			    polluteLayer.add(graphic);
		  }
	 }
    for(var i=0;i<pointinfo.length;i++){
		 var da=pointinfo[i];
	     var pt=new esri.geometry.Point(da["longitude"],da["latitude"],sp);
	   
	     var manuf = decodeURI(da.manuf,'UTF-8'); 
		 var infoTemplate = new esri.InfoTemplate(manuf,getContent(da));
		 var graphic = new esri.Graphic(pt,pictureSymbol,pointinfo[i],infoTemplate);
		 pointsLayer.add(graphic);
	 }
     setcityRanking();
     map.infoWindow.resize(260,160);
     setTimeout(quitcover,500);
}

function getContent(attribute) {
	 var manuf = decodeURI(attribute.manuf,'UTF-8'); 
	 var product = decodeURI(attribute.product,'UTF-8'); 
	 var qydz = decodeURI(attribute.qydz,'UTF-8'); 
	 var html="<div>";
	       html+="<div style=\"padding-left:3px;\">名称："+manuf+"</div>";
	       html+="<div style=\"padding-left:3px;\">地址："+qydz+"</div>";
	       html+="<div style=\"padding-left:3px;padding-bottom:15px\">产品："+product+"</div>";
	       //html+="<a title=\"点击进入详细信息页面\"  onClick=\"javascript:window.open('"+urlpath+"/datacenter/newcarlab/newcardetail.hz?id="+attribute.manufid+"')\"  style='position:absolute;right:10px;bottom:-0px;cursor:pointer;'>查看详细<a/>";
	       html+="<a title=\"点击进入详细信息页面\"  onClick=\"javascript:window.open('"+urlpath+"/datacenter/newcarlab/projectDetails.hz?enterId="+attribute.manufid+"')\"  style='position:absolute;right:10px;bottom:-0px;cursor:pointer;'>查看详细<a/>";
		   html+="</div>";
	 return html;
}
 
function setcityRanking() {
	var graphics=pointsLayer.graphics;
    var html="";
    enterprise = document.getElementById("searchtext").value.replace(/(^\s*)|(\s*$)/g, "");
    if(isall==0){
    	html += "<h3>包含'"+enterprise+"'的";
    }else{
        html += "<h3>";
    }
    
    html += purview +"生产企业("+graphics.length+"个)</h3>";
    html+="<div id=\"overflow\"  style=\"height:100%;overflow-x:visible;overflow-y:hidden\" onMouseOver=\"overflowOver()\" onMouseOut=\"overflowOut()\">";
    html+="<table border=\"0\">";
    for(var i=0;i<graphics.length;i++){
    	var graphic=graphics[i].attributes;
        var manuf = decodeURI(graphic.manuf,'UTF-8'); 
        //var qydz = decodeURI(graphic.qydz,'UTF-8'); 
        var manufid = graphic.manufid; 
//	    var j=0;
//	    var a=qydz.indexOf("市");
//	    var b=qydz.indexOf("地区");
//	    var c=qydz.indexOf("州");
//	    var d=qydz.indexOf("区");
//	    var e=qydz.indexOf("县");
//	    if(e>-1){
//	    	j=e;
//	    }else if(d>-1){
//	    	j=d;
//	    }else if(c>-1){
//	    	j=c;
//	    }else if(b>-1){
//	    	j=b;
//	    }else if(a>-1){
//	    	j=a;
//	    }
//	    qydz=qydz.substr(0,j+1);
       
    	html += "<tr>";
    	var markerUrl = urlpath + "/res/images/baiduIMG/markers.png";  
    	html += "<td style=\"padding:5px 5px 5px 10px;\"><img title=\"点击定位\"  onClick=\"iconClick("+i+")\" style=\"widht:15px; height:15px;cursor:pointer;\" src=\"" + markerUrl + "\"></td>";
    	html += "<td style='text-align:left;padding:5px 15px;'><a title=\"点击进入详细信息页面\"  onClick=\"javascript:window.open('"+urlpath+"/datacenter/newcarlab/projectDetails.hz?enterId="+ manufid +"')\"  style='cursor:pointer;'>"+manuf+"<a/></td>";
    	
    	html+="</tr>";
    }
    html+="</table></div>";
    document.getElementById('vshow').innerHTML = html; 
}

/**鼠标移入*/
function orgLayerOver(event) {
	var graphic = event.graphic;
	map.setMapCursor("pointer");  
	var scrPt = map.toScreen(graphic.geometry);  
	var textDiv = dojo.doc.createElement("div");  
	dojo.attr(textDiv, {
		"id":"testOrgNameDiv"  
	});  
	dojo.style(textDiv, {  
		"left": scrPt.x + 10 + "px",  
		"top": scrPt.y + 10 + "px",  
		"position": "absolute",  
		"z-index": 99,  
		"background": "#FFFFF0",  
		"font-size": "10px",  
		"border": "1px solid #0096ff",  
		"padding": "0.1em 0.3em 0.1em",  
		"font-size": "11px",  
		"border-radius": "3px",  
		"box-shadow": "0 0 0.75em #777777"  
	});  
	var manuf = decodeURI(graphic.attributes.manuf,'UTF-8'); 
	textDiv.innerHTML = manuf;
	dojo.byId("mapDIV").appendChild(textDiv);
}

/**鼠标移出*/
function orgLayerOut(event) {
	if(dojo.byId("testOrgNameDiv")) {
		map.setMapCursor("default");
		dojo.byId("mapDIV").removeChild(dojo.byId("testOrgNameDiv"));
	}
}
function iconClick(index){
	var graphics=pointsLayer.graphics;
    var graphic=graphics[index];
    //map.centerAt(graphic.geometry);
    map.centerAndZoom(graphic.geometry, 12);
//    var evt = document.createEvent("MouseEvents");  
//    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);  
//    graphic.dispatchEvent(evt);  
    
}
 
//排序
function repolData(arr){
	var i = arr.length, j;
	var tempExchangVal;
	while (i > 0) {
	    for (j = 0; j < i - 1; j++) {
	        if (Number(arr[j][value]) < Number(arr[j + 1][value])) {
	            tempExchangVal = arr[j];
	            arr[j] = arr[j + 1];
	            arr[j + 1] = tempExchangVal;
	        }
	    }
	    i--;
	}
	 return arr;
}