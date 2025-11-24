import React from "react";


const Navbar : React.FC = () => {



    return(
        <div className="">
            <div className="fixed w-full top-0 bg-white z-10 flex justify-center items-center shadow-lg px-[2rem] py-[1rem]">
                <div className="w-full">
                    {/* navbar logo container */}
                    <div className="cursor-pointer select-none">
                        <h1 className="text-[1.5rem] font-semibold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">B2PTeachers</h1>
                    </div>
                </div>
                <div className="hidden md:block">
                   
                </div>
                <div className="block md:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>
            </div>
            <div className="w-full h-[80px]"></div>
        </div>
    );
};



export default Navbar;