/* canvas parems */
var canvas2 = document.getElementById('canvas2');
var context2 ;
var canvas=document.getElementById('canvas'),
    ctx=canvas.getContext('2d'),
    W=canvas.width,
    H=canvas.height,
    currPos={x:0,y:0},
    mouseStart={x:0,y:0},
    mouseEnd={x:0,y:0},
    drawing=false,
    activeShape=null,
    imgData=null,
    index=-1,
    env=getEnv(),
    shapes=[];
/**
 * 初始化*/
function canvasInit(_url){
    canvas.style.cursor='pointer';
    drawBG();
    if(canvas2!=null){
        context2 = canvas2.getContext("2d");
        var img = new Image();   // 创建一个<img>元素
        img.src = _url;
        img.setAttribute("crossOrigin", 'Anonymous');
        img.onload = function(){
            context2.drawImage(img,0,0,canvas2.width,canvas2.height);
        }
    }
}
/**
 * 各参数选项*/
function getEnv(){
    var lw=document.getElementById('size').value,
        strokeStyle=document.getElementById('strokeColor').value,
        sides=document.getElementById('sides').value,
        control=document.getElementById('control').checked,
        type='solid',
        elems=document.getElementsByName('type');
    for(var i=0,len=elems.length;i<len;i++){
        if(elems[i].checked){
            type=elems[i].id;break;
        }
    }
    return {
        lineWidth:lw,
        strokeStyle:strokeStyle,
        type:type,
        sides:sides,
        control:control
    };
}
/**
 * 格式化画布*/
function drawBG(){
    ctx.clearRect(0,0,W,H);
}
/**
 * 判断生成那种类型*/
function factory(type,pos){

    switch(type){
        case 'line': return new Line(pos);
        case 'dash': return new Dash(pos);
        case 'quadratic': return new Quadratic(pos);
        case 'bezier': return new Bezier(pos);
        case 'triangle': return new Triangle(pos);
        case 'rect': return new Rect(pos);
        case 'round': return new Round(pos);
        case 'polygon': return new Polygon(pos);
        case 'star': return new Star(pos);
        case 'ellipse': return new Ellipse(pos);
        case 'arrow': return new Arrow(pos);
        case 'text' : return new Text(pos);
        default:return new Line(pos);
    }
}
/**
 * 点击画布事件*/
document.getElementsByClassName('toolbar')[0].addEventListener('click',function(e){
    if(e.target.getAttribute('type')=='radio'){
        drawing=true;
    }
},false);
/**
 * 鼠标点击时触发事件*/
canvas.addEventListener('mousedown',function(e){
    mouseStart=WindowToCanvas(canvas,e.clientX,e.clientY);
    env=getEnv();
    activeShape=null;
    /*if(env.type == "text"){
        if($("#textInput").val() == ""){
            drawing=false;
            return ;
        }else{
            drawing=true;
        }
    }*/

    if(env.type == "text"){
        if(document.getElementById('textInput').value == ""){
            drawing=false;
            return ;
        }else{
            drawing=true;
        }
    }
    //新建图形
    if(drawing){
        activeShape = factory(env.type,mouseStart);
        activeShape.lineWidth = env.lineWidth;
        activeShape.strokeStyle = env.strokeStyle;
        activeShape.fillStyle = env.fillStyle;
        activeShape.isFill = env.isFill;
        activeShape.sides = env.sides;
        activeShape.stars = env.stars;
        shapes.push(activeShape);
        index=-1;
        drawGraph();
    } else {
        //选中控制点后拖拽修改图形
        for(var i=0,len=shapes.length;i<len;i++){
            if((index=shapes[i].isInPath(ctx,mouseStart))>-1){
                canvas.style.cursor='crosshair';
                activeShape=shapes[i];break;
            }
        }
    }
    // saveImageData();
    canvas.addEventListener('mousemove',mouseMove,false);
    canvas.addEventListener('mouseup',mouseUp,false);
},false);
/**
* 鼠标移动监听
* */
canvas.addEventListener('mousemove',function(e){
    currPos=WindowToCanvas(canvas,e.clientX,e.clientY);
    currPos.x=Math.round(currPos.x);
    currPos.y=Math.round(currPos.y);
    showInfo(currPos);
},false);
/**
 * 鼠标移动时出发*/
function mouseMove(e){
    mouseEnd=WindowToCanvas(canvas,e.clientX,e.clientY);
    if(activeShape){
        if(index>-1){
            activeShape.update(index,mouseEnd);
        } else {
            activeShape.initUpdate(mouseStart,mouseEnd);
        }
        drawBG();
        if(env.guid){drawGuidewires(mouseEnd.x,mouseEnd.y); }
        drawGraph();
    }
}
/**
 * 鼠标左键放开时触发*/
function mouseUp(e){
    canvas.style.cursor='pointer';
    if(activeShape){
        drawBG();
        drawGraph();
        resetDrawType();
    }
    canvas.removeEventListener('mousemove',mouseMove,false);
    canvas.removeEventListener('mouseup',mouseUp,false);
}
/**
 * 控制线*/
