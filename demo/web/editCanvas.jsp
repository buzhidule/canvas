<!DOCTYPE HTML>
<html lang="zh" xmlns:th="http://www.thymeleaf.org" xmlns:shiro="http://www.pollix.at/thymeleaf/shiro">
<meta charset="utf-8">

<head>
<title>可编辑画布Demo</title>
<script src="http://libs.baidu.com/jquery/2.1.4/jquery.min.js"></script>
<style type="text/css">
	#canvasp {
		position: absolute;
		top: 136px;
		left: 8px;
	}
	@font-face {
	    font-family: SYSTC;
	    /* src: url(./SYSTC.woff) format('woff'); */
	    font-style: normal;
	    font-weight: normal;
	    margin-top: 100px;
	}
	.SYSTC {
	    font-family: SYSTC;
	}
</style>

</head>

<body class="toolbar">
	<div>
		X: <span id="X"> 0</span> Y: <span id="Y"> 0</span>
		<br />
		单次收集的数据：<span id="points"></span>
		<br />
		所有收集的数据：<span id="pointsList"></span>
		<br />
		删除按钮的数据：<span id="clearList"></span>
		获取图片：<input onclick="getImageVal()" type="button" value="截取" />
	</div>
    <br />
    <br />
    <div id="canvasp">
		<canvas id="tutorial" width="1000px" height="800px" style="border:1px solid #000000;"></canvas>
	</div>
    <canvas id="tutorial2" width="1000px" height="800px" style="border:1px solid #000000;"></canvas> 
	
	<canvas id="tutorial3" width="1000px" height="800px" style="border:1px solid #000000;"></canvas> 
	
