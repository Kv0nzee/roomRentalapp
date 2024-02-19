import bcrypt from 'bcrypt';

const getPasswordCheck = (first : string, second : string) => {
    return bcrypt.compare(
        first, 
        second 
    );
}  

export default getPasswordCheck