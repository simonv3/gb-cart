import styled from "@emotion/styled";

export const Select = styled.select`
  width: 100%;
  margin-bottom: 16px;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  color: #333;
  font-size: 1rem;
  background-color: #f9f9f9;

  option {
    font-size: 1rem;
    padding: 0.5rem;
  }
`;

export const Button = styled.button`
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 0.6em 1.2em;
  display: inline-block;
  color: #333;
  background-color: #f9f9f9;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: #e6e6e6;
  }
`;

export const Input = styled.input`
  padding: 0.6em 1.2em;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

export const UL = styled.ul`
  list-style: none;
  border-left: 5px solid #eee;
  margin: 0;
  padding: 0.5rem 0 0.5rem 2rem;
`;

export const LI = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  margin-top: 1rem;
`;

export const ProductName = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

export const Quantity = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  margin-top: 8px;
`;

export const TDNumber = styled.td`
  text-align: right;
  font-family: monospace;
  font-size: 1.2em;
`;

export const SuccessContainer = styled.div`
  margin-top: 10px;
  background-color: #e6ffe6;
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
`;

export const P = styled.p`
  padding-bottom: 0.5rem;
`;

export const CartFooter = styled.div`
  margin-top: 20px;
  gap: 1rem;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: top;
`;

export const AppContainer = styled.form`
  max-width: 500px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: sans-serif;
`;

export const Section = styled.section`
  margin-bottom: 2rem;
`;
