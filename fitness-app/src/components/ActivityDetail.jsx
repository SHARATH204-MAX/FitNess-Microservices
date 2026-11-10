import { Alert, Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getActivity, getActivityDetail } from '../services/api';

const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 30;

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let retryTimer;

    const fetchActivityAndRecommendation = async () => {
      setIsLoading(true);
      setErrorMessage('');
      setRecommendation(null);

      try {
        const activityResponse = await getActivity(id);
        if (cancelled) return;
        setActivity(activityResponse.data);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load activity:', error);
          setErrorMessage('Could not load this activity. Please try again.');
          setIsLoading(false);
        }
        return;
      }

      for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
        if (cancelled) return;

        try {
          const response = await getActivityDetail(id);
          if (!cancelled) {
            setRecommendation(response.data);
            setIsLoading(false);
          }
          return;
        } catch (error) {
          // Older AI service instances return 500 instead of 404 while generation is pending.
          if (![404, 500].includes(error.response?.status)) {
            if (!cancelled) {
              console.error('Failed to load recommendation:', error);
              setErrorMessage('Could not load the recommendation. Please try again.');
              setIsLoading(false);
            }
            return;
          }
        }

        await new Promise((resolve) => {
          retryTimer = setTimeout(resolve, RETRY_DELAY_MS);
        });
      }

      if (!cancelled) {
        setErrorMessage('The recommendation is taking longer than expected.');
        setIsLoading(false);
      }
    };

    fetchActivityAndRecommendation();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, [id, retryCount]);

  if (!activity && isLoading) {
    return (
      <Box component="main" className="app-main detail-main">
        <CircularProgress aria-label="Loading activity" />
      </Box>
    );
  }

  if (!activity) {
    return (
      <Box component="main" className="app-main detail-main">
        <Button className="back-button" onClick={() => navigate('/activities')}>← Back to activities</Button>
        <Alert severity="error">{errorMessage}</Alert>
      </Box>
    );
  }

  const improvementItems = recommendation?.improvements ?? [];
  const suggestionItems = recommendation?.suggestions ?? [];
  const safetyItems = recommendation?.safety ?? [];

  return (
    <Box component="main" className="app-main detail-main">
      <Button className="back-button" onClick={() => navigate('/activities')}>
        <span aria-hidden="true">←</span> All activities
      </Button>

      <Box className="session-hero">
        <img
          className="session-hero-photo"
          src="/images/fitness-runner.jpg"
          alt=""
          aria-hidden="true"
        />
        <Box className="session-hero-overlay" />
        <Box className="session-hero-content">
          <Typography className="session-kicker">Workout complete</Typography>
          <Typography component="h1" className="session-title">
            {activity.type?.toLowerCase() || 'Activity'}
          </Typography>
          <Typography className="session-date">
            {activity.createdAt
              ? new Date(activity.createdAt).toLocaleString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })
              : 'Your latest training session'}
          </Typography>
        </Box>
        <Box className="session-hero-mark" aria-hidden="true">
          <svg width="35" height="35" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h4l2.2-6 4.1 12 2.2-6H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Box>
      </Box>

      <Box className="session-stat-grid" aria-label="Workout statistics">
        <Box className="session-stat-card">
          <Box className="session-stat-icon duration-stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          <Box>
            <Typography className="session-stat-label">Duration</Typography>
            <Typography className="session-stat-value">{activity.duration}<span>min</span></Typography>
          </Box>
        </Box>
        <Box className="session-stat-card">
          <Box className="session-stat-icon energy-stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M13.2 2.8c.5 3.2-1.6 4.2-1.6 6.5 0 1.1.8 1.9 1.8 1.9 1.4 0 2.1-1.3 2-2.6 2.1 1.6 3.6 4 3.6 6.4a7 7 0 1 1-14 0c0-3.1 1.8-5.8 4.9-8.3-.1 2.4.4 3.4 1.3 3.4 1 0 1.1-1.3 1.1-2.3 0-1.9.3-3.5.9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          <Box>
            <Typography className="session-stat-label">Energy burned</Typography>
            <Typography className="session-stat-value">{activity.caloriesBurned}<span>kcal</span></Typography>
          </Box>
        </Box>
        <Box className="session-stat-card">
          <Box className="session-stat-icon activity-stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 6h3v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          <Box>
            <Typography className="session-stat-label">Training type</Typography>
            <Typography className="session-stat-value session-type-value">
              {activity.type?.toLowerCase() || 'Activity'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {recommendation ? (
        <Box component="section" className="coaching-area">
          <Box className="coaching-heading">
            <Box className="coaching-heading-icon" aria-hidden="true">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                <path d="M12 3.5v3m0 11v3m8.5-8.5h-3m-11 0h-3m14.01-6.01-2.12 2.12m-7.78 7.78-2.12 2.12m12.02 0-2.12-2.12m-7.78-7.78L6.49 6.99M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </Box>
            <Box>
              <Typography component="h2" className="section-heading">Your coaching</Typography>
              <Typography className="section-description">Personalized insights to help you keep progressing.</Typography>
            </Box>
            <span className="coaching-ai-badge"><span /> AI INSIGHTS</span>
          </Box>

          <Box className="coaching-grid">
            <Box className="coaching-primary-column">
              <Card className="surface-card analysis-card">
                <CardContent className="coaching-card-content">
                  <Box className="coaching-card-heading">
                    <span className="coaching-section-number">01</span>
                    <Typography component="h3" className="coaching-card-title">Session analysis</Typography>
                  </Box>
                  <Typography className="recommendation-copy analysis-copy">
                    {recommendation.recommendation}
                  </Typography>
                </CardContent>
              </Card>

              {improvementItems.length > 0 && (
                <Card className="surface-card coaching-list-card">
                  <CardContent className="coaching-card-content">
                    <Box className="coaching-card-heading">
                      <span className="coaching-section-number">02</span>
                      <Box>
                        <Typography component="h3" className="coaching-card-title">Ways to improve</Typography>
                        <Typography className="coaching-card-subtitle">Build on what you did today.</Typography>
                      </Box>
                    </Box>
                    <Box className="coaching-item-list">
                      {improvementItems.map((improvement, index) => (
                        <Box className="coaching-item" key={index}>
                          <span className="coaching-item-marker">{String(index + 1).padStart(2, '0')}</span>
                          <Typography className="recommendation-copy">{improvement}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>

            <Box className="coaching-aside-column">
              {suggestionItems.length > 0 && (
                <Card className="surface-card coaching-list-card next-workout-card">
                  <CardContent className="coaching-card-content">
                    <Box className="coaching-card-heading">
                      <span className="coaching-section-number">03</span>
                      <Box>
                        <Typography component="h3" className="coaching-card-title">Try next</Typography>
                        <Typography className="coaching-card-subtitle">A few ideas for your next session.</Typography>
                      </Box>
                    </Box>
                    <Box className="coaching-item-list">
                      {suggestionItems.map((suggestion, index) => (
                        <Box className="coaching-item" key={index}>
                          <span className="coaching-dot" aria-hidden="true" />
                          <Typography className="recommendation-copy">{suggestion}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {safetyItems.length > 0 && (
                <Card className="safety-card">
                  <CardContent className="coaching-card-content">
                    <Box className="safety-heading">
                      <Box className="safety-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                          <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Box>
                      <Typography component="h3" className="coaching-card-title">Train safely</Typography>
                    </Box>
                    <Box className="safety-list">
                      {safetyItems.map((guideline, index) => (
                        <Typography className="safety-copy" key={index}>{guideline}</Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box className="surface-card detail-card" sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
          {isLoading && <CircularProgress size={24} />}
          <Alert severity="info" sx={{ flexGrow: 1 }}>
            {isLoading ? 'Generating your recommendation…' : errorMessage}
          </Alert>
          {!isLoading && (
            <Button onClick={() => setRetryCount((count) => count + 1)}>
              Retry
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

export default ActivityDetail;
