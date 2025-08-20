'use client';

import {
    createContext,
    ReactNode,
    useContext,
    useState,
    Dispatch,
  } from 'react';
  
  interface TextContextProviderProps {
    children: ReactNode;
  }
  
  interface Textbox {
    text: string;
    setText: Dispatch<any>;
  }
  
  // Module is important in allowing different views of color
  // Color and setcolor are now exposed
  const TextContext = createContext<Textbox>({
    text: '',
    setText: () => {},
  });
  
  export const useTextContext = () => useContext(TextContext);
  
  // exported as a component that can wrap in app html lines
  export default function TextContextProvider({
    children,
  }: TextContextProviderProps) {
    const [text, setText] = useState('Your go to... Full-Stack software engineer, team leader, ');
  
    return (
      <TextContext.Provider value={{ text, setText }}>
        {children}
      </TextContext.Provider>
    );
  }