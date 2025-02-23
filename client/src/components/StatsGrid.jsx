import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useState, useEffect } from 'react';

const AnimatedCounter = ({ value, color }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 second animation
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span style={{ color }}>{count}</span>;
};

const StatsGrid = ({ stats }) => {
  const difficultyColors = {
    'EASY': '#00B8A3',
    'MEDIUM': '#FFA116',
    'HARD': '#FF375F'
  };

  const totalProblems = stats?.reduce((acc, curr) => acc + curr.count, 0) || 0;

  return (
    <Container>
      <TotalCard
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Total Problems Solved</h2>
        <CountAnimation>
          <AnimatedCounter value={totalProblems} color="#FFA116" />
        </CountAnimation>
      </TotalCard>

      <StatsContainer>
        {stats?.map((stat, index) => (
          <StatCard
            key={stat.difficulty}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
            style={{ borderColor: difficultyColors[stat.difficulty] }}
          >
            <StatContent>
              <StatCount>
                <AnimatedCounter 
                  value={stat.count} 
                  color={difficultyColors[stat.difficulty]} 
                />
              </StatCount>
              <StatInfo>
                <StatTitle>{stat.difficulty.charAt(0) + stat.difficulty.slice(1).toLowerCase()}</StatTitle>
                <StatPercentage style={{ color: difficultyColors[stat.difficulty] }}>
                  {totalProblems ? Math.round((stat.count / totalProblems) * 100) : 0}%
                </StatPercentage>
              </StatInfo>
            </StatContent>
          </StatCard>
        ))}
      </StatsContainer>
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem 0;
`;

const TotalCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  h2 {
    color: #FFA116;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const CountAnimation = styled.div`
  font-size: 4rem;
  font-weight: bold;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid;
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const StatCount = styled.div`
  font-size: 3.5rem;
  font-weight: bold;
`;

const StatInfo = styled.div`
  text-align: center;
`;

const StatTitle = styled.h3`
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const StatPercentage = styled.p`
  font-size: 1.1rem;
  font-weight: bold;
`;

export default StatsGrid; 