import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import PricingPlans from "./Plans";

const LandingPage = () => {
    return (
        <div className="h-full ">
            <main className="pt-20 pb-2">
                <div className="flex flex-col items-start my-12 ml-32 gap-4">
                    <h1 className="text-3xl md:text-6xl text-neutral-800 mb-4">smartCRM</h1>
                    <p className="text-sm md:text-xl text-neutral-400 mt-4 max-w-xs md:max-w-2xl text-start">
                        The ultimate tool for Email Automation, Scheduling, Booking, and Reservation
                    </p>
                    <div className="flex gap-6">
                        <Button variant="contained" size="large">Sign Up</Button>
                        <Button variant="outlined" size="large">Log In</Button>
                    </div>

                </div>
                <div className="flex items-center justify-center flex-col bg-slate-100 pt-4">
                    <div className="flex items-center justify-center flex-col">
                        <div className="mb-4 flex items-center border shadow-sm p-4 bg-amber-100 text-amber-700 rounded-full uppercase">
                            <div className="h-6 w-6 mr-2" />
                            Meeting Schedule With John
                        </div>
                        <h1 className="text-3xl md:text-6xl text-center text-neutral-800 mb-6">
                            SmartCRM helps a Business
                        </h1>
                        <div className="text-3xl md:text-6xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-4 p-2 rounded-md pb-4 w-fit">
                            Move Faster
                        </div>
                    </div>
                    <div className="text-sm md:text-xl text-neutral-400 mt-4 max-w-xs md:max-w-2xl text-center mx-auto">
                        Manage your emails, and reach out to our
                        Convert your leads into Sales,
                        Track your leads easily,
                        Accomplish it all with SmartCRM
                    </div>
                    <Button className="mt-6" size="large">
                        <Link to="/dashboard">
                            Get Started for free
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center justify-center flex-col py-12">
                    <h1 className="text-3xl md:text-6xl text-neutral-800 mb-4">Intergration</h1>
                    <ul className="flex items-center justify-center gap-4">
                        <li>GMAIL</li>
                        <li>Outlook</li>
                        <li>Yandex</li>
                        <li>Teams</li>
                        <li>Google Calendar</li>
                        <li>Zoom</li>
                        <li>Teams</li>
                    </ul>
                </div>


                <PricingPlans />
            </main>

        </div>

    )
}

export default LandingPage;