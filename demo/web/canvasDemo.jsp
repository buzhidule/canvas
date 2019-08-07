<%--
  Created by IntelliJ IDEA.
  User: mpz
  Date: 2019/8/5
  Time: 10:17
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    String path=request.getContextPath();
%>
<html>
<head>
    <title>canvas画板</title>
    <link rel="icon" href="static/image/remove2.jpg" type="image/x-icon">
    <script src="http://libs.baidu.com/jquery/2.1.4/jquery.min.js"></script>
    <link rel="stylesheet" href="static/css/pure-min.css">
    <link rel="stylesheet" href="static/css/fontello.css">
    <link rel="stylesheet" href="static/css/style.css">
    <script type="text/javascript" >
        var path='<%=path%>'
    </script>
    <style type="text/css">
        .grid {
            max-width: 100%;
            max-height: 100%;
        }

        .toolbar {
            /* padding: 10px; */
            color: #555;
            font-size: 14px;
            display: flex;
            flex-flow: row nowrap;
            min-width: 1000px;
        }

        .block {
            padding: 4px;
            height: 90px;
            display: flex;
            border: 1px solid #ddd;
            border-width: 1px 0 1px 1px;
            flex-flow: column wrap;
            justify-content: space-around;
        }

        .style-block {
            width: 240px;
        }

        .style-block span {
            padding-left: 10px;
        }

        .Polygon-block {
            width: 240px;
        }

        .Polygon-block input[type=number] {
            /* margin-top: 4px; */
            width: 40px;
            padding: 2px 4px;
            border: 1px solid #ddd;
            border-radius: 4px;
            outline: none;
        }

        .info-block {
            width: 120px;
            border: 1px solid #ddd;
        }

        .info {
            line-height: 2;
            padding-left: 10px;
        }

        .info span {
            font-size: 12px;
            color: #e00;
        }

        .wrap {
            position: relative;
            width: 80px;
            height: 30px;
            text-align: center;
            overflow: hidden;
        }

        .wrap .label {
            padding: 4px;
            border-radius: 5px;
        }

        .wrap [type=radio] {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99;
            opacity: 0;
            cursor: pointer;
        }

        .wrap [type=radio]:checked ~.label {
            background: hsl(200, 100%, 40%);
            color: hsl(0, 0%, 100%)
        }

        .desc {
            line-height: 2;
            color: hsl(0, 0%, 80%)
        }

        label {
            display: block;
            padding: 1px;
        }

        button {
            margin-left: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fff;
            padding: 3px 20px;
            cursor: pointer;
            outline: none;
        }

        button:hover {
            background: #eee;
        }

        canvas {
            float: left;
        }

        .codes {
            width: 400px;
        }
        #canvas {
            position: absolute;
            /*top: 163px;*/
            left: 1px;
        }
    </style>
    <!--[if lt IE 9]>
    <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
</head>
<body>
<div class="content">
    <div class="main grid">
        <div class="toolbar">
            <div class="block">
                <div class="wrap desc">直线</div>
                <div class="wrap">
                    <input type="radio" name="type" id="line" >
                    <div class="label">实线</div>
                </div>
            </div>
            <div class="block Polygon-block">
                <div class="wrap">
                    <input type="radio" name="type" id="triangle" >
                    <div class="label">三角形</div>
                </div>
                <div class="wrap">
                    <input type="radio" name="type" id="rect" >
                    <div class="label">矩形</div>
                </div>
                <div class="wrap">
                    <input type="radio" name="type" id="round" >
                    <div class="label">圆形</div>
                </div>
                <div class="wrap">
                    <input type="radio" name="type" id="polygon" >
                    <div class="label">多边形</div>
                </div>
                <div class="wrap">
                    <input type="radio" name="type" id="ellipse" >
                    <div class="label">椭圆</div>
                </div>
                <div class="wrap">
                    <input type="radio" name="type" id="arrow"  >
                    <div class="label">箭头</div>
                </div>
                <div class="wrap">
                    <input type="number" id="sides" step="1" min="3" max="20"
                           value="5">
                </div>
                <%--<div class="wrap">
                    <input type="radio" name="type" id="coordinate">
                    <div class="label">所有坐标</div>
                </div>--%>
                <div class="wrap">
                    <input type="radio" name="type" id="text">
                    <div class="label">文字</div>
                </div>
            </div>
            <div class="block style-block">
                <label for="size">线条粗细 <input type="range" name="size"
                                              id="size" step="0.5" min="0.5" max="10" value="1"><span>1</span></label>
                <label for="strokeColor">描边颜色 <input type="color"
                                                     name="strokeColor" value="#ff0000" id="strokeColor"><span>#ff0000</span></label>
                <label for="strokeColor">
                    <input type="text" id="textInput" name="textInput" style="width: 200px;">
                </label>
            </div>
            <div class="block">
                <div class="wrap">
                    <label for="control"><input type="checkbox" name="control"
                                                id="control" checked> 控制线</label>
                </div>
            </div>
            <div class="block" style="width: 225px;">
                <button id="clear">清 空</button>
                <button id='createCode'>生成代码</button>
                <button id='downLoad'>下载</button>
                <button id='coordinateBtn'>所有坐标</button>
                <button id='createDraws'>渲染图片</button>
            </div>
            <div class="block info-block">
                <div class="info" id="pos">
                    X: <span> 0</span> Y: <span> 0</span>
                </div>
            </div>
        </div>

        <canvas id='canvas' width="1000" height="600"></canvas>
        <canvas id="canvas2" width="1000" height="600" style="border:1px solid #000000;"></canvas>
        <textarea name="codes" class="codes" id="codes" cols="60" rows="40"></textarea>
    </div>
    <input type="hidden" id="x" name="x">
    <input type="hidden" id="y" name="y">
</div>
<script src="static/js/canvas.min.js"></script>
<script src="static/js/common.js"></script>
</body>
</html>
