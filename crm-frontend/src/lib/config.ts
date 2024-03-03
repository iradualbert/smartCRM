import { PlanCardProps } from "./types"

export const siteConfig = {}

export const pricingPlans: PlanCardProps[] = [
    {
        title:"Free",
        description: "Get Started",
        features: [
            "100 emails/day",
            "schedule 10 emails at once",
            "unlimited templates",
            "100 contacts",
            "daily emails automation",
        ],
        color: "grey",
        btnText: "Get Started",
        price: "0",
    },
    {
        title:"Pro",
        description: "Small growing Business",
        features: [
            "10k emails per month",
            "schedule 100 emails at once",
            "unlimited templates",
            "10k contacts",
            "daily emails automation",
            "email rescheduling"
        ],
        color: "grey",
        btnText: "Get Started",
        price: "10",
    },
    {
        title:"Enterprise",
        description: "Sales & Marketing Professionals",
        features: [
            "10k emails per month",
            "schedule 100 emails at once",
            "unlimited templates",
            "10k contacts",
            "daily emails automation",
            "email rescheduling"
        ],
        color: "grey",
        btnText: "Get Started",
        price: "20",
    },

]