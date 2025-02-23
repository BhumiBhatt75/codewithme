import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fadeIn } from '../animations';

const LandingPage = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/leetcode-stats/${username}`);
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('leetcode_username', username);
        navigate('/dashboard', { state: { stats: data } });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeIn}
    >
      <LoginBox>
        <Logo 
          src="https://leetcode.com/static/images/LeetCode_logo.png" 
          alt="LeetCode Logo"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <Title>LeetCode Progress Tracker</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Enter your LeetCode username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Started'}
          </Button>
        </Form>
      </LoginBox>
    </Container>
  );
};

const Container = styled(motion.div)`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.colors.darkerBg};
`;

// Add other styled components...

export default LandingPage; 