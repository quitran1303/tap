import axios from 'axios';

const tapServer = axios.create({
	baseURL : 'http://127.0.0.1:6789/',
	headers : {
		'Content-type' : 'application/json',
	},
});

export const upload = (data, config = {}) => {
	let formData = new FormData();
	const { file, payload, cuttingSize } = data;
	formData.append('file', file);
	formData.append('payload', JSON.stringify(payload));
	formData.append('cuttingSize', cuttingSize);
	return tapServer.post('/classify', formData, config);
};

export const getModels = (i) => {
	return tapServer.get(`/models`);
};
