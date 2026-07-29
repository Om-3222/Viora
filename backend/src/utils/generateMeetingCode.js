const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

const generateGroup = (length) => {
    let result = "";

    for (let i = 0; i < length; i++) {
        result += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    }

    return result;
};

export default function generateMeetingCode() {
    return `${generateGroup(3)}-${generateGroup(3)}-${generateGroup(3)}`;
}