document.getElementById('control').onclick=function(e){
    drawBG();
    drawGraph();
}
/**
 * 线条粗细*/
document.getElementById('size').onchange=setValue;
/**
 * 清空*/
document.getElementById('clear').onclick=function(){
    shapes.length=0;
    drawBG();
    document.getElementById('codes').value='';
}
/**
 * 生成代码*/
document.getElementById('createCode').onclick=function(){
    var codes=[];
    codes.push('var canvas=document.getElementById(\'canvas\'),');
    codes.push('	ctx=canvas.getContext(\'2d\');');
    // codes.push('ctx.save();');
    shapes.forEach(s=>{
        codes.push(s.createCode());
    });
    // codes.push('ctx.restore();');
    document.getElementById('codes').value=codes.join('\n');
}
/**
 * 展示线条粗细*/
function setValue(){
    this.nextElementSibling.innerHTML = this.value;
}
/**
 * 展示坐标信息*/
function showInfo(pos){
    var elem=document.getElementById('pos');
    elem.children[0].innerHTML = pos.x;
    elem.children[1].innerHTML = pos.y;
}
/**
 * 触发收集到的对象方法*/
function drawGraph(){
    var showControl=getEnv().control;
    shapes.forEach(shape=>{
        shape.draw(ctx);
        if(showControl){
            shape.drawController(ctx);
        }
    });
}
/**
 * 渲染线条*/
function drawGuidewires(x,y){
    ctx.save();
    ctx.strokeStyle='rgba(0,0,230,0.4)';
    ctx.lineWidth=0.5;
    ctx.beginPath();
    ctx.moveTo(x+0.5,0);
    ctx.lineTo(x+0.5,ctx.canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,y+0.5);
    ctx.lineTo(ctx.canvas.width,y+0.5);
    ctx.stroke();
    ctx.restore();
}
/**
 * 格式化选项*/
function resetDrawType(){
    var elems=document.getElementsByName('type');
    for(var i=0,len=elems.length;i<len;i++){
        elems[i].checked=false;
    }
    drawing=false;
}
/**
 * 父类*/
