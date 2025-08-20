import Header from '@/app/components/header';
import Bio from '@/app/components/bio';
import Experience from '@/app/components/experienceButton'
import Nav from '@/app/components/navButton'
import Proj from '@/app/components/projectButton'

export default function Home() {
  return (
    <div className="">
      {/* <Header name="Francis Velasco" 
      title="Software Engineering CS Student at Northwestern" 
      des="I'm so excited for this proj"
      /> */}
      <Bio/>

      <div className="flex flex-col p-5 ml-[50%] w-1/2 h-screen bg-green-700 p-10">
        <nav className="flex justify-center m-10">
          <Nav name="Contact" dest="contact"/>
          <Nav name="Kaibigan" dest="kaibigan"/>
        </nav>
        <p className="text-base mb-5">I’m a developer passionate about crafting accessible, pixel-perfect user interfaces that blend thoughtful design with robust engineering. My favorite work lies at the intersection of design and development, creating experiences that not only look great but are meticulously built for performance and usability.

Currently, I'm a Senior Front-End Engineer at Klaviyo, specializing in accessibility. I contribute to the creation and maintenance of UI components that power Klaviyo’s frontend, ensuring our platform meets web accessibility standards and best practices to deliver an inclusive user experience.

In the past, I've had the opportunity to develop software across a variety of settings — from advertising agencies and large corporations to start-ups and small digital product studios. Additionally, I also released a comprehensive video course a few years ago, guiding learners through building a web app with the Spotify API.

In my spare time, I’m usually climbing, reading, hanging out with my wife and two cats, or running around Hyrule searching for Korok seeds
</p>
        <h2 className="text-lg font-bold mb-4">Experience</h2>
        <div className="flex flex-col">
          <Experience startDate="July 2022" endDate="Present" position="Student" des="asdfasdfjawejfjasdfjasdjfajwejfjae"/>
          <Experience startDate="July 2022" endDate="Present" position="Student" des="asdfasdfjawejfjasdfjasdjfajwejfjae"/>
          <Experience startDate="July 2022" endDate="Present" position="Student" des="asdfasdfjawejfjasdfjasdjfajwejfjae"/>
          <Experience startDate="July 2022" endDate="Present" position="Student" des="asdfasdfjawejfjasdfjasdjfajwejfjae"/>
          <Experience startDate="July 2022" endDate="Present" position="Student" des="asdfasdfjawejfjasdfjasdjfajwejfjae"/>
          <Experience startDate="July 2022" endDate="Present" position="Student" des="asdfasdfjawejfjasdfjasdjfajwejfjae"/>
          <Experience startDate="July 2022" endDate="Present" position="Student" des="asdfasdfjawejfjasdfjasdjfajwejfjae"/>
        </div>
        <h2 className="text-lg font-bold mb-4">Projects</h2>
        <div className="flex flex-col">
          <Proj projName="Web App" des="asdfasdfjawejfjasdfjasdjfajwejfjae" src="Kaibigan1.jpg"/>
          <Proj projName="Web App" des="asdfasdfjawejfjasdfjasdjfajwejfjae" src="Kaibigan1.jpg"/>
          <Proj projName="Web App" des="asdfasdfjawejfjasdfjasdjfajwejfjae" src="Kaibigan1.jpg"/>
          <Proj projName="Web App" des="asdfasdfjawejfjasdfjasdjfajwejfjae" src="Kaibigan1.jpg"/>
          <Proj projName="Web App" des="asdfasdfjawejfjasdfjasdjfajwejfjae" src="Kaibigan1.jpg"/>
          <Proj projName="Web App" des="asdfasdfjawejfjasdfjasdjfajwejfjae" src="Kaibigan1.jpg"/>
        </div>
        <footer className="flex justify-right hover:opacity-50"><a href="https://brittanychiang.com/"
        className="m-2 inline-block hover:opacity-50">Inspired by Brittany Chiang's Web Portfolio</a></footer>



      </div>


    </div>
  );
}
