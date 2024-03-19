import BeinparkLogo from "@/assets/beinpark-logo.png";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";


const HeaderLogo = () => {
  return (
    <Link to="/">
      <div className="hover:opacity-75 transition items-center gap-x-2 hidden md:flex">
        <img
          src={BeinparkLogo}
          alt="Logo"
          height={20}
          width={20}
        />
        <p className={cn(
          "text-xl text-neutral-700 pb-1"
        )}>
          Beinpark
        </p>
      </div>
    </Link>
  );
};

export default HeaderLogo