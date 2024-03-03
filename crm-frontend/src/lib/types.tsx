export type TemplateParameter = {
    name: string,
    defaultValue: string
}

export type Email = {
    to: string,
    CC: string,
    subject: string,
    mailBoy: string,
    attachments?: Set<File>,
    isSendLater?: boolean,
    scheduleTime: Date,
}


export type IToast = {
    id?: string | number,
    message: string,
    severity: "error" | "info" | "success",
}


export type PlanCardProps = {
    features: string[],
    color: string,
    title: string,
    description: string,
    btnText: string,
    price: string

}