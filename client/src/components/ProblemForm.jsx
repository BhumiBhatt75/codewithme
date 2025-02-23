import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useState } from 'react';

const ProblemForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    difficulty: 'easy',
    dateCompleted: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      difficulty: 'easy',
      dateCompleted: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  return (
    <FormContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>Add New Problem</Title>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Input
            type="text"
            placeholder="Problem Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            whileFocus={{ scale: 1.02 }}
          />
        </InputGroup>

        <InputGroup>
          <Select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            whileFocus={{ scale: 1.02 }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </InputGroup>

        <InputGroup>
          <Input
            type="date"
            value={formData.dateCompleted}
            onChange={(e) => setFormData({ ...formData, dateCompleted: e.target.value })}
            required
            whileFocus={{ scale: 1.02 }}
          />
        </InputGroup>

        <InputGroup>
          <TextArea
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            whileFocus={{ scale: 1.02 }}
          />
        </InputGroup>

        <SubmitButton
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add Problem
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

// Add styled components...

export default ProblemForm; 