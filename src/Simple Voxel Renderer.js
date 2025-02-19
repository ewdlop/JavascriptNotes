<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Simple Voxel Renderer</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { width: 100vw; height: 100vh; display: block; }
        .controls {
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.8);
            padding: 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="controls">
        <button onclick="addVoxel()">Add Voxel</button>
        <input type="color" id="colorPicker" value="#ff0000">
    </div>
    <canvas id="glCanvas"></canvas>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js"></script>
    <script>
        let gl;
        let program;
        let voxels = [];

        // Shader sources
        const vsSource = `
            attribute vec4 aPosition;
            attribute vec4 aColor;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying vec4 vColor;
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
                vColor = aColor;
            }
        `;

        const fsSource = `
            precision mediump float;
            varying vec4 vColor;
            void main() {
                gl_FragColor = vColor;
            }
        `;

        function init() {
            const canvas = document.querySelector("#glCanvas");
            gl = canvas.getContext("webgl");

            if (!gl) {
                alert("WebGL not available");
                return;
            }

            // Set canvas size
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            // Create shader program
            program = createShaderProgram(gl, vsSource, fsSource);
            gl.useProgram(program);

            // Initialize matrices
            const projectionMatrix = mat4.create();
            const modelViewMatrix = mat4.create();

            mat4.perspective(projectionMatrix, 45 * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
            mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);

            // Set uniforms
            gl.uniformMatrix4fv(
                gl.getUniformLocation(program, "uProjectionMatrix"),
                false,
                projectionMatrix
            );
            gl.uniformMatrix4fv(
                gl.getUniformLocation(program, "uModelViewMatrix"),
                false,
                modelViewMatrix
            );

            // Enable depth testing
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);

            // Start render loop
            requestAnimationFrame(render);
        }

        function resizeCanvas() {
            const canvas = gl.canvas;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        function createVoxelBuffers(x, y, z, color) {
            // Create cube vertices
            const positions = new Float32Array([
                // Front face
                x, y, z+1,
                x+1, y, z+1,
                x+1, y+1, z+1,
                x, y+1, z+1,
                // Back face
                x, y, z,
                x+1, y, z,
                x+1, y+1, z,
                x, y+1, z,
            ]);

            const colors = new Float32Array(positions.length * 4/3).fill(1.0);
            for (let i = 0; i < colors.length; i += 4) {
                colors[i] = color[0];
                colors[i+1] = color[1];
                colors[i+2] = color[2];
                colors[i+3] = 1.0;
            }

            const indices = new Uint16Array([
                0, 1, 2,    0, 2, 3,    // Front
                4, 5, 6,    4, 6, 7,    // Back
                0, 4, 7,    0, 7, 3,    // Left
                1, 5, 6,    1, 6, 2,    // Right
                3, 2, 6,    3, 6, 7,    // Top
                0, 1, 5,    0, 5, 4,    // Bottom
            ]);

            // Create and bind buffers
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

            const colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

            return {
                position: positionBuffer,
                color: colorBuffer,
                indices: indexBuffer,
                count: indices.length
            };
        }

        function addVoxel() {
            const colorPicker = document.getElementById('colorPicker');
            const color = hexToRgb(colorPicker.value);
            const position = [voxels.length, 0, 0];
            const buffers = createVoxelBuffers(...position, color);
            voxels.push(buffers);
        }

        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255
            ] : [1, 0, 0];
        }

        function createShaderProgram(gl, vsSource, fsSource) {
            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vsSource);
            gl.compileShader(vertexShader);

            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fsSource);
            gl.compileShader(fragmentShader);

            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            return program;
        }

        function render() {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Draw each voxel
            voxels.forEach(voxel => {
                // Position attribute
                gl.bindBuffer(gl.ARRAY_BUFFER, voxel.position);
                const positionAttribute = gl.getAttribLocation(program, "aPosition");
                gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(positionAttribute);

                // Color attribute
                gl.bindBuffer(gl.ARRAY_BUFFER, voxel.color);
                const colorAttribute = gl.getAttribLocation(program, "aColor");
                gl.vertexAttribPointer(colorAttribute, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(colorAttribute);

                // Draw
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, voxel.indices);
                gl.drawElements(gl.TRIANGLES, voxel.count, gl.UNSIGNED_SHORT, 0);
            });

            // Rotate view
            const modelViewMatrix = mat4.create();
            mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
            mat4.rotate(modelViewMatrix, modelViewMatrix, performance.now() * 0.001, [0, 1, 0]);
            gl.uniformMatrix4fv(
                gl.getUniformLocation(program, "uModelViewMatrix"),
                false,
                modelViewMatrix
            );

            requestAnimationFrame(render);
        }

        // Start the application
        init();
    </script>
</body>
</html>
