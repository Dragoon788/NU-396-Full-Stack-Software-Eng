interface projProps{
    projName: string;
    des: string;
    src: string;
}

export default function Project( { projName, des }: projProps){
    return(
        <div className="flex flex-row justify-start bg-orange-700 w-full h-min m-3">
            <img className="w-30 h-20 max-w-lg rounded-lg border-gray-700 mr-10" src="Kaibigan1.jpg" alt="Kaibigan1"></img>
            <div className="flex flex-col">
                <h1 className="mb-2 text-xl font-normal text-white">{projName}</h1>
                <p className="mb-3 text-md font-normal text-white">{des}</p>
            </div>

        </div>

    )
}

