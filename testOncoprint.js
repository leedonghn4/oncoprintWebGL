    var gl;
    var rowNum = 200;
    var marginX = 5.0;
    var marginY = 5.0;
    var recWidth = 7.0;
    var recHeight = 20.0
    var squareHeigth = 7.0;
    var depth = 0.01;
    var mouseshiftX = 100;
    var mouseshiftY = 50;
    var Xindex;
    var Yindex;
    var frameLeft;
    var frameRight;
    var frameLow;
    var frameHigh;
    var showmutation=false;
    var zoomValue = 1.0;
    var originWidth;
    var originHeight;
    var originRecWidth;
    var originMarginX;
        
    function initGL(canvas) 
    {
        try 
		{
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }


    function getShader(gl, id) 
	{
        var shaderScript = document.getElementById(id);
        if (!shaderScript) 
		{
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) 
		{
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var shaderProgram;
	var shaderProgram1;
	var shaderProgram2;

    function initShaders() 
	{
	    //shader 0
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) 
		{
            alert("Could not initialise shaders");
        }

        //gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
		
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		
		//shader 1
		var fragmentShader1 = getShader(gl, "shader-fs1");
		var vertexShader1 = getShader(gl, "shader-vs1");

		shaderProgram1 = gl.createProgram();
		gl.attachShader(shaderProgram1, vertexShader1);
		gl.attachShader(shaderProgram1, fragmentShader1);
		gl.linkProgram(shaderProgram1);
		
		if (!gl.getProgramParameter(shaderProgram1, gl.LINK_STATUS)) 
		{
			alert("Could not initialise shaders1");
		}

		shaderProgram1.vertexPositionAttribute = gl.getAttribLocation(shaderProgram1, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram1.vertexPositionAttribute);
		shaderProgram1.vertexColorAttribute = gl.getAttribLocation(shaderProgram1, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram1.vertexColorAttribute);

		shaderProgram1.pMatrixLoc = gl.getUniformLocation(shaderProgram1, "uPMatrix");
        shaderProgram1.mvMatrixLoc = gl.getUniformLocation(shaderProgram1, "uMVMatrix");	

		//shader 2
		var fragmentShader2 = getShader(gl, "shader-fs2");
        var vertexShader2 = getShader(gl, "shader-vs2");

        shaderProgram2 = gl.createProgram();
        gl.attachShader(shaderProgram2, vertexShader2);
        gl.attachShader(shaderProgram2, fragmentShader2);
        gl.linkProgram(shaderProgram2);

        if (!gl.getProgramParameter(shaderProgram2, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        shaderProgram2.vertexPositionAttribute = gl.getAttribLocation(shaderProgram2, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram2.vertexPositionAttribute);
        shaderProgram2.textureCoordAttribute = gl.getAttribLocation(shaderProgram2, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram2.textureCoordAttribute);

        shaderProgram2.pMatrixUniform = gl.getUniformLocation(shaderProgram2, "uPMatrix");
        shaderProgram2.mvMatrixUniform = gl.getUniformLocation(shaderProgram2, "uMVMatrix");
        shaderProgram2.samplerUniform = gl.getUniformLocation(shaderProgram2, "uSampler");
		
    }


    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();
	var mvMatrixStack = [];

    function setMatrixUniforms() 
	{
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    }

    function setMatrixUniforms1() 
	{
        gl.uniformMatrix4fv(shaderProgram1.pMatrixLoc, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram1.mvMatrixLoc, false, mvMatrix);
    }
	
    function setMatrixUniforms2() 
	{
        gl.uniformMatrix4fv(shaderProgram2.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram2.mvMatrixUniform, false, mvMatrix);
    }

	function mvPushMatrix() 
	{
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() 
	{
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }
	
    var triangleVertexPositionBuffer;
    var rectangleVertexPositionBuffer;
	var triangleVertexColorBuffer;
    var rectangleVertexColorBuffer;
    var squareVertexPositionBuffer;
	var squareVertexColorBuffer;
    var lineVertexPositionBuffer;
	var lineVertexColorBuffer;

    function initBuffers(Xindex, Yindex) 
	{
		//triangle 
        triangleVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        var vertices = [
            100.0,  50.1, 0.0001,
            100.0, 153.0, 0.0001,
            150.0, 150.0, 0.0001
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        triangleVertexPositionBuffer.itemSize = 3;
        triangleVertexPositionBuffer.numItems = 3;

		triangleVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
        var colors = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        triangleVertexColorBuffer.itemSize = 4;
        triangleVertexColorBuffer.numItems = 3;
				
		//rectangle vertex and color
		var scalepercentage = 0.185; //scale percentage
        rectangleVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, rectangleVertexPositionBuffer);

        var colNum = 48;
        var vertices = [];
        vertices1 = [
             10.0, 23.0, 0.01,
              3.0, 23.0, 0.01,
             10.0, 3.0, 0.01,
              3.0, 3.0, 0.01
        ];
         	
    	for(var j = 0; j < colNum; j++)
        {
        	var low  = (marginY+recHeight)*j + marginY;
        	var high = (marginY+recHeight)*j + marginY + recHeight;      
        	 
        	for(var i = 0;i<rowNum; i++)
        	{
        		var left  = (marginX+recWidth)*i + marginX;
        		var right = (marginX+recWidth)*i + recWidth + marginX
        	

        	
        		vertices.push(right, high, depth);
        		vertices.push(left,  high, depth);
        		vertices.push(right,  low, depth);
        	
        		vertices.push(left, high, depth);
        		vertices.push(right, low, depth);
        		vertices.push(left,  low, depth);
        	}
        }
        
        if(Xindex !== undefined)
        {
        	for(var i = 0; i < colNum; i++)
        	{
            	var left  = (marginX+recWidth)*Xindex + marginX - scalepercentage*recWidth;
        		var right = (marginX+recWidth)*Xindex + recWidth + marginX + scalepercentage*recWidth;
        		var low   = (marginY+recHeight)*i + marginY - scalepercentage*recWidth;
         		var high  = (marginY+recHeight)*i + marginY + recHeight + scalepercentage*recWidth;        	
        	
        		vertices[(Xindex+i*rowNum)* 6 * 3]     = right; vertices[(Xindex+j*rowNum)* 6 * 3 + 1] = high;
      		  	vertices[(Xindex+i*rowNum)* 6 * 3 + 3] = left;  vertices[(Xindex+j*rowNum)* 6 * 3 + 4] = high;
        		vertices[(Xindex+i*rowNum)* 6 * 3 + 6] = right; vertices[(Xindex+j*rowNum)* 6 * 3 + 7] = low;
        	
        		vertices[(Xindex+i*rowNum)* 6 * 3 + 9] = left;  vertices[(Xindex+j*rowNum)* 6 * 3 + 10] = high;
        		vertices[(Xindex+i*rowNum)* 6 * 3 + 12] = right;vertices[(Xindex+j*rowNum)* 6 * 3 + 13] = low;
        		vertices[(Xindex+i*rowNum)* 6 * 3 + 15] = left; vertices[(Xindex+j*rowNum)* 6 * 3 + 16] = low; 
        	}
        	
        	// line vertex and color
        	frameLeft  = (marginX+recWidth)*Xindex + marginX - scalepercentage*recWidth;
        	frameRight = (marginX+recWidth)*Xindex + recWidth + marginX + scalepercentage*recWidth;
        	frameLow   = (marginY+recHeight)*Yindex + marginY - scalepercentage*recWidth;
         	frameHigh  = (marginY+recHeight)*Yindex + marginY + recHeight + scalepercentage*recWidth; 
        }
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        rectangleVertexPositionBuffer.itemSize = 3;
        rectangleVertexPositionBuffer.numItems = 6 * rowNum * colNum;
		
        rectangleVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, rectangleVertexColorBuffer);
        var colors = [];
        for(var i = 0;i<rowNum; i++)
        {
        	for(var j = 0; j < colNum; j++)
        	{
        		colors.push(0.9, 0.9, 0.9, 1.0);
        		colors.push(0.9, 0.9, 0.9, 1.0);
        		colors.push(0.9, 0.9, 0.9, 1.0);
        	
        		colors.push(0.9, 0.9, 0.9, 1.0);
        		colors.push(0.9, 0.9, 0.9, 1.0);
        		colors.push(0.9, 0.9, 0.9, 1.0);
        	}
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        rectangleVertexColorBuffer.itemSize = 4;
        rectangleVertexColorBuffer.numItems = 6 * rowNum  * colNum;
        
        
        
        
        //square vertex and color
        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);

        var colNum = 45;
        var vertices = [];
        var marginRecSquare= 6.0//where heigh the square should be on rectangl 
         	
    	for(var j = 0; j < colNum; j++)
        {
        	var differeceRecSquare = recHeight - squareHeigth;
        	var low  = (marginY+squareHeigth + differeceRecSquare)*j + marginY + marginRecSquare;
        	var high = (marginY+squareHeigth + differeceRecSquare)*j + marginY + squareHeigth + marginRecSquare;      
        	 
        	for(var i = 0;i<rowNum; i++)
        	{
        		var left  = (marginX+recWidth)*i + marginX;
        		var right = (marginX+recWidth)*i + recWidth + marginX
        	

        	
        		vertices.push(right, high, depth+0.000001);
        		vertices.push(left,  high, depth+0.000001);
        		vertices.push(right,  low, depth+0.000001);
        	
        		vertices.push(left, high, depth+0.000001);
        		vertices.push(right, low, depth+0.000001);
        		vertices.push(left,  low, depth+0.000001);
        	}
        }
        
        if(Xindex !== undefined)
        {
        	for(var i = 0; i < colNum; i++)
        	{
            	var left  = (marginX+recWidth)*Xindex + marginX - scalepercentage*recWidth;
        		var right = (marginX+recWidth)*Xindex + recWidth + marginX + scalepercentage*recWidth;
        		var low   = (marginY+recHeight)*i + marginY - scalepercentage*recWidth;
         		var high  = (marginY+recHeight)*i + marginY + recHeight + scalepercentage*recWidth;        	
        	
        		vertices[(Xindex+i*rowNum)* 6 * 3]     = right; vertices[(Xindex+j*rowNum)* 6 * 3 + 1] = high;
      		  	vertices[(Xindex+i*rowNum)* 6 * 3 + 3] = left;  vertices[(Xindex+j*rowNum)* 6 * 3 + 4] = high;
        		vertices[(Xindex+i*rowNum)* 6 * 3 + 6] = right; vertices[(Xindex+j*rowNum)* 6 * 3 + 7] = low;
        	
        		vertices[(Xindex+i*rowNum)* 6 * 3 + 9] = left;  vertices[(Xindex+j*rowNum)* 6 * 3 + 10] = high;
        		vertices[(Xindex+i*rowNum)* 6 * 3 + 12] = right;vertices[(Xindex+j*rowNum)* 6 * 3 + 13] = low;
        		vertices[(Xindex+i*rowNum)* 6 * 3 + 15] = left; vertices[(Xindex+j*rowNum)* 6 * 3 + 16] = low; 
        	}
        	
        	// line vertex and color
        	frameLeft  = (marginX+recWidth)*Xindex + marginX - scalepercentage*recWidth;
        	frameRight = (marginX+recWidth)*Xindex + recWidth + marginX + scalepercentage*recWidth;
        	frameLow   = (marginY+recHeight)*Yindex + marginY - scalepercentage*recWidth;
         	frameHigh  = (marginY+recHeight)*Yindex + marginY + recHeight + scalepercentage*recWidth; 
        }
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 6 * rowNum * colNum;
		
		squareVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        var colors = [];
        for(var i = 0;i<rowNum; i++)
        {
        	for(var j = 0; j < colNum; j++)
        	{
        		colors.push(0.0, 0.5, 0.0, 1.0);
        		colors.push(0.0, 0.5, 0.0, 1.0);
        		colors.push(0.0, 0.5, 0.0, 1.0);
        	
        		colors.push(0.0, 0.5, 0.0, 1.0);
        		colors.push(0.0, 0.5, 0.0, 1.0);
        		colors.push(0.0, 0.5, 0.0, 1.0);
        	}
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        squareVertexColorBuffer.itemSize = 4;
        squareVertexColorBuffer.numItems = 6 * rowNum  * colNum;
    }



//////////////////mouse functions
	var vertices = [
			-1.5, 1.8, 0.1,
			 3.5, 1.8, 0.1,
			 4.0, 1.8, 0.1
		];
    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;

    var moonRotationMatrix = new okMat4();
	var threshold = 0.2;// use this to select point
	var selectedInd;
	function calculateDis(pX0, pY0, pZ0, pX1, pY1, pZ1)
	{
		var distance = 0;
		distance = Math.sqrt((pX0 - pX1)*(pX0 - pX1) + (pY0 - pY1)*(pY0 - pY1) + (pZ0 - pZ1)*(pZ0 - pZ1));
		return distance;
	}
	
	function getPointIndex(mouseX, mouseY, mouseZ)
	{
		var Index = -1;
		var countNum = vertices.length/ 3;
		
		for(var i = 0; i < countNum; i++ )
		{
			var dis = calculateDis(mouseX, mouseY, mouseZ, vertices[i*3], vertices[i*3+1], vertices[i*3+2]);
			if( dis <= threshold)
			{
				Index = i;
				document.getElementById("dis").innerHTML = dis;
				return Index;
			}
		}
		
		return Index;
	}
	
	function degToRad(degrees) 
	{
        return degrees * Math.PI / 180;
    }
	
	function getPosition(winX, winY)
	{
		var viewportArray = [
		0, 0, gl.viewportWidth, gl.viewportHeight
		];

		// The results of the operation will be stored in this array.
		var modelPointArrayResults = [0.0, 0.0, 0.0];
		var success = GLU.unProject(
			winX, winY, 0.9865,
			mvMatrix, pMatrix,
			viewportArray, modelPointArrayResults);
		var posXY;	
		if(success)
		{
			posXY = [modelPointArrayResults[0], modelPointArrayResults[1], modelPointArrayResults[2]];
			document.getElementById("x").innerHTML=modelPointArrayResults[0];
			document.getElementById("y").innerHTML=modelPointArrayResults[1];
			document.getElementById("x1").innerHTML=posXY[0];
			document.getElementById("y1").innerHTML=posXY[1];
		}
		return posXY;
	}

    function handleMouseDown(event) 
	{
        mouseDown = true;
		//mouse left button down
		if(event.button == 0)
		{
			lastMouseX = event.clientX - mouseshiftX;
			lastMouseY = event.clientY - mouseshiftY;
			
			document.getElementById("xpos").innerHTML = lastMouseX;
			document.getElementById("ypos").innerHTML = gl.viewportHeight - lastMouseY;
			
			var pXY = getPosition(lastMouseX, gl.viewportHeight - lastMouseY);
			
			
			//calculation rectangle index where mouse over
			var xMouse = pXY[0];
			var yMouse = pXY[1];
			
			var outX = false;
			var outY = false;
			var	difX = (xMouse - marginX)%(marginX+recWidth);
			if(difX > recWidth)
			{
				outX = true;
			}
			
			var	difY= (yMouse - marginY)%(marginY+recWidth);
			if(difY > recHeight)
			{
				outY = true;
			}

			if(!outX)
			{
				var indXMouse = Math.floor((xMouse - marginX)/(marginX+recWidth)); // X index of rectangle mouse on
				var indYMouse = Math.floor((yMouse - marginY)/(marginY+recHeight));// Y index of rectangle mouse on

				document.getElementById("mriX").innerHTML=indXMouse;
				document.getElementById("mriY").innerHTML=indYMouse;
				
				initBuffers(indXMouse,indYMouse);
			}
			else
			{
				indXMouse = undefined;
				indYMouse = undefined;
				
				initBuffers(indXMouse,indYMouse);
			}
			//calculation end
			
			document.getElementById("x2").innerHTML=pXY[0];
			document.getElementById("y2").innerHTML=pXY[1];
			vertices.push(pXY[0], pXY[1], 0.1);
			document.getElementById("IndNum").innerHTML = vertices.length/3 - 1;
		}
		
		//mouse middle button down
		if(event.button == 1)
		{
			lastMouseX = event.clientX - mouseshiftX;
			lastMouseY = event.clientY - mouseshiftY;

			var pXY = getPosition(lastMouseX, gl.viewportHeight - lastMouseY);
			var IndexNum = getPointIndex(pXY[0], pXY[1], pXY[2]);
			selectedInd = IndexNum;
			document.getElementById("m1").innerHTML=pXY[0];
			document.getElementById("m2").innerHTML=pXY[1];
			document.getElementById("m3").innerHTML=pXY[2];
			document.getElementById("IndNum").innerHTML = IndexNum;
		}
		
		//mouse right button down
		if(event.button == 2)
		{
			lastMouseX = event.clientX - mouseshiftX;
			lastMouseY = event.clientY - mouseshiftY;

			var pXY = getPosition(lastMouseX, gl.viewportHeight - lastMouseY);
			var IndexNum = getPointIndex(pXY[0], pXY[1], pXY[2]);
			selectedInd = IndexNum;
			document.getElementById("IndNum").innerHTML = selectedInd;
			vertices.splice(selectedInd*3,selectedInd*3+2);
			
		}
    }


    function handleMouseUp(event) 
	{
        mouseDown = false;
    }


    function handleMouseMove(event) 
	{   
	
	 	var newX = event.clientX;
		var newY = event.clientY;

		var deltaX = newX - lastMouseX
		var newRotationMatrix = new okMat4();
		newRotationMatrix.rotY(OAK.SPACE_LOCAL, deltaX / 80, true);

		var deltaY = newY - lastMouseY;
		newRotationMatrix.rotX(OAK.SPACE_LOCAL, deltaY / 80, true);

		moonRotationMatrix = okMat4Mul(newRotationMatrix, moonRotationMatrix);

		lastMouseX = newX - mouseshiftX;
		lastMouseY = newY - mouseshiftY;
			
		var pXY = getPosition(lastMouseX, gl.viewportHeight - lastMouseY);		
			
		//calculation rectangle index where mouse over
		var xMouse = pXY[0];
		var yMouse = pXY[1];
			
		var outX = false;
		var outY = false;
		var	difX = (xMouse - marginX)%(marginX+recWidth);
		if(difX > recWidth || xMouse > gl.viewportWidth || yMouse > gl.viewportHeight || xMouse < 0 || yMouse < 0)
		{
			outX = true;
		}
			
			var	difY= (yMouse - marginY)%(marginY+recWidth);
			if(difY > recHeight)
			{
				outY = true;
			}

			if(!outX)
			{
				var indXMouse = Math.floor((xMouse - marginX)/(marginX+recWidth)); // X index of rectangle mouse on
				var indYMouse = Math.floor((yMouse - marginY)/(marginY+recHeight));// Y index of rectangle mouse on

				document.getElementById("mriX").innerHTML=indXMouse;
				document.getElementById("mriY").innerHTML=indYMouse;
				
				initBuffers(indXMouse,indYMouse);
				Xindex = indXMouse;
				Yindex = indYMouse;
			}
			else
			{
				indXMouse = undefined;
				indYMouse = undefined;
				Xindex = undefined;
				Yindex = undefined;
				
				initBuffers(indXMouse,indYMouse);
			}
			//calculation end
		
		if(event.button === 0 && mouseDown)
		{
			var newX = event.clientX;
			var newY = event.clientY;

			var deltaX = newX - lastMouseX
			var newRotationMatrix = new okMat4();
			newRotationMatrix.rotY(OAK.SPACE_LOCAL, deltaX / 80, true);

			var deltaY = newY - lastMouseY;
			newRotationMatrix.rotX(OAK.SPACE_LOCAL, deltaY / 80, true);

			moonRotationMatrix = okMat4Mul(newRotationMatrix, moonRotationMatrix);

			lastMouseX = newX - mouseshiftX;
			lastMouseY = newY - mouseshiftY;
			
			var pXY = getPosition(lastMouseX, gl.viewportHeight - lastMouseY);		
			
			//calculation rectangle index where mouse over
			var xMouse = pXY[0];
			var yMouse = pXY[1];
			
			var outX = false;
			var outY = false;
			var	difX = (xMouse - marginX)%(marginX+recWidth);
			if(difX > recWidth)
			{
				outX = true;
			}
			
			var	difY= (yMouse - marginY)%(marginY+recWidth);
			if(difY > recHeight)
			{
				outY = true;
			}

			if(!outX)
			{
				var indXMouse = Math.floor((xMouse - marginX)/(marginX+recWidth)); // X index of rectangle mouse on
				var indYMouse = Math.floor((yMouse - marginY)/(marginY+recHeight));// Y index of rectangle mouse on

				document.getElementById("mriX").innerHTML=indXMouse;
				document.getElementById("mriY").innerHTML=indYMouse;
				
				initBuffers(indXMouse,indYMouse);
			}
			else
			{
				indXMouse = undefined;
				indYMouse = undefined;
				
				initBuffers(indXMouse,indYMouse);
			}
			//calculation end
			
			vertices[selectedInd*3] = pXY[0];
			vertices[selectedInd*3+1] = pXY[1];
			vertices[selectedInd*3+2] = 0.1;
			
			
			document.getElementById("xpos").innerHTML=lastMouseX;
			document.getElementById("ypos").innerHTML=lastMouseY;
		}
    }
	//mouse function end
	
	function drawPoints()
	{
		// initialize point vertex buffer and color buffer
		pointVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, pointVertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		pointVertexPositionBuffer.itemSize = 3;
		pointVertexPositionBuffer.numItems = vertices.length/3;
		
		pointVertexColorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, pointVertexColorBuffer);		
		var colors = [ 
			1.0, 1.0, 0.0, 1.0 
		];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
            pointVertexColorBuffer.itemSize = 4;
            pointVertexColorBuffer.numItems = 1;
	
		//draw points	
		gl.bindBuffer(gl.ARRAY_BUFFER, pointVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram1.vertexPositionAttribute, pointVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		//color buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, pointVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram1.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
		
		setMatrixUniforms1();
		gl.drawArrays(gl.POINTS, 0, pointVertexPositionBuffer.numItems);
	}
	
	var zPos = 0;

	
    function drawScene() 
    {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
		mat4.identity(pMatrix);
        //mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        mat4.ortho(0, gl.viewportWidth, 0, gl.viewportHeight, -10.0, 10.0, pMatrix);
		mat4.identity(mvMatrix);	
		mvMatrix = mat4.lookAt([0,0,zPos], [0, 0, -100], [0, 1, 0]);//this is the same as glulookat in OpenGL
		gl.useProgram(shaderProgram);//use shaderprograme
		
		// draw triangle
        mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
        //gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

		//draw rectangle
        gl.bindBuffer(gl.ARRAY_BUFFER, rectangleVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, rectangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, rectangleVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, rectangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLES, 0, rectangleVertexPositionBuffer.numItems);	
        
        
        //draw square
        if(showmutation)
        {
        	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        	setMatrixUniforms();
        	gl.drawArrays(gl.TRIANGLES, 0, squareVertexPositionBuffer.numItems);	
        }
        
        if(Xindex !== undefined)
        { 	
        // draw line		
        lineVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexColorBuffer);
        var colors = [
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        lineVertexColorBuffer.itemSize = 4;
        lineVertexColorBuffer.numItems = 2*4;
        
		var vtx = new Float32Array(
		[frameLeft,  frameHigh, depth+0.0001,
		 frameLeft,  frameLow,  depth+0.0001,
		 frameLeft,  frameHigh, depth+0.0001,
		 frameRight, frameHigh, depth+0.0001,
		 frameLeft,  frameLow,  depth+0.0001,
		 frameRight, frameLow,  depth+0.0001,
		 frameRight, frameHigh, depth+0.0001,
		 frameRight, frameLow,  depth+0.0001]
		);
		
		var idx = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7]);
		
		var vbuf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
		gl.bufferData(gl.ARRAY_BUFFER, vtx, gl.STATIC_DRAW);
		var ibuf = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		
		gl.lineWidth(2.0);
		gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
		setMatrixUniforms();
		gl.drawElements(gl.LINES, 8, gl.UNSIGNED_SHORT, 0);
        }	
	}

	//keyboard function
	var currentlyPressedKeys = {};

    function handleKeyDown(event) 
	{
        currentlyPressedKeys[event.keyCode] = true;
    }


    function handleKeyUp(event) 
	{
        currentlyPressedKeys[event.keyCode] = false;
    }


    function handleKeys() 
	{
        if (currentlyPressedKeys[33]) {
            // Page Up
            zPos -= 0.05;
        }
        if (currentlyPressedKeys[34]) {
            // Page Down
            zPos += 0.05;
        }
	}
	
	//redraw function
	function tick() {
        requestAnimFrame(tick);
		handleKeys();
        drawScene();
    }

/////////button function begin

	//truncate half
	function enlarge()
	{
		//var portwidth = (gl.viewportWidth-2) * 2 + 2;
		//gl.viewportWidth = portwidth;
		var canvas = document.getElementById("lesson01-canvas");
		var cwidth = canvas.width;
		var cheigth = canvas.heigth;
		canvas.width = (cwidth-2)*2 + 2;
		drawScene();
	}
	//resize double
	function shrink()
	{
		//var portwidth = (gl.viewportWidth-2)/2 + 2;
		//gl.viewportWidth = portwidth;
		var canvas = document.getElementById("lesson01-canvas");
		var cwidth = canvas.width;
		var cheigth = canvas.heigth;
		canvas.width = (cwidth-2)/2 + 2;
		drawScene();
	}
	
	//zoomin
	function zoom(value)
	{
            var canvas = document.getElementById("lesson01-canvas");
            canvas.width = originWidth * value;
            recWidth = value * originRecWidth;
            marginX = value * originMarginX;
            initGL(canvas);
            initBuffers(Xindex, Yindex) 
	}
	//show hide mutation
	function showhide()
	{
            showmutation = !showmutation;
	}
        
        function removespace()
        { 
            var canvas = document.getElementById("lesson01-canvas");
            var cwidth = canvas.width;
            canvas.width = cwidth - rowNum * marginX;
            marginX = 0;
            initGL(canvas);
            initBuffers(Xindex, Yindex)
        }
        
        function withspace()
        { 
            marginX = 5;
            var canvas = document.getElementById("lesson01-canvas");
            var cwidth = canvas.width;
            canvas.width = cwidth + rowNum * marginX;
            initGL(canvas);
            initBuffers(Xindex, Yindex)
        }
/////////button function end
	
    function webGLStart() 
	{
        var canvas = document.getElementById("lesson01-canvas");
        initGL(canvas);
        initShaders();
        initBuffers(Xindex,Yindex);
        
        originWidth = canvas.width;
        originHeight = canvas.height;
        originRecWidth = recWidth;
        originMarginX = marginX;

        gl.clearColor(0.7, 0.7, 0.7, 1.0);
        gl.enable(gl.DEPTH_TEST);

	canvas.onmousedown = handleMouseDown;
        document.onmouseup = handleMouseUp;
        document.onmousemove = handleMouseMove;
		
	document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
		
        tick();
    }
