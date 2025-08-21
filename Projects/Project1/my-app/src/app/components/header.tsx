interface HeaderProps{
    name: string;
    title: string;
    des: string;
}

export default function Header({ name, title, des}: HeaderProps){
    return(
        <header className="flex flex-col justify-start bg-blue-700 mb-10">
            <h1 className="text-5xl font-bold m-2">{name}</h1>
            <h2 className="text-xl font-semi-bold m-2 mb-2">{title}</h2>
            <h3 className="text-md font-normal m-2 w-1/2">{des}</h3> 
        </header>
    )
}