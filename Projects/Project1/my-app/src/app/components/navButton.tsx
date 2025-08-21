import Link from 'next/link';

interface navProps{
    name: string;
    dest: string;
}

export default function Nav( { name, dest }: navProps){
    return(
        <Link
            href={`/${dest}`}
            className="inline-block m-3 hover:opacity-50"
        >
            {name} 
        </Link>
    )
}
