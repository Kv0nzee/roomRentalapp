'use client';

interface ContainerProps {
  children: React.ReactNode
};

const Container: React.FC<ContainerProps> = ({ children }) => {
    return ( 
        <div className="max-w-[2250px] mx-auto xl:px-20 md:-x-10 sm:-px-2 px-4">
            {children}
        </div>
     );
}
 
export default Container;