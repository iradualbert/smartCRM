import PlanCard from "./PlanCard";
import { pricingPlans } from "@/lib/config";

const Plans = () => {
    return (
        <div className="flex flex-col p-4 items-center">
            <div className="mb-2 mt-12 text-center">
                <h1 className="mb-4 text-7xl">Pricing</h1>
                <p className="text-lg">Choose the right plan for your business</p>
            </div>
            <div className="flex flex-col xl:flex-row md:flex-row gap-8 p-10">
                {pricingPlans.map(plan => <PlanCard key={plan.title} {...plan}/>)}
            </div>
        </div>
    )
}

export default Plans