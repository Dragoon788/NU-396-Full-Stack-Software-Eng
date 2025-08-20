'use client';
import Nav from '@/app/components/navButton'
import { useState } from 'react';


export default function Home() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    return (
        <div className="flex flex-col p-5 w-full h-screen bg-green-700 p-10">
            <nav className="flex justify-center m-10">
            <Nav name="Home" dest=""/>
            <Nav name="Kaibigan" dest="kaibigan"/>
            </nav>
            <h1 className="flex text-4xl font-bold justify-center m-5">Contact Me</h1>
            <p className="flex justify-center">Please contact me directly at francisvelasco2025@u.northwestern.edu or through this form.</p>
            <form
                className="flex flex-row justify-center mb-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    setEmail("");
                }}
            >
                <input 
                    id="email_submission_form"
                    name="email submission"
                    value={email}
                    placeholder="Your Email"
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-75 text-md text-black bg-white"
                />
            </form>      
            <form
                className="flex flex-row justify-center mb-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    setMessage("");
                }}
            >
                <input 
                    id="message_submission_form"
                    name="message submission"
                    value={message}
                    placeholder="Your Message"
                    onChange={(e) => setMessage(e.target.value)} 
                    className="w-125 h-40 text-md text-black bg-white"
                />
            </form>     
        </div>
    );
}
