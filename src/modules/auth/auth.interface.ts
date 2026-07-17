import { Role } from "../../../generated/prisma/enums";

export interface RegisterUserPayload {
    name : string;
    email : string;
    password : string;
    phone ?: string;
    bio ?: string;
    avgRating?:number;
    role : Role;
    experienceYears ?: number;
    skills ?: string[];
}

export interface ILogInUser {
    email : string;
    password : string;
}