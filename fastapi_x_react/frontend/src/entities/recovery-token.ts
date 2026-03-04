import {z} from "zod";

export const recoveryTokenObject = z.object({
    recovery_token: z.string(),
    token_type: z.string(),
})

export type recoveryTokenModel = z.infer<typeof recoveryTokenObject>;