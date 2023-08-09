import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Input from '@mui/material/Input';
import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { Paper } from '@material-ui/core';

import Grid from '@mui/material/Grid';

export default function SaveAsPatientPopup({ open, onClose }) {
	const handleClose = () => {
		onClose(false);
	};

	const patients = [
		{ name: 'Oden Tomass', year: 1994 },
		{ name: 'Isa Kondwani', year: 1972 },
		{ name: 'Angela Amalija', year: 1974 },
		{ name: 'Firdos Ashtoreth', year: 2008 },
		{ name: 'Karl Brando', year: 1957 },
		{ name: 'Marina Cerere', year: 1993 },
		{ name: 'Karna Lucius', year: 1994 },
		{
			name : 'Radka Cunobelinus',
			year : 2003,
		},
	];
	return (
		<React.Fragment>
			<Dialog open={open} onClose={handleClose} maxWidth="xs">
				<DialogTitle>Patient search</DialogTitle>
				<DialogContent>
					<DialogContentText>Search patient for this record.</DialogContentText>
					<Box sx={{ flexGrow: 1 }} justify-content="center">
						<Grid display="flex" container spacing={2} alignItems="center" justifyContent="center">
							<Grid item xs={12}>
								<Autocomplete
									id="free-solo-demo"
									options={patients.map((option) => option.name)}
									renderInput={(params) => <TextField {...params} label="Name" />}
								/>
							</Grid>
							<Grid item xs={12}>
								<FormControl sx={{ mt: 2, minWidth: 350 }} justify-content="center">
									<InputLabel htmlFor="max-width">Taken Date</InputLabel>
									<Input id="takenDate" replacement="Select a date" />
								</FormControl>
							</Grid>
						</Grid>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Save</Button>
					<Button onClick={handleClose}>Close</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
}
