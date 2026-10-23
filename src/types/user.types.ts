export interface IUser {
    _id?: string;
    name: string;
    email: string;
    mobile: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserLoginBody {
    email: string;
    password: string;
}

export interface IUserRegisterBody {
    name: string;
    email: string;
    mobile: string;
    password: string;
}

export interface JWTPayload {
    user_Id: string;
    email?: string;
}

