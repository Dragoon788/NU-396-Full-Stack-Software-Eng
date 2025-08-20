interface butProps{
    src: string;
    srcName: string;
    link: string;
}

export default function Button( { src, srcName, link}: butProps){
    return(
        <a
        href={link}
        className="m-2 inline-block hover:opacity-50"
      >
        <img src={src} alt={`${srcName} image`} className="w-8 h-8" />
      </a>
    )
}
