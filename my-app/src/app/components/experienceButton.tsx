import Lang from '@/app/components/languageButton';

interface expProps{
    startDate: number|string;
    endDate: number|string;
    position: string;
    des: string;
}

export default function Experience( { startDate, endDate, position, des }: expProps){
    return(
        <div className="flex flex-row justify-start bg-orange-700 w-full h-min m-3">
            <h3 className="text-sm mr-10">{startDate}-{endDate}</h3>
            <div className="flex flex-col">
                <h1 className="mb-2 text-xl font-normal text-white">{position}</h1>
                <p className="mb-3 text-md font-normal text-white">{des}</p>
                <div className="flex flex-row">
                    <Lang langName="Python"/>
                    <Lang langName="JavaScript"/>
                    <Lang langName="Racket"/>
                </div>
            </div>

        </div>

    )
}

