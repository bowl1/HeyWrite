import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: 3rem;
  gap: 5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    gap: 2rem;
    margin-top: 1rem;
   
  }
`;

export const ChatBox = styled.div`
  background-color: white;
  padding: 3rem;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const Title = styled.h1`
  font-family: "Poppins", sans-serif;
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  color: #1d4ed8;
  margin-bottom: 2rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.5);
  }

  @media (max-width: 768px) {
    font-size: 1.7rem;
    
  }
`;

export const IntentTextarea = styled.textarea`
  width: 100%;
  padding: 1.2rem;
  font-size: 1.1rem;
  border: 1px solid #93c5fd;
  border-radius: 0.75rem;
  resize: vertical;
  outline: none;
  transition: 0.2s border ease-in-out;
  box-sizing: border-box;
  overflow: auto;
  margin-bottom: 1.5rem;
  font-family: inherit;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #bfdbfe;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.8rem;
  }
`;

export const Selectors = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const SelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
`;

export const StyledSelect = {
  container: (base) => ({
    ...base,
    width: '100%', // 这一层包裹整个组件
  }),
  control: (base, state) => ({
    ...base,
    width: '100%',
    padding: '0.2rem', // React-Select 的 padding 是在 control 外部元素设置的
    fontSize: '1rem',
    borderRadius: '0.5rem',
    borderColor: state.isFocused ? '#2563eb' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 2px #bfdbfe' : 'none',
    outline: 'none',
    '@media (max-width: 768px)': {
      fontSize: '0.8rem',
      padding: '0.1rem',
    },
  }),
  option: (base) => ({
    ...base,
    fontSize: '1rem',
    '@media (max-width: 768px)': {
      fontSize: '0.8rem',
    },
  }),
};

export const GenerateButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 3rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;

  }
`;

export const GenerateButton = styled.button`
  width: 100%;
  background-color: #2563eb;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #1e40af;
  }

  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.5rem 0.8rem;
    max-width: 80%;
    margin: 0 auto;
  }
`;

export const ResponseBox = styled.div`
  margin-top: 3rem;
`;

export const ResponseTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0rem;
  color: #374151;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const ResponseText = styled.div`
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  white-space: pre-line;
  line-height: 1.6;
  font-size: 1.05rem;
  color: #111827;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 1rem;
    line-height: 1.4;
  }
`;

export const ResponseControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
`;

export const Button = styled.button`
  background-color: #2563eb;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.5rem 0.8rem;
  }
`;

export const UndoButton = styled(Button)`
  }
`;

export const ResetButton = styled(Button)`
  margin-left: auto;
`;

export const CopyButton = styled(Button)`
  display: block;
  margin-left: auto;
`;

export const HistoryPanel = styled.div`
  background-color: white;
  padding: 3rem;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const Message = styled.div`
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 5px;
  background-color: ${(props) =>
    props.role === "user" ? "#e0f7fa" : "#fff3e0"};
`;