document.addEventListener('DOMContentLoaded', () => {
    // Ensure resultados is defined and has data
    if (typeof resultados === 'undefined') {
        console.error('resultados is not defined');
        return;
    }

    const pipelineData = resultados;
    const steps = Object.entries(pipelineData);

    // Verify we have steps to animate
    if (steps.length === 0) {
        console.warn('No pipeline steps to animate');
        return;
    }

    const canvas = document.getElementById('pipelineCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    if (!canvas.getContext) {
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            canvasContainer.innerHTML += '<p style="color: red;">Tu navegador no soporta Canvas, la visualización animada no está disponible.</p>';
        }
        return;
    }

    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const boxWidth = 120, boxHeight = 60, gap = 40;
    const startX = 30, startY = canvasHeight / 2 - boxHeight / 2;
    //const arrowOffsetY = 15;
    const dataPacketRadius = 8;
    const animationSpeed = 0.5; // Increased animation speed
    const dataBoxHeight = 50, dataBoxPadding = 10, lineHeight = 14;

    let currentStepIndex = 0;
    let dataPacketX = startX - gap; // Start before first box
    let dataPacketY = startY + boxHeight / 2;
    let targetX = startX + boxWidth / 2;
    let animating = true;

    function drawFilterBox(x, y, text) {
        ctx.fillStyle = '#e9ecef';
        ctx.strokeStyle = '#0056b3';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.strokeRect(x, y, boxWidth, boxHeight);

        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + boxWidth / 2, y + boxHeight / 2 + 5);
    }

    function drawArrow(x1, y1, x2, y2) {
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2 - 8, y2 - 4);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 8, y2 + 4);
        ctx.stroke();
    }

    function drawDataText(boxX, boxY, text) {
        ctx.fillStyle = '#f8f9fa';
        ctx.strokeStyle = '#adb5bd';
        ctx.lineWidth = 1;
        ctx.fillRect(boxX, boxY, boxWidth, dataBoxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, dataBoxHeight);

        ctx.fillStyle = '#212529';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const textPadding = 5;
        const maxWidth = boxWidth - (textPadding * 2);

        // Convert text to string if it's not already
        const textStr = String(text);
        const words = textStr.split(' ');
        let line = '', lines = [];
        for (let word of words) {
            const testLine = line + word + ' ';
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth > maxWidth && line !== '') {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        const startTextY = boxY + textPadding;
        for (let i = 0; i < lines.length && i < 2; i++) {
            let lineToDraw = lines[i];
            if (ctx.measureText(lineToDraw).width > maxWidth) {
                while (ctx.measureText(lineToDraw + '...').width > maxWidth && lineToDraw.length > 0) {
                    lineToDraw = lineToDraw.substring(0, lineToDraw.length - 1);
                }
                lineToDraw += '...';
            }
            ctx.fillText(lineToDraw, boxX + boxWidth / 2, startTextY + (i * lineHeight));
        }
    }

    function drawDataPacket(x, y) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x, y, dataPacketRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        let currentX = startX;

        // Draw pipeline structure
        steps.forEach(([stepName, stepData], index) => {
            let displayName = stepName.includes(':') ? stepName.split(':')[1].trim() : stepName;
            if (displayName.length > 15) displayName = displayName.substring(0, 13) + '...';

            drawFilterBox(currentX, startY, displayName);
            drawDataText(currentX, startY + boxHeight + dataBoxPadding, stepData);
            if (index < steps.length - 1) {
                drawArrow(currentX + boxWidth, startY + boxHeight / 2, currentX + boxWidth + gap, startY + boxHeight / 2);
            }
            currentX += boxWidth + gap;
        });

        // Animate data packet
        if (animating) {
            dataPacketX += animationSpeed;
            
            const currentFilterCenterX = startX + currentStepIndex * (boxWidth + gap) + boxWidth / 2;
            
            if (dataPacketX >= currentFilterCenterX) {
                if (currentStepIndex < steps.length - 1) {
                    currentStepIndex++;
                    targetX = startX + currentStepIndex * (boxWidth + gap) + boxWidth / 2;
                } else {
                    animating = false;
                }
            }

            drawDataPacket(dataPacketX, dataPacketY);
            requestAnimationFrame(animate);
        }
    }

    // Start animation
    animate();
});
