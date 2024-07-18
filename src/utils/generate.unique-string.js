// modules imports
import { customAlphabet } from "nanoid";

const generateUniqueString = (len) => {
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', len || 13);
    return nanoid();
}

export default generateUniqueString;