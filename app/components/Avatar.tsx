'user client';

import Image from "next/image";

interface AvatarProps{
    src: String | null | undefined;
}

const Avatar: React.FC<AvatarProps> = ({src}) => {
    return ( 
        <Image
            className="rounded-full"
            height="30"
            width="30"
            alt="avatar"
            src={src || "/images/placeholder.jpg"}
        />
     );
}
 
export 
default Avatar;