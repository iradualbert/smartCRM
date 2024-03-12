import { FaCheck } from "react-icons/fa";
import { PlanCardProps } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PlanCard = ({ features, color, title, description, btnText, price }: PlanCardProps) => {
    return (
        <div
            style={{ border: `2px solid ${color}` }}
            className="flex min-h-[428px] w-[320px] flex-col rounded-3xl p-8"
        >
            <h2 className="mb-5 text-xl font-medium">{title}</h2>
            <div className="mb-5 flex items-end text-3xl">
                {price ? (
                    <div>${price} / month</div>
                ) : 'Free'}
            </div>
            <p className="mb-5">{description}</p>
            <ul className="mb-10 flex-col gap-4">
                {features.map(feature => (
                    <li key={feature} className="flex items-center justify-start gap-2">
                        <FaCheck />
                        {feature}
                    </li>
                ))}
            </ul>
            <div className="mt-auto rounded-xl py-3 px-6 text-lg">
                <Link to="/signup">
                    <Button type="button" size="lg">{btnText}</Button>
                </Link>
            </div>

        </div>
    )
}

export default PlanCard;