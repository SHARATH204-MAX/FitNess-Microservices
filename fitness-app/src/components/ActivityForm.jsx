import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React, { useState } from 'react'
import { addActivity } from '../services/api'


const ActivityForm = ({ userId, onActivityAdded }) => {

    const [activity, setActivity] = useState({
        type: "RUNNING", duration: '', caloriesBurned: '',
        additionalMetrics: {}
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            setErrorMessage('Could not identify your account. Please sign in again.');
            return;
        }

        setErrorMessage('');
        setIsSubmitting(true);
        try {
            await addActivity({
                ...activity,
                userId,
                duration: Number(activity.duration),
                caloriesBurned: Number(activity.caloriesBurned),
            });
            onActivityAdded();
            setActivity({ type: "RUNNING", duration: '', caloriesBurned: '', additionalMetrics: {} });
        } catch (error) {
            console.error('Failed to add activity:', error);
            const message = error.response?.data?.message;
            setErrorMessage(typeof message === 'string' ? message : 'Could not add activity. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <Box component="form" className="activity-form" onSubmit={handleSubmit}>
      <Box className="form-fields">
    <FormControl fullWidth>
        <InputLabel>Activity Type</InputLabel>
        <Select
            label="Activity Type"
            value={activity.type}
            onChange={(e) => setActivity({...activity, type: e.target.value})}>
                <MenuItem value="RUNNING">Running</MenuItem>
                <MenuItem value="WALKING">Walking</MenuItem>
                <MenuItem value="CYCLING">Cycling</MenuItem>
            </Select>
    </FormControl>
    <TextField fullWidth
                label="Duration (Minutes)"
                type='number'
                required
                slotProps={{ htmlInput: { min: 1 } }}
                value={activity.duration}
                onChange={(e) => setActivity({...activity, duration: e.target.value})}/>

<TextField fullWidth
                label="Calories Burned"
                type='number'
                required
                slotProps={{ htmlInput: { min: 0 } }}
                value={activity.caloriesBurned}
                onChange={(e) => setActivity({...activity, caloriesBurned: e.target.value})}/>

      <Button className="form-submit" type='submit' variant='contained' disabled={isSubmitting}>
        {isSubmitting ? 'Adding Activity...' : 'Add activity'}
      </Button>
      </Box>
      {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
  </Box>
  )
}

export default ActivityForm