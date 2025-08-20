interface langProps{
    langName: string;
}

export default function Lang( { langName }: langProps){
    return(
        <div className="bg-blue-700/70 rounded-full px-3 py-1 text-sm text-white w-min mr-2">{langName}</div>
    )
}
