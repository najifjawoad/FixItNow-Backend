import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
// Generate Token :
const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);

  return token;
};

// verify TOken :
const verifyToken = (token :string , secret : string) =>{
    try {
        const verifiedToken = jwt.verify(token, secret)
        return verifiedToken as JwtPayload
        
    } catch (error : any) {
       return {
        success : false,
        error : error.message,
       }
    }
}

export const jwtUtils = {
  createToken,
  verifyToken
};
