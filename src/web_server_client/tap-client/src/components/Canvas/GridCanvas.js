import React, { useRef, useEffect } from 'react';

const GridCanvas = ({ image, x, y, cuttingSize }) => {
	const canvasRef = useRef(null);

	const draw = (context, objUrl) => {
		const base_image = new Image();
		base_image.src = objUrl;

		base_image.onload = function() {
			context.canvas.width = cuttingSize;
			context.canvas.height = cuttingSize;
			// context.drawImage(base_image, 0, 0);
			context.drawImage(base_image, x, y, cuttingSize, cuttingSize, 0, 0, cuttingSize, cuttingSize);
		};
	};

	useEffect(
		() => {
			if (!canvasRef.current) {
				return;
			}

			const objUrl = URL.createObjectURL(image);

			const canvas = canvasRef.current;
			const context = canvas.getContext('2d');
			draw(context, objUrl);

			// free memory when ever this component is unmounted
			return () => URL.revokeObjectURL(objUrl);
		},
		[ draw ]
	);

	return <canvas ref={canvasRef} />;
};

export default GridCanvas;
