'use client';
import Header from '@/app/components/header';
import Button from '@/app/components/imgButton';
import Textbox from '@/app/components/textBox';
import { useTextContext } from '@/app/contexts/textContext';


interface BioProps{
    // title: string|number;
}


export default function Bio({ }: BioProps){
    const { text, setText } = useTextContext();
    return(
        <div className="w-1/2 bg-red-700 h-full fixed left-0 top-0 z-10 p-10">
            <Header name="Francis Velasco" 
            title="Full Stack Software Engineer" 
            des="Northwestern Computer Science student with a degree soon!"
            />
            <p className="text-3xl mt-25 mb-25 blinking-cursor h-30">{text}</p>
            <Textbox/>
            <footer className="flex flex-row justify-start">
                <Button src="githubicon.png" srcName="Github" link="https://github.com/Dragoon788"/>
                <Button src="LinkedInicon.png" srcName="LinkedIn" link="https://www.linkedin.com/in/francis-velasco-a53ba8242/"/>
            </footer>

            
        </div>
    )
}
