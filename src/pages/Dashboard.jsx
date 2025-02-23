import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatsGrid from '../components/StatsGrid';
import ProblemForm from '../components/ProblemForm';
import ProblemsList from '../components/ProblemsList';
import { slideUp } from '../animations';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(location.state?.stats || null);
  const username = localStorage.getItem('leetcode_username');

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    if (!stats) {
      fetchStats();
    }
  }, [username]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/leetcode-stats/${username}`);
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <Container
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={slideUp}
    >
      <Navbar />
      <Content>
        <Header>
          <HeaderContent>
            <Logo src="https://leetcode.com/static/images/LeetCode_logo.png" alt="LeetCode Logo" />
            <Title>My LeetCode Progress</Title>
            <Username>{username}</Username>
          </HeaderContent>
        </Header>

        <StatsGrid stats={stats?.data.matchedUser.submitStats.acSubmissionNum} />

        <Grid>
          <ProblemForm />
          <ProblemsList />
        </Grid>
      </Content>
    </Container>
  );
};

// Add styled components...

export default Dashboard; 