<script>
	var booleans=false;
	var canvas = document.getElementById('tutorial');
	var context = canvas.getContext("2d");
	
	var canvas2 = document.getElementById('tutorial2');
	var context2 ;
	
	var canvas3 = document.getElementById('tutorial3');
	var context3 ;
	
	var REDCOLOR = "red"
	
	var reconizeAreas=new Array();// 所有识别区域
	var reconizePoints=new Array();// 每次识别区域的所有点
	var clearBtn=new Array();
	
	var currPos={x:0,y:0};
	var endPos={x:0,y:0};
	var DOTRADIUS = 3;
	var index=null;
	var index2=null;
	var clearIndex=null;
	var isNew=true;
	
	
	
	$(function(){
        if(!canvas.getContext) {
			return;
		}
        
        if(canvas2!=null){
        	context2 = canvas2.getContext("2d");
        	var img = new Image();   // 创建一个<img>元素
            //img.src = 'http://192.168.20.124:6900/image?aW1hZ2UvMjAxOTA1LzA5LzE5Mi4xNjguMjAuMTI0Ly8xOTIuMTY4LjIwLjEyNF8xXzEwXzBfYmlnLmltZy8yNDU3NjI2NV8xOTQwNzg'; // 设置图片源地址
            img.src = './static/image/cancasImage.jpg';
            img.setAttribute("crossOrigin", 'Anonymous');
            img.onload = function(){
            	context2.drawImage(img,0,0);
                
             }
        }
        
        
    	document.getElementsByClassName('toolbar')[0].addEventListener('click',function(e){
				booleans=true;
				//isNew=true;
    	},false);
    	
    	//单击事件
    	canvas.addEventListener('mousedown',function(e){
			mouseStart=WindowToCanvas(canvas,e.clientX,e.clientY);
			var pos={x:0,y:0};
			pos.x=Math.round(mouseStart.x);
			pos.y=Math.round(mouseStart.y);
			booleans=true;
			isNew=true;
			if(isInPath(pos)){
				reconizePoints.push(pos);
				createLine(pos);
			}else{
				isNew=false;
				if(clearIndex!=null){
					reconizeAreas.splice(clearIndex,1);
					clearBtn.splice(clearIndex,1);
					createLine(pos);
					addBtn();
					clearIndex=null;
					//isNew=true;
				}
			}
			showSpan();
			
		},false);
    	
    	//鼠标移动事件
		canvas.addEventListener('mousemove',function(e){
			currPos=WindowToCanvas(canvas,e.clientX,e.clientY);
			
			var pos={x:0,y:0};
			pos.x=Math.round(currPos.x);
			pos.y=Math.round(currPos.y);
			
			showInfo(pos);
			if(booleans && isNew){
				createLine(pos);
			}else if(index != null && index2 != null){
				reconizeAreas[index][index2]=pos;
				createLine(pos);
			}
			
			showSpan();
		},false);
		
		//双击事件
		canvas.addEventListener("dblclick", e => {
			mouseStart=WindowToCanvas(canvas,e.clientX,e.clientY);
			var pos={x:0,y:0};
			pos.x=Math.round(mouseStart.x);
			pos.y=Math.round(mouseStart.y);
			clearBtn=[];
			if(reconizePoints.length > 0){
				reconizeAreas.push(reconizePoints);
			}
			addClearBtu(reconizeAreas);
			showSpan();
			addBtn();
			
			
			booleans=false;
			isNew=true;
			index=null;
			index2=null;
			reconizePoints=[];
			endPos={x:0,y:0};
		});
	});
	function getImageVal(){
		//var canvas1 = document.getElementById("canvas1Id");
		//var canvas2 = document.getElementById("canvas2Id");
		//canvas2.getContext("2d").drawImage(canvas,0,0);
		
		
		
		//var ImageData = context2.getImageData(0,0,1000,800);
		//let img = document.createElement('img');
		//img.src = ImageData;
		//document.body.appendChild(img);
	
		if(context3==null){
			context3 = canvas3.getContext("2d");
		}
		
		var img = new Image();   // 创建一个<img>元素
            img.src = canvas2.toDataURL();
            //img.setAttribute("crossOrigin", 'Anonymous');
            img.onload = function(){
            	context3.drawImage(img,0,0);
                context3.putImageData(imagedata, dx, dy);
             }
	
	}
	//添加删除按钮
	function addBtn(){
		for(let i = 0; i < clearBtn.length;i++){
			context.beginPath()
	    	context.lineWidth=1;
	    	context.globalAlpha = 0.2;
	    	context.fillStyle='#ffffff';
	    	context.arc(clearBtn[i].x, clearBtn[i].y, 10, 0, Math.PI*2, false);
		    context.fill();
			var img = new Image();   // 创建一个<img>元素
	        img.onload = function(){ 
	        	context.globalAlpha = 1;
	        	context.drawImage(img, clearBtn[i].x-10, clearBtn[i].y-10,20, 20);
	        	//context.roundRect(clearBtn[i].x-10, clearBtn[i].y-10,20, 20, 20);
	        }
			img.setAttribute("crossOrigin", 'Anonymous');
	        img.src = './static/image/removeBtn.jpg'; // 设置图片源地址
	        img.style.borderRadius='100px';
		}
	}
	
	//收集删除按钮位置
	function addClearBtu(_array){
		for(let i = 0; i < _array.length;i++){
			var y=_array[i][0].y-20;
			clearBtn.push({x:_array[i][0].x,y:y});
		}
	}
	//显示坐标
	function showSpan(){
		//显示坐标
		var vals=[];
		for (let i = 0; i < reconizePoints.length;i++ ) {
			var val = JSON.stringify(reconizePoints[i]);
			vals.push(val);
    	}
		$("#points").html(vals.join(','));
		
		var valsList=[];
		for (let i = 0; i < reconizeAreas.length;i++ ) {
			var point = reconizeAreas[i];
			valsList.push("[");
			for(let j = 0; j < point.length;j++){
				var val = JSON.stringify(point[j]);
				valsList.push(val);
			}
			valsList.push("]");
			
    	}
		$("#pointsList").html(valsList.join(' '));
		
		var vals2=[];
		for (let i = 0; i < clearBtn.length;i++ ) {
			var val = JSON.stringify(clearBtn[i]);
			vals2.push(val);
    	}
		$("#clearList").html(vals2.join(' '));
	}
	
	//描述所有线
	function create(_array){
		var length = _array.length;
	    if(length>0){
	    	drawDot(_array[0],0)
	    	for (let i = 1; i < length;i++ ) {
	    		drawLine(_array[i-1], _array[i]);
	    		drawDot(_array[i],i);
	    	} 
			drawLine(_array[length-1], _array[0])
	    }
	}
	//描绘线条
	function initFill(_array){
		
		context.beginPath()
    	context.strokeStyle = "red"
   		context.fillStyle='#96d8ad';
    	context.globalAlpha = 0.4;
		for(var i=0;i<_array.length;i++){
			if(i==0){
				context.moveTo(_array[i].x, _array[i].y);
			}else{
				context.lineTo(_array[i].x, _array[i].y);
			}
		}
		context.stroke();
		context.fill();
    	//context.closePath();
    	context.restore();
		
	}
	
	//描绘方法
	function createLine(pos){
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		//新的点
		if(reconizePoints.length>0){
			var tempPt = [].concat(reconizePoints)
	        tempPt.push(pos)
			create(tempPt);
			initFill(tempPt);
		}
		//所有的点
		if(reconizeAreas.length>0){
	    	for ( var i = 0; i < reconizeAreas.length; i++) {
	    		var a=reconizeAreas[i]
	    		create(a)
	    		initFill(a);
	    	}
	    }
	}
	
	//生成点
	function drawDot(loc,index) {
	    context.beginPath()
    	context.lineWidth=1;
	    if(index==0){
	    	context.strokeStyle = "#000"
    		context.fillStyle='#000000';
	    	context.globalAlpha = 1;
	    	context.arc(loc.x, loc.y, 5, 0, Math.PI*2, false);
	    }else{
	    	context.globalAlpha = 1;
	    	context.fillStyle='#ffffff';
	    	context.arc(loc.x, loc.y, 5, 0, Math.PI*2, false);
	    }
	    context.fill();
	}
	//生成线
	function drawLine(locStart, locEnd) {
	    context.beginPath()
	    context.moveTo(locStart.x, locStart.y);
	    context.lineTo(locEnd.x, locEnd.y);
    	context.strokeStyle = REDCOLOR
	    context.stroke();
    	//context.closePath();
    	context.restore();
	}
	//显示XY坐标
	function showInfo(pos){
		$("#X").html(pos.x);
		$("#Y").html(pos.y);
	}
	//获取鼠标坐标
	function WindowToCanvas(t, n, e) {
		var o = t.getBoundingClientRect();
		return {
			x: n - o.left * (t.width / o.width),
			y: e - o.top * (t.height / o.height)
		}
	}
	//判断是否存在
	function isInPath(pos){
		var b=true;
		for(var i=0;i<reconizePoints.length;i++){
			
			var point=reconizePoints[i];
			context.beginPath();
			context.arc(point.x,point.y,5,0,Math.PI*2,false);
			
			if(context.isPointInPath(pos.x,pos.y)){
				b=false;
				index=i;
				return b;
			}
		}
		for(var i=0;i<reconizeAreas.length;i++){
			var points=reconizeAreas[i];
			for(var j=0;j<points.length;j++){
				var point=points[j];
				context.beginPath();
				context.arc(point.x,point.y,5,0,Math.PI*2,false);
				if(context.isPointInPath(pos.x,pos.y)){
					b=false;
					index=i;
					index2=j;
					return b;
				}
			}
		}
		
		for(let i = 0; i < clearBtn.length;i++){
			//context.beginPath();
	    	context.arc(clearBtn[i].x, clearBtn[i].y, 10, 0, Math.PI*2, false);
	        if(context.isPointInPath(pos.x,pos.y)){
				b=false;
				clearIndex=i;
				return b;
			}
		}
		
		return b;
	}
	
</script>
</body>
</html>