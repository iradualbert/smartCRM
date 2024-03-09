import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast";
import { createCategory, updateCategory } from "@/redux/actions/contactActions";

type CategoryFormDialogType = {
    children: React.ReactNode,
    category?: {
        name: string,
        id: number | string
    }
}

type ErrorsType = {
    name?: string | string[],
    non_field_errors?: string[]
}

const CategoryFormDialog = ({ children, category }: CategoryFormDialogType) => {
    const [errors, setErrors] = useState<ErrorsType>({});
    const [categoryName, setCategoryName] = useState(category ? category.name : "")
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isDisabled = isSubmitting

    const { toast } = useToast()

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsSubmitting(true)
        const _errors = category ?
            await updateCategory({ name: categoryName, id: category.id })
            : await createCategory({ name: categoryName })
        setIsSubmitting(false);
        if (_errors) {
            setErrors(_errors)
        } else {
            if(!category)setCategoryName("");
            setIsDialogOpen(false);
            setErrors({});
            toast({
                title: category ? "Contact category updated" : "Contact category created"
            })
        }
    }


    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className={"max-w-3xl-lg overflow-y-scroll max-h-screen"}>
                <DialogHeader>
                    <DialogTitle className="py-2">
                        { category ?   "Update Contact Category" : "New Contact Category"}
                    </DialogTitle>
                    <DialogDescription className="py-6" asChild>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3">

                                <Input
                                    placeholder="Category Name"
                                    disabled={isDisabled}
                                    value={categoryName} onChange={e => setCategoryName(e.target.value)}
                                />
                                {errors?.name && (
                                    <p className='text-sm flex-1 text-red-500'>
                                        {errors?.name}
                                    </p>
                                )}
                            </div>
                            {errors?.non_field_errors && (
                                <p className='text-sm text-red-500'>
                                    {errors.non_field_errors}
                                </p>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isDisabled}
                                >
                                    {isSubmitting && (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    )}
                                    { category ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form >
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}

export default CategoryFormDialog;