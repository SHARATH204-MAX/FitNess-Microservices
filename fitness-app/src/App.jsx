import { Box, Button, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router";
import { setCredentials } from "./store/authSlice";
import ActivityForm from "./components/ActivityForm";
import ActivityList from "./components/ActivityList";
import ActivityDetail from "./components/ActivityDetail";
import "./App.css";

const ActivitiesPage = ({ userId }) => {
  const [activityListKey, setActivityListKey] = useState(0);
  const [dashboardActivities, setDashboardActivities] = useState(null);
  const activities = dashboardActivities ?? [];
  const totalDuration = activities.reduce((total, activity) => total + (Number(activity.duration) || 0), 0);
  const totalCalories = activities.reduce((total, activity) => total + (Number(activity.caloriesBurned) || 0), 0);
  const recentActivities = [...activities]
    .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
    .slice(0, 6)
    .reverse();
  const maxDuration = Math.max(...recentActivities.map((activity) => Number(activity.duration) || 0), 1);

  return (
    <Box component="main" className="app-main">
      <Typography className="page-eyebrow">Your fitness, in focus</Typography>
      <Typography component="h1" className="page-heading">Activity dashboard</Typography>
      <Typography className="page-subtitle">
        Build healthy momentum, track every session, and get coaching tailored to your effort.
      </Typography>

      <Box className="dashboard-hero">
        <img
          className="hero-photo"
          src="/images/workout-gym.jpg"
          alt="Athlete training with free weights in a gym"
          loading="lazy"
        />
        <Box className="hero-copy">
          <Typography className="hero-kicker">Small steps. Strong habits.</Typography>
          <Typography component="h2" className="hero-title">Make today count.</Typography>
          <Typography className="hero-description">
            Log a workout to see your progress and get a personalized recommendation for what to do next.
          </Typography>
        </Box>
        <Box className="hero-badge" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h4l2.2-6 4.1 12 2.2-6H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Box>
        <Box className="hero-visual-chip" aria-hidden="true">
          <span className="hero-chip-icon">↗</span>
          <span>STRONGER EVERY SESSION</span>
        </Box>
      </Box>

      <Box component="section" className="stats-section" aria-label="Activity summary">
        <Box className="stat-card">
          <Box className="stat-icon stat-icon-sessions" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.7" />
              <path d="M8 3v4m8-4v4M4 10h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </Box>
          <Box>
            <Typography className="stat-label">Sessions logged</Typography>
            <Typography className="stat-value">
              {dashboardActivities === null ? '—' : activities.length}
            </Typography>
          </Box>
        </Box>
        <Box className="stat-card">
          <Box className="stat-icon stat-icon-duration" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          <Box>
            <Typography className="stat-label">Active minutes</Typography>
            <Typography className="stat-value">
              {dashboardActivities === null ? '—' : totalDuration}
              <span className="stat-unit">min</span>
            </Typography>
          </Box>
        </Box>
        <Box className="stat-card">
          <Box className="stat-icon stat-icon-calories" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M13.2 2.8c.5 3.2-1.6 4.2-1.6 6.5 0 1.1.8 1.9 1.8 1.9 1.4 0 2.1-1.3 2-2.6 2.1 1.6 3.6 4 3.6 6.4a7 7 0 1 1-14 0c0-3.1 1.8-5.8 4.9-8.3-.1 2.4.4 3.4 1.3 3.4 1 0 1.1-1.3 1.1-2.3 0-1.9.3-3.5.9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          <Box>
            <Typography className="stat-label">Energy burned</Typography>
            <Typography className="stat-value">
              {dashboardActivities === null ? '—' : totalCalories}
              <span className="stat-unit">kcal</span>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box component="section" className="rhythm-card">
        <Box className="rhythm-copy">
          <Typography className="section-heading">Your recent rhythm</Typography>
          <Typography className="section-description">
            {recentActivities.length > 0
              ? 'Workout duration across your latest sessions.'
              : 'Your recent workouts will appear here as you log sessions.'}
          </Typography>
        </Box>
        {recentActivities.length > 0 ? (
          <Box
            className="rhythm-chart"
            role="img"
            aria-label={`Recent workout durations: ${recentActivities.map((activity) => `${activity.type?.toLowerCase() || 'activity'} ${activity.duration} minutes`).join(', ')}`}
          >
            {recentActivities.map((activity, index) => {
              const duration = Number(activity.duration) || 0;
              const height = Math.max(12, Math.round((duration / maxDuration) * 100));
              return (
                <Box className="rhythm-column" key={activity.id || `${activity.type}-${index}`}>
                  <Typography className="rhythm-duration">{duration}</Typography>
                  <Box className="rhythm-track">
                    <Box className="rhythm-bar" sx={{ height: `${height}%` }} />
                  </Box>
                  <Typography className="rhythm-label">{activity.type?.slice(0, 3).toUpperCase() || 'ACT'}</Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box className="rhythm-empty" aria-hidden="true">
            <span className="rhythm-empty-line" />
            <span className="rhythm-empty-line" />
            <span className="rhythm-empty-line" />
            <span className="rhythm-empty-line" />
            <span className="rhythm-empty-line" />
            <span className="rhythm-empty-line" />
          </Box>
        )}
      </Box>

      <Box component="section" className="surface-card form-card">
        <Box className="form-heading">
          <Typography component="h2" className="section-heading">Log an activity</Typography>
          <Typography className="section-description">A few details are all it takes to get started.</Typography>
        </Box>
        <ActivityForm
          userId={userId}
          onActivityAdded={() => {
            setDashboardActivities(null);
            setActivityListKey((key) => key + 1);
          }}
        />
      </Box>

      <Box component="section" className="list-section">
        <Box className="list-heading-row">
          <Box>
            <Typography component="h2" className="section-heading">Your activities</Typography>
            <Typography className="section-description">Select a session to see its details and coaching.</Typography>
          </Box>
        </Box>
        <ActivityList key={activityListKey} onActivitiesLoaded={setDashboardActivities} />
      </Box>
    </Box>
  );
};

const Brand = () => (
  <Box className="brand" aria-label="FitNess home">
    <Box className="brand-mark" aria-hidden="true">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
        <path d="M3 12h4l2.2-6 4.1 12 2.2-6H21" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
    <span>FitNess</span>
  </Box>
);

function App() {
  const { token, tokenData, logIn, logOut } = useContext(AuthContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && tokenData) {
      dispatch(setCredentials({token, user: tokenData}));
    }
  }, [token, tokenData, dispatch]);

  return (
    <Router>
      {!token ? (
        <Box className="auth-page">
          <Box component="section" className="auth-story">
            <Brand />
            <Box className="auth-story-copy">
              <Typography className="hero-kicker">A healthier rhythm starts here</Typography>
              <Typography component="h1" className="auth-story-title">
                Move with purpose. Feel the difference.
              </Typography>
              <Typography className="auth-story-description">
                Make your workouts count with simple tracking and thoughtful coaching built around you.
              </Typography>
            </Box>
            <Typography className="auth-story-footer">Your personal space for progress.</Typography>
          </Box>
          <Box component="main" className="auth-panel">
            <Box className="auth-card">
              <Brand />
              <Typography component="h2" className="auth-card-title">Welcome back</Typography>
              <Typography className="auth-card-description">
                Sign in to pick up where you left off and keep your momentum going.
              </Typography>
              <Button className="auth-login-button" variant="contained" onClick={logIn}>
                Continue to sign in
              </Button>
              <Typography className="auth-card-description" sx={{ mt: 2, mb: 0, textAlign: "center" }}>
                Secure sign-in powered by your account provider
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box className="app-shell">
          <Box component="header" className="topbar">
            <Brand />
            <Box className="topbar-actions">
              <Typography className="account-label">
                {tokenData?.given_name ? `Hi, ${tokenData.given_name}` : "Your account"}
              </Typography>
              <Button variant="outlined" onClick={logOut} size="small">
                Sign out
              </Button>
            </Box>
          </Box>
              <Routes>
                <Route path="/activities" element={<ActivitiesPage userId={tokenData?.sub} />} />
                <Route path="/activities/:id" element={<ActivityDetail />} />
                <Route path="/" element={<Navigate to="/activities" replace />} />
              </Routes>
        </Box>
      )}
    </Router>
  );
}

export default App