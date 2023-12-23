import axios from "axios"

export const createEmail = async (data: FormData) => {
    return await axios.post('/mails/', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
}

export const createBulkEmail = async (data: FormData) => {
    return await axios.post('/bulk-mails/', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
}