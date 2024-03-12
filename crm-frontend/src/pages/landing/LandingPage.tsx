import { Link } from "react-router-dom";
import PricingPlans from "./Plans";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
    return (
        <div className="h-full ">
            <PageTitle title="The ultimate platform for success" />
            <main className="pt-20 pb-2">
                <div className="flex flex-col items-start my-12 ml-6 md:ml-32  gap-4">
                    <h1 className="text-3xl md:text-6xl text-neutral-800 mb-4">Beinpark</h1>
                    <p className="text-sm md:text-xl text-neutral-400 mt-4 max-w-xs md:max-w-2xl text-start">
                        The ultimate tool for Email Automation, Scheduling, Booking, and Reservation
                    </p>
                    <div className="flex gap-6">
                        <Link to="/login">
                            <Button size="lg" variant="secondary">Log In</Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg">Sign Up</Button>
                        </Link>
                    </div>

                </div>
                <div className="flex items-center justify-center flex-col bg-slate-100 py-8 gap-6">
                    <div className="flex items-center justify-center flex-col gap-6">
                        <div className="mb-4 flex items-center border shadow-sm p-4 bg-amber-100 text-amber-700 rounded-full uppercase">
                            <div className="h-6 w-6 mr-2" />
                            10 emails scheduled at 10:45 AM 
                        </div>
                        <h1 className="text-3xl md:text-5xl text-center text-neutral-800 mb-6">
                            Beinpark helps your Business
                        </h1>
                        <div className="text-3xl md:text-6xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-4 p-2 rounded-md pb-4 w-fit">
                            Move Faster
                        </div>
                    </div>
                    <div className="text-sm md:text-xl text-neutral-400 mt-4 max-w-xs md:max-w-2xl text-center mx-auto">
                        Manage your emails, and reach out to our
                        Convert your leads into Sales,
                        Track your leads easily,
                        Accomplish it all with BeinPark
                    </div>
                    <Link to="/dashboard">
                        <Button size="lg">Get Started for Free</Button>
                    </Link>
                </div>

                <div className="flex items-center justify-center flex-col py-12 gap-6">
                    <h1 className="text-3xl md:text-6xl text-neutral-800 mb-4">Integration</h1>
                    <ul className="flex items-center justify-center gap-4 text-2xl font-light flex-wrap">
                        <li>GMAIL</li>
                        <li>Yahoo Mail</li>
                        <li>Yandex Mail</li>
                        <li>SMTP</li>
                    </ul>
                </div>
                <PricingPlans />
            </main>

        </div>

    )
}

export default LandingPage;