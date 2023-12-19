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