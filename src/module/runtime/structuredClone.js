let structuredClone = window.structuredClone;
if (!structuredClone) {
    structuredClone = (obj, options) => {
        return JSON.parse(JSON.stringify(obj));
    };
}

export default structuredClone;