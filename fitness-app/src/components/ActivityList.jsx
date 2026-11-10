import { Alert, Box, Card, CardActionArea, CardContent, CircularProgress, Typography } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import { getActivities } from '../services/api';

const ActivityList = ({ onActivitiesLoaded }) => {
  const [activities, setActivities] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchActivities = useCallback(async () => {
    try {
      const response = await getActivities();
      setActivities(response.data);
      setErrorMessage('');
      onActivitiesLoaded?.(response.data);
    } catch (error) {
      console.error('Failed to load activities:', error);
      setErrorMessage('Could not load your activities. Please try again.');
      onActivitiesLoaded?.(null);
    } finally {
      setIsLoading(false);
    }
  }, [onActivitiesLoaded]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);
  return (
    <>
      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
      {isLoading && <CircularProgress size={24} aria-label="Loading activities" />}
      {!isLoading && !errorMessage && activities.length === 0 && (
        <Alert className="empty-state" severity="info" sx={{ mb: 2 }}>
          No activities yet. Add an activity above to get a personalized recommendation.
        </Alert>
      )}
      <Box className="activity-grid">
        {activities.map((activity) => (
            <Card key={activity.id} className="activity-card">
              <CardActionArea
                onClick={() => navigate(`/activities/${activity.id}`)}
                aria-label={`View ${activity.type?.toLowerCase() || 'activity'} details`}
                sx={{ height: '100%', borderRadius: 'inherit' }}
              >
                <CardContent className="activity-card-content">
                  <Box className="activity-card-top">
                    <Box className="activity-type-icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 12h4l2.2-6 4.1 12 2.2-6H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Box>
                    <Typography className="activity-open-label">VIEW DETAILS&nbsp; ↗</Typography>
                  </Box>
                  <Typography className="activity-type">{activity.type?.toLowerCase() || 'Activity'}</Typography>
                  <Box className="activity-meta">
                    <Typography component="span">{activity.duration} min</Typography>
                    <Typography component="span">{activity.caloriesBurned} kcal</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
        ))}
      </Box>
    </>
  )
}

export default ActivityList