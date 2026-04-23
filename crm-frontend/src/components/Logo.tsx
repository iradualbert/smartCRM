import BeinparkLogo from "@/assets/beinpark-logo.png";

const Logo = ({ className = "h-12 w-auto" }: { className?: string }) => {
    return (
        <img src={BeinparkLogo} className={className} alt="Beinpark" />
    )
}


export default Logo
