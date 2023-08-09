import React, { useRef, useEffect, useState, useCallback } from 'react';

const Canvas = ({ imageSrc, isAddingAnnotation, setIsAddingAnnotation, classifiedList, redraw, cuttingSize }) => {
	const canvasRef = useRef(null);
	const [ mousePosition, setMousePosition ] = useState({ mouseX: 0, mouseY: 0 });
	const [ isPainting, setIsPainting ] = useState(false);

	useEffect(
		() => {
			if (!canvasRef.current) {
				return;
			}
			const canvas = canvasRef.current;
			const context = canvas.getContext('2d');
			draw(context);
			if (isAddingAnnotation) {
				canvas.addEventListener('mousedown', startPaint, false);
				return () => {
					canvas.removeEventListener('mousedown', startPaint);
				};
			}
		},
		[ imageSrc, redraw ]
	);

	const draw = (context) => {
		const base_image = new Image();
		base_image.src = imageSrc;

		base_image.onload = function() {
			const { width, height } = base_image;

			context.canvas.width = width;
			context.canvas.height = height;
			context.drawImage(base_image, 0, 0);

			classifiedList.current.data &&
				classifiedList.current.data.forEach((each) => {
					context.strokeStyle = 'rgb(255, 255 ,255)';
					context.beginPath();
					context.rect(each.x, each.y, cuttingSize, cuttingSize);
					context.stroke();
				});
		};
	};

	const drawRect = (coordinates) => {
		if (!canvasRef.current || !coordinates.mouseX || !coordinates.mouseY) {
			return;
		}
		const canvas = canvasRef.current;
		const context = canvas.getContext('2d');
		if (context) {
			context.strokeStyle = 'rgb(255, 255 ,255)';
			context.beginPath();
			context.rect(coordinates.mouseX, coordinates.mouseY, cuttingSize, cuttingSize);
			context.stroke();

			const currentData = classifiedList.current.data || [];

			const newClassified = {
				id : currentData.length + 1,
				x  : coordinates.mouseX,
				y  : coordinates.mouseY,
			};
			classifiedList.current.data = [ ...currentData, newClassified ];
			setIsAddingAnnotation(false);
		}
	};

	function getPosition(canvas) {
		var xPosition = 0;
		var yPosition = 0;

		while (canvas) {
			xPosition += canvas.offsetLeft - canvas.scrollLeft || 0 + canvas.clientLeft || 0;
			yPosition += canvas.offsetTop - canvas.scrollTop || 0 + canvas.clientTop || 0;
			canvas = canvas.offsetParent;
		}
		return {
			x : xPosition,
			y : yPosition,
		};
	}

	const getCoordinates = (event) => {
		if (!canvasRef.current) {
			return;
		}
		const canvas = canvasRef.current;
		const canvasPos = getPosition(canvas);
		return {
			mouseX : event.clientX - canvasPos.x,
			mouseY : event.clientY - canvasPos.y,
		};
	};

	const startPaint = useCallback(
		(event) => {
			const coordinates = getCoordinates(event);
			if (coordinates) {
				setIsPainting(true);
				setMousePosition(coordinates);
				drawRect(coordinates);
			}
		},
		[ isPainting, mousePosition ]
	);

	return <canvas ref={canvasRef} />;
};

export default Canvas;
