import { motion } from 'framer-motion';
import styled from 'styled-components';

const ProblemCard = ({ problem, onDelete }) => {
  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 }
    }
  };

  const difficultyColors = {
    easy: '#00B8A3',
    medium: '#FFA116',
    hard: '#FF375F'
  };

  return (
    <Card
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layoutId={problem.id.toString()}
      style={{ borderLeftColor: difficultyColors[problem.difficulty] }}
    >
      <CardContent>
        <Title>{problem.name}</Title>
        <Difficulty style={{ color: difficultyColors[problem.difficulty] }}>
          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
        </Difficulty>
        <Date>{new Date(problem.dateCompleted).toLocaleDateString()}</Date>
        {problem.notes && <Notes>{problem.notes}</Notes>}
        <DeleteButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(problem.id)}
        >
          Delete
        </DeleteButton>
      </CardContent>
    </Card>
  );
};

const Card = styled(motion.div)`
  background: ${props => props.theme.colors.cardBg};
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.textPrimary};
`;

const Difficulty = styled.p`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const Date = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const Notes = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
  margin-bottom: 1rem;
`;

const DeleteButton = styled(motion.button)`
  background: ${props => props.theme.colors.danger};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
`;

export default ProblemCard; 