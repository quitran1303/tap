import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Box from '@mui/material/Box';
import GridCanvas from '../Canvas/GridCanvas';
import { withStyles } from '@material-ui/core';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';
import { blue } from '@mui/material/colors';
import PlaylistAddCheckCircleIcon from '@mui/icons-material/PlaylistAddCheckCircle';
import MonoStackedBar from 'mono-stacked-bar';
import 'mono-stacked-bar/dist/index.css';
import CorrectPopup from '../Popup/CorrectPopup';

export default function ComplexGrid({
	classifiedList,
	selectedModel,
	hasToUpdate,
	setRedraw,
	redraw,
	imageName,
	cuttingSize,
}) {
	const [ dataSource, setDataSource ] = useState([]);
	const colors = [ '#393986', '#6767aa', '#56b5b5', '#B0B7C0' ];
	const [ open, setOpen ] = React.useState(false);
	const [ selectedValue, setSelectedValue ] = React.useState('Bego');
	useEffect(
		() => {
			if (!classifiedList) return;
			updateDataSource(classifiedList);
		},
		[ classifiedList.current.data, hasToUpdate ]
	);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = (value) => {
		setOpen(false);
		setSelectedValue(value);
	};

	const updateDataSource = (classifiedList) => {
		const { data } = classifiedList.current;

		const accuracy = (predicted) => {
			if (selectedModel !== '')
				return Object.fromEntries(Object.entries(predicted).filter(([ key ]) => key === selectedModel));
			return predicted;
		};

		const ds = data.map((each) => ({
			id           : each.id,
			captureImage : { x: each.x, y: each.y },
			predict      : each.predict ? accuracy(each.predict) : '',
		}));
		setDataSource(ds);
	};

	const renderImage = (params) => {
		return (
			<GridCanvas
				image={classifiedList.current.currentFile}
				x={params.row.captureImage.x}
				y={params.row.captureImage.y}
				cuttingSize={cuttingSize}
			/>
		);
	};
	const handleDelete = (params) => {
		const { id } = params.row;
		classifiedList.current.data = classifiedList.current.data.filter((x) => x.id !== id);
		updateDataSource(classifiedList);
		setRedraw(!redraw);
	};

	const gridDataColumns = [
		{
			field : 'id',
			hide  : true,
		},
		{
			field           : 'captureImage',
			headerName      : 'Capture list',
			width           : parseInt(cuttingSize),
			minHeight       : parseInt(cuttingSize),
			sortable        : false,
			filterable      : false,
			disableExport   : true,
			headerClassName : 'super-app-theme--header',
			renderCell      : (params) => renderImage(params),
			// headerAlign     : 'center',
		},
		{
			field                          : 'predict',
			headerName                     : 'Classified as',
			dataGeneratorUniquenessEnabled : true,
			flex                           : 1,
			editable                       : true,
			headerClassName                : 'super-app-theme--header',
			renderCell                     : (params) => {
				const { predict } = params.row;
				return (
					<div style={{ width: '100%' }}>
						{predict &&
							Object.keys(predict).map((model) => (
								<Box
									sx={{
										height : 50,
										width  : '100%',
									}}
								>
									<Box sx={{ width: '20%' }}>{model}</Box>
									<Box sx={{ width: '80%', alignContent: 'flex-start' }}>
										<MonoStackedBar
											data={[
												{ value: predict[model].bego, caption: 'Bego' },
												{ value: predict[model].bicon, caption: 'Bicon' },
												{ value: predict[model].straumann, caption: 'Straumann' },
												{ value: predict[model].nothing, caption: 'Unknown' },
											]}
											unit="%"
											colors={colors}
										/>
									</Box>
								</Box>
							))}
					</div>
				);
			},
		},
		{
			field      : 'action',
			headerName : 'Action',
			sortable   : false,
			renderCell : (params) => {
				return (
					<Box sx={{ padding: '5px', display: 'flex' }}>
						<IconButton aria-label="delete" onClick={() => handleDelete(params)}>
							<DeleteIcon sx={{ color: blue[600], fontSize: 20 }} />
						</IconButton>
						<IconButton aria-label="delete" onClick={() => handleClickOpen(params)}>
							<PlaylistAddCheckCircleIcon sx={{ color: blue[600], fontSize: 40 }} />
						</IconButton>
					</Box>
				);
			},
		},
	];

	function CustomFooterStatusComponent({ status }) {
		return (
			<Box sx={{ padding: '10px', display: 'flex' }}>
				<FiberManualRecordIcon
					fontSize="small"
					sx={{
						mr    : 2,
						color : '#4caf50',
					}}
				/>
				Image: {imageName}
			</Box>
		);
	}

	const StyledDataGrid = withStyles({
		root : {
			'& .MuiDataGrid-cell'              : {
				wordBreak     : 'break-all',
				maxHeight     : 'fit-content!important',
				overflow      : 'auto',
				whiteSpace    : 'initial!important',
				lineHeight    : '256px!important',
				display       : 'flex!important',
				alignItems    : 'center',
				paddingTop    : '10px!important',
				paddingBottom : '10px!important',
			},

			'& .MuiDataGrid-cell div'          : {
				maxHeight  : 'inherit',
				width      : '100%',
				whiteSpace : 'initial',
				lineHeight : '16px',
			},
			'& .MuiDataGrid-columnHeaderTitle' : {
				fontWeight : 'bold',
			},
			virtualScrollerContent             : {
				height   : '100% !important',
				overflow : 'scroll',
			},
		},
	})(DataGrid);
	return (
		<Paper
			sx={{
				p               : 2,
				margin          : 'auto',
				width           : '100%',
				height          : '800',
				flexGrow        : 1,
				backgroundColor : (theme) => (theme.palette.mode === 'dark' ? '#1A2027' : '#fff'),
			}}
		>
			<StyledDataGrid
				sx={{
					boxShadow   : 2,
					border      : 2,
					borderColor : 'primary.light',
				}}
				autoHeight={true}
				width="100%"
				columns={gridDataColumns}
				rows={dataSource}
				rowHeight={parseInt(cuttingSize)}
				components={{
					Footer : CustomFooterStatusComponent,
				}}
			/>
			<CorrectPopup open={open} onClose={handleClose} selectedValue={selectedValue} />
		</Paper>
	);
}
