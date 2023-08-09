import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import ComplexGrid from '../components/Grid/ComplexGrid';
import ImageViewer from '../components/Stack/ImageViewer';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SaveIcon from '@mui/icons-material/Save';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Grid from '@mui/material/Grid';
import { upload, getModels } from '../apis/fetch';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import NewPatientPopup from '../components/Popup/NewPatient';
import SaveAsPatientPopup from '../components/Popup/SaveAsPatient';
import ProgressPopup from '../components/Popup/ProgressPopup';

const styles = (theme) => ({
	button : {
		margin : theme.spacing.unit,
	},
	input  : {
		display : 'none',
	},
});
const Input = styled('input')({
	display : 'none',
});

const Home = (props) => {
	// const [ classifiedList, setClassifiedList ] = useState([]);
	const [ isAddingAnnotation, setIsAddingAnnotation ] = useState(false);

	const [ image, setImage ] = useState(null);
	const [ redraw, setRedraw ] = useState(false);
	const [ imageName, setImageName ] = useState('');

	const classifiedList = useRef([]);
	const [ hasToUpdate, setHasToUpdate ] = useState(false);
	const [ selectedModel, setSelectedModel ] = React.useState('');
	const [ modelList, setModelList ] = useState([]);
	const [ cuttingSize, setCuttingSize ] = useState(224);
	const [ openSaveAsPatientPopup, setSaveAsPatientPopup ] = React.useState(false);
	const [ openNewPatientPopup, setNewPatientPopup ] = React.useState(false);
	const [ openProgressPopup, setOpenProgressPopup ] = React.useState(false);

	useEffect(
		() => {
			if (modelList.length !== 0) return;
			async function fetchData() {
				const response = await getModels();
				setModelList(response.data);
			}
			fetchData();
		},
		[ modelList ]
	);

	const onSelectFile = (e) => {
		if (!e.target.files || e.target.files.length === 0) {
			setImage(null);
			return;
		}
		classifiedList.current = { currentFile: e.target.files[0], data: [] };
		setImage(e.target.files[0]);
		setHasToUpdate(false);
		setRedraw(false);
		setImageName(classifiedList.current.currentFile.name);
	};

	const uploadHandler = () => {
		const data = {
			file        : classifiedList.current.currentFile,
			payload     : classifiedList.current.data,
			cuttingSize : cuttingSize,
		};
		setOpenProgressPopup(true);
		upload(data)
			.then((response) => {
				const { data } = response;
				classifiedList.current.data = classifiedList.current.data.map((each) => ({
					...each,
					predict : data[each.id],
				}));
				setHasToUpdate(!hasToUpdate);
				setRedraw(!redraw);
				setOpenProgressPopup(false);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const handleChange = (event) => {
		setSelectedModel(event.target.value);
		setHasToUpdate(!hasToUpdate);
	};

	const onChangeCuttingSize = (event) => {
		setCuttingSize(event.target.value);
		setHasToUpdate(!hasToUpdate);
	};

	const onOpenSaveAsPatientButton = () => {
		setSaveAsPatientPopup(true);
	};
	const onCloseSaveAsPatientPopup = () => {
		setSaveAsPatientPopup(false);
	};

	const onCloseProgressPopup = () => {
		setOpenProgressPopup(false);
	};

	const onOpenNewPatientButton = () => {
		setNewPatientPopup(true);
	};
	const onCloseNewPatientPopup = () => {
		setNewPatientPopup(false);
	};

	return (
		<div>
			<div>
				<Grid container spacing={2}>
					<Grid item xs={4} md={6}>
						<Grid container justify="center">
							<Grid item xs={12} height={70}>
								<Box sx={{ width: '100%', m: 2 }}>
									<Box>
										<Stack direction="row" justifyContent="center" alignItems="center">
											<strong>Patient:</strong> Unknown
										</Stack>
									</Box>
								</Box>
							</Grid>
							<Grid item xs={12}>
								<ImageViewer
									isAddingAnnotation={isAddingAnnotation}
									setIsAddingAnnotation={setIsAddingAnnotation}
									classifiedList={classifiedList}
									image={image}
									hasToUpdate={hasToUpdate}
									redraw={redraw}
									cuttingSize={cuttingSize}
								/>

								<Box
									sx={{
										width  : '100%',
										height : 100,
									}}
									display="flex"
									justifyContent="center"
								>
									<Stack direction="row" alignItems="center" spacing={2}>
										<label htmlFor="contained-button-file">
											<Input
												accept="image/*"
												id="contained-button-file"
												multiple
												type="file"
												onChange={onSelectFile}
												onClick={(e) => setImage(null)}
											/>
											<Button
												sx={{ height: 40, width: 200 }}
												variant="outlined"
												component="span"
												startIcon={<PhotoCamera />}
											>
												Select
											</Button>
											{image && (
												<Button
													variant={isAddingAnnotation ? 'contained' : 'outlined'}
													sx={{ height: 40, width: 200 }}
													startIcon={<AddCircleIcon />}
													onClick={() => {
														setIsAddingAnnotation(true);
														setHasToUpdate(!hasToUpdate);
														setRedraw(!redraw);
													}}
												>
													Add
												</Button>
											)}
										</label>
									</Stack>
								</Box>
							</Grid>
						</Grid>
					</Grid>
					<Grid item xs={8} md={6}>
						{image && (
							<Grid container>
								<Grid item xs={10} direction="column" alignItems="left" justifyContent="left">
									<FormControl>
										<FormLabel id="demo-row-radio-buttons-group-label">Cutting option</FormLabel>
										<RadioGroup
											row
											aria-labelledby="demo-row-radio-buttons-group-label"
											name="row-radio-buttons-group"
											defaultValue={cuttingSize}
											onChange={onChangeCuttingSize}
										>
											<FormControlLabel value={224} control={<Radio />} label="224x224" />
											<FormControlLabel value={256} control={<Radio />} label="256x256" />
										</RadioGroup>
									</FormControl>
								</Grid>
								<Grid item xs={2} direction="column" alignItems="right" justifyContent="right">
									<FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
										<InputLabel id="demo-simple-select-standard-label">Model</InputLabel>
										<Select
											labelId="demo-simple-select-standard-label"
											id="demo-simple-select-standard"
											value={selectedModel}
											onChange={handleChange}
											label="Age"
										>
											<MenuItem value="">
												<em>None</em>
											</MenuItem>
											{modelList.length !== 0 &&
												modelList.map((modelName) => (
													<MenuItem value={modelName}>{modelName}</MenuItem>
												))}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs={12}>
									<ComplexGrid
										classifiedList={classifiedList}
										hasToUpdate={hasToUpdate}
										setRedraw={setRedraw}
										redraw={redraw}
										imageName={imageName}
										selectedModel={selectedModel}
										cuttingSize={cuttingSize}
									/>
									<Stack spacing={2} direction="row">
										<Button
											variant="outlined"
											sx={{ height: 40, width: 200 }}
											startIcon={<SaveIcon />}
											onClick={uploadHandler}
											disabled={classifiedList.current.length === 0}
										>
											Classify
										</Button>
										<Button
											variant="outlined"
											sx={{ height: 40, width: 200 }}
											startIcon={<SaveIcon />}
											onClick={onOpenSaveAsPatientButton}
										>
											Save As
										</Button>
										<Button
											variant="outlined"
											sx={{ height: 40, width: 200 }}
											startIcon={<FiberNewIcon />}
											onClick={onOpenNewPatientButton}
										>
											New patient
										</Button>
									</Stack>
								</Grid>
							</Grid>
						)}
					</Grid>
				</Grid>
				<ProgressPopup open={openProgressPopup} onClose={onCloseProgressPopup} />
				<NewPatientPopup open={openNewPatientPopup} onClose={onCloseNewPatientPopup} />
				<SaveAsPatientPopup open={openSaveAsPatientPopup} onClose={onCloseSaveAsPatientPopup} />
			</div>
		</div>
	);
};

Home.propTypes = {
	classes : PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
