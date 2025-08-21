import Nav from '@/app/components/navButton'


export default function Home() {

    return (
        <div className="flex flex-col p-5 w-full h-screen bg-green-700 p-10">
            <nav className="flex justify-center m-10">
                <Nav name="Home" dest=""/>
                <Nav name="Contact" dest="contact"/>
            </nav>
            <h1 className="flex text-4xl font-bold justify-center m-5">Kaibigan</h1>
            <p className="flex text-center w-150 mx-auto">Kaibigan has been one the most important things about my time at Northwestern. Finding a Filipino community on campus as well as growing that over the last four years has taught me so much in terms of how to manage people, cultivate a community, and handle issues within the community. In the time that 4 years that I've been a part of this organization, we've grown our general body membership 4x, produced two shows with over 40 committee members, led an executive board of 10 individuals as President of Kaibigan, and organized Midwest Filipino-American Conference with over 700 attendees.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 m-10">
                <img className="w-80 h-50 max-w-lg rounded-lg mx-auto" src="Kaibigan1.jpg" alt="Kaibgian1" />
                <img className="w-80 h-50 max-w-lg rounded-lg mx-auto" src="Kaibigan2.jpg" alt="Kaibigan2" />
                <img className="w-80 h-50 max-w-lg rounded-lg mx-auto" src="Kaibigan3.jpg" alt="Kaibigan3" />
                <img className="w-80 h-50 max-w-lg rounded-lg mx-auto" src="Kaibigan4.jpg" alt="Kaibigan4" />
                <img className="w-80 h-50 max-w-lg rounded-lg mx-auto" src="Kaibigan5.jpg" alt="Kaibigan5" />
                <img className="w-80 h-50 max-w-lg rounded-lg mx-auto" src="Kaibigan6.jpg" alt="Kaibigan6" />
            </div>
        </div>
    );
}