class Graph{
    /*核心构造函数*/
    constructor(pos){
        this.x=pos.x;
        this.y=pos.y;
        this.points=[];
        this.sides=5;
        this.stars=5;
        this.lineWidth=1;
        this.strokeStyle='#f00';
        this.fillStyle='#f00';
        this.isFill=false;
    }
    /*修改坐标信息*/
    initUpdate(start,end){
        this.points[1]=end;
        this.x=(start.x+end.x)/2;
        this.y=(start.y+end.y)/2;
    }
    /*修改坐标*/
    update(i,pos){
        if(i==9999){
            var that=this,
                x1=pos.x-this.x,
                y1=pos.y-this.y;
            this.points.forEach((p,i)=>{
                that.points[i]={x:p.x+x1, y:p.y+y1 };
            });
            this.x=Math.round(pos.x);
            this.y=Math.round(pos.y);
        } else {
            this.points[i]=pos;
            var x=0,y=0;
            this.points.forEach(p=>{
                x+=p.x;
                y+=p.y;
            });
            this.x=Math.round(x/this.points.length);
            this.y=Math.round(y/this.points.length);
        }
    }
    /*创建开始坐标*/
    createPath(ctx){
        ctx.beginPath();
        this.points.forEach((p,i)=>{
            ctx[i==0?'moveTo':'lineTo'](p.x,p.y);
        });
        ctx.closePath();
    }
    /*判断点击位置是否存在于范围内*/
    isInPath(ctx,pos){
        for(var i=0,point,len=this.points.length;i<len;i++){
            point=this.points[i];
            ctx.beginPath();
            ctx.arc(point.x,point.y,5,0,Math.PI*2,false);
            if(ctx.isPointInPath(pos.x,pos.y)){
                if(i==0){
                    drawBG();
                    if(shapes.indexOf(this)>-1){
                        shapes.splice(shapes.indexOf(this),1)
                    }
                    this.points=[];
                    drawGraph();
                    return -1;
                }
                return i;
            }
        }
        this.createPath(ctx);
        if(ctx.isPointInPath(pos.x,pos.y)){
            return 9999;
        }
        return -1
    }
    /*渲染方法*/
    drawController(ctx){
        this.drawPoints(ctx);
        this.drawCenter(ctx);
        var startX=this.points[0].x;
        var startY=this.points[0].y;
        var img = new Image();   // 创建一个<img>元素
        img.onload = function(){
            ctx.drawImage(img, startX-7.5, startY-7.5,15, 15);
        }
        img.setAttribute("crossOrigin", 'Anonymous');
        img.src =path+'/static/image/removeBtn2.png'; // 设置图片源地址
        // img.src ='./static/image/removeBtn2.png'; // 设置图片源地址
        img.style.borderRadius='100px';
    }
    /*渲染各个点*/
    drawPoints(){
        ctx.save();
        ctx.lineWidth=2;
        ctx.strokeStyle='#999';
        this.points.forEach(p=>{
            ctx.beginPath();
            ctx.arc(p.x,p.y,5,0,Math.PI*2,false);
            ctx.stroke();
        });
        ctx.restore();
    }
    /*渲染中心点*/
    drawCenter(ctx){
        ctx.save();
        ctx.lineWidth=1;
        ctx.strokeStyle='hsla(60,100%,45%,1)';
        ctx.fillStyle='hsla(60,100%,50%,1)';
        ctx.beginPath();
        ctx.arc(this.x,this.y,5,0,Math.PI*2,false);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
    /*渲染边框*/
    draw(ctx){
        ctx.save();
        ctx.lineWidth=this.lineWidth;
        ctx.strokeStyle=this.strokeStyle;
        ctx.fillStyle=this.fillStyle;
        this.createPath(ctx);
        ctx.stroke();
        if(this.isFill){ ctx.fill(); }
        ctx.restore();
    }
    /*生成代码*/
    createCode(){
        var codes=['// '+this.name];
        codes.push('ctx.save();');
        codes.push('ctx.lineWidth='+this.lineWidth);
        codes.push('ctx.strokeStyle=\''+this.strokeStyle+'\';');
        if(this.isFill){
            codes.push('ctx.fillStyle=\''+this.fillStyle+'\';');
        }
        codes.push('ctx.beginPath();');
        codes.push('ctx.translate('+this.x+','+this.y+');')//translate到中心点，方便使用
        this.points.forEach((p,i)=>{
            if(i==0){
                codes.push('ctx.moveTo('+(p.x-this.x)+','+(p.y-this.y)+');');
                // codes.push('ctx.moveTo('+(p.x)+','+(p.y)+');');
            } else {
                codes.push('ctx.lineTo('+(p.x-this.x)+','+(p.y-this.y)+');');
                // codes.push('ctx.lineTo('+(p.x)+','+(p.y)+');');
            }
        });
        codes.push('ctx.closePath();');
        codes.push('ctx.stroke();');
        if(this.isFill){
            codes.push('ctx.fill();');
        }
        codes.push('ctx.restore();');
        return codes.join('\n');
    }
}
/**
 * 线条 */
class Line extends Graph{
    /*必带*/
    constructor(pos){
        super(pos);
        this.points=[pos,pos];
        this.name='直线'
    }
    /*中心点*/
    createPath(ctx){
        ctx.beginPath();
        ctx.arc(this.x,this.y,5,0,Math.PI*2,false);
        console.log("line createPath ")
    }
    /*渲染方法*/
    draw(ctx){
        console.log("line draw ")
        ctx.save();
        ctx.lineWidth=this.lineWidth;
        ctx.strokeStyle=this.strokeStyle;
        ctx.beginPath();
        this.points.forEach((p,i)=>{
            if(i==0){
                ctx.moveTo(p.x,p.y);
            } else {
                ctx.lineTo(p.x,p.y);
            }
        });
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
    createCode(){
        var codes=['// '+this.name];
        codes.push('ctx.lineWidth='+this.lineWidth);
        codes.push('ctx.strokeStyle=\''+this.strokeStyle+'\';');
        codes.push('ctx.beginPath();');
        this.points.forEach((p,i)=>{
            if(i==0){
                codes.push('ctx.moveTo('+p.x+','+p.y+');');
            } else {
                codes.push('ctx.lineTo('+p.x+','+p.y+');');
            }
        });
        codes.push('ctx.closePath();');
        codes.push('ctx.stroke();');
        return codes.join('\n');
    }
}
/**
 * 三角形
 */
class Triangle extends Graph{
    constructor(pos){
        super(pos);
        this.points=[pos,pos,pos];
        this.name='三角形';
    }
    initUpdate(start,end){
        var x1=Math.round(start.x),
            y1=Math.round(start.y),
            x2=Math.round(end.x),
            y2=Math.round(end.y);

        this.points[0]={x:x1,y:y1};
        this.points[1]={x:x1,y:y2};
        this.points[2]={x:x2,y:y2};
        this.x=Math.round((x1*2+x2)/3);
        this.y=Math.round((y2*2+y1)/3);
    }
}
/**
 * 矩形
 */
class Rect extends Graph{
    constructor(pos){
        super(pos);
        this.points=[pos,pos,pos,pos];
        this.name='矩形';
    }
    initUpdate(start,end){
        var x1=Math.round(start.x),
            y1=Math.round(start.y),
            x2=Math.round(end.x),
            y2=Math.round(end.y);
        this.points[0]={x:x1,y:y1};
        this.points[1]={x:x2,y:y1};
        this.points[2]={x:x2,y:y2};
        this.points[3]={x:x1,y:y2};
        this.x=Math.round((x1+x2)/2);
        this.y=Math.round((y1+y2)/2);
    }
}
/**
 * 圆形
 */
class Round extends Graph{
    constructor(pos){
        super(pos);
        this.points=[pos];
        this.radius=10;
        this.name='圆形';
    }
    update(i,pos){
        if(i==9999){
            var x1=pos.x-this.x,
                y1=pos.y-this.y;
            this.points[0].x+=x1;
            this.points[0].y+=y1;
            this.x=pos.x;
            this.y=pos.y;
        } else {
            this.points[0]=pos;
            this.radius=Math.round(Math.sqrt(Math.pow(pos.x-this.x,2)+Math.pow(pos.y-this.y,2)));
        }
    }
    initUpdate(start,end){
        this.points[0]=end;
        this.radius=Math.round(Math.sqrt(Math.pow(end.x-start.x,2)+Math.pow(end.y-start.y,2)));
    }
    createPath(ctx){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
    }
    createCode(){
        var codes=['// '+this.name];
        codes.push('ctx.lineWidth='+this.lineWidth);
        codes.push('ctx.strokeStyle=\''+this.strokeStyle+'\';');
        if(this.isFill){
            codes.push('ctx.fillStyle=\''+this.fillStyle+'\';');
        }
        codes.push('ctx.beginPath();');
        codes.push('ctx.arc('+this.x+','+this.y+','+this.radius+',0,Math.PI*2,false);');
        codes.push('ctx.stroke();');
        if(this.isFill){
            codes.push('ctx.fill();');
        }
        return codes.join('\n');
    }
}
/**
 * 椭圆
 */
class Ellipse extends Graph{
    constructor(pos){
        super(pos);
        this.points=[pos];
        this.angle=0;
        this.a=0;
        this.b=0;
        this.name='椭圆形';
    }
    rotateA(){
        var x1=this.a*Math.cos(Math.PI/2),
            y1=this.b*Math.sin(Math.PI/2),
            cos=Math.cos(this.angle),
            sin=Math.sin(this.angle),
            x2=x1*cos-y1*sin,
            y2=y1*cos-x1*sin;
        this.points[1]={x:this.x-x2,y:this.y-y2};
    }
    rotateB(){
        var x1=this.a*Math.cos(0),
            y1=this.b*Math.sin(0),
            cos=Math.cos(this.angle),
            sin=Math.sin(this.angle),
            x2=x1*cos-y1*sin,
            y2=y1*cos-x1*sin;
        this.points[0]={x:this.x+x2,y:this.y-y2};
    }
    initUpdate(start,end){
        this.points[0]=end;
        this.a=Math.round(Math.sqrt(Math.pow(this.points[0].x-start.x,2)+Math.pow(this.points[0].y-start.y,2)));
        this.b=this.a/2;
        this.angle = Math.atan2(this.points[0].y-this.y,this.points[0].x-this.x);
        this.rotateA();
    }
    update(i,pos){
        if(i==9999){
            var that=this,
                x1=pos.x-this.x,
                y1=pos.y-this.y;
            this.points.forEach((p,i)=>{
                that.points[i]={x:p.x+x1, y:p.y+y1 };
            });
            this.x=pos.x;
            this.y=pos.y;
        } else {
            this.points[i]=pos;
            if(i==0){
                this.a=Math.round(Math.sqrt(Math.pow(this.points[0].x-this.x,2)+Math.pow(this.points[0].y-this.y,2)));
                this.angle = Math.atan2(this.points[0].y-this.y,this.points[0].x-this.x);
                this.rotateA();
            } else if(i==1){
                this.b=Math.round(Math.sqrt(Math.pow(this.points[1].x-this.x,2)+Math.pow(this.points[1].y-this.y,2)));
                this.angle = Math.PI/2+Math.atan2(this.points[1].y-this.y,this.points[1].x-this.x);
                this.rotateB();
            }
        }
    }
    createPath(ctx){
        var k = .5522848,
            x=0, y=0,
            a=this.a, b=this.b,
            ox = a * k, // 水平控制点偏移量
            oy = b * k; // 垂直控制点偏移量
        ctx.beginPath();
        //从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
        ctx.moveTo(x - a, y);
        ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
        ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
        ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
        ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
        ctx.closePath();
    }
    isInPath(ctx,pos){
        super.isInPath(ctx,pos);
        for(var i=0,point,len=this.points.length;i<len;i++){
            point=this.points[i];
            ctx.beginPath();
            ctx.arc(point.x,point.y,5,0,Math.PI*2,false);
            if(ctx.isPointInPath(pos.x,pos.y)){
                return i;
            }
        }
        this.createPath(ctx);
        if(ctx.isPointInPath(pos.x-this.x,pos.y-this.y)){
            return 9999;
        }
        return -1
    }
    draw(){
        ctx.save();
        ctx.lineWidth=this.lineWidth;
        ctx.strokeStyle=this.strokeStyle;
        ctx.fillStyle=this.fillStyle;
        ctx.translate(this.x,this.y);
        ctx.rotate(this.angle);
        this.createPath(ctx);
        ctx.stroke();
        if(this.isFill){
            ctx.fill();
        }
        ctx.restore();
    }
    createCode(){
        var k = .5522848,
            x=0, y=0,
            a=this.a, b=this.b,
            ox = a * k,
            oy = b * k;
        var codes=['// '+this.name];
        codes.push('ctx.save();');
        codes.push('ctx.lineWidth='+this.lineWidth);
        codes.push('ctx.strokeStyle=\''+this.strokeStyle+'\';');
        if(this.isFill){
            codes.push('ctx.fillStyle=\''+this.fillStyle+'\';');
        }
        codes.push('ctx.translate('+this.x+','+this.y+');');
        codes.push('ctx.rotate('+this.angle+');');
        codes.push('ctx.beginPath();');
        codes.push('ctx.moveTo('+(x - a)+', '+y+');');
        codes.push('ctx.bezierCurveTo('+(x - a)+', '+(y - oy)+', '+(x - ox)+', '+(y - b)+', '+x+','+ (y - b)+');');
        codes.push('ctx.bezierCurveTo('+(x + ox)+', '+(y - b)+', '+(x + a)+', '+(y - oy)+', '+(x + a)+','+ y+');');
        codes.push('ctx.bezierCurveTo('+(x + a)+', '+(y + oy)+', '+(x + ox)+', '+(y + b)+', '+x+', '+(y + b)+');');
        codes.push('ctx.bezierCurveTo('+(x - ox)+', '+(y + b)+', '+(x - a)+', '+(y + oy)+', '+(x - a)+', '+y+');');
        codes.push('ctx.closePath();');
        codes.push('ctx.stroke();');
        if(this.isFill){
            codes.push('ctx.fill();');
        }
        codes.push('ctx.restore();');
        return codes.join('\n');
    }
}
/**
 * 多边形
 */
class Polygon extends Graph{
    constructor(pos){
        super(pos);
        this.points=[pos];
        this.cPoints=[];
    }
    get name(){
        return this.sides+'边形';
    }
    createPoints(start,end){
        var x1 = end.x - start.x,
            y1 = end.y - start.y,
            angle=0;
        this.points=[];
        for(var i=0;i<this.sides;i++){
            angle=2*Math.PI/this.sides*i;
            var sin=Math.sin(angle),
                cos=Math.cos(angle),
                newX = x1*cos - y1*sin,
                newY = y1*cos + x1*sin;
            this.points.push({
                x:Math.round(start.x + newX),
                y:Math.round(start.y + newY)
            });
        }
    }
    createControlPoint(start,end,len){
        var x1 = end.x - start.x,
            y1 = end.y - start.y,
            angle=Math.atan2(y1,x1),
            c=Math.round(Math.sqrt(x1*x1+y1*y1)),
            l=c+(!len?0:c/len),
            x2 =l * Math.cos(angle) + start.x,
            y2 =l * Math.sin(angle) + start.y;
        return {x:x2,y:y2};
    }
    initUpdate(start,end){
        this.createPoints(start,end);
        this.cPoints[0]=this.createControlPoint(start,end,3);
    }
    update(i,pos){
        if(i==10000){
            var point=this.createControlPoint({x:this.x,y:this.y},pos,-4);
            this.cPoints[0]=pos;
            this.createPoints({x:this.x,y:this.y},point);
        } else if(i==9999){
            var that=this,
                x1=pos.x-this.x,
                y1=pos.y-this.y;
            this.points.forEach((p,i)=>{
                that.points[i]={x:p.x+x1, y:p.y+y1 };
            });
            this.cPoints.forEach((p,i)=>{
                that.cPoints[i]={x:p.x+x1,y:p.y+y1};
            });
            this.x=Math.round(pos.x);
            this.y=Math.round(pos.y);
        } else {
            this.points[i]=pos;
            var x=0,y=0;
            this.points.forEach(p=>{
                x+=p.x;
                y+=p.y;
            });
            this.x=Math.round(x/this.points.length);
            this.y=Math.round(y/this.points.length);
        }
    }
    createCPath(ctx){
        this.cPoints.forEach(p=>{
            ctx.beginPath();
            ctx.arc(p.x,p.y,6,0,Math.PI*2,false);
        });
    }
    isInPath(ctx,pos){
        var index=super.isInPath(ctx,pos);
        if(index>-1) return index;
        this.createCPath(ctx);
        for(var i=0,len=this.cPoints.length;i<len;i++){
            var p=this.cPoints[i];
            ctx.beginPath();
            ctx.arc(p.x,p.y,6,0,Math.PI*2,false);
            if(ctx.isPointInPath(pos.x,pos.y)){
                return 10000+i;break;
            }
        }
        return -1
    }
    drawCPoints(ctx){
        ctx.save();
        ctx.lineWidth=1;
        ctx.strokeStyle='hsla(0,0%,50%,1)';
        ctx.fillStyle='hsla(0,100%,60%,1)';
        this.cPoints.forEach(p=>{
            ctx.beginPath();
            ctx.moveTo(this.x,this.y);
            ctx.lineTo(p.x,p.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(p.x,p.y,6,0,Math.PI*2,false);
            ctx.stroke();
            ctx.fill();
        });
        ctx.restore();
    }
    drawController(ctx){
        this.drawPoints(ctx);
        this.drawCPoints(ctx);
        this.drawCenter(ctx);
        var startX=this.points[0].x;
        var startY=this.points[0].y;
        var img = new Image();   // 创建一个<img>元素
        img.onload = function(){
            ctx.drawImage(img, startX-7.5, startY-7.5,15, 15);
        }
        img.setAttribute("crossOrigin", 'Anonymous');
        img.src =path+'/static/image/removeBtn2.png'; // 设置图片源地址
        img.style.borderRadius='100px';
    }
}
/**
 * 箭头
	*/
class Arrow extends Graph{
    constructor(pos){
        super(pos);
        this.points=[pos,pos];
        this.name='箭头'
    }
    /*中心点*/
    createPath(ctx){
        ctx.beginPath();
        ctx.arc(this.x,this.y,5,0,Math.PI*2,false);
    }
    /*渲染方法*/
    draw(ctx){
        var fromX;
        var fromY;
        var toX;
        var toY;
        var theta=30;
        var headlen=30;
        ctx.save();
        ctx.lineWidth=this.lineWidth;
        ctx.strokeStyle=this.strokeStyle;
        ctx.beginPath();
        this.points.forEach((p,i)=>{
            if(i==0){
                fromX=p.x
                fromY=p.y
            } else {
                toX=p.x
                toY=p.y
            }
        });
        var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
            angle1 = (angle + theta) * Math.PI / 180,
            angle2 = (angle - theta) * Math.PI / 180,
            topX = headlen * Math.cos(angle1),
            topY = headlen * Math.sin(angle1),
            botX = headlen * Math.cos(angle2),
            botY = headlen * Math.sin(angle2);

        var arrowX = fromX - topX,
            arrowY = fromY - topY;
        //起始点
        ctx.moveTo(fromX, fromY);
        //终点
        ctx.lineTo(toX, toY);

        //箭头x
        arrowX = toX + topX;
        //箭头y
        arrowY = toY + topY;
        //箭头起始坐标
        ctx.moveTo(arrowX, arrowY);
        //上箭头
        ctx.lineTo(toX, toY);
         arrowX = toX + botX;
         arrowY = toY + botY;
         //下箭头
        ctx.lineTo(arrowX, arrowY);

        //不封口
        // ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
    /*修改坐标信息*/
    initUpdate(start,end){
        this.points[1]=end;
        this.x=(start.x+end.x)/2;
        this.y=(start.y+end.y)/2;
    }
}
/**
 * 文字*/
class Text extends Graph{
    constructor(pos){
        super(pos);
        this.points=[pos,pos,pos,pos];
        this.cPoints=[];
        this.sides=4;
        this.type="text";
        this.textValue='';
    }
    get name(){
        this.sides=4;
        return this.sides+'边形';
    }
    createPoints(start,end){
        var x1=Math.round(start.x),
            y1=Math.round(start.y),
            x2=Math.round(end.x),
            y2=Math.round(end.y);
        this.points[0]={x:x1,y:y1};
        this.points[1]={x:x2,y:y1};
        this.points[2]={x:x2,y:y2};
        this.points[3]={x:x1,y:y2};
        this.x=Math.round((x1+x2)/2);
        this.y=Math.round((y1+y2)/2);
    }
    createControlPoint(start,end,len){
        var x1 = end.x - start.x,
            y1 = end.y - start.y,
            angle=Math.atan2(y1,x1),
            c=Math.round(Math.sqrt(x1*x1+y1*y1)),
            l=c+(!len?0:c/len),
            x2 =l * Math.cos(angle) + start.x,
            y2 =l * Math.sin(angle) + start.y;
        return {x:x2,y:y2};
    }
    initUpdate(start,end){
        if(this.textValue == ''){
            this.textValue=document.getElementById('textInput').value;
        }
        this.createPoints(start,end);
        this.cPoints[0]=this.createControlPoint(start,end,3);
    }
    update(i,pos){
        //判断是否是控制线
        if(i==10000){
            var point=this.createControlPoint({x:this.x,y:this.y},pos,-4);
            this.cPoints[0]=pos;
            this.createPoints(this.points[0],point);
        } else if(i==9999){//判断是否是圈定范围内
            if(this.textValue == ''){
                this.textValue=document.getElementById('textInput').value;
            }
            var that=this,
                x1=pos.x-this.x,
                y1=pos.y-this.y;
            this.points.forEach((p,i)=>{
                that.points[i]={x:p.x+x1, y:p.y+y1 };
            });
            this.cPoints.forEach((p,i)=>{
                that.cPoints[i]={x:p.x+x1,y:p.y+y1};
            });
            this.x=Math.round(pos.x);
            this.y=Math.round(pos.y);
        } else {//各角点
            this.points[i]=pos;
            var x=0,y=0;
            this.points.forEach(p=>{
                x+=p.x;
                y+=p.y;
            });
            this.x=Math.round(x/this.points.length);
            this.y=Math.round(y/this.points.length);
        }
    }
    createCPath(ctx){
        this.cPoints.forEach(p=>{
            ctx.beginPath();
            ctx.arc(p.x,p.y,6,0,Math.PI*2,false);
        });
    }
    isInPath(ctx,pos){
        var index=super.isInPath(ctx,pos);
        if(index == 9999){
            if(this.textValue == ''){
                this.textValue=document.getElementById('textInput').value;
            }else{
                if(this.textValue != document.getElementById('textInput').value){
                    this.textValue=document.getElementById('textInput').value;
                }
            }
        }
        if(index>-1)
            return index;
        this.createCPath(ctx);
        for(var i=0,len=this.cPoints.length;i<len;i++){
            var p=this.cPoints[i];
            ctx.beginPath();
            ctx.arc(p.x,p.y,6,0,Math.PI*2,false);
            if(ctx.isPointInPath(pos.x,pos.y)){
                return 10000+i;break;
            }
        }
        return -1
    }
    drawCPoints(ctx){
        ctx.save();
        ctx.lineWidth=1;
        ctx.strokeStyle='hsla(0,0%,50%,1)';
        ctx.fillStyle='hsla(0,100%,60%,1)';
        this.cPoints.forEach(p=>{
            ctx.beginPath();
            ctx.moveTo(this.x,this.y);
            ctx.lineTo(p.x,p.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(p.x,p.y,6,0,Math.PI*2,false);
            ctx.stroke();
            ctx.fill();
        });
    }
    drawController(ctx){
        if(this.textValue == ''){
            this.textValue=document.getElementById('textInput').value;
        }
        this.drawPoints(ctx);
        this.drawCPoints(ctx);
        this.drawCenter(ctx);
    }
    draw(ctx){
        ctx.save();
        ctx.lineWidth=this.lineWidth;
        ctx.strokeStyle=this.strokeStyle;
        ctx.beginPath();
        var startX;
        var startY;
        this.points.forEach((p,i)=>{
            if(i==0){
                ctx.moveTo(p.x,p.y);
                startX=p.x;
                startY=p.y;
                var img = new Image();   // 创建一个<img>元素
                img.onload = function(){
                    ctx.drawImage(img, startX-7.5, startY-7.5,15, 15);
                }
                img.setAttribute("crossOrigin", 'Anonymous');
                img.src =path+'/static/image/removeBtn2.png'; // 设置图片源地址
                img.style.borderRadius='100px';
            } else {
                ctx.lineTo(p.x,p.y);
            }
        });
        ctx.font = this.strokeStyle;
        var str=this.textValue;
        var L=0.0;
        for(var i in str){
            L+=(str.charCodeAt(i)>255)?1:0.5;
        }
        L=Math.ceil(L);
        var font_size=Math.floor(Math.sqrt((this.points[1].x-startX)/2 * (this.points[3].y-startY)/2 /L ));
        ctx.font = ""+font_size+"px Georgia";
        ctx.fillText(str , startX , startY-((startY-this.points[3].y)*0.6));

        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
}
/**
*下载方法
*/
var saveFile = function(data, filename){
    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    save_link.href = data;
    save_link.download = filename;

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);
}
/**
 * 绘制图源*/
function draws(_obj) {
    ctx.save();
    ctx.lineWidth=_obj.lineWidth;
    ctx.strokeStyle=_obj.strokeStyle;
    ctx.beginPath();
    /*$.each(_obj.points,function(i,p){
        if(i==0){
            ctx.moveTo(p.x,p.y);
        } else {
            ctx.lineTo(p.x,p.y);
        }
    });*/
    for(var i=0;i<_obj.points.length;i++){
        var p=_obj.points[i];
        if(i==0){
            ctx.moveTo(p.x,p.y);
        } else {
            ctx.lineTo(p.x,p.y);
        }
    }
    //判断是否存在文字信息
    if(_obj.textValue != null){
        ctx.font = _obj.strokeStyle;
        ctx.font = "25px Georgia";
        ctx.fillText(_obj.textValue, _obj.points[0].x, _obj.points[0].y-((_obj.points[0].y-_obj.points[_obj.points.length-1].y)/2) );
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}
$(function () {
    canvasInit(path+'/static/image/cancasImage.jpg');
    $("#downLoad").on("click",function () {
        var img = new Image();   // 创建一个<img>元素
        img.src = canvas.toDataURL();//获取第一个画布元素
        img.onload = function(){
            //再将第一个画布的元素渲染到第二个画布
            context2.drawImage(img,0, 0);
            //下载图片
            saveFile(canvas2.toDataURL("image/png"),'test.jpg');
        }
        img.style.borderRadius='100px';
    })
    $("#coordinateBtn").on("click",function () {
        $("#codes").empty();
        if(shapes.length>0){
            $("#codes").val(JSON.stringify(shapes));
        }
    });
    $("#createDraws").on("click",function () {
        var _obj={};
        _obj.lineWidth=3;
        _obj.strokeStyle="#232eff"
        _obj.textValue="这是一个测试用的信息！！";
        var pointsList=[
            {x:265,y:90},
            {x:380,y:155},
            {x:378,y:284},
            {x:264,y:349},
            {x:149,y:283},
            {x:151,y:154}
        ];
        _obj.points=pointsList;
        draws(_obj);
    });
});
/*document.getElementById('createDraws').onclick=function(){
        var _obj={};
        _obj.lineWidth=3;
        _obj.strokeStyle="#232eff"
        _obj.textValue="这是一个测试用的信息！！";
        var pointsList=[
            {x:265,y:90},
            {x:380,y:155},
            {x:378,y:284},
            {x:264,y:349},
            {x:149,y:283},
            {x:151,y:154}
        ];
        _obj.points=pointsList;
        draws(_obj);
    }
    document.getElementById('coordinateBtn').onclick=function(){
        document.getElementById('codes').value=JSON.stringify(shapes)
        /!*$("#codes").empty();
        if(shapes.length>0){
            this.value=JSON.stringify(shapes)
        }*!/
    }
    document.getElementById('downLoad').onclick=function(){
        var img = new Image();   // 创建一个<img>元素
        img.src = canvas.toDataURL();//获取第一个画布元素
        img.onload = function(){
            //再将第一个画布的元素渲染到第二个画布
            context2.drawImage(img,0, 0);
            //下载图片
            saveFile(canvas2.toDataURL("image/png"),'test.jpg');
        }
        img.style.borderRadius='100px';
    }*/
/**
 * 文字
 * */
/*class Text extends Graph{
    constructor(pos){
        super(pos);
        this.points=[pos,pos,pos,pos];
        this.name='文字';
    }
    initUpdate(start,end){
        var x1=Math.round(start.x),
            y1=Math.round(start.y),
            x2=Math.round(end.x),
            y2=Math.round(end.y);
        this.points[0]={x:x1,y:y1};
        this.points[1]={x:x2,y:y1};
        this.points[2]={x:x2,y:y2};
        this.points[3]={x:x1,y:y2};
        this.x=Math.round((x1+x2)/2);
        this.y=Math.round((y1+y2)/2);
    }
    /!*判断点击位置是否存在于范围内*!/
    isInPath(ctx,pos){
        var index=super.isInPath(ctx,pos);
/!*
        if(index==0){
            drawBG();
            if(shapes.indexOf(this)>-1){
                shapes.splice(shapes.indexOf(this),1)
            }
            this.points=[];
            drawGraph();
            return -1;
        }*!/
        if(index>-1)
            return index;

        this.createPath(ctx);
        if(ctx.isPointInPath(pos.x,pos.y)){
            console.log("圈定范围内，x:"+pos.x+"  y:"+pos.y);
            return 9999;
        }
        return -1
    }
    /!*渲染*!/
    draw(ctx){
        console.log("text draw ")
        ctx.save();
        ctx.lineWidth=this.lineWidth;
        ctx.strokeStyle=this.strokeStyle;
        ctx.beginPath();
        var startX;
        var startY;
        this.points.forEach((p,i)=>{
            if(i==0){
                ctx.moveTo(p.x,p.y);
                startX=p.x;
                startY=p.y;
                /!*var img = new Image();   // 创建一个<img>元素
                img.onload = function(){
                    ctx.drawImage(img, startX-10, startY-10,20, 20);
                }
                img.setAttribute("crossOrigin", 'Anonymous');
                img.src =path+'/static/image/removeBtn.jpg'; // 设置图片源地址
                img.style.borderRadius='100px';*!/
            } else {
                ctx.lineTo(p.x,p.y);
            }
        });
        ctx.font = this.strokeStyle;
        ctx.font = ""+((this.points[1].x-startX)/10)+"px Georgia";
        // ctx.fillText($("#textInput").val(), startX, startY-((startY-this.points[3].y)/2) );

        ctx.fillText(document.getElementById('textInput').value, startX, startY-((startY-this.points[3].y)/2) );

        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
    /!*渲染控制方法*!/
    /!*drawController(ctx){
        this.drawPoints(ctx);
        this.drawCenter(ctx);
        /!*var startX=this.points[0].x;
        var startY=this.points[0].y;
        var img = new Image();   // 创建一个<img>元素
        img.onload = function(){
            ctx.drawImage(img, startX-7.5, startY-7.5,15, 15);
        }
        img.setAttribute("crossOrigin", 'Anonymous');
        img.src =path+'/static/image/removeBtn2.png'; // 设置图片源地址
        img.style.borderRadius='100px';*!/
    }*!/
}*/