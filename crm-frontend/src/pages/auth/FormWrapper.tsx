import Logo from "@/components/Logo";

const FormWrapper = ({ title, children }: { title: string, children: React.ReactNode}) => {

    return (
        <div className='container relative flex pt-10 flex-col items-center justify-center lg:px-0'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-4 sm:w-[350px]'>
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-3xl">{title}</h1>
                    <Logo />
                    {children}
                </div>
            </div>

        </div>

    )
}

export default FormWrapper;