export interface Register {
    fullName: {
        firstName: string,
        lastName: string
    },
    userName: string,
    email: string,
    enrollmentNumber: string,
    password: string
}

export interface Login {
    email: string,
    password: string
}

export interface ForgotPassword {
    email: string
}