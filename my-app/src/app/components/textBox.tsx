'use client';
import { useTextContext } from '@/app/contexts/textContext';
import { useState } from 'react';


export default function Textbox() {
    const { text, setText } = useTextContext();
    const [input, setInput] = useState("");
    return (
        <>
            <h2 className="text-lg mb-5">Input roles you are looking to fill</h2>
            <form
                className="flex flex-col justify-start mb-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    setText(text + input + ", ");
                    setInput("");
                }}
            >
                <input 
                    id="skills"
                    name="skills input box"
                    value={input}
                    onChange={(e) => setInput(e.target.value)} 
                    className="w-1/2 text-lg text-black bg-white"
                />
            </form>    
        </>


    );
}