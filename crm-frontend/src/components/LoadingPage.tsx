import { Loader2 } from "lucide-react";
import BeinparkLogo from "@/assets/beinpark-logo.svg";

const LoadingPage = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-100 flex flex-col items-center justify-center">
            <img src={BeinparkLogo} alt="Beinpark" className="block w-32" />
            <div className="flex gap-4 items-center justify-center">
                <Loader2 className='animate-spin' size={40} />
                <p>Loading..</p>
            </div>

        </div>
    );
};


export default LoadingPage